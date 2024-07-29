import { ObjectId } from 'mongodb'

export interface LikeType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}

export class Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at: Date
  constructor({ create_at, tweet_id, user_id, _id }: LikeType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.create_at = create_at || new Date()
  }
}
