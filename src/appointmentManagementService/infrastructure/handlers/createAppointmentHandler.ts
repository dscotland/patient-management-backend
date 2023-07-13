import { Handler } from "aws-cdk-lib/aws-lambda";
import { CreateAppointment } from '../../domain/useCases/createAppointment/createAppointment';
import { ConcreteAppointmentManagementRepository } from '../concreteAppointmentManagementRepository';
import { Appointment } from "../../domain/entities/Appointment";
import { AppointmentInput } from "../../domain/inputs/AppointmentInput";

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
        const appointmentInput:AppointmentInput = {
            id: parsedEvent?.id,
            userId: userId,
            doctor: parsedEvent?.doctor,
            description: parsedEvent?.description,
            createdAt: parsedEvent?.createdAt,
            date: parsedEvent?.date
        }  
        
        const appointment = new Appointment(appointmentInput);
        const repo = new ConcreteAppointmentManagementRepository();
        const useCase = new CreateAppointment(repo);
        const response = await useCase.execute(appointment);
        jsonResponse = {
            id: response.id,
            doctor: response.doctor,
            date: response.date,
            createdAt: response.createdAt,
            description: response.description

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
