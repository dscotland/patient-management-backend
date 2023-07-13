import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface QueryInput extends DocumentClient.QueryInput {
    
}