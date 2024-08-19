import { ObjectId } from 'mongodb'
import { NotificationStatusType, NotiType } from '~/constants/enum'

export interface NotificationType {
  _id?: ObjectId
  user_id: ObjectId
  type: NotiType // Loại thông báo (e.g., 'like', 'hashtag')
  content?: string // Nội dung thông báo
  status?: NotificationStatusType // enum Đã xem chưa xem đã xóa
  tweet_id: ObjectId // ID liên quan (e.g., tweet_id, hashtag_id)
  created_at?: Date // Ngày tạo thông báo
}

export class NotificationSchema {
  _id?: ObjectId
  user_id: ObjectId
  type: NotiType
  content?: string
  status?: NotificationStatusType
  tweet_id: ObjectId
  created_at?: Date

  constructor({ _id, user_id, type, content, tweet_id, created_at, status }: NotificationType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.type = type
    this.content = content || ''
    this.status = status || NotificationStatusType.Unread
    this.tweet_id = tweet_id
    this.created_at = created_at || new Date()
  }
}
