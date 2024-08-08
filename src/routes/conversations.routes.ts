import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { getConversationsValidator } from '~/middlewares/conversations.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandlers } from '~/utils/handlers'

const conversationsRoutes = Router()

conversationsRoutes.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapRequestHandlers(getConversationsController)
)

export default conversationsRoutes
