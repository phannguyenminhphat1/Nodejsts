import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  // mentions: string[] // user_id[]
  mentions: string[] // username[]
  medias: Media[]
}

export interface GetTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface GetTweetChildrenRequestQuery extends PaginationRequestQuery, Query {
  tweet_type: string
}

export interface PaginationRequestQuery extends Query {
  limit: string
  page: string
}
