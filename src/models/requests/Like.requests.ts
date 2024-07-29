import { ObjectId } from 'mongodb'
import { ParamsDictionary } from 'express-serve-static-core'

export interface LikeRequestBody {
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}

export interface LikeRequestParams extends ParamsDictionary {
  like_id: string
}

export interface LikeTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}
