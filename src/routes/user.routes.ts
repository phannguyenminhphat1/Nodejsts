import express from 'express'
import {
  twitterCircleController,
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
  twitterCircleValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeRequestBody } from '~/models/requests/User.requests'
import { wrapRequestHandlers } from '~/utils/handlers'
const userRoute = express.Router()

/**
 * Description. Login
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 * Middlewares: loginValidator
 */
userRoute.post('/login', loginValidator, wrapRequestHandlers(loginController))

// OAUTH
userRoute.get('/oauth/google', wrapRequestHandlers(oauthController))

/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 * Middlewares: registerValidator
 */
userRoute.post('/register', registerValidator, wrapRequestHandlers(registerController))

/**
 * Description. Logout a user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 * Middlewares: accessTokenValidator, refreshTokenValidator
 */
userRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandlers(logoutController))

/**
 * Description. Refresh Token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 * Middlewares: refreshTokenValidator
 */
userRoute.post('/refresh-token', refreshTokenValidator, wrapRequestHandlers(refreshTokenController))

/**
 * Description. Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 * Middlewares: emailVerifyTokenValidator
 */
userRoute.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandlers(emailVerifyController))

/**
 * Description. Resend verify email to user
 * Path: /resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 * Middlewares: accessTokenValidator
 */
userRoute.post('/resend-verify-email', accessTokenValidator, wrapRequestHandlers(resendEmailVerifyController))

/**
 * Description. Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 * Middlewares: forgotPasswordValidator
 */
userRoute.post('/forgot-password', forgotPasswordValidator, wrapRequestHandlers(forgotPasswordController))

/**
 * Description. Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 * Middlewares: forgotPasswordVerifyTokenValidator
 */
userRoute.post(
  '/verify-forgot-password',
  forgotPasswordVerifyTokenValidator,
  wrapRequestHandlers(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 * Middlewares: resetPasswordValidator
 */
userRoute.post('/reset-password', resetPasswordValidator, wrapRequestHandlers(resetPasswordController))

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: accessTokenValidator
 */
userRoute.get('/me', accessTokenValidator, getMeController)

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 * Middlewares: accessTokenValidator, verifiedUserValidator, updateMeValidator
 */
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

/**
 * Description: Get user profile by username (unique) befor following user
 * Path: /:username
 * Method: GET
 */
userRoute.get('/:username', wrapRequestHandlers(getProfileController))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 * Middlewares: accessTokenValidator, verifiedUserValidator, followValidator
 */
userRoute.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandlers(followController)
)

/**
 * Description: Unfollow someone
 * Path: /follow/:user_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Middlewares: accessTokenValidator, verifiedUserValidator, unfollowValidator
 */
userRoute.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandlers(unfollowController)
)

/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * Body: { old_password: string, password: string, confirm_password: string }
 * Middlewares: accessTokenValidator, verifiedUserValidator, changePasswordValidator
 */
userRoute.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandlers(changePasswordController)
)

/**
 * Description: Add Users Twitter Circle
 * Path: /twitter_circle
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: [username]
 * Middlewares: accessTokenValidator, verifiedUserValidator, twitterCircleValidator
 */
userRoute.post(
  '/twitter_circle',
  accessTokenValidator,
  verifiedUserValidator,
  twitterCircleValidator,
  wrapRequestHandlers(twitterCircleController)
)

export default userRoute
