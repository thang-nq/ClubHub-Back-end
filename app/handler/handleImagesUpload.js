const env = require('dotenv')
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { v4: uuidv4 } = require('uuid');

env.config()

const s3 = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    }
})

// Delete an images
const deleteImage = key => {
    try {
        s3.send(new DeleteObjectCommand(key)).then(result => {
            return result
        })
    } catch (error) {
        console.log("Error", error)
    }
}


//Filter file with jpeg, jpg, png
const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
//For uploading avatar - single file
const uploadAvatar = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, req.userId + "avatar")
        },
        acl: "public-read-write",
        contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    fileFilter: filefilter
}).single('useravatar')


//Multiple images uploading - max 5 images
const uploadImages = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, uuidv4())
        },
        acl: "public-read-write",
        contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    fileFilter: filefilter
}).array("images", 5)

module.exports = { uploadAvatar, uploadImages, deleteImage }