import { Schema, Document, model, Types } from 'mongoose'

export interface ICallout {
  name: string
  x: number
  y: number
  type: bigint
}

export interface IMap {
  name: string
  minimap: string
  loadingScreen: string
  callouts: ICallout[]
}

export default interface IMapModel extends Document, IMap {}

const mapSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    minimap: {
      type: Types.ObjectId,
      required: true,
    },
    loadingScreen: {
      type: Types.ObjectId,
      required: true,
    },
    callouts: [
      {
        name: {
          type: String,
          required: true,
        },
        x: {
          type: Number,
          required: true,
        },
        y: {
          type: Number,
          required: true,
        },
        type: {
          type: Number,
          integer: true,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

mapSchema.virtual('id').get(function () {
  return this._id.toHexString()
})
mapSchema.set('toJSON', {
  virtuals: true,
})

export const Map = model<IMapModel>('Map', mapSchema)
