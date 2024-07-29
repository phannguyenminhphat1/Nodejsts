import express from 'express'
import {
  bookmarkTweetController,
  unbookmarkController,
  unBookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { bookmarkIdValidator } from '~/middlewares/bookmarks.middlewares'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const bookmarksRoutes = express.Router()

bookmarksRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(bookmarkTweetController)
)
bookmarksRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandlers(unBookmarkTweetController)
)
bookmarksRoutes.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  bookmarkIdValidator,
  wrapRequestHandlers(unbookmarkController)
)

export default bookmarksRoutes
