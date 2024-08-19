import express from 'express'
import { getUserNotificationController } from '~/controllers/notifications.controllers'
import { notificationStatusValidator } from '~/middlewares/notifications.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'

const notificationsRoutes = express.Router()

/**
 * Description: Get user notifications
 * Path: /get-notifications
 * Method: GET
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: paginationValidator, verifiedUserValidator, accessTokenValidator,notificationStatusValidator
 */
notificationsRoutes.get(
  '/get-notifications',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  notificationStatusValidator,
  wrapRequestHandlers(getUserNotificationController)
)

export default notificationsRoutes
