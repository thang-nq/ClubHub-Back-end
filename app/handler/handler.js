const multer = require('multer')
const aws = require('aws-sdk')
const env = require('dotenv')
const { v4: uuidv4 } = require('uuid');
env.config()

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})



const handler = {

    // Get the current date in Ho Chi Minh
    getCurrentTime: () => {
        const today = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })
        return today
    },



    //Parameters for uploading avatar
    awsAvatarParams: (req) => {


        const avatarName = req.userId + "avatar"
        const params = {

            Bucket: process.env.AWS_BUCKET_NAME,
            Key: avatarName,
            Body: req.file.buffer,
            ACL: "public-read-write",
            ContentType: "image"
        }
        return params
    },


    awsPostImagesParams: (req) => {
        const postImageName = uuidv4()
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: postImageName,
            Body: req.files,
            ACL: "public-read-write",
            ContentType: "image"
        }
        return params
    }


}


module.exports = { handler, s3 }