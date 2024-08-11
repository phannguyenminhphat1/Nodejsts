import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.sesFromAddress,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf-8')

export const sendVerifyRegisterEmail = (
  toAddresses: string,
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  console.log(`Send email to ${toAddresses} successfully`)

  return sendVerifyEmail(
    toAddresses,
    'Please verify email',
    template
      .replace('{{title}}', 'Please verify your email')
      .replace('{{content}}', 'Click the button below to verify your email')
      .replace('{{titleLink}}', 'Verify')
      .replace('{{link}}', `${envConfig.clientUrl}/verify-email?token=${email_verify_token}`)
  )
}

export const sendForgotPasswordEmail = (
  toAddresses: string,
  forgot_password_token: string,
  template: string = verifyEmailTemplate
) => {
  console.log(`Send email to ${toAddresses} successfully`)

  return sendVerifyEmail(
    toAddresses,
    'Forgot Password',
    template
      .replace('{{title}}', 'You are receiving this email because you requested to reset your password')
      .replace('{{content}}', 'Click the button below to reset your password')
      .replace('{{titleLink}}', 'Reset Password')
      .replace('{{link}}', `${envConfig.clientUrl}/forgot-password?token=${forgot_password_token}`)
  )
}
