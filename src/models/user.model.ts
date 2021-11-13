import { Schema, Document, model } from 'mongoose'
import jwt from 'jsonwebtoken'
import { JWT_EXPIRE, JWT_SECRET } from '@/config/config'
import uniqueValidator from 'mongoose-unique-validator'
import privateValidator from 'mongoose-private'

export interface IUser {
  discordId: string
  accessToken: string
  refreshToken: string
}

export interface IUserToAuthJSON {
  discordId: string
  token: string
}

export default interface IUserModel extends Document, IUser {
  toAuthJSON(): IUserToAuthJSON
  generateJWT(): string
}

const schema = new Schema<IUserModel>(
  {
    discordId: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Plugins
// schema.plugin(uniqueValidator)
schema.plugin(privateValidator)

schema.methods.generateJWT = function (): string {
  console.log(this._id.toString())
  return jwt.sign(
    {
      id: this._id.toString(),
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
    },
  )
}

schema.methods.toAuthJSON = function () {
  const { discordId } = this
  return {
    discordId,
    token: this.generateJWT(),
  }
}

export const User = model<IUserModel>('User', schema)
