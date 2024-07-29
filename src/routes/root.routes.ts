import express from 'express'
import userRoute from './user.routes'
import mediaRoute from './medias.routes'
import staticRoute from './static.routes'
import tweetRoutes from './tweet.routes'
import bookmarksRoutes from './bookmarks.routes'
import likesRoutes from './likes.routes'
const rootRoutes = express.Router()

rootRoutes.use('/users', userRoute)
rootRoutes.use('/medias', mediaRoute)
rootRoutes.use('/static', staticRoute)
rootRoutes.use('/tweets', tweetRoutes)
rootRoutes.use('/likes', likesRoutes)
rootRoutes.use('/bookmarks', bookmarksRoutes)

export default rootRoutes
