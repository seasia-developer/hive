let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let shareSchema = new mongoose.Schema({

  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  activity_id: {
    type: Schema.Types.ObjectId,
    ref: 'mainActivities',
  },
},
  {
    timestamps: true,
    versionKey: false,
    collation: { locale: 'en', strength: 1 }
  });


module.exports = mongoose.model('ShareActivity', shareSchema)
