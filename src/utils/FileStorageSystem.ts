import { GridFsStorage } from 'multer-gridfs-storage'
import mongoose, { mongo } from 'mongoose'
import { DB_URI } from '@/config/config'
import crypto from 'crypto'
import * as path from 'path'
import multer from 'multer'
import Grid from 'gridfs-stream'
import { createModel, MongooseGridFS, MongooseGridFSFileModel } from 'mongoose-gridfs'
import stream from 'stream'

export default class FileStorageSystem {
  get storage(): MongooseGridFS {
    return this._storage
  }
  private static _instance: FileStorageSystem

  private _storage?: MongooseGridFS

  private constructor() {
    mongoose.connection.once('open', () => {
      this._storage = createModel({
        modelName: 'images',
        connection: mongoose.connection,
      })
    })
  }

  public static getInstance(): FileStorageSystem {
    if (!FileStorageSystem._instance) FileStorageSystem._instance = new FileStorageSystem()
    return FileStorageSystem._instance
  }
  removeFile(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.storage.deleteFile(id.toString(), (err: Error, done: MongooseGridFSFileModel) => {
        if (err || !done) return reject(err)
        resolve()
      })
    })
  }

  async storeFile(filename: string, contentType: string, buffer: Buffer): Promise<MongooseGridFSFileModel> {
    const downloadFileStream = new stream.PassThrough()
    downloadFileStream.end(buffer)
    return new Promise<MongooseGridFSFileModel>((resolve, reject) => {
      this.storage.write({ filename, contentType }, downloadFileStream, (err, file) => {
        if (err || !file) {
          reject()
          return
        }
        resolve(file)
      })
    })
  }
}
