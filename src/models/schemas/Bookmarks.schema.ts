import { ObjectId } from 'mongodb'

export interface BookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}

export class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at: Date
  constructor({ create_at, tweet_id, user_id, _id }: BookmarkType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.create_at = create_at || new Date()
  }
}
