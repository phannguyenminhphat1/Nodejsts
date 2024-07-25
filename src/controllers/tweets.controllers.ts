import { Request, Response } from 'express'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { config } from 'dotenv'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'

config()
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweetsService(user_id, req.body)
  return res.json(result)
}
