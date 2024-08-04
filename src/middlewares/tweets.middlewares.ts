import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import { databaseService } from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validate'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

// export enum TweetType {
//   Tweet,
//   Retweet,
//   Comment,
//   QuoteTweet
// }

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: TWEETS_MESSAGES.INVALID_TYPE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          // Nếu type là retweet, comment, quotetweet thì parent_id phải là tweet_id của tweet cha
          const type = req.body.type as TweetType
          if ([TweetType.Retweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          // nếu type là tweet thì parent_id phải là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: {
        errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_A_STRING
      },
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }

          // Nếu `type` là retweet thì `content` phải là `''`.
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },

    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Mỗi phần từ trong array là string
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Mỗi phần từ trong array là user_id
          // if (value.some((item: any) => !ObjectId.isValid(item))) {
          //   throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          // }
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USERNAME)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là Media Object
          if (value.some((item: any) => typeof item.url !== 'string' || !mediaTypes.includes(item.type))) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.INVALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweets_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comments_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quotes_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    },
                    total_views: {
                      $add: ['$user_views', '$guest_views']
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: {
          errorMessage: TWEETS_MESSAGES.LIMIT_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1 || num > 50) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.LIMIT_LENGTH_MUST_BE_FROM_1_TO_50,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      page: {
        isNumeric: {
          errorMessage: TWEETS_MESSAGES.PAGE_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.PAGE_LENGTH_MUST_GREATER_THAN_1,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tweet = req.tweet as Tweet
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // Check User đã đăng nhập chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      // Check tác giả của bài tweet này bị banned hay bị xóa rồi
      const author = await databaseService.users.findOne({
        _id: new ObjectId(tweet.user_id)
      })
      if (!author || author.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          message: TWEETS_MESSAGES.TWEET_AUTHOR_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // check user có nằm trong twitter circle hay không.
      const { user_id } = req.decoded_authorization as TokenPayload
      const isInTwitterCircle = author.twitter_circle.some((user_id_circle) => user_id_circle.equals(user_id))
      if (!author._id.equals(user_id) && !isInTwitterCircle) {
        throw new ErrorWithStatus({
          message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}
