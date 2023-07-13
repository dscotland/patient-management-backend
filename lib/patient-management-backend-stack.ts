import * as cdk from 'aws-cdk-lib';
import { Cognito, CognitoProps } from "./cognito";
import { DynamoDBTable } from "./dynamodb";
import { KMS } from './kms';
import { Construct } from 'constructs';
import { APIGateway, ApiGatewayProps, ApiGatewayLambdaProps } from './apigateway';

export class PatientManagementBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //#region Dynamo
    const pmTable = new DynamoDBTable(this, "pm-table", {
      partitionKey: { name: "PK", type: cdk.aws_dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: cdk.aws_dynamodb.AttributeType.STRING },
      gsiList: [
        {
          indexName: "GS1",
          partitionKey: { name: "GS1PK", type: cdk.aws_dynamodb.AttributeType.STRING },
          sortKey: { name: "GS1SK", type: cdk.aws_dynamodb.AttributeType.STRING },
        },
      ],
    });
    //#endregion

    //#region KMS
    const kms = new KMS(this, "nCight-km");
    //#endregion

    //#region Layers
    const awsUtilitiesLayer = new cdk.aws_lambda.LayerVersion(this, 'AWS_Utilities_Layer', {
      //removalPolicy: cdk.RemovalPolicy.RETAIN,
      code: cdk.aws_lambda.Code.fromAsset('./src/layers/awsService'),
      description: 'The functions and logic that support the basic AWS utilities used by the application.'
    });

    const generalUtilitiesLayer = new cdk.aws_lambda.LayerVersion(this, 'General_Utilities_Layer', {
      //removalPolicy: cdk.RemovalPolicy.RETAIN,
      code: cdk.aws_lambda.Code.fromAsset('./src/layers/utilitiesService'),
      description: 'The functions and logic that support the general utilities used by the application.'
    });
    //#endregion

    //#region Lambda
    const sendMailFn = new cdk.aws_lambda.Function(this, 'sendCustomEmail', {
      code: cdk.aws_lambda.Code.fromAsset('./src/emailManagementService/infrastructure/lib'),
      handler: 'emailManagementService/infrastructure/handlers/sendMailHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        SOURCE_EMAIL: process.env.SOURCE_EMAIL || '',
        REGION: process.env.REGION || 'us-east-1',
        KEY_ALIAS: kms.kmsKey.keyArn,
        KEY_ID: kms.kmsKey.keyId
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    const registerUserFn = new cdk.aws_lambda.Function(this, "registerUser", {
      code: cdk.aws_lambda.Code.fromAsset(
        "./src/userManagementService/infrastructure/lib"
      ),
      handler:
        "userManagementService/infrastructure/handlers/registerUserHandler.handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        TABLE_NAME: pmTable.table.tableName,
      },
      layers: [
        awsUtilitiesLayer,
        generalUtilitiesLayer,
      ],
    });

    const cognitoTriggerLambdaFunctions = new Map();
    cognitoTriggerLambdaFunctions.set("sendMailFn",sendMailFn);
    cognitoTriggerLambdaFunctions.set("registerUserFn",registerUserFn);

    kms.kmsKey.grantEncryptDecrypt(sendMailFn);

    //#region Cognito
    const cognitoProps: CognitoProps = {
      lambdaFunctions: cognitoTriggerLambdaFunctions,
      kmsKey:kms.kmsKey,
      poolName: "PM-userpool",
      poolKey: "PMUserPool",
      poolEmailFromName: "PM",
      clientKey: "PM-app-client",
      region: process.env.REGION || 'us-east-1',
      poolGroups: ["Patient","Doctor"]
    };

    const pm_cognito = new Cognito(this, "pm_cognito", cognitoProps);

    //#endregion

    const createAppointmentFn = new cdk.aws_lambda.Function(this, 'createAppointment', {
      code: cdk.aws_lambda.Code.fromAsset('./src/appointmentManagementService/infrastructure/lib'),
      handler: 'appointmentManagementService/infrastructure/handlers/createAppointmentHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        REGION: process.env.REGION || 'us-east-1',
        TABLE: pmTable.table.tableName
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    const listAppointmentsFn = new cdk.aws_lambda.Function(this, 'listAppointments', {
      code: cdk.aws_lambda.Code.fromAsset('./src/appointmentManagementService/infrastructure/lib'),
      handler: 'appointmentManagementService/infrastructure/handlers/listAppointmentsHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        REGION: process.env.REGION || 'us-east-1',
        TABLE: pmTable.table.tableName
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    const getUserFn = new cdk.aws_lambda.Function(this, 'getUser', {
      code: cdk.aws_lambda.Code.fromAsset('./src/userManagementService/infrastructure/lib'),
      handler: 'userManagementService/infrastructure/handlers/getUserHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        REGION: process.env.REGION || 'us-east-1',
        TABLE: pmTable.table.tableName
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    const updateUserFn = new cdk.aws_lambda.Function(this, 'updateUser', {
      code: cdk.aws_lambda.Code.fromAsset('./src/userManagementService/infrastructure/lib'),
      handler: 'userManagementService/infrastructure/handlers/updateUserHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        REGION: process.env.REGION || 'us-east-1',
        TABLE: pmTable.table.tableName
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    const deleteUserFn = new cdk.aws_lambda.Function(this, 'deleteUser', {
      code: cdk.aws_lambda.Code.fromAsset('./src/userManagementService/infrastructure/lib'),
      handler: 'userManagementService/infrastructure/handlers/deleteUserHandler.handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(6),
      environment: {
        STAGE: process.env.STAGE || '',
        REGION: process.env.REGION || 'us-east-1',
        TABLE: pmTable.table.tableName,
        POOL_ID: pm_cognito.userPool.userPoolId
      },
      layers:[awsUtilitiesLayer, generalUtilitiesLayer]
    });

    deleteUserFn.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ["cognito-idp:AdminDeleteUser"],
        resources: [
          `arn:aws:cognito-idp:${process.env.REGION}:${pm_cognito.userPool.stack.account}:userpool/${pm_cognito.userPool.userPoolId}`,
        ],
      })
    );

    pmTable.table.grantWriteData(registerUserFn);
    pmTable.table.grantWriteData(deleteUserFn);
    pmTable.table.grantWriteData(updateUserFn);
    pmTable.table.grantReadData(getUserFn);
    pmTable.table.grantWriteData(createAppointmentFn);
    pmTable.table.grantReadData(listAppointmentsFn);


    const ApiResources = new Map();
    const userLambdaFunctions = new Map();
    const appointmentLambdaFunctions = new Map();
    userLambdaFunctions.set("updateUserFn",{function:updateUserFn, verb:"POST"});
    userLambdaFunctions.set("deleteUserFn",{function:deleteUserFn, verb:"POST"});
    userLambdaFunctions.set("getUserFn",{function:getUserFn, verb:"GET"});
    appointmentLambdaFunctions.set("createAppointmentFn",{function:createAppointmentFn, verb:"POST"});
    appointmentLambdaFunctions.set("listAppointmentsFn",{function:listAppointmentsFn, verb:"GET"});

    ApiResources.set("user", userLambdaFunctions);
    ApiResources.set("appointment", appointmentLambdaFunctions);

    sendMailFn.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['ses:SendTemplatedEmail'],
      resources: ['*'],
      effect: cdk.aws_iam.Effect.ALLOW,
    }));
    //#endregion

    //#region Api Gateway
    const apiGatewayProps: ApiGatewayProps = {
      apiResources: ApiResources,
      cognitoUserPool: pm_cognito.userPool,
      authorizer: new cdk.aws_apigateway.CognitoUserPoolsAuthorizer(this, 'apiAuthorizer', {
        cognitoUserPools: [pm_cognito.userPool]
      }),
      apiName: 'PM-API',
      apiId: 'pmAPI',
      authorizationType: cdk.aws_apigateway.AuthorizationType.COGNITO
    }

    const pm_apigateway = new APIGateway(this, "pm_apigateway", apiGatewayProps);
    //#endregion
  }
}
