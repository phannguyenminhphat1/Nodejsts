import { ObjectId } from 'mongodb'

export interface HashtagType {
  _id?: ObjectId
  name: string
  create_at?: Date
}
export default class HashTag {
  _id?: ObjectId
  name: string
  create_at: Date
  constructor({ _id, name, create_at }: HashtagType) {
    this._id = _id || new ObjectId()
    this.name = name
    this.create_at = create_at || new Date()
  }
}
