/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

import express from 'express'
import passport from 'passport'
import FileStorageSystem from '@/utils/FileStorageSystem'
import { NOT_FOUND } from 'http-status'
import { MongooseGridFSFileModel } from 'mongoose-gridfs'

const router = express.Router()
const fileStorage = FileStorageSystem.getInstance()

router.get('/display/:id', passport.authenticate('anonymous'), async (req, res) => {
  const file = await new Promise<MongooseGridFSFileModel>((resolve, reject) => {
    fileStorage.storage.findOne({ _id: req.params.id }, (err, done) => {
      if (err || !done) return reject(err)
      resolve(done)
    })
  }).catch((e) => console.log(e))

  if (!file) {
    return res.status(NOT_FOUND)
  }

  console.log(file)
  if (!file.contentType.startsWith('image/')) {
    return res.status(NOT_FOUND)
  }

  const readStream = file.read({ _id: req.params.id })
  readStream.pipe(res)
})

export default router
