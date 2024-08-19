import { MongoClient, Db, Collection } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
import { Bookmark } from '~/models/schemas/Bookmarks.schema'
import { Like } from '~/models/schemas/Like.schema'
import { Conversation } from '~/models/schemas/Conversations.schema'
import { envConfig } from '~/constants/config'
import { NotificationSchema } from '~/models/schemas/Notifications.schema'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@twitter.yclown5.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`

const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = client.db(envConfig.dbName)
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
    const isExist = await this.users.indexExists(['email_1', 'email_1_password_1', 'username_1', 'name_text'])
    if (!isExist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
      this.users.createIndex({ name: 'text' }, { default_language: 'none' })
    }
  }

  async indexTweets() {
    const isExist = await this.tweets.indexExists(['content_text'])
    if (!isExist) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
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
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }

  get hashtags(): Collection<HashTag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }

  get likes(): Collection<Like> {
    return this.db.collection(envConfig.dbLikesCollection)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationsCollection)
  }

  get notifications(): Collection<NotificationSchema> {
    return this.db.collection(envConfig.dbNotificationsCollection)
  }
}

export const databaseService = new DatabaseService()
