const {Schema, model} = require('mongoose');

const levelSchema = new Schema({
  userId:{
    type: String,
    required: true
  },
  guildId:{
    type: String,
    required: true
  },
  exp:{
    type: Number,
    default: 0
  },
  totalExp:{
    type: Number,
    default: 0
  },
  targetExp:{
    type: Number,
    default: 600
  },
  score:{
    type: Number,
    default: 0
  },
  level:{
    type: Number,
    default: 0
  }
})
module.exports = model('Level', levelSchema)