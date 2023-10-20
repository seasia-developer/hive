let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let applicationCommentSchema = new mongoose.Schema({
  record_id: {
    type: Schema.Types.ObjectId,
    ref: 'Record'
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  application_id: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  workspace_id: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
  },
  organization_id: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  activity_sub_type: {
    type: String
  },
  activity_text: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  activity_type: {
    type: String
  },
  is_read: {
    type: Boolean,
    default: false
  },
  star: {
    type: Boolean,
    default: false
  },
  uniqueId: {
    type: String
  }, task_id: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  invited_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  user_ids: [],
  avatar: [],
  comment_rich_link: [],
  comment: {
    type: String
  },
  activity_id: {
    type: Schema.Types.ObjectId,
    ref: 'Activities',
  }, post_id: {
    type: Schema.Types.ObjectId,
    ref: 'Activities',
  },
},
  {
    timestamps: true,
    versionKey: false,
    collation: { locale: 'en', strength: 1 }
  });


module.exports = mongoose.model('Activities', applicationCommentSchema)
