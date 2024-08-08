import { databaseService } from './database.services'
import { ObjectId, WithId } from 'mongodb'

export class ConversationsServices {
  async getConversationsService({
    sender_id,
    receive_id,
    page,
    limit
  }: {
    sender_id: string
    receive_id: string
    page: number
    limit: number
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receive_id)
        },
        {
          sender_id: new ObjectId(receive_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }
    const conversations = await databaseService.conversations
      .find(match)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const countConversations = await databaseService.conversations.countDocuments(match)

    return {
      conversations,
      total: countConversations || 0
    }
  }
}

const conversationsServices = new ConversationsServices()
export default conversationsServices
