import { NotificationStatus } from '~/constants/enum'
import { PaginationRequestQuery } from './Tweet.requests'

export interface GetNotificationsRequestQuery extends PaginationRequestQuery {
  status: NotificationStatus
}
