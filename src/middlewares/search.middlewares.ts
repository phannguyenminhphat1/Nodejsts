import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { CountryLocation, MediaTypeRequestQuery, PeopleFollowTypeRequestQuery } from '~/constants/enum'
import { SEARCH_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { databaseService } from '~/services/database.services'
import { validate } from '~/utils/validate'

const peopleFollowSchema: ParamSchema = {
  optional: true,
  isIn: {
    options: [Object.values(PeopleFollowTypeRequestQuery)],
    errorMessage: SEARCH_MESSAGES.INVALID_PEOPLE_FOLLOW
  }
}
export const advancedSearchValidator = validate(
  checkSchema(
    {
      content: {
        notEmpty: {
          errorMessage: SEARCH_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 3,
            max: 100
          },
          errorMessage: SEARCH_MESSAGES.CONTENT_LENGTH_MUST_BE_FROM_3_TO_100
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeRequestQuery)],
          errorMessage: SEARCH_MESSAGES.INVALID_MEDIA_TYPE
        }
      },
      people_follow: peopleFollowSchema
    },
    ['query']
  )
)

export const searchUsersValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 2,
            max: 100
          },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_2_TO_100
        }
      },
      people_follow: peopleFollowSchema,
      location: {
        optional: true,
        isIn: {
          options: [Object.values(CountryLocation)],
          errorMessage: SEARCH_MESSAGES.INVALID_LOCATION
        }
      }
    },
    ['query']
  )
)
