import express from 'express'
import {
  createTweetController,
  getTweetController,
  getTweetChildrenController,
  getNewFeedsFollowingController,
  getAllNewFeedsController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const tweetRoutes = express.Router()

tweetRoutes.post(
  '/create-tweet',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandlers(createTweetController)
)

/**
 * Description: Get Tweet Details
 * Path: /get-tweet/:tweet_id
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Middlewares: tweetIdValidator, audienceValidator
 * Query: {limit: number, page:number}
 */

tweetRoutes.get(
  '/get-tweet/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandlers(getTweetController)
)

/**
 * Description: Get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Middlewares: tweetIdValidator, audienceValidator, paginationValidator
 * Query: {limit: number, page:number, tweet_type: TweetType}
 */
tweetRoutes.get(
  '/get-tweet/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandlers(getTweetChildrenController)
)

/**
 * Description: Get new feeds following user
 * Path: /new-feeds/following
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page:number, tweet_type: TweetType}
 */
tweetRoutes.get(
  '/new-feeds/following',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandlers(getNewFeedsFollowingController)
)

tweetRoutes.get(
  '/new-feeds/all',
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandlers(getAllNewFeedsController)
)

export default tweetRoutes
