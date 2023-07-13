import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface QueryOutput extends DocumentClient.QueryOutput {
    
}