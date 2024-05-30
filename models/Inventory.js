const {Schema, model} = require('mongoose');

const inventorySchema = new Schema({
  userId:{
    type: String,
    required: true
  },
  coins:{
    type: Number,
    default: 0
  },
  currentBackgroundId:{
    type: Number,
    default: 0
  },
  backgrounds:{
    type: [Number],
    default: [0]
  },
  badges:{
    type: [String],
    default: ["star"]
  }
})
module.exports = model('Inventory', inventorySchema)