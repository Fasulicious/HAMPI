import AWS from 'aws-sdk'
import fs from 'fs'

AWS.config.update({
  region: 'us-east-1'
})

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export default async (path, folder, id) => {
  const params = {
    ACL: 'public-read',
    Bucket: 'mindtec-hampi',
    Body: fs.createReadStream(path),
    Key: `${folder}/${id}`
  }
  const putObjectPromise = s3.putObject(params).promise()
  await putObjectPromise
  fs.unlinkSync(path)
}
