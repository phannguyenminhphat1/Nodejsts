import { Request, Response } from 'express'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { GetTweetRequestParams, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { config } from 'dotenv'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'

config()
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweetsService(user_id, req.body)
  return res.json(result)
}

export const getTweetController = async (req: Request<GetTweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetsService.increaseViewService(req.decoded_authorization?.user_id as string, tweet_id)
  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views
  }
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    tweet
  })
}
