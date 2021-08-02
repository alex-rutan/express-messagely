"use strict";

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config.js")
const bcrypt = require("bcrypt")
const { NotFoundError } = require("../expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */
  // TODO maybe a try/catch for errors
  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword =  await bcrypt(password, BCRYPT_WORK_FACTOR)
    const result = await db.query(
      `INSERT INTO users (username,
                          password,
                          first_name,
                          last_name,
                          phone,
                          join_at)
             VALUES
               ($1, $2, $3, $4, $5, current_timestamp)
             RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);
    
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `SELECT username, password
      FROM users
      WHERE username = $1`,
      [username]
    )

    const user = result.rows[0];
    if (user) {
      if  (await bcrypt.compare(password , user.password) === true )  {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  //change variable name later
  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE  users
      Set last_login_at = current_timestamp
      WHERE username = $1
      Returning username, last_login_at
      `,
      [username]
    )
    const userLogin = result.rows[0]

    return userLogin;

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
      const result = await db.query(
        `SELECT username AS "userName",
        first_name AS "firstName",
        last_name AS "lastName"
        FROM users
        ` 
      )
      const users =  result.rows
      return users
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */


  static async get(username) {
    const result = await db.query(
      `SELECT username AS "userName",
      first_name AS "firstName",
      last_name AS "lastName",
      phone,
      join_at AS "joinAt"
      last_login_at AS "lastLoginAt"
      FROM users
      WHERE username = $1
      ` ,[username]
    )
    const user =  result.rows[0]
    if (!user) throw new NotFoundError(`No user named ${username}`)
    return users
  }


  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
