"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { UnauthorizedError, NotFoundError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, 
      ensureCorrectUser, } = require("../middleware/auth")  

const app = require("../app");
router.use(authenticateJWT) 

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in user is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn,
    async function (req, res, next) {
    const response = await Message.get(id);
    let currUsername = res.locals.user.username;
    if (currUsername != response.from_user.username ||
       currUsername != response.to_user.username) {
        throw new UnauthorizedError();
    } else{
    return res.json({ "message": response });
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
// test to username  try/catch for to_username errors
router.post("/",ensureLoggedIn, async function (req, res, next) {
    const { to_username, body } = req.body;
    let fromUsername = res.locals.user.username
    try {
      const response = await Message.create(fromUsername, to_username, body);
      return res.json({ "message": response });
    } catch (err){
      throw new NotFoundError(  `Couldn't find recipient.` )
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that only the intended recipient can mark as read.
 *
 **/
// whoever sent_to == loginuser
router.post("/:id/read", ensureLoggedIn, 
    async function (req, res, next) {
    const message = await Message.get(id)
    const user = message.to_user.username
    if ( res.locals.user.username !== user ){
      throw new UnauthorizedError()
    }else{
      const response = await Message.markRead(id);
      return res.json({ "message": response });
    }
})



module.exports = router;