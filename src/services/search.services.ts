import { ObjectId } from 'mongodb'
import { databaseService } from './database.services'
import {
  LocationType,
  MediaType,
  MediaTypeRequestQuery,
  PeopleFollowTypeRequestQuery,
  TweetType
} from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { TWEETS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

export class SearchServices {
  async advancedSearchService({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeRequestQuery
    people_follow?: PeopleFollowTypeRequestQuery
  }) {
    const current_user_id = new ObjectId(user_id)
    const match: any = {
      $text: {
        $search: content
      }
    }
    if (media_type) {
      if (media_type === MediaTypeRequestQuery.Image) {
        match['medias.type'] = MediaType.Image
      } else {
        match['medias.type'] = MediaType.Video
      }
    }
    if (people_follow && people_follow === PeopleFollowTypeRequestQuery.Following) {
      const followed_user_id = await databaseService.followers
        .find({
          user_id: current_user_id
        })
        .toArray()

      if (followed_user_id.length < 1) {
        throw new ErrorWithStatus({
          message: TWEETS_MESSAGES.USER_CURRENTLY_DO_NOT_FOLLOW_ANYONE,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const ids = followed_user_id.map((item) => item.followed_user_id)
      ids.push(current_user_id)
      match['user_id'] = {
        $in: ids
      }
    }
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: match
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
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: match
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

    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = { user_views: 1 }
    const date = new Date()

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
    ),
      tweets.forEach((tweet) => {
        tweet.updated_at = date
        tweet.user_views += 1
      })

    return { tweets, total: total[0]?.total || 0 }
  }

  async searchUsersService({
    limit,
    page,
    user_id,
    name,
    location,
    people_follow
  }: {
    limit: number
    page: number
    user_id: string
    name: string
    location?: LocationType
    people_follow?: PeopleFollowTypeRequestQuery
  }) {
    const current_user_id = new ObjectId(user_id)
    const matchStage: any = {
      $text: {
        $search: name
      }
    }
    // if (location) {
    //   console.log(location)
    // }
    if (people_follow && people_follow === PeopleFollowTypeRequestQuery.Following) {
      const followed_user_id = await databaseService.followers
        .find({
          user_id: current_user_id
        })
        .toArray()
      if (followed_user_id.length < 1) {
        throw new ErrorWithStatus({
          message: TWEETS_MESSAGES.USER_CURRENTLY_DO_NOT_FOLLOW_ANYONE,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const ids = followed_user_id.map((item) => item.followed_user_id)
      matchStage['_id'] = {
        $in: ids
      }
    }

    const [users, total] = await Promise.all([
      databaseService.users
        .aggregate([
          {
            $match: matchStage
          },
          {
            $project: {
              password: 0,
              created_at: 0,
              updated_at: 0,
              verify: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              email: 0,
              twitter_circle: 0
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.users
        .aggregate([
          {
            $match: {
              $text: {
                $search: name
              }
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    return {
      users,
      total: total[0]?.total || 0
    }
  }
}

const searchServices = new SearchServices()
export default searchServices
