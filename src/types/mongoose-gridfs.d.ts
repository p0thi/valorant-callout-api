declare module 'mongoose-gridfs' {
  import mongodb from 'mongodb'
  import mongoose from 'mongoose'

  export type MongoGridFSOptions = {
    _id?: string | number | Record<string, unknown>
    filename?: string
    metadata?: Record<string, unknown>
    contentType?: string
    disableMD5?: boolean
    aliases?: Array<string>
    chunkSizeBytes?: number
    start?: number
    end?: number
    revision?: number
  }

  export type GridFSModelOptions = mongodb.GridFSBucketOptions & {
    connection?: mongoose.Connection
    modelName?: string
  }

  export type WriteCallback = (err: Error | null | undefined, file: MongooseGridFSFileModel) => void
  export type ReadCallback = (err: Error | null | undefined, buffer: Buffer) => void
  export type DeleteCallback = (err: Error | null | undefined, done: MongooseGridFSFileModel) => void
  export type FindCallback = (err: Error | null | undefined, done: MongooseGridFSFileModel) => void

  export interface MongooseGridFSFileModel extends MongooseGridFS {
    _id: string | number | Record<string, unknown>
    length: number
    chunkSize: number
    uploadDate: Date
    md5: string
    filename: string
    contentType: string
    aliases: Array<string>
    meanVolume: number
    metadata: Record<string, unknown>
  }

  export interface MongooseGridFS extends mongodb.GridFSBucket {
    createWriteStream(options: MongoGridFSOptions): mongodb.GridFSBucketWriteStream
    createReadStream(options: MongoGridFSOptions): mongodb.GridFSBucketReadStream
    writeFile(
      file: MongoGridFSOptions,
      readStream: NodeJS.ReadableStream,
      writeCb: WriteCallback,
    ): mongodb.GridFSBucketWriteStream
    readFile(file: MongoGridFSOptions, readCb: ReadCallback): mongodb.GridFSBucketReadStream
    deleteFile(fileId: string | number | Record<string, unknown>, deleteCb: DeleteCallback): void
    findOne(file: MongoGridFSOptions, findCb: FindCallback): void
    findById(fileId: string | number | Record<string, unknown>, findCb: FindCallback): void
    read(options: MongoGridFSOptions): mongodb.GridFSBucketReadStream
    write(options: MongoGridFSOptions, stream: NodeJS.ReadableStream, writeCb: WriteCallback)
    unlink(deleteCb: DeleteCallback): void
  }

  export function createBucket(options?: mongodb.GridFSBucketOptions): MongooseGridFS
  export function createModel(options?: GridFSModelOptions): MongooseGridFS
}
