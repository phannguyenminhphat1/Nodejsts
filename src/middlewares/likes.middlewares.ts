import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { LIKE_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { databaseService } from '~/services/database.services'
import { validate } from '~/utils/validate'

export const likeIdValidator = validate(
  checkSchema(
    {
      like_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: LIKE_MESSAGES.INVALID_LIKE_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const like = await databaseService.likes.findOne({
              _id: new ObjectId(value)
            })
            if (!like) {
              throw new ErrorWithStatus({
                message: LIKE_MESSAGES.LIKE_NOT_FOUND,
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
