import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationsServices from '~/services/conversations.services'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { PaginationRequestQuery } from '~/models/requests/Tweet.requests'
import { GetConversationsRequestParams } from '~/models/requests/Conversation.requests'

export const getConversationsController = async (
  req: Request<GetConversationsRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { user_id } = req.decoded_authorization as TokenPayload
  const { receiver_id } = req.params
  const result = await conversationsServices.getConversationsService({
    sender_id: user_id,
    receive_id: receiver_id,
    page,
    limit
  })
  return res.json({
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY,
    conversations: result.conversations,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}
