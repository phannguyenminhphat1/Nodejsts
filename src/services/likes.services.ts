import { databaseService } from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { LIKE_MESSAGES } from '~/constants/messages'
import { Like } from '~/models/schemas/Like.schema'
import { LikeRequestBody } from '~/models/requests/Like.requests'
import { NotificationSchema } from '~/models/schemas/Notifications.schema'
import { NotiType } from '~/constants/enum'

export class LikesService {
  async likeTweetServices(user_id: string, likeRequestBody: LikeRequestBody) {
    const [result] = await Promise.all([
      databaseService.likes.findOneAndUpdate(
        {
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(likeRequestBody.tweet_id)
        },
        {
          $setOnInsert: new Like({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(likeRequestBody.tweet_id)
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
          tweet_id: new ObjectId(likeRequestBody.tweet_id),
          type: NotiType.Like
        },
        {
          $setOnInsert: new NotificationSchema({
            user_id: new ObjectId(user_id),
            tweet_id: new ObjectId(likeRequestBody.tweet_id),
            type: NotiType.Like
          })
        },
        {
          upsert: true
        }
      )
    ])
    return result as WithId<Like>
  }

  async unlikeService(user_id: string, like_id: string) {
    await databaseService.likes.deleteOne({
      _id: new ObjectId(like_id),
      user_id: new ObjectId(user_id)
    })
    return {
      message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY
    }
  }

  async getLikesService({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const [likes, countLikes] = await Promise.all([
      await databaseService.likes
        .aggregate<Like>([
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
      await databaseService.likes.countDocuments({ user_id: new ObjectId(user_id) })
    ])
    return {
      likes,
      total: countLikes || 0
    }
  }
}

const likesService = new LikesService()
export default likesService
