import * as AWS from "aws-sdk";
import * as b64 from 'base64-js';
import * as encryptionSdk from '@aws-crypto/client-node';
import { SESTemplateEmailInput } from "./SESTemplateEmailInput";
import { HeadObjectOutput } from 'aws-sdk/clients/s3';
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const ses = new AWS.SES({
    apiVersion: "2010-12-01",
    region: process.env.REGION || 'us-east-1',
});

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18',
    region: 'us-east-1'
});

const s3service = new AWS.S3();

const docClient: DocumentClient = new DocumentClient();


export class AWSService {
    /**
     * 
     *  @param {SESTemplateEmailInput} input the SES params used to send a templated email
     * 
     */
    sendSESTemplateEmail(input: SESTemplateEmailInput): Promise<any> {
        const params = {
            Destination: input.Destination,
            Source: input.Source ,
            Template: input.Template ,
            TemplateData: JSON.stringify(input.TemplateData) ,
        };
        console.log(params);
        return new Promise((resolve, reject) => {
            ses.sendTemplatedEmail(params, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * 
     * @param {DocumentClient.PutItemInput} putItemInput 
     * @returns 
     */
    async putItem(putItemInput:DocumentClient.PutItemInput): Promise<any>{
        return new Promise((resolve, reject) => {
            docClient.put(putItemInput, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }

    /**
     * 
     * @param {DocumentClient.DeleteItemInput} deleteItemInput 
     * @returns 
     */
    async deleteItem(deleteItemInput:DocumentClient.DeleteItemInput): Promise<any>{
        return new Promise((resolve, reject) => {
            docClient.delete(deleteItemInput, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }

    /**
     * 
     * @param queryInput 
     */
    async query(queryInput: DocumentClient.QueryInput): Promise<any> {
        return new Promise((resolve, reject) => {
            docClient.query(queryInput, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }

    /**
     * 
     * @param updateItemInput 
     * @returns 
     */
    async updateItem(updateItemInput: DocumentClient.UpdateItemInput): Promise<any> {
        return new Promise((resolve, reject) => {
            docClient.update(updateItemInput, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })       
    }

    /**
     *
     * @param {string} userId the user's sub in cognito
     * @param {string} userPoolId the user pool id in cognito
     */
    async deleteCognitoUser(userId:string, userPoolId:string): Promise<any> {
        const params = {
            UserPoolId: userPoolId,
            Username: userId
        };
        return new Promise((resolve, reject) => {
            cognitoidentityserviceprovider.adminDeleteUser(params, (err, data) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(data);
                }
        });
    });
}


    /**
     * 
     * @param getItemInput 
     * @returns 
     */
    async getItem(getItemInput:DocumentClient.GetItemInput): Promise<any>{
        return new Promise((resolve, reject) => {
            docClient.get(getItemInput, (err, data) => {
                console.log(data);
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }

    /**
     * 
     * @param destinationBucketName 
     * the bucket where the object is being copied to
     * @param copySource 
     * the object that is being copied
     * @param newObjectKey 
     * the new name of the copied object in the destination bucket
     * @returns 
     */
    async copyObject(destinationBucketName: string, 
        copySource: string, newObjectKey:string): Promise<any>{
        var params = {
            Bucket: destinationBucketName, 
            CopySource: copySource, 
            Key: newObjectKey
        };
        return new Promise((resolve, reject)=>{
            s3service.copyObject(params, (err,data) => {
                if(err){
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

    }

    /**
     *
     * @param {string} bucketName
     * The name of the s3 bucket where the object is uploaded
     * @param {string} bucketKey
     * The name of the uploaded object in the s3 bucket
     * @returns {Promise<HeadObjectOutput>} the metadata object
     */
     async getObjectMetadata(bucketName:string,
        bucketKey:string):Promise<HeadObjectOutput> {
        return new Promise<HeadObjectOutput>((resolve, reject) => {
            s3service.headObject({ Bucket: bucketName, Key:bucketKey }, (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
    *
    * @param {any} s3Params the parameters used to build the signed url
    * @returns {string} the signed url
    */
    getSignedUrl(s3Params:unknown):string {
        return s3service.getSignedUrl('putObject', s3Params);
    }

    /**
     *
     * @param {string} verificationCode the verifification code to be decrypted
     *
     * @returns { string } the decrypted verification code
     */
    async decryptCode(verificationCode: string):Promise<string> {
        const { decrypt } = encryptionSdk.buildClient(
            encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
        const generatorKeyId = process.env.KEY_ALIAS;
        const keyIds = [process.env.KEY_ID as string ];
        const keyring = new encryptionSdk.KmsKeyringNode(
            { generatorKeyId: generatorKeyId, keyIds: keyIds });
        const encryptedtext = b64.toByteArray(verificationCode);
        const { plaintext } = await decrypt(keyring, encryptedtext);
        const plainTextCode = plaintext;
        console.log(plainTextCode);
        console.log(plainTextCode.toString());
        return plainTextCode.toString();
    }


}