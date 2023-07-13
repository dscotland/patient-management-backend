import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export interface ApiGatewayProps {
    apiResources: Map<string, Map<string,ApiGatewayLambdaProps>>;
    cognitoUserPool: cdk.aws_cognito.UserPool;
    authorizer: cdk.aws_apigateway.CognitoUserPoolsAuthorizer
    authorizationType: cdk.aws_apigateway.AuthorizationType
    apiName: string
    apiId: string

}

export interface ApiGatewayLambdaProps {
    function: cdk.aws_lambda.Function
    verb: string
}

export class APIGateway extends Construct {

    lambdaObjects: [ApiGatewayLambdaProps]
    api: cdk.aws_apigateway.RestApi

    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id);

        this.api = new cdk.aws_apigateway.RestApi(this,props.apiId,{
            deployOptions:{stageName: process.env.STAGE?.toLowerCase()},
            defaultCorsPreflightOptions: {
                allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,        
            }
        });



        // const resources = props.apiResources.keys();
        for (const [resourceName, value] of props.apiResources.entries()) {
            const createdResource = this.api.root.addResource(resourceName)
            const lambdaObjectList = props.apiResources.get(resourceName)
            if ( lambdaObjectList !== undefined){
                for(const [functionName, lambdaObject] of lambdaObjectList){
                    const subResource = createdResource.addResource(functionName)
                    subResource.addMethod(lambdaObject.verb,new cdk.aws_apigateway.LambdaIntegration(lambdaObject.function),
                    {   
                        authorizer: props.authorizer,
                        authorizationType: cdk.aws_apigateway.AuthorizationType.COGNITO, 
                    })
                }
            }

        }

    }

}
