import { databaseService } from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { LIKE_MESSAGES } from '~/constants/messages'
import { Like } from '~/models/schemas/Like.schema'
import { LikeRequestBody } from '~/models/requests/Like.requests'

export class LikesService {
  async likeTweetServices(user_id: string, likeRequestBody: LikeRequestBody) {
    const result = await databaseService.likes.findOneAndUpdate(
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
    )
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
}

const likesService = new LikesService()
export default likesService
