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
import { TweetType } from '~/constants/enum'

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
      message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
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
          guest_views: 1,
          updated_at: 1
        }
      }
    )
    return result as { user_views: number; guest_views: number; updated_at: Date }
  }

  async getTweetChildrenService({
    limit,
    page,
    tweet_id,
    tweet_type,
    user_id
  }: {
    limit: number
    page: number
    tweet_id: string
    tweet_type: TweetType
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $sort: {
            created_at: -1 // Sắp xếp theo ngày tạo giảm dần, tweet mới nhất lên trước
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
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const date = new Date()
    const ids = tweets.map((item) => item._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const [total] = await Promise.all([
      await databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      }),
      await databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      )
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return { tweets, total }
  }

  async getNewFeedsFollowingService({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const current_user_id = new ObjectId(user_id)
    const followed_user_id = await databaseService.followers
      .find(
        {
          user_id: current_user_id
        },
        {
          projection: {
            followed_user_id: 1
          }
        }
      )
      .toArray()
    if (followed_user_id.length < 1) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.USER_CURRENTLY_DO_NOT_FOLLOW_ANYONE,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const ids = followed_user_id.map((item) => item.followed_user_id)
    ids.push(current_user_id)

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: ids
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    $or: [
                      {
                        'user.twitter_circle': {
                          $in: [current_user_id]
                        }
                      },
                      {
                        user_id: current_user_id
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          $sort: {
            created_at: -1 // Sắp xếp theo ngày tạo giảm dần, tweet mới nhất lên trước
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
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
            }
          }
        },
        {
          $project: {
            tweet_children: 0,
            user: {
              email_verify_token: 0,
              forgot_password_token: 0,
              verify: 0,
              password: 0,
              created_at: 0,
              updated_at: 0,
              twitter_circle: 0,
              website: 0,
              location: 0,
              cover_photo: 0
            }
          }
        }
      ])
      .toArray()

    const tweet_ids = tweets.map((item) => item._id as ObjectId)
    const date = new Date()
    const inc = { user_views: 1 }
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweet_ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      $or: [
                        {
                          'user.twitter_circle': {
                            $in: [current_user_id]
                          }
                        },
                        {
                          user_id: current_user_id
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          { $count: 'total' }
        ])
        .toArray()
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return { tweets, total: total[0]?.total || 0 }
  }

  // Chưa có làm
  async getAllNewFeedsService({ user_id, limit, page }: { user_id?: string; limit: number; page: number }) {
    const current_user_id = new ObjectId(user_id)
    const followed_user_id = await databaseService.followers
      .find(
        {
          user_id: current_user_id
        },
        {
          projection: {
            followed_user_id: 1
          }
        }
      )
      .toArray()
    if (followed_user_id.length < 1) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.USER_CURRENTLY_DO_NOT_FOLLOW_ANYONE,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const ids = followed_user_id.map((item) => item.followed_user_id)
    ids.push(current_user_id)

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: ids
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    $or: [
                      {
                        'user.twitter_circle': {
                          $in: [current_user_id]
                        }
                      },
                      {
                        user_id: current_user_id
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          $sort: {
            created_at: -1 // Sắp xếp theo ngày tạo giảm dần, tweet mới nhất lên trước
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
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
            }
          }
        },
        {
          $project: {
            tweet_children: 0,
            user: {
              email_verify_token: 0,
              forgot_password_token: 0,
              verify: 0,
              password: 0,
              created_at: 0,
              updated_at: 0,
              twitter_circle: 0,
              website: 0,
              location: 0,
              cover_photo: 0
            }
          }
        }
      ])
      .toArray()

    const tweet_ids = tweets.map((item) => item._id as ObjectId)
    const date = new Date()
    const inc = { user_views: 1 }
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweet_ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      $or: [
                        {
                          'user.twitter_circle': {
                            $in: [current_user_id]
                          }
                        },
                        {
                          user_id: current_user_id
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          { $count: 'total' }
        ])
        .toArray()
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return { tweets, total: total[0]?.total || 0 }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
