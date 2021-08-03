"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { authenticateJWT, ensureLoggedIn, 
      ensureCorrectUser, } = require("../middleware/auth")  

const app = require("../app");
router.use(authenticateJWT) 

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/" ,ensureLoggedIn, async function(req, res, next){
  const response = await User.all()
  return res.json( {"users":response})
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get( "/:username" , ensureCorrectUser,
  async function(req,res,next){
  const response = await User.get(username)
  return res.json( {"user":response} )
} )



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name}}, ...]}
 *
 **/
router.get( "/:username/to" , ensureCorrectUser, 
  async function( req, res ,next ){
  const response = await User.messagesTo(username)
  return res.json({messages:response})
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

 router.get( "/:username/from" , ensureCorrectUser,
  async function( req, res ,next ){
  const response = await User.messagesFrom(username)
  return res.json({messages:response})
})

module.exports = router;