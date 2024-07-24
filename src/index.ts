import express from 'express'
import rootRoutes from './routes/root.routes'
import { databaseService } from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { initFolderImage, initFolderVideo } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
config()

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})
const app = express()
const port = process.env.PORT || 8080
initFolderImage()
initFolderVideo()

app.use(express.json())
app.use('/api', rootRoutes)
// app.use('/api/static/video-stream', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(path.resolve(UPLOAD_IMAGE_DIR)))
app.use(defaultErrorHandler)

app.listen(port)
