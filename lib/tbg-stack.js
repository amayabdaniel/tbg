"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TbgStack = void 0;
const cdk = require("aws-cdk-lib");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
const s3 = require("aws-cdk-lib/aws-s3");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
const path = require("path");
const iam = require("aws-cdk-lib/aws-iam");
class TbgStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = new s3.Bucket(this, 'tbgbucket', {
            versioned: true,
            //the 2 options below were just created for the tech test.
            removalPolicy: cdk.RemovalPolicy.DESTROY, //done for testing purposes, RETAIN is the option to not delete de bucket when stack is deleted.
            autoDeleteObjects: true, // in case everything is deleted, delete the objects first, if true, manual cleanup would be required.
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
        bucket.grantReadWrite(lambdaFunction);
        const videoFileTypes = ['.mp4', '.wav'];
        lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [bucket.arnForObjects('*')],
        }));
        //notification for the chosen type file .mp4 and .wav
        videoFileTypes.forEach((suffix) => {
            bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(lambdaFunction), { suffix });
        });
        lambdaFunction.addPermission('AllowS3Invoke', {
            action: 'lambda:InvokeFunction',
            principal: new cdk.aws_iam.ServicePrincipal('s3.amazonaws.com'),
            sourceArn: bucket.bucketArn,
        });
    }
}
exports.TbgStack = TbgStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGJnLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGJnLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyw4Q0FBOEM7QUFDOUMseUNBQXlDO0FBQ3pDLGlEQUFpRDtBQUNqRCx3REFBd0Q7QUFDeEQsNkJBQTZCO0FBQzdCLDJDQUEyQztBQUczQyxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzlDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsMERBQTBEO1lBQzFELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxnR0FBZ0c7WUFDMUksaUJBQWlCLEVBQUUsSUFBSSxFQUFFLHNHQUFzRztTQUNoSSxDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ25FLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNELFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDL0I7WUFDRCxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1NBQ2xDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFHeEMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDckQsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSixxREFBcUQ7UUFDckQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDekIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUN6QyxFQUFFLE1BQU0sRUFBRSxDQUNYLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFO1lBQzVDLE1BQU0sRUFBRSx1QkFBdUI7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztZQUMvRCxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7U0FDNUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBN0NELDRCQTZDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbi8vIGltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBzM24gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcblxuXG5leHBvcnQgY2xhc3MgVGJnU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICd0YmdidWNrZXQnLCB7XG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICAvL3RoZSAyIG9wdGlvbnMgYmVsb3cgd2VyZSBqdXN0IGNyZWF0ZWQgZm9yIHRoZSB0ZWNoIHRlc3QuXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvL2RvbmUgZm9yIHRlc3RpbmcgcHVycG9zZXMsIFJFVEFJTiBpcyB0aGUgb3B0aW9uIHRvIG5vdCBkZWxldGUgZGUgYnVja2V0IHdoZW4gc3RhY2sgaXMgZGVsZXRlZC5cbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLCAvLyBpbiBjYXNlIGV2ZXJ5dGhpbmcgaXMgZGVsZXRlZCwgZGVsZXRlIHRoZSBvYmplY3RzIGZpcnN0LCBpZiB0cnVlLCBtYW51YWwgY2xlYW51cCB3b3VsZCBiZSByZXF1aXJlZC5cbiAgICB9KTtcblxuICAgIGNvbnN0IGxhbWJkYUZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnTXlMYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICdsYW1iZGEnKSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBCVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICB9LFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgIH0pO1xuXG4gICAgYnVja2V0LmdyYW50UmVhZFdyaXRlKGxhbWJkYUZ1bmN0aW9uKTtcbiAgICBjb25zdCB2aWRlb0ZpbGVUeXBlcyA9IFsnLm1wNCcsICcud2F2J107XG5cbiBcbiAgICBsYW1iZGFGdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcbiAgICAgIHJlc291cmNlczogW2J1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAgIH0pKTtcblxuICAgIC8vbm90aWZpY2F0aW9uIGZvciB0aGUgY2hvc2VuIHR5cGUgZmlsZSAubXA0IGFuZCAud2F2XG4gICAgdmlkZW9GaWxlVHlwZXMuZm9yRWFjaCgoc3VmZml4KSA9PiB7XG4gICAgICBidWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXG4gICAgICAgIHMzLkV2ZW50VHlwZS5PQkpFQ1RfQ1JFQVRFRCxcbiAgICAgICAgbmV3IHMzbi5MYW1iZGFEZXN0aW5hdGlvbihsYW1iZGFGdW5jdGlvbiksXG4gICAgICAgIHsgc3VmZml4IH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBsYW1iZGFGdW5jdGlvbi5hZGRQZXJtaXNzaW9uKCdBbGxvd1MzSW52b2tlJywge1xuICAgICAgYWN0aW9uOiAnbGFtYmRhOkludm9rZUZ1bmN0aW9uJyxcbiAgICAgIHByaW5jaXBhbDogbmV3IGNkay5hd3NfaWFtLlNlcnZpY2VQcmluY2lwYWwoJ3MzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIHNvdXJjZUFybjogYnVja2V0LmJ1Y2tldEFybixcbiAgICB9KTtcbiAgfVxufVxuIl19