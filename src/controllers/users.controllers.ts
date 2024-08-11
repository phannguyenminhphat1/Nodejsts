import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordRequestBody,
  FollowRequestBody,
  GetProfileRequestParams,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  TwitterCircleRequestBody,
  UnfollowRequestParams,
  UpdateMeRequestBody
} from '~/models/requests/User.requests'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { databaseService } from '~/services/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
config()

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersServices.userLoginService({
    user_id: user_id.toString(),
    verify: user.verify as UserVerifyStatus
  })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersServices.oauthGoogleService(code as string)
  if (result instanceof ErrorWithStatus) {
    return res.status(result.status).json({ message: result.message })
  }
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await usersServices.userRegisterService(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  await usersServices.userLogoutService(req.body)
  return res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const emailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token == '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersServices.verifyEmailService(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    access_token: result.access_token,
    refresh_token: result.refresh_token
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  await usersServices.resendEmailVerifyService(user_id, user.email)
  return res.json({
    message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id, verify, email } = req.user as User
  const result = await usersServices.forgotPasswordService({
    user_id: (_id as ObjectId).toString(),
    verify: verify as UserVerifyStatus,
    email
  })
  return res.json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersServices.resetPasswordService(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersServices.getMeService(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersServices.updateMeService(user_id, req.body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileRequestParams>, res: Response) => {
  const { username } = req.params
  const result = await usersServices.getProfileService(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersServices.followService(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersServices.unfollowService(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response
) => {
  const { password } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersServices.changePasswordService(user_id, password)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersServices.refreshTokenService({ user_id, verify, refresh_token, exp })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const twitterCircleController = async (
  req: Request<ParamsDictionary, any, TwitterCircleRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { twitter_circle } = req.body
  const result = await usersServices.twitterCircleService(user_id, twitter_circle)
  return res.json(result)
}
