import express from 'express'

import auth from './auth.route'
import maps from './maps.route'
import images from './images.route'
import callouts from './callouts.route'

const router = express.Router()

router.use('/maps', maps)
router.use('/auth', auth)
router.use('/images', images)
router.use('/callouts', callouts)

export default router
