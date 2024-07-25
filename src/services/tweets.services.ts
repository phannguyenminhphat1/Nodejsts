import { NextFunction, Request, Response } from 'express'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { databaseService } from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/Hashtag.schema'

export class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagsDocument = await Promise.all(
      hashtags.map((hashtag) =>
        databaseService.hashTags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new HashTag({ name: hashtag })
          },
          { upsert: true, returnDocument: 'after' }
        )
      )
    )
    return hashtagsDocument.map((hashtag) => (hashtag as WithId<HashTag>)._id)
  }

  async createTweetsService(user_id: string, body: TweetRequestBody) {
    const { audience, content, hashtags, medias, mentions, parent_id, type } = body
    const hashTags = await this.checkAndCreateHashtag(hashtags)
    console.log(hashTags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        type,
        audience,
        content,
        hashtags: hashTags,
        mentions,
        medias,
        parent_id,
        user_id: new ObjectId(user_id),
        created_at: new Date(),
        updated_at: new Date()
      })
    )
    const tweet = await databaseService.tweets.findOne({
      _id: result.insertedId
    })
    return {
      message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
      tweet
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
