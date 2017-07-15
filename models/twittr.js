const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const twittrSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  created_at: Date
});

twittrSchema.pre('save', function(next)  {
  console.log('hi');
  const twittr = this;
  console.log(this);
  console.log('unhashed password is ' + twittr.password);

  if (!this.created_at) this.created_at = new Date();

  bcrypt.genSalt(10, (err, salt) => {
    console.log('salt is ' + salt);

    bcrypt.hash(twittr.password, salt, function(e, hash) {
      console.log('hash is ' + hash);
      twittr.password = hash;
      console.log('password is ' + twittr.password);
      next();
    });
  });
});

twittrSchema.methods.compare = function(passw) {
  return bcrypt.compareSync(passw, twittr.password);
};

const twittr = mongoose.model('twittrs', twittrSchema);

module.exports = twittr;
