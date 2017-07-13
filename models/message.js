const express = require('express');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  body: {type: String, required: true},
  author: {type: String, required: true},
  created_at: Date
});

messageSchema.pre('save', function(next)  {

  if (!this.created_at) this.created_at = new Date();
  next();
});

const message = mongoose.model('messages', messageSchema);

module.exports = message;
