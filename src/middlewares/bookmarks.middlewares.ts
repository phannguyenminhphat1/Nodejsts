import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { databaseService } from '~/services/database.services'
import { validate } from '~/utils/validate'

export const bookmarkIdValidator = validate(
  checkSchema(
    {
      bookmark_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.INVALID_BOOKMARK_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const bookmark = await databaseService.bookmarks.findOne({
              _id: new ObjectId(value)
            })
            if (!bookmark) {
              throw new ErrorWithStatus({
                message: BOOKMARK_MESSAGES.BOOKMARK_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
