import { AppointmentManagementRepository } from "../domain/repository";
import { Appointment } from "../domain/entities/Appointment";
import { AppointmentInput } from "../domain/inputs/AppointmentInput";
import { AWSService } from "../../layers/awsService/nodejs/awsUtilities";
import { PutItemInput } from "../../layers/awsService/nodejs/PutItemInput";
import { PutItemOutput } from "../../layers/awsService/nodejs/PutItemOutput";
import { QueryInput } from "../../layers/awsService/nodejs/QueryInput";
import { QueryOutput } from "../../layers/awsService/nodejs/QueryOutput";

export class ConcreteAppointmentManagementRepository extends AppointmentManagementRepository{
    tableName:string = process.env.TABLE || '';
    awsService = new AWSService();

    /**
     * 
     * @param appointment 
     */
    async create (appointment:Appointment):Promise<Appointment>{
        let err: Error | unknown = null;
        let createdAppointment:Appointment;

        const userId:string = appointment.userId;
        const description:string | undefined = appointment.description;
        const doctor:string = appointment.doctor;
        const date:string = appointment.date
        const createdAt:string = appointment.createdAt;
        const id:string = appointment.id;

        const putItem: PutItemInput = {
            TableName: this.tableName,
            Item:{
                PK: `USER#${userId}`,
                SK: `APPOINTMENT#${date}`,
                userId: userId,
                doctor:doctor,
                createdAt: createdAt,
                date: date,
                description: description,
                id: id,
                GSI1PK: `USER#${userId}`,
                GSI1SK: `APPOINTMENT#${date}`
            },
            ReturnValues: "ALL_OLD"
        };

        try{
            const resultSet:PutItemOutput = await this.awsService.putItem(putItem);
            const attributes = resultSet.Attributes;

            const appointmentInput:AppointmentInput = {
                id: attributes?.id,
                createdAt: attributes?.dateOfBirth,
                userId: attributes?.userId,
                doctor: attributes?.doctor,
                description: attributes?.description,
                date: attributes?.date
            }  
            
            createdAppointment = new Appointment(appointmentInput);
            console.log(resultSet)
        } catch(error){
            err = error;
            console.log(error);
        }

        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(createdAppointment);
            } else {
                reject(err);
            }
        });
    }

    /**
     * 
     * @param userId 
     */
    async list(userId: string): Promise<Appointment[]> {
        const appointmentList:Appointment[] = [];
        let err: Error | unknown = null;

        const queryItem: QueryInput = {
            TableName: this.tableName,
            KeyConditionExpression: "#PK = :partitionKey and begins_with(#SK,:sortKey)",
            ExpressionAttributeNames:{
                "#PK": "PK",
                "#SK": 'SK'
            },
            ExpressionAttributeValues: {
              ":partitionKey": `USER#${userId}`,
              ":sortKey": 'APPOINTMENT'
            }
        };

        try {
            const resultSet:QueryOutput = await this.awsService.query(queryItem);

            const items = resultSet.Items;

            if(items !== undefined){
                for(const item of items){
                    const appointmentInput:AppointmentInput = {
                        id:item.id,
                        doctor: item.doctor,
                        date: item.date,
                        userId: item.userId,
                        createdAt: item.createdAt,
                        description: item.description
                    }
                    const appointment:Appointment = new Appointment(appointmentInput);
                    appointmentList.push(appointment);
                }
            }
        } catch (error) {
            err = error;
            console.log(error);
        }

        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(appointmentList);
            } else {
                reject(err);
            }
        });
    }
}