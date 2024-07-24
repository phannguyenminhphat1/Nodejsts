import { Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'

export const createTweetController = (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  return res.json('Create Tweet Success')
}
