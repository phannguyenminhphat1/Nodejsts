export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',
  NAME_LENGTH_MUST_BE_FROM_2_TO_100: 'Name length must be from 2 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully, please check email to verify your account',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  USERS_NOT_FOUND: 'Users not found',
  USERNAME_LENGTH: 'Username length must be from 1 to 50',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify successfully',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  OLD_PASSWORD_IS_REQUIRED: 'Old password is requires',
  GET_ME_SUCCESS: 'Get my profile successfully',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio length must be from 1 to 200',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length must be from 1 to 200',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website length must be from 1 to 200',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_IS_REQUIRED: 'Username is required',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  IMAGE_URL_MUST_BE_STRING: 'Avatar must be a string',
  IMAGE_URL_LENGTH: 'Avatar length must be from 1 to 200',
  UPDATE_ME_SUCCESS: 'Update my profile successfully',
  GET_PROFILE_SUCCESS: 'Get profile successfully',
  FOLLOW_SUCCESS: 'Follow successfully',
  INVALID_USER_ID: 'Invalid user id',
  FOLLOWED: 'Followed',
  FOLLOW_USER_ID_IS_REQUIRED: 'Follow user id is required',
  USER_ID_IS_REQUIRED: 'User id is required',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow successfully',
  USERNAME_EXISTED: 'Username existed',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_SUCCESS: 'Upload successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully',
  IMAGE_NOT_FOUND: 'Image not found',
  VIDEO_NOT_FOUND: 'Video not found',
  TWITTER_CIRCLE_MUST_BE_AN_ARRAY_OF_USERNAME: 'Twitter circle must be an array of username',
  TWITTER_CIRCLE_IS_REQUIRED: 'Twitter circle is required',
  TWITTER_CIRCLE_MUST_BE_AN_ARRAY: 'Twitter circle must be an array',
  ADD_TWITTER_CIRCLE_SUCCESS: 'Add twitter circle successfully',
  CANNOT_ADD_YOURSELF: 'Cannot add yourself',
  INVALID_COUNTRY_LOCATION: 'Invalid country location',
  CAN_NOT_FOLLOW_YOURSELF: 'Can not follow yourself',
  GET_USER_RECOMMENDATIONS_SUCCESSFULLY: 'Get user recommendations successfully'
} as const

export const TWEETS_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USERNAME: 'Mentions must be an array of username',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
  TWEET_AUTHOR_NOT_FOUND: 'Author of the tweet not found',
  TWEET_AUTHOR_IS_BANNED: 'Author of the tweet is banned',
  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully',
  GET_TWEET_CHILDREN_SUCCESSFULLY: 'Get tweet children successfully',
  LIMIT_MUST_BE_A_NUMBER: 'Limit must be a number',
  PAGE_MUST_BE_A_NUMBER: 'Page must be a number',
  LIMIT_LENGTH_MUST_BE_FROM_1_TO_50: 'Limit must be greater than 1 and less than 50',
  PAGE_LENGTH_MUST_GREATER_THAN_1: 'Page length must be greater than 1',
  GET_NEW_FEEDS_FOLLOWING_SUCCESSFULLY: 'Get new feeds following successfully',
  USER_CURRENTLY_DO_NOT_FOLLOW_ANYONE: 'User currently do not follow anyone, let follows to get new feeds',
  GET_ALL_NEW_FEEDS_SUCCESSFULLY: 'Get all new feeds sucessfully'
} as const

export const BOOKMARK_MESSAGES = {
  BOOKMARK_SUCCESSFULLY: 'Bookmark successfully',
  UNBOOKMARK_SUCCESSFULLY: 'Unbookmark successfully',
  INVALID_BOOKMARK_ID: 'Invalid bookmark id',
  BOOKMARK_NOT_FOUND: 'Bookmark not found',
  GET_BOOKMARKS_SUCCESSFULLY: 'Get bookmarks successfully'
}

export const LIKE_MESSAGES = {
  LIKE_SUCCESSFULLY: 'Like successfully',
  UNLIKE_SUCCESSFULLY: 'Unlike successfully',
  INVALID_LIKE_ID: 'Invalid like id',
  LIKE_NOT_FOUND: 'Like not found',
  GET_LIKES_SUCCESSFULLY: 'Get likes successfully'
}

export const SEARCH_MESSAGES = {
  SEARCH_TWEETS_SUCCESSFULLY: 'Search tweets successfully',
  MEDIA_TYPE_MUST_BE_A_STRING: 'Media type must be a string',
  INVALID_MEDIA_TYPE: "Invalid media type, media type must be 'image' or 'video'",
  INVALID_PEOPLE_FOLLOW: "Invalid people follow, people follow must be 'on' or 'off'",
  INVALID_LOCATION: 'Invalid location',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  CONTENT_IS_REQUIRED: 'Content is required',
  CONTENT_LENGTH_MUST_BE_FROM_3_TO_100: 'Content length must be from 3 to 100',
  SEARCH_USERS_SUCCESSFULLY: 'Search users successfully',
  SEARCH_HASHTAGS_SUCCESSFULLY: 'Search hashtags successfully'
}

export const CONVERSATIONS_MESSAGES = {
  GET_CONVERSATIONS_SUCCESSFULLY: 'Get conversations successfully'
}

export const NOTIFICATIONS_MESSAGES = {
  GET_NOTIFICATIONS_SUCCESSFULLY: 'Get notifications successfully',
  INVALID_STATUS_TYPE: 'Invalid status type (read, unread)'
}
