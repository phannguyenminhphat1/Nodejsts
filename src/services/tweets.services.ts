import { NextFunction, Request, Response } from 'express'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { databaseService } from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import HashTag from '~/models/schemas/Hashtag.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import User from '~/models/schemas/User.schema'

export class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagsDocument = await Promise.all(
      hashtags.map((hashtag) =>
        databaseService.hashtags.findOneAndUpdate(
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

  async checkMentions(mentions: string[]) {
    const mentionsDocument = []
    for (const mention of mentions) {
      const findMention = await databaseService.users.findOne({ username: mention })
      if (!findMention) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND + ':' + ' ' + mention,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      mentionsDocument.push(findMention)
    }
    return mentionsDocument.map((item) => (item as WithId<User>)._id)
  }

  async createTweetsService(user_id: string, body: TweetRequestBody) {
    const { audience, content, hashtags, medias, mentions, parent_id, type } = body
    const hashTags = await this.checkAndCreateHashtag(hashtags)
    const menTions = await this.checkMentions(mentions)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        type,
        audience,
        content,
        hashtags: hashTags,
        mentions: menTions,
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

  async increaseViewService(user_id: string, tweet_id: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
    return result as { user_views: number; guest_views: number }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
