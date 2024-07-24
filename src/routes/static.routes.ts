import express from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'
const staticRoute = express.Router()

staticRoute.get('/image/:name', serveImageController)
staticRoute.get('/video-stream/:name', serveVideoStreamController)

export default staticRoute
