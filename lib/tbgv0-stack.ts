import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Tbgv0Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'tbgbucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
      autoDeleteObjects: true, // Use false for production-like envs
    });

    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const videoFileTypes = ['.mp4', '.MP4', '.wav', '.WAV'];

    videoFileTypes.forEach((suffix) => {
      bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.LambdaDestination(lambdaFunction),
        { suffix }
      );
    });

    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
    }));

    lambdaFunction.addPermission('AllowS3Invoke', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('s3.amazonaws.com'),
      sourceArn: bucket.bucketArn,
    });
  }
}
