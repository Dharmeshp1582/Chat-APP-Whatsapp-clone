import multer from "multer";
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { error } from "console";
import { resolve } from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFileOnCloudinary = (file) => {
  const options = {
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
  }
  return new Promise((resolve, reject) => {
    
    const uploader = file.mimetype.startsWith('video') ? cloudinary.uploader.upload_large : cloudinary.uploader.upload;

    uploader(file.path, options, (error, result) => {
      // remove local file after upload
      fs.unlink(file.path, () => {})

      if (error) {
        return reject(error)
      }
      resolve(result)
    })
  })
}


export const multerMiddleware = multer({dest: 'uploads/'}).single('media');