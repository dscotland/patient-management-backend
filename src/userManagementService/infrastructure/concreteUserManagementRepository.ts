import { UserManagementRepository } from "../domain/repository";
import { User, UserType, UserStatus } from "../domain/entities/User";
import { UserInput } from "../domain/inputs/UserInput";
import { AWSService } from "../../layers/awsService/nodejs/awsUtilities";
import { PutItemInput } from "../../layers/awsService/nodejs/PutItemInput";
import { GetItemInput } from "../../layers/awsService/nodejs/GetItemInput";
import { GetItemOutput } from "../../layers/awsService/nodejs/GetItemOutput";
import { PutItemOutput } from "../../layers/awsService/nodejs/PutItemOutput";
import { DeleteItemInput } from "../../layers/awsService/nodejs/DeleteItemInput";
import { DeleteItemOutput } from "../../layers/awsService/nodejs/DeleteItemOutput";
import { UpdateItemInput } from "../../layers/awsService/nodejs/UpdateItemInput";
import { UpdateItemOutput } from "../../layers/awsService/nodejs/UpdateItemOutput";

export class ConcreteUserManagementRepoaitory extends UserManagementRepository{
    tableName:string = process.env.TABLE || '';
    userPoolId:string = process.env.POOL_ID || '';
    awsService = new AWSService();

    /**
     * 
     * @param user - The user object to be used when creating a new user
     * @returns 
     */
    async register(user:User): Promise<User>{
        let err: Error | unknown = null;
        let createdUser:User;
        const userId:string = user.id;
        const givenName:string = user.givenName;
        const familyName:string = user.familyName;
        const dateOfBirth:string | undefined = user.dateOfBirth;
        const email:string = user.email;
        const status:UserStatus = user.status;
        const createdAt:string = user.createdAt;
        const type:UserType = user.type;
        const ipAddress:string = user.ipAddress;
        const phoneNumber:string | undefined = user.phoneNumber
    

        const putItem: PutItemInput = {
            TableName: this.tableName,
            Item:{
                PK: `USER#${userId}`,
                SK: `USER#${userId}`,
                userId: userId,
                givenName: givenName,
                familyName: familyName,
                dateOfBirth: dateOfBirth,
                ipAddress: ipAddress,
                email:email,
                status:status,
                createdAt:createdAt,
                userType: type,
                phoneNumber: phoneNumber,
                GSI1PK: `USER#${userId}`,
                GSI1SK: `USER#${userId}`
            },
            ReturnValues: "ALL_OLD"
        };
        try{
            const resultSet:PutItemOutput = await this.awsService.putItem(putItem);
            const attributes = resultSet.Attributes;

            const userInput:UserInput = {
                id: attributes?.id,
                givenName: attributes?.givenName,
                familyName: attributes?.familyName,
                dateOfBirth: attributes?.dateOfBirth,
                createdAt: attributes?.dateOfBirth,
                status: attributes?.status,
                email: attributes?.email,
                type: attributes?.type,
                ipAddress: attributes?.ipAddress
            }  
            
            createdUser = new User(userInput);
            console.log(resultSet)
        } catch(error){
            err = error;
            console.log(error);
        }

        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(createdUser);
            } else {
                reject(err);
            }
        });
    }


    /**
     * 
     * @param user - The user object to be used for updating the existing user
     */
    async updateUser(user:User): Promise<User> {
        let err: Error | unknown = null;
        let updatedUser:User;
        const userId:string = user.id;

        const updateItem: UpdateItemInput = {
            TableName: this.tableName,
            Key: {
                PK:`USER#${userId}`,
                SK:`USER#${userId}`
            },
            UpdateExpression: 'set #pn = :var1, #firstName = :var2, #lastName = :var3',
            ExpressionAttributeNames: {'#pn' : 'phoneNumber', '#firstName': 'givenName', '#lastName': 'familyName'},
            ExpressionAttributeValues: {
              ':var1' : user.phoneNumber,
              ':var2' : user.givenName,
              ':var3' : user.familyName
            },
            ReturnValues: "ALL_NEW"
        };

        try{
            const resultSet:UpdateItemOutput = await this.awsService.updateItem(updateItem);

            const attributes = resultSet.Attributes;

            const userInput:UserInput = {
                id: attributes?.id,
                givenName: attributes?.givenName,
                familyName: attributes?.familyName,
                dateOfBirth: attributes?.dateOfBirth,
                createdAt: attributes?.dateOfBirth,
                status: attributes?.status,
                email: attributes?.email,
                type: attributes?.type,
                ipAddress: attributes?.ipAddress
            }  
            
            updatedUser = new User(userInput);

            console.log(resultSet)
        } catch(error){
            err = error;
            
            console.log(error);
        }
        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(updatedUser);
            } else {
                reject(err);
            }
        });
    }

    /**
     * 
     * @param userId - The userId to be used when deleting the user
     */
    async deleteUser(userId: string): Promise<User> {
        let err: Error | unknown = null;
        let user:User;
        const deleteItem: DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                PK: `USER#${userId}`,
                SK: `USER#${userId}`,
            },
            ReturnValues: "ALL_OLD"
        };

        try {
            //const resultSet:DeleteItemOutput = await this.awsService.deleteItem(deleteItem);
            const deleteResultPromise = this.awsService.deleteItem(deleteItem);
            const cognitoResultPromise = this.awsService.deleteCognitoUser(userId, this.userPoolId);

            await Promise.all([deleteResultPromise,cognitoResultPromise]).then((values)=>{
                const resultSet = values[0];
                const cognitoResult = values[1];

                console.log(resultSet);
                console.log(cognitoResult);

                const item = resultSet.Attributes;
    
                const userInput:UserInput = {
                    id: item?.id,
                    givenName: item?.givenName,
                    familyName: item?.familyName,
                    dateOfBirth: item?.dateOfBirth,
                    createdAt: item?.dateOfBirth,
                    status: item?.status,
                    email: item?.email,
                    type: item?.type,
                    ipAddress: item?.ipAddress,
                    phoneNumber: item?.phoneNumber
                }  
                
                user = new User(userInput);
            })
        } catch(error){
            err = error;
            console.log(error);
        }

        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(user);
            } else {
                reject(err);
            }
        });
    }


    /**
     * 
     * @param userId - The userId to be used when retreiving the user
     * @returns 
     */
    async getUser(userId: string): Promise<User> {
        let err: Error | unknown = null;
        let user:User;
        const getItem:GetItemInput = {
            TableName: this.tableName,
            Key: {
                PK:`USER#${userId}`,
                SK:`USER#${userId}`
            }
        }

        try {
            const resultSet:GetItemOutput = await this.awsService.getItem(getItem);
            console.log(resultSet);
            const item = resultSet.Item;

            const userInput:UserInput = {
                id: item?.id,
                givenName: item?.givenName,
                familyName: item?.familyName,
                dateOfBirth: item?.dateOfBirth,
                createdAt: item?.createdAt,
                status: item?.status,
                email: item?.email,
                type: item?.type,
                ipAddress: item?.ipAddress,
                phoneNumber: item?.phoneNumber
            }  
            
            user = new User(userInput);

        } catch(error){
            err = error;
            console.log(error);
        }

        return new Promise((resolve, reject) => {
            if (err === null) {
                resolve(user);
            } else {
                reject(err);
            }
        });
    }
}