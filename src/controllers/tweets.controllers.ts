import { Request, Response } from 'express'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { GetTweetRequestParams, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { config } from 'dotenv'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import { TweetType } from '~/constants/enum'

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
    guest_views: result.guest_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    tweet
  })
}

/**
 * Description: Get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Query: {limit: number, page:number, tweet_type: TweetType}
 */

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const { tweets, total } = await tweetsService.getTweetChildrenService({
    limit,
    page,
    tweet_id: req.params.tweet_id,
    tweet_type
  })
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    tweets,
    tweet_type,
    limit,
    current_page: page,
    total: total,
    total_page: Math.ceil(total / limit)
  })
}
