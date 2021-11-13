import IUserModel, { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import express from 'express'
import bodyParser from 'body-parser'
import httpStatus, { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status'
import crypto from 'crypto'
import multer from 'multer'
import GridFsStorage from 'multer-gridfs-storage'
import grid from 'gridfs-stream'
import fileUpload, { UploadedFile } from 'express-fileupload'
import passport from 'passport'
import IMapModel, { Map } from '@/models/maps.model'
import FileStorageSystem from '@/utils/FileStorageSystem'
import * as path from 'path'

const router = express.Router()
const fileStorage = FileStorageSystem.getInstance()

router.put('/:mapId', passport.authenticate(['jwt']), async (req, res) => {
  const map = await Map.findById(req.params.mapId)
    .exec()
    .catch((e) => console.log(e))

  if (!map) {
    return res.status(BAD_REQUEST).json({ error: 'Map could not be found' })
  }

  const callouts = req.body.callouts ?? []

  if (!callouts || !Array.isArray(callouts)) {
    return res.status(BAD_REQUEST).json({ error: 'Callouts must be an array of callouts' })
  }

  map.callouts = callouts

  map
    .save()
    .then((doc) => {
      res.json(doc)
    })
    .catch(() => {
      res.status(BAD_REQUEST)
    })
})

export default router
