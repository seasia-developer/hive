import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  HostListener,
  ViewChild,
  forwardRef,
  Input,
  ChangeDetectorRef,
  QueryList,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormBuilder, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { CdkDragDrop, CdkDragSortEvent, moveItemInArray } from "@angular/cdk/drag-drop";
import * as _ from "lodash";
import { MentionDirective } from "angular-mentions";
import { Observable, Subscription } from "rxjs";

import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "../../home.service";
import { AppViewService } from "../../application-view/application-view.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { CreateAppComponent } from "../../content/create-app/create-app.component";
import { environment } from "../../../../../../environments/environment";
import { UploadOrgContentComponent } from "../../content/organisation-setup/upload-org-content/upload-org-content.component";
import { SocketService } from "src/app/services/socketio.service";
import { ParentService } from "../parent/parent.service";
import { RecordModalComponent } from "../../application-view/record-modal/record-modal.component";
import { findNode } from "@angular/compiler";
import { element } from 'protractor';
import { Constants } from "src/app/constants/constants";
import { EventManager } from '@angular/platform-browser';
import 'quill-mention'
import { QuillEditorComponent } from 'ngx-quill'
import Quill from 'quill'
import { HelperFunctions } from "../../../../helpers/index.service";

export let selectedMentionUsers = [];
@Component({
  selector: "app-post-lists",
  templateUrl: "./post-lists.component.html",
  styleUrls: ["./post-lists.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PostListsComponent),
      multi: true,
    },
  ],
})
export class PostListsComponent implements OnInit, OnDestroy {

  @ViewChild("reply", { static: false })
  reply: TemplateRef<any>;


  @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent
  // @Input() comment = '';
  selectedMentionUsers = [];
  @ViewChild("Socialcreatepost", { static: false })
  Socialcreatepost: TemplateRef<any>;
  @ViewChild("SocialSharepost", { static: false })
  SocialSharepost: TemplateRef<any>;
  @ViewChild(MentionDirective, { static: false }) mention: MentionDirective;
  env = environment;
  activeAppIndex = "";
  showApps;
  newAppsOrder = [];
  modalRef: BsModalRef;
  isDisplayApps = true;
  refreshPostSubscription = new Subscription();
  activityList = [];
  mediaUrl;
  openMenu;
  homeOrgId;
  homeWsId;
  btnDisable = false;
  totalRecord = 0;
  showBtn = false;
  imageData = [];
  updateNewImage = [];
  updatedImageData = [];
  imageDataPreview = [];
  isEdit = false;
  currentId;
  imagePreview;
  imagePrevOfRes = false;
  type = "edit";
  temp = [];
  attachmentData: any;
  mainObj;
  userData;
  mentionUserList = [];
  addPostForm: FormGroup;
  addShareForm: FormGroup;
  imgModal: any;
  activeImageModalIndex: any = 0;
  comment;
  shareComment;
  isMentionUserSelect = true;
  deleteActivityId: any;
  deleteCommentId: any;
  deleteType: any;
  deletePostType: any;
  currentCommentId;
  currentComment;
  currentActivity;
  parentId;
  canAddComment = true;
  isDisplay = false;
  @Input() userId;
  @Input() workspaceId;
  editComment = "&nbsp;";
  editShareComment = "&nbsp;";
  sharePostComment;
  shareImageData = [];
  isPublicProfile = false;
  messages = [];
  activityLi: any;
  urlData = [];
  fileTypes = Constants.FILE_TYPES;
  timeout: any = null;
  activityUserLists = [];
  adduserComment: any
  AddCommentSucess: any
  editCommentsucess: any
  checkUrl: any = "https";
  onCommentUrlData = [];


  // SCROLL
  appsScrollLeft: boolean = false;
  appsScrollRight: boolean = false;
  scrollStep: number = 200;
  appsNav: boolean = false;

  allActivitiesApi: boolean = true;
  orgRole: string = 'light_member';
  orgList: any = [];
  selectedOrgId: any;
  onReplySucess: any;
  onAddcomment: any
  postUrlData: any
  onAddReply: any
  postReplyData: any;
  // quill = new Quill('#editor', {
  //   modules : {
  //   mention: {
  //     allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
  //     showDenotationChar: false,
  //     onSelect: (item, insertItem) => {
  //       this.isMentionUserSelect = false;
  //       const data = {
  //         id: `{{${item.id}}}`,
  //         name: item.target
  //       };

  //       this.selectedMentionUsers.push(data);
  //       const editor = this.editor.quillEditor
  //       insertItem(item)
  //       // necessary because quill-mention triggers changes as 'api' instead of 'user'
  //       editor.insertText(editor.getLength() - 1, '', 'user')
  //     },
  //     onClose: (item, insertItem) => {
  //       setTimeout(() => {
  //         this.isMentionUserSelect = true;
  //       }, 250);
  //     },
  //     source: (searchTerm, renderList) => {
  //       this.mentionUserList = [];
  //    //   this.mentionUserList = this.appViewService.members;
  //       console.log(this.mentionUserList)
  //       this.mentionUserList = this.mentionUserList.filter(
  //         (element) => {
  //           return element !== null;
  //         }
  //       );
  //       if (this.mentionUserList.length) {
  //         this.mentionUserList = this.mentionUserList.map((e) => {

  //           let avatar = "../../../../../assets/images/user.png";
  //           if (e.user_id.avatar) {
  //             avatar = `${environment.MEDIA_URL}/${e.user_id.avatar}`;
  //           }
  //           return {
  //             id: e.user_id._id.toString(),
  //             target: (e.user_id.lastName && !_.isEmpty(e.user_id.lastName)) ? e.user_id.firstName + ' ' + e.user_id.lastName : e.user_id.lastName,
  //             value: (e.user_id.lastName && !_.isEmpty(e.user_id.lastName)) ? '<img src="' + avatar + '" style="width: 25px!important;height: 25px!important;border-radius: 100%!important;margin-right: 10px!important;position: unset!important;">' + e.user_id.firstName + ' ' + e.user_id.lastName :
  //               '<img src="' + avatar + '" style="width: 25px!important;height: 25px!important;border-radius: 100%!important;margin-right: 10px!important;position: unset!important;">' + e.user_id.firstName

  //           };
  //         });

  //       }

  //       if (searchTerm.length === 0) {
  //         renderList(this.mentionUserList, searchTerm)
  //       } else {
  //         const matches = [];
  //         this.mentionUserList.forEach((entry) => {
  //           if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
  //             matches.push(entry)
  //           }
  //         });
  //         renderList(matches, searchTerm);
  //       }
  //     }
  //   },
  //   toolbar: false
  // },placeholder: 'Edit text',
  // theme: 'snow'
  // });
  constructor(
    public helperService: HelperService,
    public homeService: HomeService,
    private appViewService: AppViewService,
    private router: Router,
    private modalService: BsModalService,
    private apiService: APIService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private parentService: ParentService,
    private cdRef: ChangeDetectorRef,
    private socketService: SocketService,
    private http: HttpClient,
    public helperFunctions: HelperFunctions,
  ) {

  }
  @HostListener("window:scroll", ["$event"])


  scroll(event) {
    // if (
    //   parseInt(event.target.scrollingElement.scrollTop) ===
    //   parseInt(event.target.scrollingElement.scrollHeight) -
    //   parseInt(event.target.scrollingElement.clientHeight)
    // ) {
    //   console.log('in scroll')
    //   this.getAllData(0, "all");
    // }
    // console.log('window.innerHeight + window.pageYOffset',window.innerHeight + window.pageYOffset)
    // console.log('document.body.scrollHeight',document.body.scrollHeight)

    if (((window.innerHeight + window.pageYOffset) + 5) >= document.body.scrollHeight) {
      if (this.allActivitiesApi) {
        this.getAllData(0, "all");
      }
    }
  }
  async ngOnInit() {
    this.orgRole = this.helperService.getLocalStore("orgRole")
    this.comment = "";
    this.userData = this.helperService.getLocalStore("userData");
    // this.socketService.connectSocket();
    this.urlData = [];
    this.isEdit = false;
    this.toggleMenu("");
    const connectedUsersInfo: any = await this.parentService.getFormattedCredentials();
    const connectedUsersEmails = [];
    setTimeout(() => {
      connectedUsersInfo.google.forEach((element) => {
        connectedUsersEmails.push(element.email);
      });
      this.helperService.setLocalStore(
        "connectedUsersEmails",
        connectedUsersEmails
      );
    }, 1000);

    this.userData = this.helperService.getLocalStore("userData");
    this.addPostForm = this.fb.group({
      comment: [""],
      avatar: [""],
    });
    this.addPostForm.get("comment").setValue("");

    this.addShareForm = this.fb.group({
      comment: [""],
    });

    this.addShareForm.get("comment").setValue("");
    this.getImages();
    this.getCommentImages();
    this.mediaUrl = environment.MEDIA_URL;
    if (this.activatedRoute.snapshot.queryParams.userId) {
      this.homeOrgId = "";
      this.homeWsId = this.activatedRoute.snapshot.queryParams.workspace_id ? this.activatedRoute.snapshot.queryParams.workspace_id : "";
      this.getAllData(0, "");
    } else if (this.homeService.activityWsId || this.homeService.activityOrgId) {
      this.homeOrgId = this.homeService.activityOrgId;
      this.homeWsId = this.activatedRoute.snapshot.queryParams.workspace_id ? this.activatedRoute.snapshot.queryParams.workspace_id : "";
      if (this.homeOrgId === "") {
        this.getUsersForMention(
          this.helperService.getLocalStore("selectedOrgId")
        );
      } else {
        this.getUsersForMention(this.homeOrgId);
      }
      this.getAllData(0, "");
    }
    if (
      this.homeService.activityWsId === "" &&
      this.homeService.activityOrgId === ""
    ) {
      this.homeOrgId = "";
      this.homeWsId = "";
      this.getAllUsers();
      this.getAllData(0, "");
    } else {
      this.getAllData(0, "");
      this.getAllUsers();
    }
    this.refreshPostSubscription = this.homeService
      .getPostFlag()
      .subscribe(async (flag) => {
        this.homeOrgId = flag.organization_id;
        this.homeWsId = flag.workspace_id;
        if (
          this.homeOrgId === "" && this.homeWsId === ""

        ) {
          this.getAllUsers();
        } else if (this.homeOrgId === "") {
          this.getUsersForMention(
            this.helperService.getLocalStore("selectedOrgId")
          );
        } else {
          this.getUsersForMention(this.homeOrgId == 'undefined' || this.homeOrgId == undefined ? this.helperService.getLocalStore("selectedOrgId") : this.homeOrgId);
        }
        this.activityList = [];
        await this.getAllData(0, "");
      });
    if (this.router.url === "/application/home/admin/contributed-workspaces") {
      this.isDisplayApps = false;
    }
    if (
      this.activatedRoute["_routerState"].snapshot.url.includes(
        "/application/home/parent/public-profile"
      )
    ) {
      this.isPublicProfile = true;
    }
    setTimeout(() => {
      this.getAppsContainerScroll()
    }, 1000);

    setInterval(() => {
      var content = document.getElementById('apps-tabs-container');
      if (content) {
        var scrollWidth = content.scrollWidth;
        content.style.width = scrollWidth + 'px';
      }
    });

    this.selectedOrgId = this.helperService.getLocalStore("selectedOrgId");

  }

