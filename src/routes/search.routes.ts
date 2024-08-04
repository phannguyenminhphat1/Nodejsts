import express from 'express'
import { advancedSearchController, searchUsersController } from '~/controllers/search.controllers'
import { advancedSearchValidator, searchUsersValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'
const searchRoutes = express.Router()

searchRoutes.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  advancedSearchValidator,
  wrapRequestHandlers(advancedSearchController)
)

searchRoutes.get(
  '/search-users',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  searchUsersValidator,
  wrapRequestHandlers(searchUsersController)
)

export default searchRoutes
