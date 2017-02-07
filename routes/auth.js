// require('dotenv').config();
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var mongo = require('../Database/mongo-db');

router.post('/login', function(req, res, next) {

  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    mongo.locateLoginCredentialsByUsername(data.db, req.body.username)
    .then(function(userObject) {
      bcrypt.compare(req.body.password, userObject.password, function(err, result) {
        console.log(result);
        if (err) {
          console.log(err);
        } else if (!result) {
          res.status(403).end('invalid credentials');
        } else {
          var loginStatus = result ? 'valid' : 'invalid' ;
          var returnObj = { loginStatus: loginStatus, role: userObject.role, association: userObject.association };

          var user = {
            iss: process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'indigo-utility.herokuapp.com',
            name: userObject.username,
            role: userObject.role,
            ass: userObject.association
          };

          var jwtToken = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: 1440 * 60 });
          res.send(jwtToken);

        }
      })
    }).catch(function(err) {
      console.log(err);
      res.status(403).end('invalid credentials');
    })
  })

  // MISC password creation
  // var bcrypt = require('bcrypt');
  // bcrypt.hash('password', 13, function(err, hash) {
  //   console.log(hash);
  // })

})

router.post('/verify-token', function(req, res, next) {

    jwt.verify(req.body.token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        console.log(err);
      } else {
        res.send('authenticated')
      }
    })

})

module.exports = router;
