import { NotificationSchema } from '~/models/schemas/Notifications.schema'
import { databaseService } from './database.services'
import { ObjectId } from 'mongodb'
import { NotificationStatus, NotificationStatusType, NotiType } from '~/constants/enum'

class NotificationsServices {
  async getUserNotificationsService({
    current_user_id,
    limit,
    page,
    status
  }: {
    current_user_id: string
    limit: number
    page: number
    status?: NotificationStatus
  }) {
    const matchStage: any = {
      'tweet.user_id': new ObjectId(current_user_id)
    }

    if (status) {
      if (status === NotificationStatus.Read) {
        matchStage['status'] = NotificationStatusType.Read
      } else {
        matchStage['status'] = NotificationStatusType.Unread
      }
    }

    const [listNotifications, total] = await Promise.all([
      databaseService.notifications
        .aggregate<NotificationSchema>([
          {
            $lookup: {
              from: 'tweets',
              localField: 'tweet_id',
              foreignField: '_id',
              as: 'tweet'
            }
          },
          {
            $unwind: {
              path: '$tweet'
            }
          },
          {
            $match: matchStage
          },
          {
            $project: {
              tweet_id: 0
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
      databaseService.notifications
        .aggregate([
          {
            $lookup: {
              from: 'tweets',
              localField: 'tweet_id',
              foreignField: '_id',
              as: 'tweet'
            }
          },
          {
            $unwind: {
              path: '$tweet'
            }
          },
          {
            $match: matchStage
          },
          { $count: 'total' }
        ])
        .toArray()
    ])
    const notifications = await Promise.all(
      listNotifications.map(async (item) => {
        let username = ''
        const findUser = await databaseService.users.findOne({
          _id: new ObjectId(item.user_id)
        })

        if (!findUser) {
          username = 'User no longer exists'
        } else {
          username = findUser.username
        }

        return { ...item, content: `${username} was ${item.type} your tweet` }
      })
    )

    return {
      notifications,
      total: total[0]?.total || 0
    }
  }

  async saveNotifications({ user_id, tweet_id, type }: { user_id: string; tweet_id: string; type: NotiType }) {
    await databaseService.notifications.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id),
        type
      },
      {
        $setOnInsert: new NotificationSchema({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
          type
        })
      },
      {
        upsert: true
      }
    )
  }
}

const notificationsServices = new NotificationsServices()
export default notificationsServices
