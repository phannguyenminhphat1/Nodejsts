import express from 'express'
import rootRoutes from './routes/root.routes'
import { databaseService } from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolderImage, initFolderVideo } from './utils/file'
import { config } from 'dotenv'
import cors, { CorsOptions } from 'cors'
// import './utils/fake'
import './utils/s3'
import { createServer } from 'http'
import initSocket from './utils/socket'

config()

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})
const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 8080
initFolderImage()
initFolderVideo()

app.use(express.json())
app.use(cors())
app.use('/api', rootRoutes)
app.use(defaultErrorHandler)
// app.use('/api/static/video-stream', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(path.resolve(UPLOAD_IMAGE_DIR)))
initSocket(httpServer)

httpServer.listen(port)
