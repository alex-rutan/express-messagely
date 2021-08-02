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

  //TODO: check about to_user during the testing
  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, 
              m.to_username, 
              m.body, 
              m.sent_at, 
              m.read_at
              t.username AS username,
              t.first_name AS first_name,
              t.last_name AS last_name,
              t.phone AS phone
      FROM messages AS m
      JOIN users ON m.from_username = users.username
      JOIN users AS t ON m.to_username = t.username
      WHERE users.username = $1`,
      [username]
    );
    for (let row of result.rows) {
      row = {
        id: m.id,
        to_username: {
          username: username,
          first_name: first_name,
          last_name: last_name,
          phone: phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      }
    }
    return results.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, 
              m.to_username, 
              m.body, 
              m.sent_at, 
              m.read_at
              f.username AS username,
              f.first_name AS first_name,
              f.last_name AS last_name,
              f.phone AS phone
      FROM messages AS m
      JOIN users ON m.to_username = users.username
      JOIN users AS f ON m.from_username = f.username
      WHERE users.username = $1`,
      [username]
    );
    for (let row of result.rows) {
      row = {
        id: m.id,
        from_username: {
          username: username,
          first_name: first_name,
          last_name: last_name,
          phone: phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      }
    }
    return results.rows;
  }
}


module.exports = User;
