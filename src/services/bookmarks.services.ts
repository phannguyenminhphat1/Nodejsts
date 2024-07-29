import { BookmarkRequestBody } from '~/models/requests/Bookmark.requests'
import { databaseService } from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { Bookmark } from '~/models/schemas/Bookmarks.schema'
import { BOOKMARK_MESSAGES } from '~/constants/messages'

export class BookmarksService {
  async bookmarkTweetServices(user_id: string, bookmarkRequestBody: BookmarkRequestBody) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(bookmarkRequestBody.tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(bookmarkRequestBody.tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as WithId<Bookmark>
  }
  async unBookmarkTweetServices(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result as WithId<Bookmark>
  }

  async unbookmarkService(user_id: string, bookmark_id: string) {
    await databaseService.bookmarks.deleteOne({
      _id: new ObjectId(bookmark_id),
      user_id: new ObjectId(user_id)
    })
    return {
      message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
    }
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
