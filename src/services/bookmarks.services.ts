import { BookmarkRequestBody } from '~/models/requests/Bookmark.requests'
import { databaseService } from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { Bookmark } from '~/models/schemas/Bookmarks.schema'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { NotificationSchema } from '~/models/schemas/Notifications.schema'
import { NotiType } from '~/constants/enum'

export class BookmarksService {
  async bookmarkTweetServices(user_id: string, bookmarkRequestBody: BookmarkRequestBody) {
    const [result] = await Promise.all([
      databaseService.bookmarks.findOneAndUpdate(
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
      ),
      databaseService.notifications.findOneAndUpdate(
        {
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(bookmarkRequestBody.tweet_id),
          type: NotiType.Bookmark
        },
        {
          $setOnInsert: new NotificationSchema({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(bookmarkRequestBody.tweet_id),
            type: NotiType.Bookmark
          })
        },
        {
          upsert: true
        }
      )
    ])
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

  async getBookmarksService({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const [bookmarks, countBookmarks] = await Promise.all([
      await databaseService.bookmarks
        .aggregate<Bookmark>([
          {
            $match: {
              user_id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: 'tweet_id',
              foreignField: '_id',
              as: 'tweet'
            }
          },
          {
            $unwind: {
              path: '$tweet'
            }
          },
          {
            $project: {
              tweet_id: 0
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      await databaseService.bookmarks.countDocuments({ user_id: new ObjectId(user_id) })
    ])
    return {
      bookmarks,
      total: countBookmarks || 0
    }
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
