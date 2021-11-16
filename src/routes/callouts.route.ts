import express from 'express'
import {BAD_REQUEST} from 'http-status'
import passport from 'passport'
import {Map} from '@/models/maps.model'
import FileStorageSystem from '@/utils/FileStorageSystem'
import {checkRoles} from "@/middlewares/checkRoles";
import Roles from "@/utils/Roles";

const router = express.Router()
const fileStorage = FileStorageSystem.getInstance()

router.put('/:mapId', passport.authenticate(['jwt']), checkRoles(Roles.EDITOR), async (req, res) => {
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