  onlightUserPermission(application_id) {
    if (this.helperService.orgRole && this.helperService.orgRole === 'light_member') {
      if (application_id === null) {
        return true;
      }
      else {
        return false;
      }
    }
    return true;
  }

  isLightMemberPermission(activity_sub_type, workspaceRole) {
    if (activity_sub_type && (activity_sub_type === 'CREATED_WORKSPACE' || activity_sub_type === 'CREATED_RECORD') && workspaceRole === 'light_member') {
      return false;
    }
    return true;
  }

  // ngAfterViewChecked() {
  //   // this.cdRef.detectChanges();
  // }

  get form() {
    return this.addPostForm.controls;
  }
  // get shareform() {
  //   return this.addShareForm.controls;
  // }
  updateMentionsList(orgId) {
    console.log(orgId, "orgidddddd")
    if (orgId) {
      this.getUsersForMention(orgId)
    }
    if (orgId === 'undefined' || orgId === "" || orgId === null) {
      this.getAllUsers();
    }
  }
  sendMessage(message, event) {
    if (event.key == "Enter") {
      const data = {
        recipient: this.helperService.selectedRecipient,
        message,
      };
      this.socketService.sendMessage(data);
      event.target.value = "";
    }
  }

  scrollUp(event) {
    if (event.target.scrollTop == 0) {
      this.socketService.getMessages({
        recipient: this.helperService.selectedRecipient,
        skip: this.helperService.messages[this.helperService.selectedRecipient]
          .length,
      });
    }
  }

  getAllData(length = -1, type, skippedRecords: any = undefined) {
    return new Promise<void>((resolve, reject) => {
      let skipCount = 0;
      if (skippedRecords !== undefined) {
        skipCount = skippedRecords;
      }
      else {
        skipCount = this.activityList.length ? this.activityList.length : 0;
      }
      this.totalRecord = skipCount > 0 ? this.totalRecord : 0;
      const postData = {
        organization_id:
          this.homeOrgId == "" || this.homeOrgId == undefined
            ? ""
            : this.homeOrgId,
        workspace_id:
          this.homeWsId == "" || this.homeWsId == undefined
            ? this.activatedRoute.snapshot.queryParams.workspace_id ? this.activatedRoute.snapshot.queryParams.workspace_id : ""
            : this.homeWsId,
        skip: skipCount,
        user_id: this.activatedRoute.snapshot.queryParams.userId ? this.activatedRoute.snapshot.queryParams.userId : ""
      };
      console.log('this.homeOrgId', this.homeOrgId)
      console.log('this.homeWsId', this.homeWsId)
      if (this.totalRecord == 0 || this.totalRecord > this.activityList.length) {
        if (this.homeOrgId && this.helperService.orgRole && this.helperService.orgRole === 'light_member') {
          this.activityList = []
        }
        else {
          this.getOrganizations();
          this.appViewService
            .getAllActivities(postData)
            .then((jresponse: JReponse) => {
              if (jresponse.body == null) {
                this.allActivitiesApi = false;
              }
              if (jresponse.success && !_.isEmpty(jresponse.body)) {
                if (type === "all") {
                  if (skipCount > 0) {
                    let activitiesArray = [
                      ...this.activityList,
                      ...jresponse.body.data,
                    ];

                    activitiesArray = activitiesArray.filter((value, index, self) =>
                      index === self.findIndex((t) => (
                        t._id === value._id
                      ))
                    )

                    this.activityList = activitiesArray;
                  }
                } else {
                  this.activityList = [];
                  this.activityList = jresponse.body.data;

                }
                const userList = [];
                console.log(this.activityList, "  this.activityList11111")
                this.activityList.forEach((activity) => {
                  if (!this.activityUserLists.includes(activity.user._id)) {
                    this.activityUserLists.push(activity.user._id);
                    userList.push(activity.user);
                  }
                  if (!_.isEmpty(activity.avatar)) {
                    activity.avatar.forEach((img) => {
                      let src =
                        img.attachment.type === "img"
                          ? img.attachment.path
                          : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                            ? img.thumbs[0].thumbPath
                            : (img.attachment.path + ',' + img.attachment.type);
                      img.attachment.srcPath = src;
                    })
                  }
                  if (activity.ActivityComments && !_.isEmpty(activity.ActivityComments)) {

                    activity.ActivityComments.forEach((comment) => {
                      if (!_.isEmpty(comment.image)) {
                        comment.image.forEach((img) => {
                          let src =
                            img.attachment.type === "img"
                              ? img.attachment.path
                              : img.attachment.type === "vid" ? img.thumbs[1].name : (img.thumbs && img.thumbs.length)
                                ? img.thumbs[0].thumbPath
                                : (img.attachment.path + ',' + img.attachment.type);
                          img.attachment.srcPath = src;
                        })
                      }
                      if (!_.isEmpty(comment.comment_rich_link)) {
                        comment.comment_rich_link = this.IsJsonString(comment.comment_rich_link) ? Array.isArray( JSON.parse(comment.comment_rich_link)) ? "": JSON.parse(comment.comment_rich_link) : ''
                      }

                    })

                  }

                  //   if (activity.workspace_id && activity.workspace_id !== null) {
                  //     let arr = [];
                  //     let itemArr = []
                  //     console.log('before', activity.subActivityTotal)
                  //     arr = activity.subActivity.map(item => {
                  //       if (!item.uniqueId) {
                  //         return item;
                  //       } else if (item.uniqueId && !itemArr.includes(item.uniqueId.toString())) {
                  //         itemArr.push(item.uniqueId.toString());
                  //         return item;
                  //       } else {
                  //       //  activity.subActivityTotal = activity.subActivityTotal - 1;
                  //         return false;
                  //       }
                  //     })
                  //     console.log('after', activity.subActivityTotal)
                  //     arr = _.compact(arr);
                  //     activity.subActivity = arr;
                  //   }
                })
                this.socketService.getOnlineStatuses(this.activityUserLists);


                let elms = document.querySelectorAll("div.client-name");
                for (let i = 0; i < elms.length; i++) {
                  elms[i].setAttribute("contenteditable", "false");
                }
                this.activityList.map((activity) => {
                  let id = this.userData.owner.toString()
                  let likes = _.includes(activity.ActivityLikes, id)

                  activity.actClass = likes && likes == true ? 'active' : 'inactive';

                  if (activity.activity_sub_type === "CREATED_RECORD") {
                    activity.recordTitle = "";
                    if (
                      activity.recordsCells &&
                      !_.isEmpty(activity.recordsCells)
                    ) {
                      if (_.indexOf(activity.fieldsType, "text") > -1) {
                        let id =
                          activity.fields[_.indexOf(activity.fieldsType, "text")];
                        if (
                          activity.recordsCells[id] !== undefined &&
                          activity.recordsCells[id] !== "undefined"
                        ) {
                          activity.recordTitle = activity.recordsCells[id].value;
                        }
                      }
                    }
                    let business;
                    let firstTime = false;
                    let firstTimeOfIndex = false;
                    let fieldTypeIndex;
                    activity.fieldsType.forEach((e, i) => {
                      if (e === "image" && !firstTimeOfIndex) {
                        fieldTypeIndex = i;
                        firstTimeOfIndex = true;
                      }
                    });
                    if (activity.cell && activity.cell.length > 0) {
                      activity.cell.forEach((innerElement) => {
                        if (
                          innerElement.value &&
                          innerElement.value.image &&
                          innerElement.value.image.length > 0 &&
                          !firstTime
                        ) {
                          if (
                            innerElement.field_id === activity.fields[fieldTypeIndex]
                          ) {
                            firstTime = true;
                            business = innerElement.value;
                            if (!_.isEmpty(business.image)) {
                              business.image.forEach((img) => {
                                // let src = environment.MEDIA_URL;
                                let src =
                                  img.attachment.type === "img"
                                    ? img.attachment.path
                                    : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                                      ? img.thumbs[0].thumbPath
                                      : (img.attachment.path + ',' + img.attachment.type);
                                img.attachment.srcPath = src;
                              })
                            }
                          }
                        }
                      });
                      activity.businessPhotos = business;
                    }

                  }
                });
                this.totalRecord = jresponse.body.totalRecord;
              }
              resolve();
            })
            .catch((err: Error) => {
              this.helperService.showErrorToast(err.message);
              reject();
              throw err;
            });
        }

      }

    });
  }


