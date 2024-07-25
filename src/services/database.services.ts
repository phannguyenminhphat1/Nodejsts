import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.yclown5.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`

const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    }
  }

  async indexUsers() {
    const isExist = await this.users.indexExists(['email_1', 'email_1_password_1', 'username_1'])
    if (!isExist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const isExist = await this.refreshToken.indexExists(['exp_1', 'token_1'])
    if (!isExist) {
      this.refreshToken.createIndex({ token: 1 })
      this.refreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexFollowers() {
    const isExist = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!isExist) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  get hashTags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
}

export const databaseService = new DatabaseService()
