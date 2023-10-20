const mongoose = require('mongoose');
// const Activity = mongoose.model('Activities');
const mainActivity = mongoose.model('mainActivities');

module.exports.logMainActivity = (user_id, organization_id, workspace_id, application_id, record_id, task_id, activity_text, activity_type, activity_sub_type, uniqueId, invited_user_id, user_ids, avatar = undefined,activity_id=undefined,comment=undefined,comment_rich_link=undefined,post_id=undefined) => {
   // Return new promise 
    return new Promise((resolve, reject) => {
        let logActivity = new mainActivity();
        logActivity.user_id = user_id;
        logActivity.organization_id = organization_id;
        logActivity.workspace_id = workspace_id;
        logActivity.application_id = application_id;
        logActivity.record_id = record_id;
        logActivity.activity_text = activity_text;
        logActivity.activity_type = activity_type;
        logActivity.activity_sub_type = activity_sub_type ? activity_sub_type : null;
        logActivity.uniqueId = uniqueId;
        logActivity.task_id = task_id;
        logActivity.user_ids = user_ids;
        if (invited_user_id && invited_user_id !== undefined) {
            logActivity.invited_user_id = invited_user_id ? invited_user_id : null;
        }
        if (avatar && (avatar !=undefined || avatar!='')) {
            logActivity.avatar = avatar;
        }
        if (comment && (comment !=undefined || comment!='')) {
            logActivity.comment = comment;
        }
        if (comment_rich_link && (comment_rich_link !=undefined || comment_rich_link!='')) {
            logActivity.comment_rich_link = comment_rich_link;
        }
        if (activity_id && activity_id !== undefined) {
            logActivity.activity_id = activity_id ? activity_id : null;
        }
        if (post_id && post_id !== undefined) {
            logActivity.post_id = post_id ? post_id : null;
        }
        logActivity.save((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(logActivity);
            }
        });
    });
};