import { Component, OnInit, TemplateRef, OnDestroy } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { Constants } from "src/app/constants/constants";
import { OrganisationUserWorkspaceComponent } from "../organisation-user-workspace/organisation-user-workspace.component";
import { environment } from "src/environments/environment";
import { HomeService } from "../../home.service";
@Component({
  selector: "app-user-management",
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.scss"],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  orgId;
  workspace_id;
  userManagementList;
  workspaceUserManagementList;
  isSelectAll = false;
  employeeList;
  employeeListForInvite = [];
  employeeListForWorkspaceInvite = [];
  selectedEmployeeForInvite = [];
  selectedEmployeeForWorkspaceInvite = [];
  IsEmployee;
  isShowRole = false;
  modalRef: BsModalRef;
  roleList;
  keyword = "";
  selectedRole = "";
  searchKeyword = "";
  inputData;
  inputedData = "";
  userData;
  removeUserListById = [];
  removeUserListByEmail = [];
  mediaUrl;
  IsWorkspaceUserManagement;
  wsIdForUM;
  availableSeats = 0;
  totalSeats = 0;
  authUserPlan:any = false;
  workspaces:any;
  isUserManagementAccess:boolean = false;

  constructor(
    public helperService: HelperService,
    public homeService: HomeService,
    private apiService: APIService,
    public modalService: BsModalService
  ) { }

  ngOnInit() {
    this.mediaUrl = environment.MEDIA_URL;
    this.userData = this.helperService.getLocalStore("userData");
    this.roleList = Constants.ROLES;
    this.orgId = this.helperService.getLocalStore("selectedOrgId");
    this.workspaces = this.helperService.getLocalStore(
      "workspaces"
    );
    if (this.IsEmployee) {
      this.getEmployees(this.searchKeyword, this.selectedRole);
      // this.getAvailableSeats();
    } else if (this.IsWorkspaceUserManagement) {
      this.getEmployeesForWorkspaceUserManagement(
        this.searchKeyword,
        this.selectedRole
      );
    } else {
      this.getUsersForUserManagement(this.searchKeyword, this.selectedRole);
    }

    // console.log('workspacesworkspacesworkspaces');
    // console.log(this.userData.owner);
    // this.isUserManagementAccess = false;
   
    // this.workspaces.forEach((element) => {
    //   console.log('element.owner',element.owner)
    //   console.log('spaceOwner',spaceOwner)
    //   console.log('element.role', element.role)
    //     if(element.owner == spaceOwner && element.role == 'admin'){
    //       this.isUserManagementAccess = true;
    //     }
    // });
    // console.log('this.isUserManagementAccess',this.isUserManagementAccess)
  }

  checkIsUserManagementAccess(user_id,role){
    var spaceOwner = this.userData.owner;
    if(user_id == spaceOwner && role == 'admin'){
      this.isUserManagementAccess = true;
      return true;
    }
    else{
      return false;
    }
  }

  doSelectAll() {
    this.isSelectAll = !this.isSelectAll;
    if (this.isSelectAll) {
      if (this.IsEmployee) {
        this.employeeList.forEach((element) => {
          element.isChecked = true;
        });
      } else if (this.IsWorkspaceUserManagement) {
        this.workspaceUserManagementList.forEach((element) => {
          element.isChecked = true;
        });
      } else {
        this.userManagementList.forEach((element) => {
          element.isChecked = true;
        });
      }
    } else {
      if (this.IsEmployee) {
        this.employeeList.forEach((element) => {
          element.isChecked = false;
        });
      } else if (this.IsWorkspaceUserManagement) {
        this.workspaceUserManagementList.forEach((element) => {
          element.isChecked = false;
        });
      } else {
        this.userManagementList.forEach((element) => {
          element.isChecked = false;
        });
      }
    }
  }

  checkSelectAll(item) {
    item.isChecked = !item.isChecked;
    if (this.IsEmployee) {
      let temp = [];
      temp = this.employeeList.filter((e) => e.isChecked === false);
      if (temp.length > 0) {
        this.isSelectAll = false;
      } else {
        this.isSelectAll = true;
      }
    } else if (this.IsWorkspaceUserManagement) {
      let temp = [];
      temp = this.workspaceUserManagementList.filter(
        (e) => e.isChecked === false
      );
      if (temp.length > 0) {
        this.isSelectAll = false;
      } else {
        this.isSelectAll = true;
      }
    } else {
      let temp = [];
      temp = this.userManagementList.filter((e) => e.isChecked === false);
      if (temp.length > 0) {
        this.isSelectAll = false;
      } else {
        this.isSelectAll = true;
      }
    }

    if (this.IsEmployee) {
      this.employeeList.forEach((element) => {
        if (item.isChecked) {
          if (!item.user_id._id) {
            if (!this.removeUserListByEmail.includes(item.user_id.email)) {
              if (element.user_id.email === item.user_id.email) {
                this.removeUserListByEmail.push(item.user_id.email);
              }
            }
          } else {
            if (!this.removeUserListById.includes(item.user_id._id)) {
              if (element.user_id._id === item.user_id._id) {
                this.removeUserListById.push(item.user_id._id);
              }
            }
          }
        } else {
          if (!item.user_id._id) {
            this.removeUserListByEmail = this.removeUserListByEmail.filter(
              (e) => {
                return e !== item.user_id.email;
              }
            );
          } else {
            this.removeUserListById = this.removeUserListById.filter((e) => {
              return e !== item.user_id._id;
            });
          }
        }
      });
    } else if (this.IsWorkspaceUserManagement) {
      this.workspaceUserManagementList.forEach((element) => {
        this.workspace_id = element.workspace_id;
        if (item.isChecked) {
          if (!item.user_id._id) {
            if (!this.removeUserListByEmail.includes(item.user_id.email)) {
              if (element.user_id.email === item.user_id.email) {
                this.removeUserListByEmail.push(item.user_id.email);
              }
            }
          } else {
            if (!this.removeUserListById.includes(item.user_id._id)) {
              if (element.user_id._id === item.user_id._id) {
                this.removeUserListById.push(item.user_id._id);
              }
            }
          }
        } else {
          if (!item.user_id._id) {
            this.removeUserListByEmail = this.removeUserListByEmail.filter(
              (e) => {
                return e !== item.user_id.email;
              }
            );
          } else {
            this.removeUserListById = this.removeUserListById.filter((e) => {
              return e !== item.user_id._id;
            });
          }
        }
      });
    } else {
      this.userManagementList.forEach((element) => {
        if (item.isChecked) {
          if (!item.user_id._id) {
            if (!this.removeUserListByEmail.includes(item.user_id.email)) {
              if (element.user_id.email === item.user_id.email) {
                this.removeUserListByEmail.push(item.user_id.email);
              }
            }
          } else {
            if (!this.removeUserListById.includes(item.user_id._id)) {
              if (element.user_id._id === item.user_id._id) {
                this.removeUserListById.push(item.user_id._id);
              }
            }
          }
        } else {
          if (!item.user_id._id) {
            this.removeUserListByEmail = this.removeUserListByEmail.filter(
              (e) => {
                return e !== item.user_id.email;
              }
            );
          } else {
            this.removeUserListById = this.removeUserListById.filter((e) => {
              return e !== item.user_id._id;
            });
          }
        }
      });
    }
  }

  search(data) {
    this.searchKeyword = data.target.value;
    if (this.IsEmployee) {
      this.getEmployees(this.searchKeyword, this.selectedRole);
    } else if (this.IsWorkspaceUserManagement) {
      this.getEmployeesForWorkspaceUserManagement(
        this.searchKeyword,
        this.selectedRole
      );
    } else {
      this.getUsersForUserManagement(this.searchKeyword, this.selectedRole);
    }
  }

  showRole() {
    this.isShowRole = !this.isShowRole;
  }

  // async getAvailableSeats() {
  //   await this.apiService
  //     .getWithHeader(`organization/${this.orgId}/getOrgSeat`)
  //     .then((jresponse: JReponse) => {
  //       if (jresponse) {
  //         this.totalSeats = jresponse.body.totalSeats;
  //         this.availableSeats = jresponse.body.availableSeats;
  //       }
  //     })
  //     .catch((err: any) => {
  //       throw err;
  //     });
  // }

  getEmployees(data, role) {
    let query = "";
    if (data) {
      query = `?name=${data}`;
    } else if (role) {
      query = `?role=${role}`;
    }
    if (data && role) {
      query = `?name=${data}&role=${role}`;
    }
    this.apiService
      .getWithHeader(`organization/${this.orgId}/employees${query}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.totalSeats = jresponse.body.seats;
          this.authUserPlan = (jresponse.body.userPlan).toLowerCase();
          this.availableSeats =  jresponse.body.data.length;
          this.employeeList = jresponse.body.data;
          this.employeeList.forEach((element) => {
            element.showActions = false;
            element.isChecked = false;
          });
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.message);
        throw err;
      });
  }

  getEmployeesForWorkspaceUserManagement(data?, role?) {
    let query = "";
    if (data) {
      query = `?name=${data}`;
    } else if (role) {
      query = `?role=${role}`;
    }
    if (data && role) {
      query = `?name=${data}&role=${role}`;
    }
    this.apiService
      .getWithHeader(`workspace/${this.wsIdForUM}/user-management${query}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.workspaceUserManagementList = jresponse.body;
          this.workspace_id = this.IsWorkspaceUserManagement.length
            ? this.IsWorkspaceUserManagement[0].workspace_id
            : "";
          this.workspaceUserManagementList.forEach((element) => {
            element.showActions = false;
            element.isChecked = false;
          });
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  getUsersForUserManagement(data?, role?) {
    let query = "";
    if (data) {
      query = `?name=${data}`;
    } else if (role) {
      query = `?role=${role}`;
    }
    if (data && role) {
      query = `?name=${data}&role=${role}`;
    }
    this.apiService
      .get(`organization/${this.orgId}/members${query}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.userManagementList = jresponse.body;
          this.userManagementList.forEach((element) => {
            element.showActions = false;
            element.isChecked = false;
          });
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "right-custom-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }

  closeModal(level) {
    this.modalService.hide(level);
    this.employeeListForInvite = [];
    this.employeeListForWorkspaceInvite = [];
    this.selectedEmployeeForInvite = [];
    this.selectedEmployeeForWorkspaceInvite = [];
    if(level === 1){
      document.body.classList.remove('modal-open')
    }
  }
  goToUserWorkspaces() {
    this.modalRef = this.modalService.show(OrganisationUserWorkspaceComponent, {
      class: "right-custom-popup custom-member-right-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }
  getKeyword(keyword) {
    this.inputData = keyword.target.value;
    if (this.inputData.length >= 3) {
      this.keyword = this.inputData;
      if (this.IsWorkspaceUserManagement) {
        this.getOrgMemberListForWorkspaceInvite();
      } else {
        this.getUserListForInvite();
      }
    } else {
      this.keyword = "";
      this.employeeListForInvite = [];
      this.employeeListForWorkspaceInvite = [];
    }
  }

  getUserListForInvite() {
    if (this.keyword && this.keyword !== "") {
      this.apiService
        .getWithHeader(
          `organization/${this.orgId}/getUserList?keyword=${this.keyword}`
        )
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.employeeListForInvite = jresponse.body;
            for (let i = 0; i < this.employeeListForInvite.length; i++) {
              this.employeeListForInvite[i].isAdded = false;
              this.employeeListForInvite[i].role = "";
            }
          }
        })
        .catch((err: any) => {
          throw err;
        });
    }
  }

  getRole(event, employee?) {
    if (event.target.value === "Administrator") {
      this.selectedRole = "admin";
    } else if (event.target.value === "Member") {
      this.selectedRole = "member";
    } else if (event.target.value === "light_member") {
      this.selectedRole = "light_member";
    }else {
      this.selectedRole = "";
    }
    if (this.IsWorkspaceUserManagement) {
      this.getEmployeesForWorkspaceUserManagement(
        this.searchKeyword,
        this.selectedRole
      );
    } else {
      this.getUsersForUserManagement(this.searchKeyword, this.selectedRole);
    }
    if (this.IsWorkspaceUserManagement) {
      if (this.employeeListForWorkspaceInvite.length > 0) {
        this.employeeListForWorkspaceInvite.filter((elem, index) => {
          if (elem._id === employee._id) {
            elem.role = event.target.value;
          }
        });
      }
    } else {
      if (this.employeeListForInvite.length > 0) {
        this.employeeListForInvite.filter((elem, index) => {
          if (elem._id === employee._id) {
            elem.role = event.target.value;
          }
        });
      }
    }
  }

  async selectEmployeeForInvite(employee?) {
    if (this.IsWorkspaceUserManagement) {
      if (employee) {
        await this.employeeListForWorkspaceInvite.filter((elem) => {
          if (elem._id === employee._id) {
            elem.isAdded = true;
            elem.inviteByEmail = false;
            this.selectedEmployeeForWorkspaceInvite.push(elem);
          }
        });
      } else {
        const regexx = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$");
        if (regexx.test(this.inputedData)) {
          const inviteEmailData = {
            user_id: "",
            email: this.inputedData,
            role: "light_member",
            inviteByEmail: true,
            isAdded: true,
          };
          this.employeeListForWorkspaceInvite.push(inviteEmailData);
          this.selectedEmployeeForWorkspaceInvite.push(inviteEmailData);
          this.inputedData = "";
          this.inputData = "";
        } else {
          this.helperService.showErrorToast("Enter valid Email Id");
        }
      }
    } else {
      if (employee) {
        await this.employeeListForInvite.filter((elem) => {
          if (elem._id === employee._id) {
            elem.isAdded = true;
            elem.inviteByEmail = false;
            this.selectedEmployeeForInvite.push(elem);
          }
        });
      } else {
        const regexx = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$");
        if (regexx.test(this.inputedData)) {
          const inviteEmailData = {
            user_id: "",
            email: this.inputedData,
            role: "member",
            inviteByEmail: true,
            isAdded: true,
          };
          this.employeeListForInvite.push(inviteEmailData);
          this.selectedEmployeeForInvite.push(inviteEmailData);
          this.inputedData = "";
          this.inputData = "";
        } else {
          this.helperService.showErrorToast("Enter valid Email Id");
        }
      }
    }
  }

  removeSelectedEmployeeForInvite(employee) {
    if (this.IsWorkspaceUserManagement) {
      this.employeeListForWorkspaceInvite.filter((elem, index) => {
        if (elem._id === employee._id) {
          elem.isAdded = false;
        }
      });
      this.selectedEmployeeForWorkspaceInvite.filter((elem, index) => {
        if (elem._id === employee._id) {
          this.selectedEmployeeForWorkspaceInvite.splice(index, 1);
        }
      });
    } else {
      this.employeeListForInvite.filter((elem, index) => {
        if (elem._id === employee._id) {
          elem.isAdded = false;
        }
      });
      this.selectedEmployeeForInvite.filter((elem, index) => {
        if (elem._id === employee._id) {
          this.selectedEmployeeForInvite.splice(index, 1);
        }
      });
    }
  }

  showActionsPopup(item) {
    item.showActions = !item.showActions;
    if (this.IsEmployee) {
      this.employeeList.forEach((element) => {
        if (item._id !== element._id) {
          element.showActions = false;
        }
      });
    } else if (this.IsWorkspaceUserManagement) {
      this.workspaceUserManagementList.forEach((element) => {
        if (item._id !== element._id) {
          element.showActions = false;
        }
      });
    } else {
      this.userManagementList.forEach((element) => {
        if (item._id !== element._id) {
          element.showActions = false;
        }
      });
    }
  }

  inviteUser() {
    if (this.IsWorkspaceUserManagement) {
      this.selectedEmployeeForWorkspaceInvite.filter((item) => {
        if (item.role === "Administrator") {
          item.role = "admin";
        } else if (item.role === "Member") {
          item.role = "member";
        }
        item.user_id = item._id;
        delete item._id;
        delete item.isAdded;
        delete item.avatar;
        delete item.firstName;
        delete item.lastName;
        delete item.inviteByEmail;
      });
      const data = {
        organization_id: this.orgId,
        workspace_id: this.wsIdForUM,
        users: this.selectedEmployeeForWorkspaceInvite,
      };
      this.employeeListForWorkspaceInvite = [];
      this.inputData = "";
      this.inputedData = "";
      console.log('dataaaaa',data)
      this.apiService
        .postWithHeader("workspace/assign-users", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.closeModal(2);
            this.helperService.showSuccessToast(jresponse.message);
            // if (this.IsEmployee) {
            //   this.getEmployees(this.searchKeyword, this.selectedRole);
            // } else if (this.IsWorkspaceUserManagement) {
            this.getEmployeesForWorkspaceUserManagement();
            // } else {
            //   this.getUsersForUserManagement(
            //     this.searchKeyword,
            //     this.selectedRole
            //   );
            // }
            this.selectedEmployeeForWorkspaceInvite = [];
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          throw err;
        });
    } else {
      this.selectedEmployeeForInvite.filter((item) => {
        if (item.role === "Administrator") {
          item.role = "admin";
        } else if (item.role === "Member") {
          item.role = "member";
        }
        item.user_id = item._id;
        delete item._id;
        delete item.isAdded;
        delete item.avatar;
        delete item.firstName;
        delete item.lastName;
        delete item.inviteByEmail;
      });
      const data = {
        organization_id: this.orgId,
        users: this.selectedEmployeeForInvite,
      };
      this.employeeListForInvite = [];
      this.inputData = "";
      this.inputedData = "";
      this.apiService
        .postWithHeader("organization/invite-users", data)
        .then((jresponse: JReponse) => {
          this.selectedEmployeeForInvite = [];
          if (jresponse) {
            this.closeModal(2);
            this.helperService.showSuccessToast(jresponse.message);
            if (this.IsEmployee) {
              this.getEmployees("","");
            } else {
              this.getUsersForUserManagement();
            }

          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    }
  }

  removeUsers() {
    if (this.IsWorkspaceUserManagement) {
      const data = {
        workspace_id: this.wsIdForUM,
        users: this.removeUserListById,
        emails: this.removeUserListByEmail,
      };
      this.apiService
        .postWithHeader("workspace/remove-users", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.getEmployeesForWorkspaceUserManagement(
              this.searchKeyword,
              this.selectedRole
            );
            this.helperService.showSuccessToast(jresponse.message);
            this.removeUserListByEmail = [];
            this.removeUserListById = [];
            this.closeModal(1);
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    } else {
      const data = {
        organization_id: this.orgId,
        users: this.removeUserListById,
        emails: this.removeUserListByEmail,
      };
      this.apiService
        .postWithHeader("organization/remove-users", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            if (this.IsEmployee) {
              this.getEmployees(this.searchKeyword, this.selectedRole);
            } else {
              this.getUsersForUserManagement(
                this.searchKeyword,
                this.selectedRole
              );
            }
            this.helperService.showSuccessToast(jresponse.message);
            this.removeUserListByEmail = [];
            this.removeUserListById = [];
            this.closeModal(1);
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    }
  }
  removeFromWorkspace(item) {
    this.removeUserListById = item.user_id._id ? [item.user_id._id] : [];
    this.removeUserListByEmail = item.user_id.email ? [item.user_id.email] : [];
    this.removeUsers();
  }
  changeRole(role, item) {
    if (this.IsWorkspaceUserManagement) {
      const data = {
        workspace_id: item.workspace_id,
        user_id: item.user_id._id,
        role: role,
      };

      if (this.orgId) {
        this.apiService
          .putWithHeader("workspace/editWorkspaceRole", data)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.apiService
                .postWithHeader("workspace/getWorkspaces", {
                  organization_id: this.orgId,
                })
                .then((jresponse: JReponse) => {
                  if (jresponse) {
                    this.helperService.setLocalStore("workspaces", "");
                    this.homeService.workSpaceList = jresponse.body;
                    this.helperService.setLocalStore(
                      "workspaces",
                      this.homeService.workSpaceList
                    );

                    this.homeService.wsRole = role;

                    this.getEmployeesForWorkspaceUserManagement(
                      this.searchKeyword,
                      this.selectedRole
                    );
                    this.closeModal(1);
                    this.helperService.showSuccessToast(jresponse.message);
                  }
                })
                .catch((err: any) => {
                  throw err;
                });
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error.message);
            throw err;
          });
      }
    } else {
      const data = {
        organization_id: this.orgId,
        user_id: item.user_id._id,
        role: role,
      };

      this.apiService
        .putWithHeader("organization/editOrganizationRole", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.setLocalStore("organizations", "");
            this.apiService
              .getWithHeader("organization/getOrganizations")
              .then((jresponse: JReponse) => {
                if (jresponse) {
                  this.helperService.setLocalStore(
                    "organizations",
                    jresponse.body
                  );
                  if(this.helperService.getLocalStore("orgRole") !== role){
                    this.helperService.setLocalStore("orgRole", role);
                    this.helperService.orgRole = role;
                  }
                  if (this.IsEmployee) {
                    this.getEmployees(this.searchKeyword, this.selectedRole);
                  } else {
                    this.getUsersForUserManagement(
                      this.searchKeyword,
                      this.selectedRole
                    );
                  }
                  this.closeModal(1);
                  this.helperService.showSuccessToast(jresponse.message);
                }
              });
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          throw err;
        });
    }
  }

  getOrgMemberListForWorkspaceInvite() {
    if (this.keyword && this.keyword !== "") {
      this.apiService
        .get(`organization/${this.orgId}/members?name=${this.keyword}`)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.employeeListForWorkspaceInvite = jresponse.body;
            for (
              let i = 0;
              i < this.employeeListForWorkspaceInvite.length;
              i++
            ) {
              this.employeeListForWorkspaceInvite[
                i
              ].firstName = this.employeeListForWorkspaceInvite[
                i
              ].user_id.firstName;
              this.employeeListForWorkspaceInvite[
                i
              ].lastName = this.employeeListForWorkspaceInvite[
                i
              ].user_id.lastName;
              this.employeeListForWorkspaceInvite[
                i
              ].email = this.employeeListForWorkspaceInvite[i].user_id.email;
              this.employeeListForWorkspaceInvite[
                i
              ]._id = this.employeeListForWorkspaceInvite[i].user_id._id;
              this.employeeListForWorkspaceInvite[i].isAdded = false;
              this.employeeListForWorkspaceInvite[i].role = "";
            }
          }
        })
        .catch((err: any) => {
          throw err;
        });
    }
  }

  ngOnDestroy() {
    this.closeModal(1);
  }
}
