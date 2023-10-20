let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//create our plan scheme
let planSchema = new mongoose.Schema({
  planId: {
    type: String,
  },
  plan: {
    type: String,
  },
  interval: {
    type: String
  },
  records:{
    type: Number
  },
  uploadSize: {
    type: Number
  },
}, {
  timestamps: true,
  versionKey: false,
  collation: { locale: 'en', strength: 1 }
});


module.exports = mongoose.model('Plan', planSchema)
