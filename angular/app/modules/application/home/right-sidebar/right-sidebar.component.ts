import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { environment } from "src/environments/environment";
import { BusinessProfileService } from "../content/parent/business-profile/business-profile.service";
import { MyProfileService } from "../content/parent/my-profile/my-profile.service";
import { UserManagementComponent } from "../content/user-management/user-management.component";
import { HomeService } from "../home.service";
import { SocketService } from 'src/app/services/socketio.service';
import { OrganisationWorkspacesComponent } from 'src/app/modules/application/home/left-sidebar-menu/organisation-workspaces/organisation-workspaces.component';

@Component({
  selector: "app-right-sidebar",
  templateUrl: "./right-sidebar.component.html",
  styleUrls: ["./right-sidebar.component.scss"],
  providers: [OrganisationWorkspacesComponent],
})
export class RightSidebarComponent implements OnInit {
  statusArray = [];
  percentCount: any = 0;
  modalRef: BsModalRef;
  businessName = "";
  orgId;
  userId;
  titlePosition = "";
  avatar;
  mediaUrl;
  @Input() userIdFromPostList;
  userIdFromSubscribe;
  followType;
  userInfo;
  businessRelationshipStatus;

  constructor(
    public helperService: HelperService,
    private businessProfileService: BusinessProfileService,
    private router: Router,
    private modalService: BsModalService,
    private apiService: APIService,
    private myProfileService: MyProfileService,
    public socketService: SocketService,
    private homeService: HomeService,
    private organisationWorkspaces: OrganisationWorkspacesComponent
  ) {
    for (let i = 0; i < 3; i++) {
      this.statusArray[i] = false;
    }
  }

  async ngOnInit() {
    // INITIAL FUNCTION TO GET ADMIN FOR HIDE SHOW EMPLOYEES LINK 
    this.orgId = this.helperService.getLocalStore("selectedOrgId");
    // console.log('this.orgId',this.orgId)
    if (this.orgId) {
      await this.getUsersForUserManagement(this.orgId);
    }

    this.mediaUrl = environment.MEDIA_URL;
    this.homeService.getFlagForOrgId().subscribe((flag) => {
      if (flag) {
        this.orgId = this.helperService.getLocalStore("selectedOrgId");
        this.getUsersForUserManagement(this.orgId);
      }
    });
    const userData = this.helperService.getLocalStore("userData");
    this.userId = userData.owner;
    this.avatar = userData.avatar;
    await this.getBusinessProfileData();
    await this.getProfileData();
    if (userData.avatar && userData.avatar !== "") {
      this.statusArray[0] = true;
    }
    if (this.titlePosition && this.titlePosition !== "") {
      this.statusArray[1] = true;
    }
    if (this.businessName && this.businessName !== "") {
      this.statusArray[2] = true;
    }
    let count = 0;
    this.statusArray.forEach((element) => {
      if (element) {
        count++;
      }
    });
    this.percentCount = ((100 / 3) * count).toFixed(1);
    if (this.userIdFromPostList) {
      this.getUserInfo(this.userIdFromPostList);
    }
    this.helperService.getUserIdForPublicProfile().subscribe((data) => {
      this.userIdFromSubscribe = data;
      const userIds = [...Object.keys(this.helperService.userActiveStatuses)];
      if (!userIds.includes(data)) {
        userIds.push(data);
      }
      this.socketService.getOnlineStatuses(userIds);
      this.getUserInfo(data);
    });
  }

  getMessages(user) {
    const isChatOpen = this.helperService.openedChat.find(u => u.id === user.id);
    if (!isChatOpen) {
      this.helperService.selectedRecipient = user.id;
      this.helperService.openedChat.unshift(user);
      this.helperService.showChat.push(user.id);
      this.socketService.getMessages({ recipient: user.id, skip: this.helperService.messages[user.id] ? this.helperService.messages[user.id].length : 0 });
    }
    if (this.helperService.openedChat.length === 1) {
      document.getElementById("mainBody").classList.add("chat-open");
    }
  }

