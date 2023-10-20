import { Component, OnInit, HostListener } from "@angular/core";
import { HomeService } from "../home.service";
import { JReponse } from "src/app/services/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { HelperService } from 'src/app/services/helper.service';
import { Constants } from "../../../../constants/constants";
import { Subscription } from "rxjs";
import { skip } from 'rxjs/operators';

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit {
  notifications: any = {
    all: [],
    unread: [],
    starred: [],
    viewed: [],
  };
  totalRecord = 0;
  caller = true;
  type = "unread";
  checkedNotifications = [];
  mediaUrl = environment.MEDIA_URL;
  loadMoreDataSubs = new Subscription();

  constructor(
    private homeService: HomeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService
  ) { }
  @HostListener("window:scroll", ["$event"])

  scroll(event) {
    // console.log(event.target.hasAttribute("scrolling"),event.target.scrollTop + event.target.clientHeight >= event.target.scrollHeight-50)
    // console.log((event.target.scrollHeight) - (event.target.scrollTop) , (event.target.clientHeight))
    // console.log(event.target.scrollTop,event.target.scrollHeight - event.target.clientHeight)
    if (
      event.target.scrollTop + event.target.clientHeight >= event.target.scrollHeight - 50

    ) {


      // console.log('in api')
      this.getNotifications(this.type, 0)
      event.target.setAttribute("scrolling", "1");


    }
  }
  ngOnInit() {

    if (this.activatedRoute.snapshot.queryParams.type) {
      this.type = this.activatedRoute.snapshot.queryParams.type;
    } else {
      this.type = 'unread'
    }
    this.changeTab(
      this.type
    );
  }

  selectAll(event, type) {
    if (event.target.checked) {
      this.notifications[type].forEach((item) => {
        if (!this.checkedNotifications.includes(item._id)) {
          this.checkedNotifications.push(item._id);
        }
      });
    } else {
      this.checkedNotifications = [];
    }
  }

  goToPublicProfile(id) {
    // if (this.isPublicProfile) {
    // this.helperService.sendUserIdForPublicProfile(id);
    // } else {
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
    // }
  }

  changeTab(type) {
    this.type = type;
    this.notifications = {
      all: [],
      unread: [],
      starred: [],
      viewed: [],
    };
    //  this.router.navigateByUrl(`application/home/notifications?type=${type}`);
    this.checkedNotifications = [];
    this.getNotifications(type, 0)
  }

  getNotifications(type, length = -1) {
    let skipCount;
    let flag;
    if (this.type == 'unread') {
      flag = this.totalRecord > this.notifications.unread.length ? true : false;
      skipCount = this.notifications.unread.length ? this.notifications.unread.length : 0;
    } else if (this.type == 'starred') {
      flag = this.totalRecord > this.notifications.starred.length ? true : false;
      skipCount = this.notifications.starred.length ? this.notifications.starred.length : 0;
    } else if (this.type == 'viewed') {
      flag = this.totalRecord > this.notifications.viewed.length ? true : false;
      skipCount = this.notifications.viewed.length ? this.notifications.viewed.length : 0;
    } else {
      flag = this.totalRecord > this.notifications.all.length ? true : false;
      skipCount = this.notifications.all.length ? this.notifications.all.length : 0;
    }
    this.totalRecord = skipCount > 0 ? this.totalRecord : 0;

    if (this.totalRecord == 0 || flag == true && this.caller === true) {
      this.caller = false;
      this.homeService
        .getNotifications(skipCount, type)
        .then((jresponse: JReponse) => {
          this.caller = true;
          //return false
          if (jresponse) {
            // this.notifications = {
            //   all: [],
            //   unread: [],
            //   starred: [],
            //   viewed: [],
            // };
            // jresponse.body = jresponse.body.map(notification => {
            //   if (notification && notification.comment && (notification.comment.length > 140)) {
            //     notification.comment = notification.comment.substring(0, 140) + "...";
            //   }
            //   return notification;
            // })

            this.helperService.notificationApiCalled = true;
            jresponse.body.data.forEach((notification) => {

              if (notification && notification.comment && (notification.comment.length > 140)) {
                let text = this.trimHtml(notification.comment, { limit: 140 });
                notification.comment = text.html;
                // notification.comment = notification.comment.substring(0, 140) + "...";

              }
              if (notification.activity_text.includes("[user-name]")) {
                notification.activity_text = notification.activity_text.replace(
                  "[user-name]",
                  `${notification.user.firstName} ${notification.user.lastName}`
                );
              }
              // if (notification.star) {
              //   notification.type = "starred";
              //   this.notifications.starred.push(notification);
              // }
              // if (notification.is_read) {
              //   notification.type = "viewed";
              //   this.notifications.viewed.push(notification);
              // } else {
              //   notification.type = "unread";
              //   this.notifications.unread.push(notification);
              // }
            });
            if (this.type == 'unread') {
              if (skipCount > 0) {
                this.notifications.unread = [
                  ...this.notifications.unread,
                  ...jresponse.body.data
                ];
              } else {
                this.notifications.unread = jresponse.body.data;
              }
              this.helperService.notificationCount = jresponse.body.totalRecord;
              this.helperService.setLocalStore(
                "notificationCount",
                this.helperService.notificationCount
              );
            }
            if (this.type == 'starred') {

              if (skipCount > 0) {
                this.notifications.starred = [
                  ...this.notifications.starred,
                  ...jresponse.body.data
                ];
              } else {
                this.notifications.starred = jresponse.body.data;
              }


            }
            if (this.type == 'viewed') {
              if (skipCount > 0) {
                this.notifications.viewed = [
                  ...this.notifications.viewed,
                  ...jresponse.body.data
                ];
              } else {
                this.notifications.viewed = jresponse.body.data;
              }

            }
            if (this.type == 'all') {
              if (skipCount > 0) {
                this.notifications.all = [
                  ...this.notifications.all,
                  ...jresponse.body.data
                ];
              } else {
                this.notifications.all = jresponse.body.data;
              }
            }
          }
          this.totalRecord = jresponse.body.totalRecord;

        })
        .catch((err: Error) => {
          throw err;
        });
    }

  }
  trimHtml(html, options) {

    options = options || {};

    var limit = options.limit || 100,
      preserveTags = (typeof options.preserveTags !== 'undefined') ? options.preserveTags : true,
      wordBreak = (typeof options.wordBreak !== 'undefined') ? options.wordBreak : false,
      suffix = options.suffix || '...',
      moreLink = options.moreLink || '';

    var arr = html.replace(/</g, "\n<")
      .replace(/>/g, ">\n")
      .replace(/\n\n/g, "\n")
      .replace(/^\n/g, "")
      .replace(/\n$/g, "")
      .split("\n");

    var sum = 0,
      row, cut, add,
      tagMatch,
      tagName,
      tagStack = [],
      more = false;

    for (var i = 0; i < arr.length; i++) {

      row = arr[i];
      // count multiple spaces as one character
      let rowCut = row.replace(/[ ]+/g, ' ');

      if (!row.length) {
        continue;
      }

      if (row[0] !== "<") {

        if (sum >= limit) {
          row = "";
        } else if ((sum + rowCut.length) >= limit) {

          cut = limit - sum;

          if (row[cut - 1] === ' ') {
            while (cut) {
              cut -= 1;
              if (row[cut - 1] !== ' ') {
                break;
              }
            }
          } else {

            add = row.substring(cut).split('').indexOf(' ');

            // break on halh of word
            if (!wordBreak) {
              if (add !== -1) {
                cut += add;
              } else {
                cut = row.length;
              }
            }
          }

          row = row.substring(0, cut) + suffix;

          if (moreLink) {
            row += '<a href="' + moreLink + '" style="display:inline">»</a>';
          }

          sum = limit;
          more = true;
        } else {
          sum += rowCut.length;
        }
      } else if (!preserveTags) {
        row = '';
      } else if (sum >= limit) {

        tagMatch = row.match(/[a-zA-Z]+/);
        tagName = tagMatch ? tagMatch[0] : '';

        if (tagName) {
          if (row.substring(0, 2) !== '</') {

            tagStack.push(tagName);
            row = '';
          } else {

            while (tagStack[tagStack.length - 1] !== tagName && tagStack.length) {
              tagStack.pop();
            }

            if (tagStack.length) {
              row = '';
            }

            tagStack.pop();
          }
        } else {
          row = '';
        }
      }

      arr[i] = row;
    }

    return {
      html: arr.join("\n").replace(/\n/g, ""),
      more: more
    };
  }
  checkNotification(event, id) {
    if (event.target.checked) {
      this.checkedNotifications.push(id);
    } else {
      this.checkedNotifications.splice(
        this.checkedNotifications.indexOf(id),
        1
      );
    }
  }

  updateNotifications(type, ids) {

    if (ids.length) {
      const data: any = {
        activitiesId: ids,
      };

      type === "star"
        ? (data.star = true)
        : type === "read"
          ? (data.is_read = true)
          : type === "unstar"
            ? (data.star = false)
            : (data.is_read = false);
      // return false
      // switch (type) {
      //   case Constants.NOTIFICATION_TYPES.read:
      //     ids.forEach(id => {
      //       const notificationId = this.notifications.unread.findIndex(n => n._id === id);
      //       if (notificationId >= 0) {
      //         const obj = this.notifications.unread.splice(notificationId, 1)[0];
      //         obj.is_read = true;
      //         //this.notifications.viewed.push(obj);
      //       };
      //     });
      //     break;

      //   case Constants.NOTIFICATION_TYPES.unread:
      //     ids.forEach(id => {
      //       const notificationId = this.notifications.viewed.findIndex(n => n._id === id);
      //       if (notificationId >= 0) {
      //         const obj = this.notifications.viewed.splice(notificationId, 1)[0];
      //         obj.is_read = false;
      //      //   this.notifications.unread.push(obj);
      //       };
      //     });
      //     break;

      //   case Constants.NOTIFICATION_TYPES.star:
      //     // ids.forEach(id => {
      //     //   const notificationId = this.notifications.all.findIndex(n => n._id === id);
      //     //   const exists = this.notifications.starred.find(n => n._id === id);
      //     //   if (notificationId >= 0 && !exists) {
      //     //     const obj = this.notifications.all[notificationId].is_read
      //     //       ? this.notifications.viewed.find(n => n._id === id) : this.notifications.unread.find(n => n._id === id);
      //     //     obj.star = true;
      //     //     this.notifications.starred.push(this.notifications.all[notificationId]);
      //     //   };
      //     // });
      //     break;

      //   case Constants.NOTIFICATION_TYPES.unstar:
      //     // ids.forEach(id => {
      //     //   const notificationId = this.notifications.starred.findIndex(n => n._id === id);
      //     //   if (notificationId >= 0) {
      //     //     const obj = this.notifications.starred[notificationId].is_read
      //     //       ? this.notifications.viewed.find(n => n._id === id) : this.notifications.unread.find(n => n._id === id);
      //     //     obj.star = false;
      //     //     this.notifications.starred.splice(notificationId, 1);
      //     //   };
      //     // });
      //     break;
      // }


      let notificationData = (this.type == 'unread' ? this.notifications.unread : (this.type == 'viewed' ? this.notifications.viewed : (
        this.type == 'starred' ? this.notifications.starred : this.notifications.all)
      ));
      //return false;
      if (Object.keys(data).includes("star")) {
        this.homeService
          .updateStarNotifications(data)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.checkedNotifications = [];
              if (this.type == 'all' || this.type == 'viewed' || this.type == 'unread') {

                ids.forEach(id => {
                  const notificationId = notificationData.find(n => n._id === id);
                  if (notificationId) {
                    notificationId.star = data.star;
                  };
                });
              } else if (this.type == 'starred' && data.activitiesId.length == notificationData.length) {
                this.changeTab(
                  this.type
                );
              } else {
                ids.forEach(id => {
                  const notificationId = notificationData.findIndex(n => n._id === id);
                  if (notificationId >= 0) {
                    const obj = notificationData.splice(notificationId, 1)[0];
                    obj.star = data.star;
                  };
                });
                // if (this.type == 'unread') {
                //   this.helperService.notificationCount = this.totalRecord;
                //   this.helperService.setLocalStore(
                //     "notificationCount",
                //     this.helperService.notificationCount
                //   );
                // }
              }
              // this.getNotifications();
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      } else {
        this.homeService
          .updateViewedNotifications(data)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.checkedNotifications = [];
              let totalCount = this.helperService.notificationCount;
              if (this.type == 'all' || this.type == 'starred') {
                ids.forEach(id => {
                  const notificationId = notificationData.find(n => n._id === id);
                  if (notificationId) {
                    notificationId.is_read = data.is_read;
                  };
                });
              } else if (data.activitiesId.length == notificationData.length) {
                this.changeTab(
                  this.type
                );
              } else {
                ids.forEach(id => {
                  const notificationId = notificationData.findIndex(n => n._id === id);
                  if (notificationId >= 0) {
                    const obj = notificationData.splice(notificationId, 1)[0];
                    obj.is_read = data.is_read;
                    if (this.type == 'unread' && data.is_read == true) {
                      totalCount = totalCount - 1;
                    }
                    if (this.type == 'viewed' && data.is_read == false) {
                      totalCount = totalCount + 1;
                    }
                  };
                });
                if (this.type == 'unread' && data.is_read == true || this.type == 'viewed' && data.is_read == false) {
                  this.helperService.notificationCount = totalCount;
                  this.helperService.setLocalStore(
                    "notificationCount",
                    this.helperService.notificationCount
                  );
                }
              }
              // this.getNotifications();
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }
  }
}
