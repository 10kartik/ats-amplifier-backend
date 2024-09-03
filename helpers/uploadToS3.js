const AWS = require("aws-sdk");
const fs = require("fs");
require("dotenv").config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new AWS.S3();

const bucketName = process.env.S3_BUCKET_NAME;

/**
 * Uploads a file to S3.
 * @param {string} fileName - The name of the file to be saved in S3.
 * @param {string} filePath - The local path to the file.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file.
 */
async function uploadToS3(fileName, filePath) {
  // Read the file from the local filesystem
  const fileContent = fs.readFileSync(filePath);

  if (
    process.env.ACCESS_KEY_ID === undefined ||
    process.env.SECRET_ACCESS_KEY === undefined ||
    process.env.REGION === undefined ||
    process.env.S3_BUCKET_NAME === undefined
  ) {
    throw new Error("AWS credentials are not set");
  }

  // Set up S3 upload parameters
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: "application/pdf",
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return data.Location;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
}

// Export the function if you want to use it in other files
module.exports = uploadToS3;
