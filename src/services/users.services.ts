import User from '~/models/schemas/User.schema'
import { databaseService } from './database.services'
import { LogoutRequestBody, RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Followers.schema'
import axios from 'axios'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { envConfig } from '~/constants/config'

class UsersServices {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.jwtSecretAccessToken,

      options: {
        expiresIn: envConfig.accessTokenExpiresIn
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfig.jwtSecretRefreshToken
      })
    }
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.jwtSecretRefreshToken,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken,

      options: {
        expiresIn: envConfig.emailVerifyTokenExpiresIn
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.jwtSecretForgotPasswordToken,

      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }
  private signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken = (refresh_token: string) => {
    return verifyToken({
      token: refresh_token,
      privateKey: envConfig.jwtSecretRefreshToken
    })
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
    }
  }

  async oauthGoogleService(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      return new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    // Nếu tồn tại thì cho login vô bth
    if (user) {
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { exp, iat } = await this.decodeRefreshToken(refresh_token)
      await databaseService.refreshToken.insertOne(
        new RefreshToken({ token: refresh_token, user_id: new ObjectId(user._id), exp, iat })
      )
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    }
    // Còn không thì tạo mới với password random
    else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = await this.userRegisterService({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
    }
  }

  async userLoginService({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify
    })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), exp, iat })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async userRegisterService(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { exp, iat } = await this.decodeRefreshToken(refreshToken)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id), exp, iat })
    )

    // Xong thì gửi mail về cho người dùng
    await sendVerifyRegisterEmail(payload.email, email_verify_token)
    return {
      accessToken,
      refreshToken,
      email_verify_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async userLogoutService(payload: LogoutRequestBody) {
    return await databaseService.refreshToken.deleteOne({ token: payload.refresh_token })
  }

  async verifyEmailService(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: new Date()
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id), exp, iat })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerifyService(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    await sendVerifyRegisterEmail(email, email_verify_token)
    return await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token,
          updated_at: new Date()
        }
      }
    )
  }

  async forgotPasswordService({
    user_id,
    verify,
    email
  }: {
    user_id: string
    verify: UserVerifyStatus
    email: string
  }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await Promise.all([
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            forgot_password_token,
            updated_at: new Date()
          }
        }
      ),
      sendForgotPasswordEmail(email, forgot_password_token)
    ])

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPasswordService(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: '',
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMeService(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async updateMeService(user_id: string, payload: UpdateMeRequestBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    return await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async getProfileService(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }
  async followService(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      await databaseService.followers.insertOne(
        new Follower({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
      )
      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.FOLLOWED
    }
  }

  async unfollowService(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await databaseService.followers.deleteOne(follower)
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePasswordService(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password),
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async refreshTokenService({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshToken.deleteOne({ token: refresh_token })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id),
        exp: decoded_refresh_token.exp,
        iat: decoded_refresh_token.iat
      })
    )
    return {
      new_access_token,
      new_refresh_token
    }
  }

  async twitterCircleService(user_id: string, twitter_circle: string[]) {
    const list_user = []
    for (const user of twitter_circle) {
      const userCircle = await databaseService.users.findOne({
        username: user
      })

      if (!userCircle) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND + ':' + ' ' + user,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      if (userCircle._id.equals(user_id)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.CANNOT_ADD_YOURSELF + ':' + ' ' + user,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      list_user.push(userCircle)
    }
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          twitter_circle: list_user.map((item) => item._id),
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.ADD_TWITTER_CIRCLE_SUCCESS
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
