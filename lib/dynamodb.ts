import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface DynamoDBProps {
  partitionKey: { name: string; type: cdk.aws_dynamodb.AttributeType };
  sortKey?: { name: string; type: cdk.aws_dynamodb.AttributeType };
  gsiList?: Array<{
    indexName: string;
    partitionKey: { name: string; type: cdk.aws_dynamodb.AttributeType };
    sortKey?: { name: string; type: cdk.aws_dynamodb.AttributeType };
  }>;
}
export class DynamoDBTable extends Construct {
  readonly table: cdk.aws_dynamodb.Table;
  constructor(scope: Construct, id: string, props: DynamoDBProps) {
    super(scope, id);
    let tableProps: TableProps = {
      partitionKey: props.partitionKey,
      pointInTimeRecovery: true,
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    };
    if (props.sortKey) tableProps.sortKey = props.sortKey;
    this.table = new cdk.aws_dynamodb.Table(this, id, tableProps);
    props.gsiList?.map((gsi) => {
      this.table.addGlobalSecondaryIndex(gsi);
    });
  }
}

interface TableProps {
  partitionKey: { name: string; type: cdk.aws_dynamodb.AttributeType };
  sortKey?: { name: string; type: cdk.aws_dynamodb.AttributeType };
  pointInTimeRecovery: true;
  billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST;
}
