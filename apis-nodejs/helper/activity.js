const recordTemplateActivity =  (username, substanceName, predefinedTemplate)=> {
    return '[user-name] added a recored to the [substance-name] ' + predefinedTemplate;
};
const recordTemplateActivityUpdated = (username, substanceName, predefinedTemplate)=> {
    return '[user-name] updated the [substance-name] ' + predefinedTemplate;
};
const addCommentOnApplication = (substanceName)=> {
    return '[user-name] ' + substanceName + ' on this';
};
const addTaskTemplate =  (substanceName)=> {
    return substanceName + ' by [user-name]';
};

const addNotificationOnTaskCreated =  (substanceName)=> {
    return '[user-name] ' + substanceName + ' [app-task-name] ';
};
const addNotificationOnTaskAndAssigned =  (substanceName, predefinedTemplate)=> {
    return '[user-name] ' + substanceName + ' a task: I have ' + predefinedTemplate + ' [app-task-name] to you ';
};
const updateTaskTemplate = function (substanceName) {
    return '[user-name] updated ' + substanceName + ' in task [task-name]';
};
const addCommentOnTask = function (substanceName) {
    return '[user-name] ' + substanceName + ' on this';
};
const addNotificationOnCommentOnTask = function (substanceName) {
    return '[user-name] ' + substanceName + ' on task [task-name]';
}
const shareRecordTemplateActivity =  (username, substanceName)=> {
    return '[user-name] ' + substanceName + ' record ';
};
const deletedActivateTemplate = function (username, substanceName, predefinedTemplate) {
    return '[user-name] removed the ' + substanceName + ' ' + predefinedTemplate;
};
const addNotificationOnAppDeleted = function (substanceName, predefinedTemplate) {
    return '[user-name] ' + substanceName + ' [app-name] ' + predefinedTemplate;
};
const addNotificationOnMentionedOnTask = function (substanceName) {
    return '[user-name] ' + substanceName + ' you on task [task-name]';
};
const addNotificationOnCommentOnApp = function (substanceName) {
    return '[user-name] ' + substanceName + ' on application [app-name]';
};
const addNotificationOnMentionedOnApp = function (substanceName) {
    return '[user-name] ' + substanceName + ' you on application [app-name]';
};
const addGlobalCommentOnActivityTemplate = function (substanceName, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + ' - ' + substanceName;
};
const addCommentActivityTemplate = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + ' on this';
};
const updateCommentActivityTemplate = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + ' on this';
};
const addNotificationOnUserComment = function (substanceName) {
    return '[user-name] ' + substanceName + ' on this  post';
};
const addActivityTemplate = function (username, substanceName, predefinedTemplate) {
    return '[user-name] created [substance-name] ' + predefinedTemplate;
};
const editActivityTemplate = function (username, substanceName, predefinedTemplate) {
    return '[user-name] updated [substance-name] ' + predefinedTemplate;
};
const addNotificationOnAppCreated = function (substanceName, predefinedTemplate) {
    return '[user-name] ' + substanceName + ' [app-name] ' + predefinedTemplate;
};
const addPostTemplate = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + ' this post';
};
const addShareTemplate = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + ' this post';
};
const addPostTemplateNotification = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + '  post';
};
const addShareTemplateNotification = function (username, predefinedTemplate) {
    return '[user-name] ' + predefinedTemplate + '  post';
};
const sendInvitationLinkTemplate = function (username, invitationName, substanceName, predefinedTemplate) {
    return '[user-name] assigned [invitation-name] to [substance-name] ' + predefinedTemplate;
};
const addNotificationOnUserInvited = function (substanceName,name) {
    return '[user-name] ' + substanceName + ' [invitation-name] to '+name;
};
const addNotificationOnMentionedOnPost = function (substanceName) {
    return '[user-name] ' + substanceName + ' you on post';
};
const addNotificationOnMentionedOnShare = function (substanceName) {
    return '[user-name] ' + substanceName + ' you on post';
};
const addLike = function () {
    return '[user-name] likes this post';
};
const addOrganizationTemplate = function (username) {
    return '[user-name] created [substance-name] Organization' ;
};
const addNotificationOnOrgCreated = function (substanceName, predefinedTemplate) {
    return '[user-name] ' + substanceName + ' [org-name] ' + predefinedTemplate;
};
const addNotificationOnWsCreated = function (substanceName, predefinedTemplate) {
    return '[user-name] ' + substanceName + ' [ws-name] ' + predefinedTemplate;
};
module.exports = {
    recordTemplateActivity,
    recordTemplateActivityUpdated,
    addCommentOnApplication,
    addTaskTemplate,
    addNotificationOnTaskCreated,
    addNotificationOnTaskAndAssigned,
    updateTaskTemplate,
    addCommentOnTask,
    addNotificationOnCommentOnTask,
    shareRecordTemplateActivity,
    deletedActivateTemplate,
    addNotificationOnAppDeleted,
    addNotificationOnMentionedOnTask,
    addNotificationOnCommentOnApp,
    addNotificationOnMentionedOnApp,
    addGlobalCommentOnActivityTemplate,
    addCommentActivityTemplate,
    updateCommentActivityTemplate,
    addNotificationOnUserComment,
    addActivityTemplate,
    addNotificationOnAppCreated,
    editActivityTemplate,
    addPostTemplate,
    addShareTemplate,
    sendInvitationLinkTemplate,
    addNotificationOnUserInvited,
    addNotificationOnMentionedOnPost,
    addNotificationOnMentionedOnShare,
    addLike,
    addOrganizationTemplate,
    addNotificationOnOrgCreated,
    addNotificationOnWsCreated,
    addPostTemplateNotification,
    addShareTemplateNotification
};