import express from 'express'
import { likeTweetController, unlikeController } from '~/controllers/likes.controllers'
import { likeIdValidator } from '~/middlewares/likes.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const likesRoutes = express.Router()

likesRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(likeTweetController)
)
likesRoutes.delete(
  '/:like_id',
  accessTokenValidator,
  verifiedUserValidator,
  likeIdValidator,
  wrapRequestHandlers(unlikeController)
)
export default likesRoutes