  IsJsonString(str) {
    try {
      var json = JSON.parse(str);
      return (typeof json === 'object');
    } catch (e) {
      return false;
    }
  }


  userPermissionsOnRole(orgRole: any, wsRole: any, orgId: any, wsId: any) {
    // FOR HOME WALL - LANDING PAGE
    if (!orgId && !wsId) {
      return true;
    }
    // FOR ORG WALL
    else if (!orgRole && orgId) {
      return false;
    }
    // FOR ORG WALL
    else if (orgRole && !wsRole && orgId && !wsId) {
      if (orgRole === 'light_member') {
        return false;
      }
      return true;
    }
    // FOR ORG WALL
    else if (orgId && !wsRole && !wsId) {
      return true;
    }
    // FOR WS WALL
    else if (!orgId && wsRole && wsId) {
      if (wsRole === 'light_member') {
        return true;
      }
      else {
        return true;
      }
    }
    // FOR REST OF THE CONDITIONS
    else {
      return true
    }
  }

  getOrganizations() {
    this.apiService
      .getWithHeader("organization/getOrganizations")
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.orgList = jresponse.body;
          this.helperService.orgList = this.orgList;
          this.helperService.setLocalStore("organizations", this.orgList);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  editPost(activity) {
    this.editComment = activity.comment;
    this.urlData = activity.comment_rich_link;
    let commentText;
    let userIds = [];
    if (activity.comment_for_update && activity.comment_for_update != '') {
      commentText = activity.comment_for_update.split('{{');
      commentText = commentText.filter(e => e.includes('}}'));
      commentText.forEach(e => {
        userIds.push((e.split('}}')[0]));
        // splitText = e.split('}}')[1];
      });
      let data = _.chain(this.mentionUserList)
        .keyBy('_id')
        .at(userIds)
        .value();
      let latestField = data.map(obj => {
        let newObj = obj;
        newObj.old_id = `{{${newObj._id}}}`
        newObj.old_name = newObj.fullName
        newObj.id = obj.old_id;
        newObj.name = obj.old_name;
        delete newObj.old_id;
        delete newObj.old_name
        return newObj
      })
      selectedMentionUsers = latestField;
    }
    this.cdRef.detectChanges();
    this.updatedImageData = [];
    this.isEdit = true;
    this.currentId = activity._id;
    this.comment = activity.comment;
    this.attachmentData = [...activity.avatar];
    this.imagePrevOfRes = true;
    if (activity.avatar && !_.isEmpty(activity.avatar)) {
      activity.avatar.forEach((element) => {
        let src =
          element.attachment.type === "img"
            ? element.attachment.path
            : element.thumbs.length
              ? element.thumbs[0].thumbPath
              : "";

        this.updatedImageData.push({
          source: src,
          sendingData: element.attachment.path,
        });
      });
    }
    this.openModal(this.Socialcreatepost, "edit");
  }
  editShare(activity) {
    this.sharePostComment = _.find(this.activityList, {
      _id: activity.post_id
    });
    this.editShareComment = activity.comment;
    this.urlData = activity.comment_rich_link;
    this.cdRef.detectChanges();
    this.updatedImageData = [];
    this.isEdit = true;
    this.currentId = activity._id;
    this.comment = activity.comment;
    //  this.attachmentData = [...activity.avatar];
    //  this.imagePrevOfRes = true;
    // if (activity.avatar && !_.isEmpty(activity.avatar)) {
    //   activity.avatar.forEach((element) => {
    //     this.updatedImageData.push({
    //       source: element.attachment.path,
    //       sendingData: element.attachment.path,
    //     });
    //   });
    // }
    this.openModal(this.SocialSharepost, "edit");
  }
  deletePost(activity) {
    this.deleteActivityId = activity._id;
    this.deletePostType = activity.activity_sub_type;
    document.getElementById("deleteRecordModalButton").click();
  }
  openModal(template: TemplateRef<any>, type?) {
    this.mainObj = {};
    this.temp = [];
    if (type && type === "add") {
      this.comment = "";
      this.imageData = [];
      this.isEdit = false;
      this.editComment = "&nbsp;";
      this.updatedImageData = [];
      this.updateNewImage = [];
      this.urlData = [];
    } else if (type == "edit") {
      this.isEdit = true;
      this.updateNewImage = [];
    } else {
      this.isEdit = false;
      this.urlData = [];
      this.comment = "";
      this.editComment = "&nbsp;";
      this.editShareComment = "&nbsp;";
    }
    this.modalRef = this.modalService.show(template);
  }
  modalClosed(event) {
    this.urlData = [];
    event.target.className === "modal fade show modal-static";
  }

  goToPublicProfile(id, workspace_id?:string) {
    console.log("goToPublicProfile")
    console.log(id, "idddddd")
    console.log(workspace_id, "workspace_id", this.isPublicProfile)
    if (this.isPublicProfile) {
      this.helperService.sendUserIdForPublicProfile(id);
      this.router.navigateByUrl('/', { skipLocationChange: false })
        .then(() => this.router.navigate(['application/home/parent/public-profile'], {
          queryParams: {
            userId: id,
            workspace_id: workspace_id
          },
        }))
    } else {
      this.router.navigateByUrl('/', { skipLocationChange: true })
        .then(() => this.router.navigate(['application/home/parent/public-profile'], {
          queryParams: {
            userId: id,
            workspace_id: workspace_id
          },
        }));
    }
  }

  goToAddApp(workspaceId) {
    // this.router.navigateByUrl(
    //   `application/home/create-app?workspaceId=${workspaceId}`
    // );
    const initialState = {
      workspaceId: workspaceId,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("appname")) {
        document.getElementById("appname").focus();
      }
    });
    const modalParams = Object.assign(
      {},
      {
        initialState, class: "small-custom-modal", animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
      }
    );
    this.modalRef = this.modalService.show(CreateAppComponent, modalParams);
  }

  dragTab(event: CdkDragSortEvent<any[]>) {
    document.getElementById('apps-slider-container-cs').classList.add('overflow-hidden-imp')
  }

  dropTab(event: CdkDragDrop<any[]>) {
    document.getElementById('apps-slider-container-cs').classList.remove('overflow-hidden-imp')
    if (this.homeService.wsRole
      && this.homeService.wsRole == 'admin') {
      moveItemInArray(
        this.homeService.applicationList,
        event.previousIndex,
        event.currentIndex
      );

      const length = this.homeService.applicationList.length;
      this.newAppsOrder = [];
      for (let i = 0; i < length; i++) {
        this.newAppsOrder.push(this.homeService.applicationList[i]._id);
      }
      const data = {
        workspace_id: this.homeService.activeWorkspaceId,
        applications: this.newAppsOrder,
      };
      //  return false
      this.appViewService
        .changeAppOrder(data)
        .then((jresponse: JReponse) => {
          // this.getApplications(
          //   this.homeService.activeWorkspaceId,
          //   this.homeService.wsRole
          // );
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          throw err;
        });
    }
  }

  getApplications(workspaceId, role) {
    this.homeService.activeWorkspaceId = workspaceId;
    // let data = {
    //   organization_id: this.homeService.orgId,
    //   workspace_id: workspaceId,
    // };
    // this.homeService.sendOrgIdForPost(data);

    this.homeService.wsRole = role;
    this.appViewService
      .getApps(workspaceId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.homeService.applicationList = jresponse.body;
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  changeApplication(app) {
    this.appViewService.selectedLayoutOptions = [{}, {}, {}];
    let url = "/application/home/app-view/applicationView";
    let query = `?appId=${app._id}&workspaceId=${app.workspace_id._id}`;
    if (
      app.view_mode &&
      app.view_mode !== "grid" &&
      app.view_mode !== "gridView"
    ) {
      url += app.view_mode === "kanban" ? "/kanban-view" : "/calender-view";
    }
    if (app.rowId) {
      // rowField = this.appFields.find(field => field._id === app.rowId);
      query += `&row=${app.rowId}`;
      // this.appViewService.displayRowOption = rowField;
    } else {
      this.appViewService.displayRowOption = undefined;
    }
    if (app.columnId) {
      // columnField = this.appFields.find(field => field._id === app.columnId);
      query += `&column=${app.columnId}`;
      // this.appViewService.displayColumnOption = columnField;
    } else {
      this.appViewService.displayColumnOption = undefined;
    }
    this.router.navigateByUrl(url + query);
    // setTimeout(() => {
    //   this.appViewService.changeApplication.next(app._id);
    // }, 0);
    // if (app.view_mode === "kanban") {
    // if (app.rowId) {
    //   this.appViewService.rowOption.next(rowField);
    // } else if (app.columnId) {
    //   this.appViewService.columnOption.next(columnField);
    // } else {
    // }
  }
  toggleMenu(id) {
    if (this.openMenu !== id) {
      this.openMenu = id;
    } else {
      this.openMenu = "";
    }
  }
  getSubActivity(activity) {
    return new Promise<void>((resolve, reject) => {
      this.appViewService
        .getSubActivities(activity.subActivity ? activity.subActivity.length : 0, activity._id)
        .then((jresponse: JReponse) => {
          if (jresponse.success && !_.isEmpty(jresponse.body)) {
            const finalActivity = _.find(jresponse.body.data, {
              main_activity_id: activity._id,
            });
            activity.subActivity = [
              ...activity.subActivity,
              ...jresponse.body.data,
            ];

          }
          resolve();
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  getComments(activity, skip?, limit?) {
    return new Promise<void>((resolve, reject) => {
      const skipCount =
        skip && skip === "0" ? skip : activity.ActivityComments.length;
      const limitCount = limit && limit === "3" ? limit : 10;
      this.appViewService
        .getMoreComments(skipCount, limitCount, activity._id, activity.record_id != null ? activity.record_id : '')
        .then((jresponse: JReponse) => {
          if (jresponse.success && !_.isEmpty(jresponse.body)) {
            if (skip && skip === "0") {
              let sorted = _.orderBy(jresponse.body, ['createdAt'], ['desc']);
              activity.ActivityComments = sorted;
              activity.ActivityCommentsTotal =
                activity.ActivityCommentsTotal &&
                  activity.ActivityCommentsTotal > 0
                  ? activity.ActivityCommentsTotal + 1
                  : 1;
            } else {
              let commentObj = [...activity.ActivityComments,
              ...jresponse.body]
              let sorted = _.orderBy(commentObj, ['createdAt'], ['desc']);
              activity.ActivityComments = sorted;
            }
          }
          resolve();
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  getsubComments(comment, activity) {
    return new Promise<void>((resolve, reject) => {
      this.appViewService
        .getSubComments(comment._id)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            let comm = jresponse.body;
            console.log(comm, "commcommcomm")
            let sub = _.find(activity.ActivityComments, { _id: comment._id });
            if (!sub) {
              sub = _.find(activity.ActivityComments, {
                _id: comment.parentId,
              });
              const child = _.find(sub.subComments, { _id: comment._id });
              comm.filter((element) => {
                _.each(element.comments, (e) => {
                  if (typeof e.username == "object") {
                    delete e.username;
                    delete e.comments;
                    delete element.comments;
                    element.comments = [];
                  }
                  return e;
                });
              });
              let sorted = _.orderBy(comm, ['createdAt'], ['desc']);
              child.comments = sorted;
            } else {
              comm.filter((element) => {
                _.each(element.comments, (e) => {
                  if (typeof e.username == "object") {
                    delete e.username;
                    delete e.comments;
                    delete element.comments;
                    element.comments = [];
                  }
                  return e;
                });
              });
              let sorted = _.orderBy(comm, ['createdAt'], ['desc']);
              sub.subComments = sorted;
              sub.totalComments = comm.length;
            }
          }
          resolve();
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  clickedOutside(event) {
    // if(event.target.id!='post-edit' || event.target.id!=''){
    //   this.isEdit=false;
    //   this.editComment='';
    // }
    if (event.target.id != "post-edit") {
      this.openMenu = "";
    }
  }
  openUploadModal() {
    //this.editComment='';
    const initialState = { caller: "addPost", uploadType: "multiple" };
    const modalParams = Object.assign(
      {},
      {
        initialState, class: "small-custom-modal", animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
      }
    );
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }
  addRecord(event) {
    this.imagePrevOfRes = false;
    if (event.addedFiles) {
      this.imagePreview = event.addedFiles[0];
      event.addedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {

          if (!this.isEdit) {
            this.imageData.push({
              source: this.allFiles(file, e),
              sendingData: file,
            });
          } else {
            this.updateNewImage.push({
              source: this.allFiles(file, e),
              sendingData: file,
            });
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.imagePreview = event.target.files[0];
      // console.log('else', this.imagePreview)
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {

          // console.log(e.target)
          if (!this.isEdit) {

            this.imageData.push({
              source: e.target.result,
              sendingData: this.imagePreview,
            });
          } else {
            this.updateNewImage.push({
              source: e.target.result,
              sendingData: this.imagePreview,
            });
          }
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }
  allFiles(file, e) {
    if (file.type.includes("image")) {
      return e.target.result;
    } else {
      switch (file.type) {
        case this.fileTypes.ods:
          return "../../../../../../assets/images/file-types/Ods.svg";

        case this.fileTypes.odt:
          return "../../../../../../assets/images/file-types/Odt.svg";

        case this.fileTypes.ppt:
        case 'application/mspowerpoint':
        case 'application/powerpoint':
        case 'application/vnd.ms-powerpoint':
          return "../../../../../../assets/images/file-types/ppt.svg";

        case this.fileTypes.pptx:
        case 'application/x-mspowerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return "../../../../../../assets/images/file-types/Pptx.svg";

        case this.fileTypes.doc:
        case 'application/msword':
        case 'application/doc':
        case 'application/ms-doc':
        case 'application/msword':
          return "../../../../../../assets/images/file-types/Doc.svg";

        case this.fileTypes.docx:
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return "../../../../../../assets/images/file-types/Docx.svg";

        case this.fileTypes.xls:
        case 'application/excel':
        case 'application/vnd.ms-excel':
          return "../../../../../../assets/images/file-types/Xls.svg";
        case this.fileTypes.xlsx:
        case 'application/x-excel':
        case 'application/x-msexcel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return "../../../../../../assets/images/file-types/Xlsx.svg";
        case this.fileTypes.mov:
          return "../../../../../../assets/images/file-types/Mov.svg";

        case this.fileTypes.mp3:
          return "../../../../../../assets/images/file-types/Mp3.svg";

        case this.fileTypes.mp4:
          return "../../../../../../assets/images/file-types/Mp4.svg";

        case this.fileTypes.avi:
        case 'video/avi':
          return "../../../../../../assets/images/file-types/avi.svg";

        case this.fileTypes.csv:
          return "../../../../../../assets/images/file-types/Csv.svg";

        case this.fileTypes.wmv:
          return "../../../../../../assets/images/file-types/Wmv.svg";

        // case this.fileTypes.zip:
        // case "application/x-zip-compressed":
        //   return "../../../../../../assets/images/file-types/Zip.svg";

        case this.fileTypes.text:
          return "../../../../../../assets/images/file-types/Txt.svg";

        case this.fileTypes.pdf:
          return "../../../../../../assets/images/file-types/pdf.svg";

        default:
          return "../../../../../../assets/images/documents.svg";

      }
    }
  }
  getImages() {
    this.homeService.postImages.subscribe((images) => {
      this.addRecord({ addedFiles: images });
      this.homeService.uploadModalRef.hide();
    });
  }
  removeUpdatedImg(index) {
    this.temp.push(this.attachmentData[index]);
    this.attachmentData.splice(index, 1);
    this.updatedImageData.splice(index, 1);
    this.mainObj = {
      toRemove: this.temp,
      toSave: this.attachmentData,
    };
    this.type = "remove";
  }
  removeImg(index) {
    this.imageData.splice(index, 1);
  }

  removeUpdatedNewImg(index) {
    this.updateNewImage.splice(index, 1);
  }
  commentremoveUpdatedImg(index, comment, activity) {
    this.mainObj = {};
    this.temp = [];
    this.attachmentData = [];
    this.currentActivity = activity;
    this.currentComment = comment;
    comment.attachmentData = comment.image;
    this.temp.push(comment.attachmentData[index]);
    comment.attachmentData.splice(index, 1);
    comment.updatedImageData.splice(index, 1);
    this.mainObj = {
      toRemove: this.temp,
      toSave: comment.attachmentData,
    };
    this.type = "remove";
    this.addCommentRecord({ addedFiles: [] });
  }
  // commentremoveUpdatedNewImg(index,comment,activity) {
  //   this.currentComment=comment
  //   this.updateNewImage.splice(index, 1);
  //   this.type = "remove";
  //   this.addCommentRecord({ addedFiles: [] })
  // }
  tempFunc() {
    this.isMentionUserSelect = false;
    // this.currentCommentId = activity._id;
    // this.currentActivity = activity;
  }

  tempFunc1() {
    setTimeout(() => {
      this.isMentionUserSelect = true;
    }, 250);
  }
  tempFuncComment(activity) {
    this.currentCommentId = activity._id;
    this.currentActivity = activity;
    setTimeout(() => {
      this.isMentionUserSelect = true;
    }, 250);
  }
  submitForm() {
    if (!_.isEmpty(this.comment)) {
      let commentText = document.getElementById("commentSection").innerText;
      selectedMentionUsers.forEach((element) => {
        commentText = commentText.replace(element.name, element.id);
      });
      this.comment = commentText;
      this.comment = this.helperService.removeTags(this.comment);
      this.comment = this.helperService.checkCommentUrl(this.comment)
      console.log(this.comment, "commenttt--------------check 1")
    }
    let info = this.urlData && this.urlData.length > 0 ? this.urlData : [];
    this.btnDisable = true;
    const formData = new FormData();
    formData.append("comment", this.comment == undefined || this.comment == 'undefined ' ? "" : this.comment);
    if (!this.isEdit) {
      // console.log('this.imageData',this.imageData)
      for (let index = 0; index < this.imageData.length; index++) {
        const element = this.imageData[index];
        formData.append("avatar[]", element.sendingData);
      }
    }
    formData.append("organization_id", this.homeOrgId);
    formData.append("workspace_id", this.homeWsId);
    if (!this.isEdit) {
      if (_.isEmpty(this.comment) && this.imageData.length === 0) {
        this.helperService.showErrorToast("Please enter something");
      } else {
        formData.append("urlData", JSON.stringify(info));
        console.log(info, "infooooooo")
        console.log('test123')
        this.appViewService
          .addPost(formData)
          .then((jresponse: JReponse) => {
            console.log('wefewfwf');
            this.activityList = []
            this.getAllData(0, "all");
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
              this.getAllData(0, "");
            }
            this.urlData = [];
            this.btnDisable = false;
            if (!_.isEmpty(jresponse.body.data[0].avatar)) {
              jresponse.body.data[0].avatar.forEach((img) => {
                // let src = environment.MEDIA_URL;
                let src =
                  img.attachment.type === "img"
                    ? img.attachment.path
                    : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                      ? img.thumbs[0].thumbPath
                      : (img.attachment.path + ',' + img.attachment.type);
                img.attachment.srcPath = src;
              })
            }
            this.activityList = [jresponse.body.data[0]].concat(
              this.activityList
            );
            let elms = document.querySelectorAll("div.client-name");
            for (let i = 0; i < elms.length; i++) {
              elms[i].setAttribute("contenteditable", "false");
            }
            this.totalRecord = this.totalRecord + 1;
            this.addPostForm.reset();
            this.imageData = [];
            this.closeModal();
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            this.btnDisable = false;
            throw err;
          });
      }
    } else {
      const formData = new FormData();
      if (this.type === "remove") {
        if (_.isEmpty(this.comment) && this.mainObj.length === 0) {
          this.helperService.showErrorToast("Please enter something");
          return false
        }
        formData.append("attachmentData", JSON.stringify(this.mainObj));
      } else {
        if (_.isEmpty(this.comment) && this.attachmentData.length === 0) {
          this.helperService.showErrorToast("Please enter something");
          return false
        }
        formData.append(
          "attachmentData",
          JSON.stringify(this.attachmentData)
        );

      }

      for (let index = 0; index < this.updateNewImage.length; index++) {
        const element = this.updateNewImage[index];
        formData.append("avatar[]", element.sendingData);
      }
      formData.append("comment", this.comment == undefined || this.comment == 'undefined ' ? "" : this.comment);
      formData.append("type", this.type);
      formData.append("urlData", JSON.stringify(info));
      this.appViewService
        .editPost(this.currentId, formData)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.showSuccessToast(jresponse.message);
          }
          const finalActivity = _.find(this.activityList, {
            _id: jresponse.body.data[0]._id,
          });
          finalActivity.comment = jresponse.body.data[0].comment;
          finalActivity.avatar = jresponse.body.data[0].avatar;
          if (!_.isEmpty(finalActivity.avatar)) {
            finalActivity.avatar.forEach((img) => {
              // let src = environment.MEDIA_URL;
              let src =
                img.attachment.type === "img"
                  ? img.attachment.path
                  : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                    ? img.thumbs[0].thumbPath
                    : (img.attachment.path + ',' + img.attachment.type);
              img.attachment.srcPath = src;
            })
          }
          finalActivity.comment_rich_link =
            jresponse.body.data[0].comment_rich_link;
          this.urlData = [];
          this.btnDisable = false;
          this.addPostForm.reset();
          this.imageData = [];
          this.isEdit = false;
          this.editComment = "&nbsp;";
          this.type = 'edit';
          this.closeModal();
        })
        .then(() => {
          this.getAllData(0, "", 0);
        })
        .then(() => {
          this.cdRef.detectChanges();
          window.scrollTo(0, 0);
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error);
          this.btnDisable = false;
          throw err;
        });
    }
    //   }
  }
  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }
  async getUsersForMention(orgId) {

    if (orgId === 'undefined' && orgId === "" && orgId === null) {

      this.getAllUsers();

    } else {

      this.getAllUsers();

      // await this.apiService
      //   .get(`/organization/${orgId}/members`)
      //   .then((jresponse: JReponse) => {
      //     if (jresponse.success) {
      //       this.mentionUserList = [];
      //       this.mentionUserList = jresponse.body;
      //       this.mentionUserList = this.mentionUserList.filter((element) => {
      //         return element !== null;
      //       });
      //       if (this.mentionUserList.length) {
      //         this.mentionUserList = this.mentionUserList.map((e) => {
      //           return {
      //             ...e.user_id,
      //             fullName: e.user_id.lastName && !_.isEmpty(e.user_id.lastName) ? e.user_id.firstName + ' ' + e.user_id.lastName : e.user_id.firstName
      //           };
      //         });
      //         this.appViewService.members=this.mentionUserList;
      //       }
      //     }
      //   })
      //   .catch((err: any) => {
      //     throw err;
      //   });


    }
  }
  itemMentioned(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };

    selectedMentionUsers.push(data);
    const el = document.getElementById("commentSection");

    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
    // let formatedText = `<b>${tag.fullName}</b>&nbsp;`;
    // const formatedText = `
    // <div contenteditable="false" class="commnet-mention-wrrapper">
    //     <img class="commnet-mention-user-image" src="${image}">
    //     <label class="commnet-mention-user-label">
    //       ${tag.fullName}
    //     </label>
    // </div> &nbsp;`;
    const formatedText = `<div contenteditable="false" class="client-name"><img src="${image}"> ${tag.fullName} </div>`;

    let oldValue = el.innerHTML;
    el.innerHTML = "";
    // oldValue = oldValue.replace("@", "");
    var atIndex = oldValue.indexOf("@");
    oldValue = oldValue.substring(0, atIndex);
    oldValue = oldValue + " " + formatedText;
    el.innerHTML = oldValue;

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    el.scrollTop = el.scrollHeight;
    return "";
  }
  itemMentionedShare(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };

    selectedMentionUsers.push(data);

    const el = document.getElementById("commentSectionShare");

    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
    // let formatedText = `<b>${tag.fullName}</b>&nbsp;`;
    // const formatedText = `
    // <div contenteditable="false" class="commnet-mention-wrrapper">
    //     <img class="commnet-mention-user-image" src="${image}">
    //     <label class="commnet-mention-user-label">
    //       ${tag.fullName}
    //     </label>
    // </div> &nbsp;`;
    const formatedText = `<div contenteditable="false" class="client-name"><img src="${image}"> ${tag.fullName} </div>`;

    let oldValue = el.innerHTML + " " + formatedText;
    el.innerHTML = "";

    var atIndex = oldValue.indexOf("@");
    oldValue = oldValue.substring(0, atIndex);
    oldValue = oldValue + " " + formatedText;

    // oldValue = oldValue.replace("@", "");
    el.innerHTML = oldValue;

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    el.scrollTop = el.scrollHeight;

    return "";
  }
  addComment(event) {
    let commentText = event.target.innerText;
    selectedMentionUsers.forEach((element) => {
      commentText = commentText.replace(element.name, element.id);
    });
    this.comment = commentText;
    this.comment = this.helperService.removeTags(this.comment);
    this.comment = this.helperService.checkCommentUrl(this.comment)
    console.log(this.comment, "comment------check 2")

  }

  itemMentionedComment(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };
    selectedMentionUsers.push(data);
    const el = document.getElementById(this.activityLi._id.toString());
    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
    // let formatedText = `<b>${tag.fullName}</b>&nbsp;`;
    // let formatedText = `
    // <div contenteditable="false" class="commnet-mention-wrrapper">
    //     <img class="commnet-mention-user-image" src="${image}">
    //     <label class="commnet-mention-user-label">
    //       ${tag.fullName}
    //     </label>
    // </div> &nbsp;`;
    const formatedText = `<div contenteditable="false" class="client-name"><img src="${image}"> ${tag.fullName} </div>`;
    let oldValue = el.innerHTML + " " + formatedText;

    el.innerHTML = "";
    // oldValue = oldValue.replace("@", "");
    var atIndex = oldValue.indexOf("@");
    oldValue = oldValue.substring(0, atIndex);
    oldValue = oldValue + " " + formatedText;
    el.innerHTML = oldValue;

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    el.scrollTop = el.scrollHeight;

    return "";
  }

  openMentionList() {

    let el = document.getElementById("commentSection");

    el.focus();
    this.mention.startSearch('@');
  }
  openMentionListShare() {
    const el = document.getElementById("commentSectionShare");
    el.focus();
    this.mention.startSearch();
  }
  async getAllUsers() {
    if (this.homeOrgId) {
      await this.appViewService.getAllMembersEmployeesOfOrgAndWS(this.homeOrgId).then((jresponse: JReponse) => {
        this.getUsersInternalFun(jresponse)
      });
    }
    else if (this.homeWsId) {
      await this.appViewService.getAllMembersOfWS(this.homeWsId).then((jresponse: JReponse) => {
        this.getUsersInternalFun(jresponse)
      });
    }
    else {
      await this.appViewService.getAllMembersEmployeesOfOrgsAndWS().then((jresponse: JReponse) => {
        this.getUsersInternalFun(jresponse)
      });
    }
  }

  getUsersInternalFun(jresponse: any) {
    if (jresponse.success) {
      this.mentionUserList = [];
      this.mentionUserList = jresponse.body;

      this.mentionUserList = this.mentionUserList.filter((element) => {
        return element !== null;
      });
      if (this.mentionUserList.length) {
        this.mentionUserList = this.mentionUserList.map((e) => {
          return {
            _id: e._id,
            firstName: e.firstName,
            lastName: e.lastName,
            avatar: e.avatar,
            fullName: e.lastName && !_.isEmpty(e.lastName) ? e.firstName + ' ' + e.lastName : e.firstName
          };
        });
        this.appViewService.members = this.mentionUserList;
      }
    }
  }

  confirmDeleteRecord() {
    if (this.deletePostType == 'CREATED_POST') {
      this.appViewService
        .deletePost(this.deleteActivityId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.activityList = [];
            this.getAllData(0, "");
            this.addPostForm.reset();
            this.imageData = [];
            this.closeModal();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      this.appViewService
        .deleteSharedPost(this.deleteActivityId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.activityList = [];
            this.getAllData(0, "");
            this.addPostForm.reset();
            this.imageData = [];
            this.closeModal();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }

  }
  openUploadCommentModal(activity) {
    this.parentId = undefined;
    this.currentCommentId = activity._id;
    this.currentActivity = activity;
    this.isEdit = false;
    const initialState = { caller: "addComment", uploadType: "multiple" };
    const modalParams = Object.assign(
      {},
      {
        initialState, class: "small-custom-modal", animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
      }
    );
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }
  getjsonData(data) {
    console.log("getjsonDatagetjsonDatagetjsonData", JSON.parse(data))
    return JSON.parse(data)
  }
  openUploadSubCommentModal(comment, activity, commentType, parent?) {
    this.currentCommentId = comment._id;
    this.currentActivity = activity;
    this.currentComment = comment;
    this.parentId = comment._id;
    this.isEdit = false;
    const initialState = { caller: "addComment", uploadType: "multiple" };
    const modalParams = Object.assign(
      {},
      {
        initialState, class: "small-custom-modal", animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
      }
    );
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }
  addCommentRecord(event, type?, activityData?, data?) {
    console.log("im in on enterr presss", activityData)
    let activity;
    let comment;
    let charCode = event.which ? event.which : event.keyCode;
    if (type && type === "comment" && type.length > 0) {
      this.currentCommentId = activityData._id;
      activity = activityData;
      let commentText = event.target.innerText;
      selectedMentionUsers.forEach((element) => {
        commentText = commentText.replace(element.name, element.id);
      });
      comment = commentText;
      this.onAddcomment = commentText;
      comment = this.helperService.removeTags(comment);
      comment = this.helperService.checkCommentUrl(comment)
      console.log(comment, "comment----------------check3")
      this.canAddComment = true;
      this.isMentionUserSelect = true;
      // event.stopPropagation();
    } else {
      activity = this.currentActivity;
    }
    if (data && type.length > 0) {
      console.log("dataaa--------------")
      return this.AddCommentSucess();
    }
    if (charCode == 13 && event.shiftKey) {
      this.canAddComment = true;
      event.stopPropagation();
    }
    else if (charCode == 13 && this.isMentionUserSelect && this.canAddComment || event.addedFiles) {
      if (!event.addedFiles) {
        event.preventDefault();
      }
      this.AddCommentSucess();
    }
    this.AddCommentSucess = () => {
      let info = this.postUrlData ? this.postUrlData : []
      console.log(info, "infoooooo")
      this.canAddComment = false;
      if (this.currentComment && this.isEdit == true) {
        console.log("maiiii chali hn bhra iffff")
        if (!comment) {
          let commentText = (<HTMLInputElement>(
            document.getElementById(this.currentComment._id.toString())
          )).innerText;
          selectedMentionUsers.forEach((element) => {
            commentText = commentText.replace(element.name, element.id);
          });
          comment = commentText;
          comment = this.helperService.checkCommentUrl(comment)
          console.log(comment, "AddCommentSucess if comment----------")
        }
        const formData = new FormData();
        if (
          this.parentId &&
          this.parentId != undefined &&
          this.parentId != "undefined"
        ) {
          formData.append("parentId", this.parentId);
          formData.append("urlData", JSON.stringify(info));

        }
        console.log(this.parentId, "thsi.parentidddd")
        formData.append("comment", comment.trim());
        formData.append("activity_id", activity._id);
        event.addedFiles.forEach((file) => {
          this.updateNewImage.push({
            //source: e.target.result,
            sendingData: file,
          });
        });
        if (this.type === "remove") {
          formData.append("attachmentData", JSON.stringify(this.mainObj));
        } else {
          formData.append(
            "attachmentData",
            JSON.stringify(this.currentComment.attachmentData)
          );
        }
        for (let index = 0; index < this.updateNewImage.length; index++) {
          const element = this.updateNewImage[index];
          formData.append("avatar[]", element.sendingData);
        }
        formData.append("type", this.type);
        this.appViewService
          .editActivityComment(this.currentComment._id, formData)
          .then((jresponse: JReponse) => {
            this.canAddComment = true;
            if (jresponse && jresponse.message != "Please enter comment") {
              (<HTMLInputElement>(
                document.getElementById(this.currentComment._id.toString())
              )).innerText = "";
              this.currentComment.isShow = this.currentComment._id;
              this.currentComment.comment = comment.trim();
              this.currentComment.attachmentData = [];
              this.imagePrevOfRes = false;
              this.updateNewImage = [];
              this.toggleMenu("");
              this.type = "edit";
              this.isEdit = false;
              this.helperService.showSuccessToast(jresponse.message);
              if (
                this.parentId &&
                this.parentId != undefined &&
                this.parentId != "undefined"
              ) {
                this.parentId = undefined;
                this.getsubComments(this.currentComment, this.currentActivity);
                this.currentComment = undefined;
              } else {
                this.currentComment = undefined;
                this.parentId = undefined;
                this.getComments(this.currentActivity, "0", "3");
              }

              this.closeModal();
            } else {
              this.parentId = undefined;
              this.isDisplay = false;
              this.helperService.showErrorToast(jresponse.message);
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });
      } else {
        console.log("mai cahli hannnnnn elseeeee", comment)
        if (!comment) {
          let commentText = (<HTMLInputElement>(
            document.getElementById(this.currentCommentId.toString())
          )).innerText;
          console.log(selectedMentionUsers, 'selectedMentionUsers');
          selectedMentionUsers.forEach((element) => {
            commentText = commentText.replace(element.name, element.id);
          });
          comment = commentText;
          comment = this.helperService.checkCommentUrl(comment)
          console.log(comment, "AddCommentSucess else part comment----------")
        }
        const formData = new FormData();
        if (
          this.parentId &&
          this.parentId != undefined &&
          this.parentId != "undefined"
        ) {
          formData.append("parentId", this.parentId);
        }
        formData.append("comment", comment.trim());
        formData.append("activity_id", activity._id);
        formData.append("comment_rich_link", JSON.stringify(info));

        if (event.addedFiles) {
          for (const img of event.addedFiles) {
            formData.append("avatar[]", img);
          }
        }
        this.appViewService
          .addActivityComment(formData)
          .then((jresponse: JReponse) => {
            this.canAddComment = true;
            (<HTMLInputElement>(
              document.getElementById(this.currentCommentId.toString())
            )).innerText = "";
            if (event.target) {
              event.target.innerText = '';
            }
            if (jresponse && jresponse.message != "Please enter comment") {
              this.helperService.showSuccessToast(jresponse.message);
              if (
                this.parentId &&
                this.parentId != undefined &&
                this.parentId != "undefined"
              ) {
                this.parentId = undefined;
                this.getsubComments(this.currentComment, this.currentActivity);
                this.currentComment = undefined;
              } else {
                this.currentComment = undefined;
                this.parentId = undefined;
                this.getComments(activity, "0", "3");
              }
              this.parentId = undefined;
              this.isDisplay = false;
              this.closeModal();
            } else {
              this.parentId = undefined;
              this.isDisplay = false;
              this.helperService.showErrorToast(jresponse.message);
            }
            activity.subActivityTotal = [];
            activity.subActivityTotal = activity.subActivityTotal - 1;
            this.getSubActivity(activity)
          })
          .then(() => {
            this.getAllData(0, "", 0);
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });

      }
    }
  }


  private executeListing(matches) {
    let prodKey = 'f0e1a437d0c7ecbff1c033def9861286';
    let testKey = '3de712cf16ca1a8d5362bc0e28cd5297'

    for (const url of matches) {
      this.http
        .get(
          // `https://api.linkpreview.net/?key=3de712cf16ca1a8d5362bc0e28cd5297&q=${url}`
          `https://api.linkpreview.net/?key=${prodKey}&q=${url}`

        )
        .subscribe(
          (res) => {
            this.urlData.push(res);
          },
          (err) => {
          }
        );
    }
    this.urlData = _.uniqWith(this.urlData, _.isEqual);
  }

 checkType(data): boolean {
    console.log("Array.isArray(data)", Array.isArray(data))
   return Array.isArray(data)
  }

  async findUrl(e) {
    console.log("workeddd findUrl")
    this.urlData = [];
    // console.log('findUrl urlData')
    if (!_.isEmpty(this.comment)) {
      let matches = this.comment.match(/(((https?:\/\/)|(www\.))[^\s]+)/g);
      if (!_.isEmpty(matches) && matches.length > 0) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          // console.log('executeListing',matches)
          this.executeListing(matches);
        }, 1000);
        // if (this.urlData && this.urlData.length > 0) {
        //   let urlArr = _.map(this.urlData, function (value) {
        //     return value.url
        //   })
        //   matches = _.concat(matches, urlArr);
        //   matches = _.uniqWith(matches, _.isEqual);
        // }

      }
    }
  }

  private ReplyExecuteListing(matches, i?, j?) {
    for (const url of matches) {
      console.log(matches, "urlllllllll")
      this.http
        .get(
          `https://api.linkpreview.net/?key=3de712cf16ca1a8d5362bc0e28cd5297&q=${url}`
        )
        .subscribe(
          (res) => {
            this.activityList[i].ActivityComments[j].postReplyData = res;
            console.log(this.activityList[i].ActivityComments[j], "dataaaaressssss")
            this.postReplyData = res;
            console.log(res, "postReplyData")
          },
          (err) => {
            console.log(err, "errrr")
          }
        );
    }

    this.postReplyData = _.uniqWith(this.postReplyData, _.isEqual);
  }


  private commentExecuteListing(matches, i: any) {
    let prodKey = 'f0e1a437d0c7ecbff1c033def9861286';
    let testKey = '3de712cf16ca1a8d5362bc0e28cd5297';
    for (const url of matches) {
      this.http
        .get(
          `https://api.linkpreview.net/?key=${prodKey}&q=${url}`
        )
        .subscribe(
          (res) => {
            // this.urlData.push(res);
            this.activityList[i].urlData = res;
            this.postUrlData = res;
            console.log(this.activityList[i], "urldataaaaaaaa")
          },
          (err) => {
          }
        );
    }
    this.postUrlData = _.uniqWith(this.postUrlData, _.isEqual);
  }

  async findOncommentUrl(e, i) {
    console.log("workeddd findOncommentUrl")
    this.urlData = [];
    // console.log('findUrl urlData')
    if (!_.isEmpty(this.onAddcomment)) {
      let matches = this.onAddcomment.match(/(((https?:\/\/)|(www\.))[^\s]+)/g);
      if (!_.isEmpty(matches) && matches.length > 0) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          // console.log('executeListing',matches)
          this.commentExecuteListing(matches, i)
        }, 1000);

      }
    }
  }



  async findOnReplyUrl(e, i, j) {
    console.log(i, j, "indexess")
    console.log("workeddd findOncommentUrl")
    this.urlData = [];
    // console.log('findUrl urlData')
    if (!_.isEmpty(this.onAddReply)) {
      let matches = this.onAddReply.match(/(((https?:\/\/)|(www\.))[^\s]+)/g);
      if (!_.isEmpty(matches) && matches.length > 0) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          // console.log('executeListing',matches)
          this.ReplyExecuteListing(matches, i, j)
        }, 1000);

      }
    }
  }



  addSubComment(commentObj, activity, type?, event?, data?, i?, j?, parentComment?,) {
    let commentValue =
      (<HTMLInputElement>(
        document.getElementById(commentObj._id.toString())
      ));
    let replyComment = commentValue.innerText;
    console.log(replyComment, "replyComment")
    console.log(commentValue.innerText, "testvalue")
    console.log('activityyy', activity)
    let replyData = this.postReplyData ? this.postReplyData : [];
    console.log(data, "dtaaaa")
    const charCode = event.which ? event.which : event.keyCode;
    console.log("addSubCommentaddSubCommentaddSubComment")
    let commentText = event.target.innerText;
    console.log(replyData, "infoooo2222")
    selectedMentionUsers.forEach((element) => {
      commentText = commentText.replace(element.name, element.id);
    });
    this.currentActivity = activity;
    this.currentCommentId = commentObj._id;
    replyComment = this.helperService.removeTags(replyComment);
    replyComment = this.helperService.checkCommentUrl(replyComment);
    this.onAddReply = replyComment;
    commentText = this.helperService.removeTags(commentText);
    commentText = this.helperService.checkCommentUrl(commentText)
    console.log(commentText, "commentText ------------check 6")
    const formData = new FormData();
    console.log(replyData, "infoooo44444444")
    formData.append("comment_rich_link", JSON.stringify(replyData));
    formData.append("parentId", commentObj._id);
    formData.append("comment", commentText);
    formData.append("activity_id", commentObj.activity_id);
    formData.append("comment", replyComment)
    if (event && event.addedFiles) {
      console.log("working after append")
      for (const img of event.addedFiles) {
        formData.append("avatar[]", img);
      }
    }
    console.log(JSON.stringify(replyData), "JSON.stringify(replyData)")
    if (data && type.length > 0) {
      this.onReplySucess(formData);
    }


    if (charCode == 13 && event.shiftKey) {
      console.log("get cgarcodeee")
      this.canAddComment = true;
      event.stopPropagation();
    }
    else if (charCode == 13 && this.isMentionUserSelect && this.canAddComment || event.addedFiles) {
      console.log("else if workedddd")
      console.log(this.canAddComment, "canAddComment")
      this.onReplySucess(formData);
    }
    this.onReplySucess = (formData) => {
      event.preventDefault();
      this.canAddComment = false;
      this.appViewService
        .addActivityComment(formData)
        .then((jresponse: JReponse) => {
          this.isDisplay = false;
          if (jresponse && jresponse.message != "Please enter comment") {
            (<HTMLInputElement>(
              document.getElementById(this.currentCommentId.toString())
            )).value = "";
            event.target.innerText = '';
            this.postReplyData = '';
            this.canAddComment = true;
            this.helperService.showSuccessToast(jresponse.message);
            this.parentId = undefined;
            this.getsubComments(
              type == "child" ? parentComment : commentObj,
              this.currentActivity
            );
         
            this.closeModal();
          } else {
            this.canAddComment = false;
            this.helperService.showErrorToast(jresponse.message);
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error);
          throw err;
        });
    }
    //}
  }

  editCommentRecord(event, activityData, currentComment, type?, data?) {
    console.log("editCommentRecordeditCommentRecordworksss--------")
    console.log(event, "event")
    console.log(activityData, "activityData")
    console.log(currentComment, "currentComment")
    console.log(type, "type")
    let divcomment = event.target.innerHTML;
    let comment;
    let activity;
    if (type && type === "comment") {
      this.currentCommentId = currentComment._id;
      activity = activityData;
      let commentText = event.target.innerText;
      selectedMentionUsers.forEach((element) => {
        commentText = commentText.replace(element.name, element.id);
      });
      comment = commentText;
      comment = this.helperService.removeTags(comment);
      comment = this.helperService.checkCommentUrl(comment)
      console.log(comment, "comment ---------check  4")
    } else {
      activity = this.currentActivity;
      comment = (<HTMLInputElement>(
        document.getElementById(currentComment._id.toString())
      )).innerText;
      comment = this.helperService.removeTags(comment);
      comment = this.helperService.checkCommentUrl(comment)
      console.log(comment, "comment ---------check 5")

    }
    const charCode = event.which ? event.which : event.keyCode;
    if (data && type.length > 0) {
      return this.editCommentsucess();
    }

    if (charCode == 13 && event.shiftKey) {
      this.canAddComment = true;
      event.stopPropagation();
    }
    else if
      (charCode == 13 && this.isMentionUserSelect && this.canAddComment || event.addedFiles) {
      console.log("i worked elseeee")
      if (!event.addedFiles) {
        event.preventDefault();
      }
      this.editCommentsucess();
    }

    this.editCommentsucess = () => {
      console.log("editCommentsucesseditCommentsucess")
      this.canAddComment = false;
      const formData = new FormData();
      formData.append("comment", comment.trim());
      this.appViewService
        .editActivityComment(currentComment._id, formData)
        .then((jresponse: JReponse) => {
          if (jresponse && jresponse.message != "Please enter comment") {
            this.helperService.showSuccessToast(jresponse.message);
            this.canAddComment = true;
            currentComment.isShow = currentComment._id;
            currentComment.comment_for_update = comment.trim();
            currentComment.comment = divcomment.trim().replace('<div><br></div>', '');;
            currentComment.attachmentData = "";
            selectedMentionUsers = [];
            this.imagePrevOfRes = false;
            this.updateNewImage = [];
            this.type = "edit";
            this.isEdit = false;
            this.toggleMenu("");
            this.closeModal();
          } else {
            this.isDisplay = false;
            this.canAddComment = true;
            this.helperService.showErrorToast(jresponse.message);
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error);
          throw err;
        });
    }


  }
  //close

  openUploadEditCommentModal(activity, comment) {
    // this.parentId = undefined;
    this.mainObj = {};
    this.currentCommentId = activity._id;
    this.currentActivity = activity;
    this.currentComment = comment;
    this.isEdit = true;
    const initialState = { caller: "addComment", uploadType: "multiple" };
    const modalParams = Object.assign(
      {},
      {
        initialState, class: "small-custom-modal", animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
      }
    );
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }
  focusComment(id) {
    document.getElementById(id).focus();
  }
  getCommentImages() {
    this.homeService.commentImages.subscribe((images) => {
      this.addCommentRecord({ addedFiles: images });
      this.homeService.uploadModalRef.hide();
    });
  }
  addReply(comment, activity, type) {
    this.isDisplay = comment._id;
  }

  addLikes(activity) {
    return new Promise<void>((resolve, reject) => {
      this.appViewService
        .addLikes(activity._id)
        .then((jresponse: JReponse) => {
          const finalActivity = _.find(this.activityList, {
            _id: activity._id,
          });
          if (jresponse.success && !_.isEmpty(jresponse.body)) {
            activity.likesCount = activity.likesCount + 1;
            finalActivity.ActivityLikes =
              finalActivity.ActivityLikes &&
                !_.isEmpty(finalActivity.ActivityLikes)
                ? [jresponse.body.user_id]
                : finalActivity.ActivityLikes.push(jresponse.body.user_id);
            finalActivity.actClass = "active";
            finalActivity.subActivity = [];
            finalActivity.subActivityTotal = finalActivity.subActivityTotal + 1;
            this.getSubActivity(finalActivity);
          } else {
            activity.actClass = "inactive";
            activity.likesCount = activity.likesCount - 1;
            activity.subActivity = [];
            activity.subActivityTotal = activity.subActivityTotal - 1;
            this.getSubActivity(activity);
          }
          resolve();
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  getComment(comment) {
    return new Promise<void>((resolve, reject) => {
      this.appViewService
        .getComment(comment._id)
        .then((jresponse: JReponse) => {
          if (jresponse.success && !_.isEmpty(jresponse.body)) {
            comment.likeUsers = jresponse.body.likeUsers;
          }
          resolve();
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  addCommentLikes(activity, comment) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .addCommentLikes(comment._id)
        .then((jresponse: JReponse) => {
          this.getComment(comment);
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
    });
  }
  deleteComment(comment, activity, type, parentComment?) {
    this.deleteActivityId = activity;
    this.deleteCommentId = comment;
    this.deleteType = type;
    if (type == "subChild" || type == "child") {
      this.currentComment = parentComment;
    }
    document.getElementById("deleteCommentModalButton").click();
  }
  confirmDeleteComment() {
    this.appViewService
      .deleteComment(this.deleteCommentId._id)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.showSuccessToast(jresponse.message);
          if (this.deleteType == "parent") {
            return new Promise<void>((resolve, reject) => {
              this.appViewService
                .getMoreComments(
                  0,
                  this.deleteActivityId.ActivityComments.length,
                  this.deleteActivityId._id,
                  this.deleteActivityId.record_id != null ? this.deleteActivityId.record_id : ""
                )
                .then((jresponse: JReponse) => {
                  if (jresponse.success) {
                    if (
                      this.deleteType == "parent" &&
                      jresponse.body.length > 0
                    ) {
                      let sorted = _.orderBy(jresponse.body, ['createdAt'], ['desc']);
                      this.deleteActivityId.ActivityComments = sorted;
                      this.deleteActivityId.ActivityCommentsTotal =
                        this.deleteActivityId.ActivityCommentsTotal - 1;
                    }
                    if (_.isEmpty(jresponse.body)) {
                      this.deleteActivityId.ActivityComments = [];
                      delete this.deleteActivityId.ActivityCommentsTotal;
                    }
                    this.currentComment = undefined;
                    this.closeModal();
                  }
                  resolve();
                })
                .catch((err: Error) => {
                  this.helperService.showErrorToast(err.message);
                  reject();
                  throw err;
                });
            });
          } else {
            this.getsubComments(this.currentComment, this.deleteActivityId);
            this.currentComment = undefined;
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  editReply(comment, activity, type) {
    let commentText;
    let userIds = []
    if (comment.comment_for_update && comment.comment_for_update != '') {
      commentText = comment.comment_for_update.split('{{');
      commentText = commentText.filter(e => e.includes('}}'));
      commentText.forEach(e => {
        userIds.push((e.split('}}')[0]));
        // splitText = e.split('}}')[1];
      });
      let data = _.chain(this.mentionUserList)
        .keyBy('_id')
        .at(userIds)
        .value();
      let latestField = data.map(obj => {
        let newObj = obj;
        newObj.old_id = `{{${newObj._id}}}`
        newObj.old_name = newObj.fullName
        newObj.id = obj.old_id;
        newObj.name = obj.old_name;
        delete newObj.old_id;
        delete newObj.old_name
        return newObj
      })
      selectedMentionUsers = latestField;
    }

    comment.updatedImageData = [];
    this.updateNewImage = [];
    this.attachmentData = [];
    comment.isShow = "true";
    this.isEdit = true;
    this.currentId = comment._id;
    this.cdRef.detectChanges();
    comment.attachmentData = comment.image;
    this.imagePrevOfRes = true;
    let elms = document.querySelectorAll("div.client-name");
    for (let i = 0; i < elms.length; i++) {
      elms[i].setAttribute("contenteditable", "false");
    }
    if (comment.image && !_.isEmpty(comment.image)) {
      comment.image.forEach((element) => {
        comment.updatedImageData.push({
          source: element.attachment.srcPath,
          sendingData: element.attachment.path,
        });
      });
    }



  }
  ngOnDestroy() {
    this.refreshPostSubscription.unsubscribe();
  }
  redirectRecord(id) {
    const recordId = id;
    this.appViewService
      .getSingleRecord(id)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (jresponse.body && jresponse.body.length > 0) {
            const record = jresponse.body[0];
            const initialState = {
              recordId,
              appFields: record.appFields,
              recordFormValues: record.data,
              appId: record.application_id,
              workspaceId: record.workspace_id,
              orgId: record.organization_id,
              type: "calendar",
            };
            // document.getElementById("closeRecordModal").click();
            this.homeService.recordModalRef = this.modalService.show(
              RecordModalComponent,
              {
                initialState, class: "modal-lg", animated: true,
                keyboard: true,
                backdrop: false,
                ignoreBackdropClick: true
              }
            );
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  sharePost(type, activity) {
    this.comment = "";
    this.sharePostComment = activity;
    if (this.sharePostComment.avatar && !_.isEmpty(this.sharePostComment.avatar)) {
      this.sharePostComment.avatar.forEach((img) => {
        let src =
          img.attachment.type === "img"
            ? img.attachment.path
            : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
              ? img.thumbs[0].thumbPath
              : (img.attachment.path + ',' + img.attachment.type);
        img.attachment.srcPath = src;
      })
    }

    this.openModal(this.SocialSharepost, "share");
  }
  share() {
    if (_.isEmpty(this.comment)) {
      this.helperService.showErrorToast("Please enter something");
    } else {
      if (!_.isEmpty(this.comment)) {
        let commentText = document.getElementById("commentSectionShare").innerText;
        selectedMentionUsers.forEach((element) => {
          commentText = commentText.replace(element.name, element.id);
        });
        this.comment = commentText;
      }
      if (!this.isEdit) {
        let activity = JSON.parse(JSON.stringify(this.sharePostComment));
        let info = this.urlData && this.urlData.length > 0 ? this.urlData : [];
        this.btnDisable = true;
        const formData = new FormData();
        formData.append("comment", this.comment);
        formData.append("activity_id", activity._id);
        formData.append("urlData", JSON.stringify(info));
        this.appViewService
          .sharePost(formData)
          .then((jresponse: JReponse) => {
            if (jresponse.body == "Post already shared") {
              this.helperService.showErrorToast(
                "You have already shared this post"
              );
              this.btnDisable = false;
              this.closeModal();
            } else {
              this.helperService.showSuccessToast(jresponse.message);
              this.urlData = [];
              this.btnDisable = false;
              this.activityList = [jresponse.body.data[0]].concat(
                this.activityList
              );
              const finalActivity = _.find(this.activityList, {
                _id: activity._id,
              });
              finalActivity.shareCount = finalActivity.shareCount + 1;
              let elms = document.querySelectorAll("div.client-name");
              for (let i = 0; i < elms.length; i++) {
                elms[i].setAttribute("contenteditable", "false");
              }
              this.totalRecord = this.totalRecord + 1;
              this.addShareForm.reset();
              this.comment = "";
              this.closeModal();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });
      } else {
        let activity = JSON.parse(JSON.stringify(this.sharePostComment));
        let info = this.urlData && this.urlData.length > 0 ? this.urlData : [];
        this.btnDisable = true;
        const formData = new FormData();
        formData.append("comment", this.comment);
        formData.append("activity_id", activity._id);
        formData.append("urlData", JSON.stringify(info));
        this.appViewService
          .editPost(this.currentId, formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.body.message);
            }
            let elms = document.querySelectorAll("div.client-name");
            for (let i = 0; i < elms.length; i++) {
              elms[i].setAttribute("contenteditable", "false");
            }
            const finalActivity = _.find(this.activityList, {
              _id: jresponse.body.data[0]._id,
            });
            finalActivity.comment = jresponse.body.data[0].comment;
            finalActivity.avatar = jresponse.body.data[0].avatar;
            finalActivity.comment_rich_link =
              jresponse.body.data[0].comment_rich_link;
            this.urlData = [];
            this.btnDisable = false;
            this.addPostForm.reset();
            this.imageData = [];
            this.isEdit = false;
            this.editShareComment = "&nbsp;";
            this.closeModal();
            this.getAllData(0, "all");
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });
      }
    }
  }
  openImgModal(images, type, index: any = 0) {
    this.imgModal = [];
    if (type == 1) {
      this.imgModal = images[0];
    } else if (type == 2) {
      this.imgModal = images.slice(0, 2);
    } else if (type == 3) {
      this.imgModal = images.slice(0, 3);
    } else if (type == 24) {
      this.imgModal = images.slice(0, 4);
    } else {
      this.imgModal = images;
    }
    this.activeImageModalIndex = index
    document.getElementById("imgModalBtn").click();
  }

  // ngAfterViewInit(){
  //   setTimeout(() => {
  //     this.getAppsContainerScroll()
  //   }, 1000);
  // }

  ngAfterContentChecked() {
    setTimeout(() => {
      this.getAppsContainerScroll()
    }, 1000);
  }

  getAppsContainerScroll() {
    var content = document.getElementById('apps-tabs-container')

    if (content && content.scrollWidth && content.offsetWidth) {
      let scrollWidth = content.scrollWidth
      let contentWidth = content.offsetWidth

      if (scrollWidth > contentWidth) {
        this.appsNav = true
      }
      else {
        this.appsNav = false
      }
    }

  }

  scrollAppTabToRight() {

    document.getElementById('apps-tabs-container').className += ' scroll-behavior ';

    const content = document.getElementById('apps-tabs-container')

    if (content && content.scrollWidth && content.offsetWidth) {
      let scrollLeft = content.scrollLeft
      let scrollWidth = content.scrollWidth
      let contentWidth = content.offsetWidth

      if ((scrollLeft + contentWidth) >= scrollWidth) {
        content.scrollTo(scrollWidth + 20, 0);
      } else {
        content.scrollTo((scrollLeft + this.scrollStep + 20), 0);
      }
    }

    document.getElementById('apps-tabs-container').classList.remove("scroll-behavior");

  }

  scrollAppTabToLeft() {

    document.getElementById('apps-tabs-container').className += ' scroll-behavior ';

    const content = document.getElementById('apps-tabs-container')
    let scrollLeft = content.scrollLeft;

    if ((scrollLeft - this.scrollStep) <= 0) {
      content.scrollTo(0, 0);
    } else {
      content.scrollTo((scrollLeft - this.scrollStep - 20), 0);
    }

    document.getElementById('apps-tabs-container').classList.remove("scroll-behavior");

  }

  // CHECK FILE - IMAGE / DOC
  // TO RENDER FILE VIEW COMPONENT
  checkTypeAndGetImageDoc(getImagePath: any) {
    return this.helperFunctions.checkTypeAndGetImageDoc(getImagePath);
  }

  // GET ATTACHMENT URL
  // IF URL CONTAINS 'DOC' PARAM
  getAttachmentcUrl(getImagePath: any, action: any = 'view') {
    return this.helperFunctions.getAttachmentcUrl(getImagePath, action);
  }

  // DOWNALOD API FOR ATTACHMENT - IN MODAL BOX
  async getDownloadAttachment(filename: any) {
    return this.helperFunctions.getDownloadAttachment(filename);
  }

  // GET FILE ICON USING EXTENSION
  getFileIconUsingExtension(extension: any) {
    return this.helperFunctions.getFileIconUsingExtension(extension);
  }

  // GET FILE SUPPORTED FORMAT
  getSupportedFormat(fileExtension: any) {
    return this.helperFunctions.getSupportedFormat(fileExtension);
  }

  closeModalBox() {
    return this.helperFunctions.closeModalBox();
  }

  getActivityDateFormat(getDate: any) {
    var date = new Date(getDate);

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const updatedDate = date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear() + ' at ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');

    return updatedDate;
  }


  getOrgData(organizationId, organizationRole) {
    let data = {
      _id: organizationId,
      role: organizationRole
    }
    this.helperService.getOrgEvent(data);
  }

  getGroupData(groupId, groupRole) {
    let data = {
      _id: groupId,
      role: groupRole
    }
    this.helperService.getGroupEvent(data);
  }


}
