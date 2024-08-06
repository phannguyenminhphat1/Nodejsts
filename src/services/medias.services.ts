import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fsPromise from 'fs/promises'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { uploadFileToS3 } from '~/utils/s3'
config()
class MediasServices {
  async uploadImageService(req: Request, res: Response, next: NextFunction) {
    const mime = (await import('mime')).default
    const files = await handleUploadImage(req, res, next)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFileName,
          filepath: newPath,
          content_type: mime.getType(newPath) as string
        })

        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideoService(req: Request, res: Response, next: NextFunction) {
    const mime = (await import('mime')).default
    const files = await handleUploadVideo(req, res, next)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newPath = path.resolve(UPLOAD_VIDEO_DIR, file.newFilename)

        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filepath: file.filepath,
          content_type: mime.getType(file.filepath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
