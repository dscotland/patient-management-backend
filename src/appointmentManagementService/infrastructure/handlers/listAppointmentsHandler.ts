import { Handler } from "aws-cdk-lib/aws-lambda";
import { ListAppointments } from '../../domain/useCases/listAppointments/listAppointments';
import { ConcreteAppointmentManagementRepository } from '../concreteAppointmentManagementRepository';

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
        const repo = new ConcreteAppointmentManagementRepository();
        const useCase = new ListAppointments(repo);
        const response = await useCase.execute(userId);
        jsonResponse = response.map((appointment) => {
            const obj = {
                doctor: appointment.doctor,
                date: appointment.date,
                userId: appointment.userId,
                description: appointment.description,
                createdAt: appointment.createdAt,
                id: appointment.id
            };
            return obj;
        });
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
