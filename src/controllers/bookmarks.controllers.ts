import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import {
  BookmarkRequestBody,
  BookmarkRequestParams,
  BookmarkTweetRequestParams
} from '~/models/requests/Bookmark.requests'
import bookmarksService from '~/services/bookmarks.services'
import { BOOKMARK_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarksService.bookmarkTweetServices(user_id, req.body)
  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result
  })
}

export const unBookmarkTweetController = async (req: Request<BookmarkTweetRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await bookmarksService.unBookmarkTweetServices(user_id, tweet_id)
  return res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
  })
}

export const unbookmarkController = async (req: Request<BookmarkRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { bookmark_id } = req.params
  await bookmarksService.unbookmarkService(user_id, bookmark_id)
  return res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
  })
}
