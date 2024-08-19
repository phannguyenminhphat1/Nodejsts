import { JwtPayload } from 'jsonwebtoken'
import { CountryLocation, TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  location: CountryLocation
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface RefreshTokenRequestBody {
  refresh_token: string
}

export interface ResetPasswordRequestBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: CountryLocation
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileRequestParams extends ParamsDictionary {
  username: string
}
export interface UnfollowRequestParams extends ParamsDictionary {
  user_id: string
}

export interface FollowRequestBody {
  followed_user_id: string
}

export interface ChangePasswordRequestBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface TwitterCircleRequestBody {
  twitter_circle: string[]
}
