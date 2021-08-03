"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const User = require("../models/user");
const Router = require("express").Router;
const router = new Router();





/** POST /login: {username, password} => {token} */

router.post("/login", async function(req, res, next) {
    const { username, password } = req.body;
    if (await User.authenticate(username, password) === true) {
        let token = jwt.sign({ username }, SECRET_KEY);
        await User.updateLoginTimestamp(username);
        return res.json({ token });
    } else {
        throw new BadRequestError("Invalid username or password");
    }
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
    const { username, password, first_name, last_name, phone } = req.body;
    let user = await User.register(username, password, first_name, last_name, phone);
    // if (user) {
    let token = jwt.sign({ "username":username }, SECRET_KEY);
    console.log(token, 'I AM TOKEN')
    await User.updateLoginTimestamp(username);
    return res.json({ token });
    // } else {
    //     throw new BadRequestError("Sorry, that username is already taken");
    // }
})



module.exports = router;