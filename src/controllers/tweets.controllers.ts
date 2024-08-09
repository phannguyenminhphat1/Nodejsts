import { Request, Response } from 'express'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  GetTweetChildrenRequestQuery,
  GetTweetRequestParams,
  PaginationRequestQuery,
  TweetRequestBody
} from '~/models/requests/Tweet.requests'
import { config } from 'dotenv'
import tweetsService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
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

export const getTweetChildrenController = async (
  req: Request<GetTweetRequestParams, any, any, GetTweetChildrenRequestQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const user_id = req.decoded_authorization?.user_id
  const { tweet_id } = req.params
  const { tweets, total } = await tweetsService.getTweetChildrenService({
    limit,
    page,
    tweet_id,
    tweet_type,
    user_id
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

/**
 * Description: Get new feeds following user
 * Path: /new-feeds/following
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 * Query: {limit: number, page:number, tweet_type: TweetType}
 */
export const getNewFeedsFollowingController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetsService.getNewFeedsFollowingService({ user_id, limit, page })
  return res.json({
    message: TWEETS_MESSAGES.GET_NEW_FEEDS_FOLLOWING_SUCCESSFULLY,
    tweets: result.tweets,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}

/**
 * Description: Get all new feeds
 * Path: /new-feeds/all
 * Method: GET
 * Header: {Authorization?: Bearer <access_token>}
 * Query: {limit: number, page:number, tweet_type: TweetType}
 */
//Hỏng
export const getAllNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.getAllNewFeedsService({ user_id: user_id, limit, page })
  return res.json({
    message: TWEETS_MESSAGES.GET_ALL_NEW_FEEDS_SUCCESSFULLY,
    tweets: result.tweets,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}
