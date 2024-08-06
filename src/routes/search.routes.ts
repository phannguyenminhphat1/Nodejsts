import express from 'express'
import { advancedSearchController, searchUsersController } from '~/controllers/search.controllers'
import { advancedSearchValidator, searchUsersValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const searchRoutes = express.Router()

/**
 * Description: Search Tweets
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: paginationValidator, verifiedUserValidator, accessTokenValidator, advancedSearchValidator
 * Query: {limit, page, content, media_type?, people_follow? }
 */
searchRoutes.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  advancedSearchValidator,
  wrapRequestHandlers(advancedSearchController)
)

/**
 * Description: Search Users
 * Path: /search-users
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: paginationValidator, verifiedUserValidator, accessTokenValidator, searchUsersValidator
 * Query: {limit, page, name, location?, people_follow? }
 */
searchRoutes.get(
  '/search-users',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  searchUsersValidator,
  wrapRequestHandlers(searchUsersController)
)

export default searchRoutes
