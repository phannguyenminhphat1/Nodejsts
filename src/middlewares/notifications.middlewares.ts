import { checkSchema } from 'express-validator'
import { NotificationStatus } from '~/constants/enum'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validate'

export const notificationStatusValidator = validate(
  checkSchema(
    {
      status: {
        optional: true,
        isIn: {
          options: [Object.values(NotificationStatus)],
          errorMessage: NOTIFICATIONS_MESSAGES.INVALID_STATUS_TYPE
        }
      }
    },
    ['query']
  )
)
