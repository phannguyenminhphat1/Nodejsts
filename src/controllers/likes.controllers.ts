import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeRequestBody, LikeRequestParams } from '~/models/requests/Like.requests'
import { PaginationRequestQuery } from '~/models/requests/Tweet.requests'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet = await likesService.likeTweetServices(user_id, req.body)
  return res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    tweet
  })
}

export const unlikeController = async (req: Request<LikeRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { like_id } = req.params
  const result = await likesService.unlikeService(user_id, like_id)
  return res.json(result)
}

export const getLikesController = async (
  req: Request<ParamsDictionary, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await likesService.getLikesService({ user_id, limit, page })
  return res.json({
    message: LIKE_MESSAGES.GET_LIKES_SUCCESSFULLY,
    likes: result.likes,
    current_page: page,
    limit: limit,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}
