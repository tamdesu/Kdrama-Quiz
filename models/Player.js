const {Schema, model} = require('mongoose');

const playerSchema = new Schema({
  userId:{
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
module.exports = model('Player', playerSchema)