  goToMyProfile() {
    this.router.navigateByUrl("/application/home/parent/my-profile");
  }

  goToBusinessProfile() {
    this.router.navigateByUrl("/application/home/parent/business-profile");
  }

  goToUserManagement() {
    this.modalRef = this.modalService.show(UserManagementComponent, {
      class: "right-custom-popup",
      animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true
    });
  }


  async getProfileData() {
    await this.myProfileService
      .getProfileData()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          localStorage.setItem('stripeCustomerId', jresponse.body.stripeCustomerId);
          if (jresponse.body.position && jresponse.body.position !== "") {
            this.titlePosition = jresponse.body.position;
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getBusinessProfileData() {
    await this.businessProfileService
      .getBusinessProfileData()
      .then((jresponse: JReponse) => {
        this.businessName = jresponse.body.businessName;
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getUsersForUserManagement(orgId) {
    await this.apiService
      .get(`organization/${orgId}/members`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          if (jresponse.body) {
            let count = 0;
            jresponse.body.forEach((element) => {
              if (this.userId !== element.user_id._id) {
                count++;
              }
            });
            if (count > 0) {
              this.statusArray[2] = true;
            }

            let getUserRole = jresponse.body.filter((data) => data.user_id._id === (this.helperService.getLocalStore("userData")).owner);
            if (getUserRole.length && getUserRole[0].role) {
              // console.log('getUserRole[0].role',getUserRole[0].role)
              this.helperService.setLocalStore("orgRole", getUserRole[0].role)
              this.helperService.orgRole = getUserRole[0].role;
            }
            // FOR EMPLOYEES TAB - HIDE SHOW 
            this.getAdminDomain(jresponse.body);
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  getAdminDomain(membersArray) {
    // FOR EMPLOYEES TAB - HIDE SHOW 
    const getAdmin = (membersArray.filter((data) => data.role === 'admin'))[0];
    console.log(membersArray, "membersArraymembersArray")
    console.log(getAdmin, "getAdmingetAdmin")
    try {
      if (getAdmin && getAdmin.user_id && getAdmin.user_id.email) {
        console.log(getAdmin, getAdmin.user_id, getAdmin.user_id.email , "if condition worksss")
        const getAdminEmail = getAdmin.user_id.email;
        console.log(getAdminEmail, "getAdminEmail")
        const getDomain = getAdminEmail.substring(getAdminEmail.lastIndexOf("@") + 1);
        this.helperService.setLocalStore(
          "storeAdminDomain",
          getDomain
        );
        this.helperService.setLocalStore(
          "storeAdminDomainEmail",
          getAdminEmail
        );

        // CALL FUNCTION FROM ORGANIZATION WORKSPACE 
        this.organisationWorkspaces.matchAdminAndAuthDomain();
      }
    } catch (err) {
      console.log(err,"errrrrrrrrrrrr");
    }
  }

  async doFollowUnfollow() {
    const data = {
      following: this.userIdFromPostList,
      type: this.followType === "follow" ? "unfollow" : "follow",
      followType: "people",
    };
    await this.apiService
      .postWithHeader("market-workspaces/followOrg", data)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.helperService.showSuccessToast(jresponse.message);
          this.homeService.sendOrgIdForPost({
            user_id: this.userIdFromPostList,
          });
          this.getUserInfo(this.userIdFromPostList);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  assignTask() {
    this.router.navigate(["application/home/task"], {
      queryParams: {
        openTaskModal: true,
      },
    });
  }

  async getUserInfo(id) {
    await this.apiService
      .getWithHeader(`/user/${id}/getuserInfo`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.userInfo = jresponse.body;
          this.businessRelationshipStatus = this.userInfo.businessRelation;
          if (this.userInfo.follow) {
            this.followType = "follow";
          } else {
            this.followType = "unfollow";
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
