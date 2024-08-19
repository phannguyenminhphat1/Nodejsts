import { PaginationRequestQuery } from './Tweet.requests'
import { CountryLocation, MediaTypeRequestQuery, PeopleFollowTypeRequestQuery } from '~/constants/enum'

export interface SearchRequestQuery extends PaginationRequestQuery {
  content: string
  media_type: MediaTypeRequestQuery
  people_follow: PeopleFollowTypeRequestQuery
}

export interface SearchHashtagQuery extends PaginationRequestQuery {
  name: string
}

export interface SearchUserQuery extends PaginationRequestQuery {
  name: string
  location: CountryLocation
  people_follow: PeopleFollowTypeRequestQuery
}
