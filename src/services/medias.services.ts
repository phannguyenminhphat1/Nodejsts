import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'

config()
class MediasServices {
  async uploadImageService(req: Request, res: Response, next: NextFunction) {
    const files = await handleUploadImage(req, res, next)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg({ quality: 20 }).toFile(newPath)
        await fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/api/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideoService(req: Request, res: Response, next: NextFunction) {
    const files = await handleUploadVideo(req, res, next)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video-stream/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/api/static/video-stream/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
