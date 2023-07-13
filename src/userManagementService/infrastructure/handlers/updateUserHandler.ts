import { Handler } from "aws-cdk-lib/aws-lambda";
import { UpdateUser } from '../../domain/useCases/updateUser/UpdateUser';
import { ConcreteUserManagementRepoaitory } from '../concreteUserManagementRepository';
import { User } from "../../domain/entities/User";
import { UserInput } from "../../domain/inputs/UserInput";

/**
* @param {any} event the event passed to the handler
* @returns {Object} the response from the execution of the register user function
*/
export const handler: Handler = async (event:Record<string,any>) => {
    console.log(event);
    const parsedEvent = JSON.parse(event.body);
    let status = 200;
    let jsonResponse = {};
    try {
        const userId:string = event.requestContext.authorizer.claims['custom:userId'];
        const userInput:UserInput = {
            id: userId,
            givenName: parsedEvent?.givenName,
            familyName: parsedEvent?.familyName,
            dateOfBirth: parsedEvent?.dateOfBirth,
            phoneNumber: parsedEvent?.phoneNumber,
            createdAt: parsedEvent?.createdAt,
            status: parsedEvent?.status,
            email: parsedEvent?.email,
            type: parsedEvent?.type,
            ipAddress: parsedEvent?.ipAddress
        }  
        
        const user = new User(userInput);
        const repo = new ConcreteUserManagementRepoaitory();
        const useCase = new UpdateUser(repo);
        const response = await useCase.execute(user);
        jsonResponse = {
            id: response.id,
            givenName: response.givenName,
            familyName: response.familyName,
            dateOfBirth: response.dateOfBirth,
            createdAt: response.createdAt,
            deleteAt: response.deletedAt,
            phoneNumber: response.phoneNumber,
            email: response.email,

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
            'Access-Control-Allow-Origin': '*'
        },
    };
    console.log(resp);
    return resp;
}
