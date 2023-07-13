import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


export interface CognitoProps {
    lambdaFunctions: Map<string, cdk.aws_lambda.Function> | undefined;
    kmsKey: cdk.aws_kms.Key
    poolName: string
    poolKey: string
    clientKey: string
    poolEmailFromName: string
    region: string
    poolGroups: string[]
}


export class Cognito extends Construct {
    readonly appClient: cdk.aws_cognito.UserPoolClient;
    readonly userPool: cdk.aws_cognito.UserPool;
    readonly userPoolGroups: cdk.aws_cognito.CfnUserPoolGroup[];

    constructor(scope: Construct, id: string, props: CognitoProps) {
        super(scope, id);

        this.userPool = new cdk.aws_cognito.UserPool(this, props.poolKey, {
            userPoolName: props.poolName,
            signInCaseSensitive: false, // case insensitive is preferred in most situations
            selfSignUpEnabled: true,
            mfa: cdk.aws_cognito.Mfa.OPTIONAL,
            email: cdk.aws_cognito.UserPoolEmail.withSES({
                fromEmail: `${process.env.SOURCE_EMAIL}`,
                fromName: props.poolEmailFromName,
                sesRegion: props.region,
            }),
            lambdaTriggers:{
                customEmailSender: props.lambdaFunctions?.get('sendMailFn'),
                postConfirmation: props.lambdaFunctions?.get("registerUserFn"),
            },
            customSenderKmsKey: props.kmsKey,
            mfaSecondFactor: {
              sms: true,
              otp: true,
            },
            userVerification: {
                emailStyle: cdk.aws_cognito.VerificationEmailStyle.CODE,
              },
              signInAliases: {
                email: true,
              },
            accountRecovery: cdk.aws_cognito.AccountRecovery.EMAIL_ONLY,
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
                phoneNumber: {
                    required: true,
                    mutable: true,
                },
                familyName: {
                    required: true,
                    mutable: true,
                },
                givenName: {
                    required: true,
                    mutable: true,
                },
                address: {
                    required: false,
                    mutable: true
                },
                birthdate: {
                    required: false,
                    mutable: true
                }
            },
            customAttributes: {
                userId: new cdk.aws_cognito.StringAttribute({
                    mutable: true,
                }),
                bloodType: new cdk.aws_cognito.StringAttribute({
                    mutable: true,
                }),
                ipAddress: new cdk.aws_cognito.StringAttribute({
                    mutable: true,
                }),
            }

        });

        // for (const poolGroup of props.poolGroups){
        //     const cfnUserPoolGroup = new cdk.aws_cognito.CfnUserPoolGroup(this, `${poolGroup}PoolGroup`, {
        //         userPoolId: this.userPool.userPoolId,
        //         groupName: poolGroup,
        //       });
        //       this.userPoolGroups.push(cfnUserPoolGroup);
        // }


        this.appClient = new cdk.aws_cognito.UserPoolClient(this, props.clientKey, {
            userPool: this.userPool,
            authFlows: {
              userPassword: true,
              userSrp: true,
              adminUserPassword: true,
            },
            readAttributes: (new cdk.aws_cognito.ClientAttributes())
            .withCustomAttributes('userId','bloodType')
            .withStandardAttributes({givenName:true,familyName:true,email:true,phoneNumber:true,address:true,birthdate:true})
          });

        new cdk.CfnOutput(this, "userPoolId", {
            value: this.userPool.userPoolId,
        });

      
        new cdk.CfnOutput(this, "appClientId", {
            value: this.appClient.userPoolClientId,
        });
    }   
}