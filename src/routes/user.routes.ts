import express from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  // oauthController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  forgotPasswordVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeRequestBody } from '~/models/requests/User.requests'
import { wrapRequestHandlers } from '~/utils/handlers'
const userRoute = express.Router()

userRoute.post('/login', loginValidator, wrapRequestHandlers(loginController))
userRoute.get('/oauth/google', wrapRequestHandlers(oauthController))
userRoute.post('/register', registerValidator, wrapRequestHandlers(registerController))
userRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandlers(logoutController))
userRoute.post('/refresh-token', refreshTokenValidator, wrapRequestHandlers(refreshTokenController))

userRoute.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandlers(emailVerifyController))
userRoute.post('/resend-verify-email', accessTokenValidator, wrapRequestHandlers(resendEmailVerifyController))
userRoute.post('/forgot-password', forgotPasswordValidator, wrapRequestHandlers(forgotPasswordController))
userRoute.post(
  '/verify-forgot-password',
  forgotPasswordVerifyTokenValidator,
  wrapRequestHandlers(verifyForgotPasswordController)
)
userRoute.post('/reset-password', resetPasswordValidator, wrapRequestHandlers(resetPasswordController))
userRoute.get('/me', accessTokenValidator, wrapRequestHandlers(getMeController))
userRoute.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandlers(updateMeController)
)
userRoute.get('/:username', wrapRequestHandlers(getProfileController))
userRoute.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandlers(followController)
)
userRoute.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandlers(unfollowController)
)
userRoute.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandlers(changePasswordController)
)

export default userRoute
