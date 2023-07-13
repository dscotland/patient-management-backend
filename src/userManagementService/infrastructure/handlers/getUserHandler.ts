import { Handler } from "aws-cdk-lib/aws-lambda";
import { GetUser } from '../../domain/useCases/getUser/getUser';
import { ConcreteUserManagementRepoaitory } from '../concreteUserManagementRepository';

/**
* @param {any} event the event passed to the handler
* @returns {Object} the response from the execution of the register user function
*/
export const handler: Handler = async (event:Record<string,any>) => {
    console.log(event.requestContext.authorizer.claims);
    let status = 200;
    let jsonResponse = {};
    try {
        const userId = event.requestContext.authorizer.claims['custom:userId'];
        const repo = new ConcreteUserManagementRepoaitory();
        const useCase = new GetUser(repo);
        const response = await useCase.execute(userId);
        jsonResponse = {
            id: response.id,
            givenName: response.givenName,
            familyName: response.familyName,
            dateOfBirth: response.dateOfBirth,
            createdAt: response.createdAt,
            deleteAt: response.deletedAt,
            phoneNumber: response.phoneNumber,
        };
    } catch (error) {
        const internalServerError = 500;
        status = internalServerError;
        console.log(error);
    }

    const resp = {
        statusCode: status,
        body: JSON.stringify(jsonResponse),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
    console.log(resp);
    return resp;
}
