const express = require('express');
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  messageId: {type: String, required: true},
  total: Number,
  likes:[{
      author: String,
      state: Boolean
  }]
});

likeSchema.pre('save', function(next)  {

  if (!this.created_at) this.created_at = new Date();
  next();
});

const like = mongoose.model('likes', likeSchema);

module.exports = like;
