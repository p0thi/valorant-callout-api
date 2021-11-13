import { DISCORD, JWT_SECRET } from '@/config/config'
import IUserModel, { User } from '@/models/user.model'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as AnonymousStrategy } from 'passport-anonymous'
import { Strategy as DiscordStrategy } from 'passport-discord'

interface JWTPayload {
  id: string
  name: string
  email: string
  iat: number
  exp: number
}

export const discordStrategy = new DiscordStrategy(
  {
    clientID: DISCORD.CLIENT_ID,
    clientSecret: DISCORD.CLIENT_SECRET,
    callbackURL: DISCORD.CALLBACK_URL,
    scope: DISCORD.SCOPES,
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await new Promise<IUserModel>((resolve, reject) => {
      User.findOneAndUpdate(
        { discordId: profile.id },
        {
          $set: {
            accessToken,
            refreshToken,
            email: profile.email,
          },
        },
        { upsert: true, new: true },
        (err, doc, res) => {
          if (!err) {
            resolve(doc)
            return
          }
          reject(err)
        },
      )
    }).catch((e) => {
      console.log(e)
    })
    if (!user) return done(null, false)
    return done(null, user)
  },
)
export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
  async (payload: JWTPayload, done) => {
    try {
      const user = await User.findById(payload.id)
      if (!user) return done(null, false)
      done(null, user.toJSON())
    } catch (e) {
      return done(e)
    }
  },
)

export const anonymousStrategy = new AnonymousStrategy()
