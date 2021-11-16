import { Schema, Document, model } from 'mongoose'
import jwt from 'jsonwebtoken'
import { JWT_EXPIRE, JWT_SECRET } from '@/config/config'
import uniqueValidator from 'mongoose-unique-validator'
import privateValidator from 'mongoose-private'
import Roles from "@/utils/Roles";

export interface IUser {
  discordId: string
  accessToken: string
  refreshToken: string
  role: number
}

export interface IUserToAuthJSON {
  discordId: string
  token: string
  role: number
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
    role: {
      type: Number,
      enum: Object.values(Roles),
    }
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
      role: Roles[this.role],
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
    },
  )
}

schema.methods.toAuthJSON = function () {
  const { discordId, role } = this
  return {
    discordId,
    token: this.generateJWT(),
    role: Roles[role]
  }
}

export const User = model<IUserModel>('User', schema)
