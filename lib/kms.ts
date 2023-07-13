import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class KMS extends Construct {
    readonly kmsKey: cdk.aws_kms.Key;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.kmsKey = new cdk.aws_kms.Key(this, 'PMKey', {
            enableKeyRotation: true, 
        });
        this.kmsKey.addAlias('alias/PMKey');
    } 

}