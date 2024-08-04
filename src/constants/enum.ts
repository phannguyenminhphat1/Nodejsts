export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum MediaTypeRequestQuery {
  Image = 'image',
  Video = 'video'
}

export enum PeopleFollowTypeRequestQuery {
  Following = 'on',
  Anyone = 'off'
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export enum LocationType {
  HoChiMinh = 'Ho Chi Minh City',
  HaNoi = 'Ha Noi',
  NewYork = 'New York',
  LosAngeles = 'Los Angeles',
  Chicago = 'Chicago',
  Houston = 'Houston',
  Miami = 'Miami',
  SanFrancisco = 'San Francisco',
  Seattle = 'Seattle',
  Boston = 'Boston',
  Austin = 'Austin',
  WashingtonDC = 'Washington DC',
  Philadelphia = 'Philadelphia',
  SanDiego = 'San Diego',
  Dallas = 'Dallas',
  SanJose = 'San Jose',
  Jacksonville = 'Jacksonville',
  FortWorth = 'Fort Worth',
  Columbus = 'Columbus',
  Indianapolis = 'Indianapolis',
  Charlotte = 'Charlotte',
  SanAntonio = 'San Antonio',
  Denver = 'Denver',
  Nashville = 'Nashville',
  Baltimore = 'Baltimore',
  Louisville = 'Louisville',
  Milwaukee = 'Milwaukee',
  Portland = 'Portland',
  LasVegas = 'Las Vegas',
  OklahomaCity = 'Oklahoma City',
  Tucson = 'Tucson',
  Atlanta = 'Atlanta',
  Omaha = 'Omaha',
  Raleigh = 'Raleigh',
  Cleveland = 'Cleveland',
  Minneapolis = 'Minneapolis',
  KansasCity = 'Kansas City'
}
