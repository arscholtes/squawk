const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const session = require('express-session');
const twittrs = require('../models/twittr');
const messages = require('../models/message');
const likes = require('../models/likes');

const authenticated = function(req, res, next) { //
  if (req.session && req.session.twittr) return next();
  return res.redirect('/login');
};

//

router.get('/', (req, res) => {
  if (req.session && req.session.twittr) {
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

//

router.get('/home', authenticated, function(req, res) {
  messages.find({}, null, {
    sort: {
      created_at: -1
    }
  }, function(err, messages) {
    res.render('home', {
      hatr: req.session.twittr.username,
      messages: messages
    });
  });
});

//

router.get('/message', authenticated, function(req, res) {
  res.render('message', {
    title: 'write something'
  });
});

//

router.post('/message', authenticated, function(req, res) {
  if (!req.body || !req.body.message) {
    return res.render('error', {
      error: 'You did not write anything',
      title: 'error'
    });
  }
  messages.create({
    body: req.body.message,
    author: req.session.twittr.username
  }, function(err, message) {
    console.log(message);
    if (err) return res.render('error', {
      error: 'message generation failed',
      title: 'error'
    });

    console.log('message in database');
    res.redirect('/home');
  });
});

//

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

//

router.get('/like/:id', function(req, res) {
  likes.create({
    messageId: 'ObjectId(' + req.params.id + ')',
    $inc: {
      total: 1
    }
  }).then(function(partialLike) {
    partialLike.likes = [{
      author: req.session.twittr.username,
      state: true
    }];
    partialLike.save().then(function() {
      res.redirect('/');
    });
  });
});

//

router.get('/twittr', authenticated, (req, res) => {
  console.log(req.session.twittr);
  messages.find({
    author: req.session.twittr.username
  }, function(err, foundMessages) {
    if (err) return res.render('error', {
      error: 'Not able to find that messages',
      title: 'error'
    });
    res.render('twittr', {
      messages: foundMessages,
      hatr: req.session.twittr
    });
  });
});

//

router.get('/hatr/@:username', authenticated, function(req, res) {
  twittrs.findOne({
    username: req.params.username
  }, function(err, foundUser) {
    console.log(foundUser);
    if (err) return res.render('error', {
      error: 'Can not find that twittr',
      title: 'error'
    });
    messages.find({
      author: foundUser.username
    }, function(err, foundMessages) {
      console.log(foundMessages);
      if (err) return res.render('error', {
        error: 'Can not find that messages',
        title: 'error'
      });
      res.render('twittr', {
        messages: foundMessages,
        hatr: req.session.twittr
      });
    });
  });
});

//

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'login'
  });
});

//

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: 'signup'
  });
});

//

router.post('/login', (req, res) => {
  twittrs.findOne({
    username: req.body.username
  }, function(err, foundtwittr) {
    if (err) return res.render('error', {
      error: 'Look what you did!',
      title: 'error'
    });
    if (!foundtwittr) return res.render('error', {
      error: 'no twittr',
      title: 'error'
    });

    if (foundtwittr.compare(req.body.userpass)) {
      req.session.twittr = foundtwittr;
      req.session.save();

      console.log('logged in as ' + req.session.twittr.username);

      res.redirect('/home');
    } else {
      res.render('error', {
        error: 'incorrect credentials',
        title: 'error'
      });
    }
  });
});

//

router.post('/signup', (req, res) => {
  if (req.body.newUser && req.body.newPass) {
    twittrs.create({ //plural again
      username: req.body.newUser,
      password: req.body.newPass
    }, function(err, newtwittr) {
      console.log(newtwittr);
      if (err) return res.render('error', {
        error: 'There was an error',
        title: 'error'
      });

      req.session.hatr = newtwittr;
      console.log(req.session.twittr);
      res.redirect('/');
    });

  }
});

//

router.get('/delete/:id', function(req, res) {
  messages.findByIdAndRemove(req.params.id, function(err, message) {
    const response = {
      message: 'Successfully deleted',
      id: message._id
    };
    console.log(response);
    res.redirect('/');
  });
});

//

router.get('/logout', function(req, res) {
  req.session.twittr = 0;
  res.redirect('/');
});

module.exports = router;
