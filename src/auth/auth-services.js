const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
//REGEX for validate password - requires one uppercase, one lowercase, one number, and a special character
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
//AuthServices are some base JWT functions for authorization purposes 
const AuthServices = {
  getUserWithEmail(db, email) {
    return db('live_alert_users')
      .where({ email })
      .first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'HS256',
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  },
  //used to validate create account password
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  //hashes new password
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  hasUserWithEmail(db, email) {
    return db('live_alert_users')
      .where({ email })
      .first()
      .then(user => !!user);
  },
};
module.exports = AuthServices;