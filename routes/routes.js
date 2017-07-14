const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const session = require('express-session');
const hatrs = require('../models/hatr');
const messages = require('../models/message');
const likes = require('../models/likes');

const authenticated = function(req, res, next) { //
  if (req.session && req.session.hatr) return next();
  return res.redirect('/login');
};

router.get('/', (req, res) => {
  if (req.session && req.session.hatr) {
    messages.find({}, null, {
      sort: {
        created_at: -1
      }
    }, function(err, messages) {
      res.redirect('home');
    });
  } else {
    res.render('welcome', {
      title: 'welcome'
    });
  }
});

router.get('/home', authenticated, function(req, res) {
  messages.find({}, null, {
    sort: {
      created_at: -1
    }
  }, function(err, messages) {
    res.render('home', {
      hatr: req.session.hatr.username,
      messages: messages
    });
  });
});

router.get('/message', authenticated, function(req, res) {
  res.render('message', {
    title: 'write something'
  });
});

router.post('/message', authenticated, function(req, res) {
  if (!req.body || !req.body.message) {
    return res.render('error', {
      error: "You didn't write anything",
      title: 'error'
    });
  }
  messages.create({
    body: req.body.message,
    author: req.session.hatr.username
  }, function(err, message) {
    console.log(message);
    if (err) return res.render('error', {
      error: 'message generation failed',
      title: 'error'
    });

    console.log('message in database');
    res.redirect('/home');
    // res.redirect('/message/' + message._id);
  });
});

router.get('/message/:id', (req, res) => {
  messages.findOne({
      _id: req.params.id
    }),
    function(err, foundMessage) {
      if (err) return res.render('error', {
        error: 'no message found',
        title: 'error'
      });
      res.send(foundMessage);
    };
});

router.get('/like/:id', function(req, res) {
  likes.create({
    messageId: 'ObjectId(' + req.params.id + ')',
    $inc: {
      total: 1
    }
  }).then(function(partialLike) {
    partialLike.likes = [{
      author: req.session.hatr.username,
      state: true
    }];
    partialLike.save().then(function() {
      res.redirect('/');
    });
  });
});

router.get('/hatr', authenticated, (req, res) => {
  console.log(req.session.hatr);
  messages.find({
    author: req.session.hatr.username
  }, function(err, foundMessages) {
    if (err) return res.render('error', {
      error: "Can't find that messages",
      title: 'error'
    });
    res.render('hatr', {
      messages: foundMessages,
      hatr: req.session.hatr
    });
  });
});

router.get('/hatr/@:username', authenticated, function(req, res) {
  hatrs.findOne({
    username: req.params.username
  }, function(err, foundUser) {
    console.log(foundUser);
    if (err) return res.render('error', {
      error: "Can't find that hatr",
      title: 'error'
    });
    messages.find({
      author: foundUser.username
    }, function(err, foundMessages) {
      console.log(foundMessages);
      if (err) return res.render('error', {
        error: "Can't find that messages",
        title: 'error'
      });
      res.render('hatr', {
        messages: foundMessages,
        hatr: req.session.hatr
      });
    });
  });
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: "login"
  });
});

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: "signup"
  });
});

router.post('/login', (req, res) => {
  hatrs.findOne({
    username: req.body.username
  }, function(err, foundHatr) {
    if (err) return res.render('error', {
      error: "Something went wrong.",
      title: "error"
    });
    if (!foundHatr) return res.render('error', {
      error: 'no hatr',
      title: 'error'
    })

    if (foundHatr.compare(req.body.userpass)) {
      req.session.hatr = foundHatr;
      req.session.save();

      console.log('logged in as ' + req.session.hatr.username);

      res.redirect('/home');
    } else {
      res.render('error', {
        error: "incorrect credentials",
        title: 'error'
      });
    }
  })
});

router.post('/signup', (req, res) => {
  if (req.body.newUser && req.body.newPass) {
    hatrs.create({
      username: req.body.newUser,
      password: req.body.newPass
    }, function(err, newHatr) {
      console.log(newHatr);
      if (err) return res.render('error', {
        error: 'There was an error',
        title: "error"
      });

      req.session.hatr = newHatr;
      console.log(req.session.hatr);
      res.redirect('/');
    })

    //
    //
    //   .then(function() {
    //     req.session.hatr =
    //     res.redirect('/');
    //   });
    // } else {
    //   {
    //     res.render('error', {
    //       title: "error",
    //       error: "There was an error!"
    //     });
    //   }
    // }
  }
});

router.get('/delete/:id', function(req, res) {
  messages.findByIdAndRemove(req.params.id, function(err, message) {
    const response = {
      message: "Message successfully deleted",
      id: message._id
    };
    console.log(response);
    res.redirect('/');
  });
});

router.get('/logout', function(req, res) {
  req.session.hatr = 0;
  res.redirect('/');
});

module.exports = router;
