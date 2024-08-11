import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import { envConfig } from '~/constants/config'

const s3 = new S3({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

export const uploadFileToS3 = ({
  filename,
  filepath,
  content_type
}: {
  filename: string
  filepath: string
  content_type: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: envConfig.awsBucketName,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: content_type
    },

    // optional tags
    tags: [
      /*...*/
    ],
    queueSize: 4,
    partSize: 1024 * 1024 * 5,
    leavePartsOnError: false
  })
  return parallelUploads3.done()
}
