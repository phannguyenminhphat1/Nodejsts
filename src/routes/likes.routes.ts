import express from 'express'
import { likeTweetController, unlikeController } from '~/controllers/likes.controllers'
import { likeIdValidator } from '~/middlewares/likes.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const likesRoutes = express.Router()

/**
 * Description: Like Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: tweetIdValidator, verifiedUserValidator, accessTokenValidator
 */
likesRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(likeTweetController)
)

/**
 * Description: Unlike Tweet By Like ID
 * Path: /:like_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: likeIdValidator, verifiedUserValidator, accessTokenValidator
 */
likesRoutes.delete(
  '/:like_id',
  accessTokenValidator,
  verifiedUserValidator,
  likeIdValidator,
  wrapRequestHandlers(unlikeController)
)
export default likesRoutes
