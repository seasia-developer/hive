let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let activityCommentSchema = new mongoose.Schema({

  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  activity_id: {
    type: Schema.Types.ObjectId,
    ref: 'mainActivities'
  },
  image: {
    type: Array,
    default: []
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
  },
  comment_rich_link: {
    type: String,
    default: null
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Activitycomments',
    default: null
  },
  likeUsers: [],
  'last_updated_by': {
    'type': Schema.Types.ObjectId,
    'ref': 'User'
},
},
  {
    timestamps: true,
    versionKey: false,
    collation: { locale: 'en', strength: 1 }
  });


module.exports = mongoose.model('Activitycomments', activityCommentSchema)
