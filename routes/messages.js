"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { UnauthorizedError } = require("../expressError");

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

router.get("/:id", async function (req, res, next) {
    const response = await Message.get(id);
    let currUsername = res.locals.user.username;

    if (currUsername != response.from_user.username || currUsername != response.to_user.username) {
        throw new UnauthorizedError();
    }
    return res.json({ "message": response });
})




/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function (req, res, next) {
    const { to_username, body } = req.body;
    let fromUsername = res.locals.user.username

    const response = await Message.create(fromUsername, to_username, body);

    return res.json({ "message": response });
})



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async function (req, res, next) {
    const response = await Message.markRead(id);

    return res.json({ "message": response });
})



module.exports = router;