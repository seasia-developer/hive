let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let applicationCommentSchema = new mongoose.Schema({
  record_id: {
    type: Schema.Types.ObjectId,
    ref: 'Record',
    default:null
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  application_id: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
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
  likeUsers: [],
  'last_updated_by': {
    'type': Schema.Types.ObjectId,
    'ref': 'User'
  },
  comment_rich_link: {
    type: String,
    default: null
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Applicationcomment',
    default: null
  },
  activity_id: {
    type: Schema.Types.ObjectId,
    ref: 'mainActivities',
    default: null
  },
},
  {
    timestamps: true,
    versionKey: false,
    collation: { locale: 'en', strength: 1 }
  });


module.exports = mongoose.model('Applicationcomment', applicationCommentSchema)
