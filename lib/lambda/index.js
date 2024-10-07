const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// lib/lambda/index.js

exports.handler = async (event) => {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      console.log(`Processing file from bucket: ${bucket}, key: ${key}`);

      const fileExtension = key.substring(key.lastIndexOf('.')).toLowerCase();
      console.log(`File extension: ${fileExtension}`);

      const supportedFileTypes = ['.mp4', '.wav'];

      if (!supportedFileTypes.includes(fileExtension)) {
          console.log(`Unsupported file type: ${fileExtension}. Skipping processing.`);
          continue; // I only want to process the file type I want, nothing else.
      }

      try {
          const params = {
              Bucket: bucket,
              Key: key,
          };
          const data = await s3.getObject(params).promise();
          const fileContent = data.Body.toString('utf-8');
          console.log(`Content of ${key}:`, fileContent);
      } catch (error) {
          console.error(`Error processing file ${key} from bucket ${bucket}:`, error);
          throw error;
      }
  }

  return {
      statusCode: 200,
      body: 'Successfully processed all records.',
  };
};