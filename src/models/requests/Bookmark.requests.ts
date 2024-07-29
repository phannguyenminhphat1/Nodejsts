import { ObjectId } from 'mongodb'
import { ParamsDictionary } from 'express-serve-static-core'

export interface BookmarkRequestBody {
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}

export interface BookmarkRequestParams extends ParamsDictionary {
  bookmark_id: string
}

export interface BookmarkTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}
