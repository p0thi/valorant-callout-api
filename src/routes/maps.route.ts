/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

import IUserModel, {IUser, User} from '@/models/user.model'
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
import {checkRoles} from "@/middlewares/checkRoles";
import Roles from "@/utils/Roles";

const router = express.Router()
const fileStorage = FileStorageSystem.getInstance()

router.get('/all', passport.authenticate(['jwt', 'anonymous']), async (req, res) => {
  const all = await Map.find();
  res.json(all)
})

router.post('/create', passport.authenticate(['jwt']), checkRoles(Roles.EDITOR), fileUpload(), async (req, res) => {
  const files = req.files as { [p: string]: Express.Multer.File[] }

  // console.log(req.body)
  // console.log(req.files)

  if (!req?.body?.name) {
    return res.status(BAD_REQUEST).json({ error: 'Name required' })
  }
  if (!('minimap' in req.files)) {
    return res.status(BAD_REQUEST).json({ error: 'Minimap required' })
  }
  if (!('loadingScreen' in req.files)) {
    return res.status(BAD_REQUEST).json({ error: 'Loading screen required' })
  }

  const randomString = (await crypto.randomBytes(16)).toString('hex')

  const minimapFile = req.files.minimap as unknown as UploadedFile
  const loadingScreenFile = req.files.loadingScreen as unknown as UploadedFile

  const docs = await Promise.all([
    fileStorage
      .storeFile(`${randomString}_minimap${path.extname(minimapFile.name)}`, minimapFile.mimetype, minimapFile.data)
      .catch((e) => {
        console.log(e)
      }),
    fileStorage
      .storeFile(
        `${randomString}_loadingScreen${path.extname(loadingScreenFile.name)}`,
        minimapFile.mimetype,
        loadingScreenFile.data,
      )
      .catch((e) => {
        console.log(e)
      }),
  ])

  const minimapDoc = docs[0]
  const loadingScreenDoc = docs[1]
  if (!minimapDoc || !loadingScreenDoc) {
    minimapDoc ? minimapDoc.unlink((e) => console.log(e)) : null
    loadingScreenDoc ? loadingScreenDoc.unlink((e) => console.log(e)) : null
    return res.status(INTERNAL_SERVER_ERROR)
  }

  const doc = await Map.create({
    name: req.body.name,
    minimap: minimapDoc._id,
    loadingScreen: loadingScreenDoc._id,
  }).catch((e) => undefined)

  if (!doc) {
    console.log('creation error')
    return res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }

  return res.json(doc)
})

router.patch('/edit/:id', passport.authenticate(['jwt']), checkRoles(Roles.EDITOR), async (req, res) => {
  const minimapFile = 'minimap' in req.files ? (req.files.minimap as unknown as UploadedFile) : null
  const loadingScreenFile = 'loadingScreen' in req.files ? (req.files.loadingScreen as unknown as UploadedFile) : null
  const name = req.body.name

  if (!minimapFile && !loadingScreenFile && !name) return res.status(httpStatus.BAD_REQUEST)

  const map = await new Promise<IMapModel>((resolve, reject) => {
    Map.findById(req.params.id, (err: any, doc: IMapModel | null) => {
      if (err || !doc) return reject(err)
      resolve(doc)
    })
  }).catch((e) => console.log(e))

  if (!map) return res.status(httpStatus.NOT_FOUND)

  const randomString = (await crypto.randomBytes(16)).toString('hex')

  const fileDeletePromises: Promise<void>[] = []
  if (minimapFile) {
    const newMinimapDoc = await fileStorage
      .storeFile(`${randomString}_minimap${path.extname(minimapFile.name)}`, minimapFile.mimetype, minimapFile.data)
      .catch((e) => {
        console.log(e)
      })
      .catch((e) => console.log(e))

    if (!newMinimapDoc) {
      return res.status(INTERNAL_SERVER_ERROR)
    }
    fileDeletePromises.push(fileStorage.removeFile(map.minimap))
    map.minimap = newMinimapDoc._id.toString()
  }

  if (loadingScreenFile) {
    const newLoadingScreenDoc = await fileStorage
      .storeFile(
        `${randomString}_loadingScreen${path.extname(loadingScreenFile.name)}`,
        loadingScreenFile.mimetype,
        loadingScreenFile.data,
      )
      .catch((e) => {
        console.log(e)
      })
      .catch((e) => console.log(e))

    if (!newLoadingScreenDoc) {
      return res.status(INTERNAL_SERVER_ERROR)
    }
    fileDeletePromises.push(fileStorage.removeFile(map.loadingScreen))
    map.loadingScreen = newLoadingScreenDoc._id.toString()
  }

  if (name) {
    map.name = name
  }

  const mapSavePromise = map.save()
  const allPromiseResult = await Promise.allSettled([...fileDeletePromises, mapSavePromise])
  const newMapPromiseResult = allPromiseResult[allPromiseResult.length - 1]
  if (newMapPromiseResult.status === 'fulfilled') {
    return res.json(newMapPromiseResult.value)
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR)
})

router.delete('/delete/:id', passport.authenticate(['jwt']), checkRoles(Roles.EDITOR), (req, res) => {
  Map.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(OK)
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR)
    })
})

export default router
