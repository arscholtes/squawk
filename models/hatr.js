const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const hatrSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  created_at: Date
});

hatrSchema.pre('save', function(next)  {
  console.log('hi');
  const hatr = this;
  console.log(this);
  console.log('unhashed password is ' + hatr.password);

  if (!this.created_at) this.created_at = new Date();

  bcrypt.genSalt(10, (err, salt) => {
    console.log('salt is ' + salt);

    bcrypt.hash(hatr.password, salt, function(e, hash) {
      console.log('hash is ' + hash);
      hatr.password = hash;
      console.log('password is ' + hatr.password);
      next();
    });
  });
});

hatrSchema.methods.compare = function(passw) {
  return bcrypt.compareSync(passw, this.password);
}

const hatrs = mongoose.model('hatrs', hatrSchema);

module.exports = hatrs;
