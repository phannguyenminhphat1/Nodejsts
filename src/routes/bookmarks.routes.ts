import express from 'express'
import {
  bookmarkTweetController,
  getBookmarksController,
  unbookmarkController,
  unBookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { bookmarkIdValidator } from '~/middlewares/bookmarks.middlewares'
import { paginationValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const bookmarksRoutes = express.Router()

/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: tweetIdValidator, verifiedUserValidator, accessTokenValidator
 */
bookmarksRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(bookmarkTweetController)
)

/**
 * Description: Unbookmark Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: tweetIdValidator, verifiedUserValidator, accessTokenValidator
 * Params: tweet_id
 */
bookmarksRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(unBookmarkTweetController)
)

/**
 * Description: Unbookmark Tweet By Bookmark ID
 * Path: /:bookmark_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: bookmarkIdValidator, verifiedUserValidator, accessTokenValidator
 * Params: bookmark_id
 */
bookmarksRoutes.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  bookmarkIdValidator,
  wrapRequestHandlers(unbookmarkController)
)

/**
 * Description: Get list bookmarks by user
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: verifiedUserValidator, accessTokenValidator
 */
bookmarksRoutes.get(
  '/get-bookmarks',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandlers(getBookmarksController)
)

export default bookmarksRoutes
