import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchRequestQuery, SearchUserQuery } from '~/models/requests/Search.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import searchServices from '~/services/search.services'

export const advancedSearchController = async (
  req: Request<ParamsDictionary, any, any, SearchRequestQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content
  const result = await searchServices.advancedSearchService({
    limit,
    page,
    content,
    user_id: (req.decoded_authorization as TokenPayload).user_id,
    media_type: req.query.media_type,
    people_follow: req.query.people_follow
  })
  return res.json({
    message: SEARCH_MESSAGES.SEARCH_TWEETS_SUCCESSFULLY,
    tweets: result.tweets,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}

export const searchUsersController = async (
  req: Request<ParamsDictionary, any, any, SearchUserQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchServices.searchUsersService({
    limit,
    page,
    name: req.query.name,
    user_id: (req.decoded_authorization as TokenPayload).user_id,
    location: req.query.location,
    people_follow: req.query.people_follow
  })
  return res.json({
    message: SEARCH_MESSAGES.SEARCH_USERS_SUCCESSFULLY,
    users: result.users,
    limit,
    current_page: page,
    total: result.total,
    total_page: Math.ceil(result.total / limit)
  })
}
