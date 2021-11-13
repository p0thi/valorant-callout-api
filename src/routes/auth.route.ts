/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

import IUserModel, { User } from '@/models/user.model'
import ApiError from '@/utils/ApiError'
import express from 'express'
import httpStatus from 'http-status'
import passport from 'passport'

const router = express.Router()

router.get('/discord', passport.authenticate(['discord']))

router.get(
  '/discord/window-callback',
  passport.authenticate(['discord'], {
    session: false,
    failureRedirect: '/api/auth/error',
  }),
  (req, res) => {
    res.redirect(`success?token=${(req.user as IUserModel).generateJWT()}`)
  },
)

router.get(
  '/discord/default-callback',
  passport.authenticate(['discord'], {
    session: false,
    failureRedirect: '../error',
  }),
  (req, res) => {
    res.json((req.user as IUserModel).toAuthJSON())
  },
)

router.get('/discord/success', (req, res) => {
  console.log('url', req.baseUrl)
  res.send(`<!DOCTYPE html> <html><head><script src="${req.baseUrl}/${req.path}/code"></script></head></html>`)
})
router.get('/discord/success/code', (req, res) => {
  res.setHeader('content-type', 'text/javascript')
  res.send(
    'window.onload=function (){const urlParams=new URLSearchParams(window.location.search); if (window.opener){let token=urlParams.get("token"); console.log(token); window.opener.postMessage({token, source: "callback"}, "*"); window.close();}};',
  )
})

router.get('/error', (req, res) => {
  res.send(new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized'))
})

router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  res.send(req.user)
})

export default router
