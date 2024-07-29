import express from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const tweetRoutes = express.Router()

tweetRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandlers(createTweetController)
)
tweetRoutes.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandlers(getTweetController)
)

export default tweetRoutes
