import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { GetNotificationsRequestQuery } from '~/models/requests/Notification.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import notificationsServices from '~/services/notifications.services'

export const getUserNotificationController = async (
  req: Request<ParamsDictionary, any, any, GetNotificationsRequestQuery>,
  res: Response
) => {
  const current_user_id = (req.decoded_authorization as TokenPayload).user_id
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const result = await notificationsServices.getUserNotificationsService({
    current_user_id,
    page,
    limit,
    status: req.query.status
  })
  return res.json({
    message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
    notifications: result.notifications,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}
