let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let applicationCommentSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  task_id: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  image: {
    type: String,
    default: ''
  },
  imageThumbs: [{
    thumbType: {
      type: String,
    },
    thumbPath: {
      type: String,
    },
  }],
  comment: {
    type: String,
    default: ''
  }
},
  {
    timestamps: true,
    versionKey: false,
    collation: { locale: 'en', strength: 1 }
  });


module.exports = mongoose.model('Taskcomment', applicationCommentSchema)
