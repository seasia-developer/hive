import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AdminService } from '../admin.service';
import { JReponse } from 'src/app/services/api.service';
import { HomeService } from "src/app/modules/application/home/home.service";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {


  constructor(
    private helper: HelperService,
    private fb: FormBuilder,
    private adminService: AdminService,
    private homeService: HomeService
  ) { }

  mediaUrl = environment.MEDIA_URL;
  users: any;
  filteredUsers: any;
  user: any;
  editUser: boolean = false;
  planInterval: any;
  planName: any;
  lifetimePlan = 'lifetime'
  freeLisense: string
  searchInUsers: any;
  userEmail: any;
  userId: any;
  subscriptionId: any;
  paidUsers: any = false;
  freeUsers: any = false;
  domainAdmins: any = false;
  planRecords: any;
  planStorage: any;
  plan: any;
  plans: any;
  planId: any;
  couponLicenses: any;
  planNotes: any;
  editCoupon: any;
  placements = ['top', 'left', 'right', 'bottom'];
  placement = 'top';
  popoverTitle = 'Are you sure to delete User ?';
  popoverMessage = '';
  confirmText = 'Delete';
  cancelText = 'Cancel';
  confirmClicked = false;
  cancelClicked = false;
  userCoupons: any;
  userCouponforUpgrade: any;
  organizationIdForUpgrade: any;
  upgradeAllUsersWithDomain: boolean = false;
  // Loader 
  loader: boolean = false;


  headElements = [
    "Joined",
    "Domain",
    "Email",
    "Organization",
    "Coupons",
    "Type",
    "Period",
    "PlatformPlan",
    "Edit",
  ];

  ngOnInit() {
    this.getUsers();
    this.getStripePlans();
  }

  async getUsers() {
    this.loader = true;
    this.adminService.getUsers()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.users = jresponse.body;
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  changeSearchInUsers() {
    this.loader = true;
    if (this.searchInUsers.length > 1) {
      let searchResult = this.users.filter((e: any) => e.email.includes(this.searchInUsers));
      this.paidUsers = false;
      this.freeUsers = false;
      this.domainAdmins = false;
      this.filteredUsers = searchResult;
    }
    if (this.searchInUsers.length === 0) {
      this.paidUsers = false;
      this.freeUsers = false;
      this.domainAdmins = false;
      this.getUsers();
    }
    this.loader = false;
  }

  async getPlans() {
    this.loader = true;
    this.adminService.getPlans()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.plans = jresponse.body;
        }
        this.loader = false;
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = true;
        throw err;
      });
  }

  async getStripePlans() {
    this.loader = true;
    this.homeService.getPlans()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
        }
        this.loader = false;
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  async getPlan(planId) {
    this.loader = true;
    this.adminService.getPlan(planId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.plan = jresponse.body;
        }
        this.loader = false;
      })
      .catch((err: Error) => {
        // this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  async switchPlans() {
    await this.getPlan(this.planId)
  }

  async getUserList(userId) {
    this.loader = true;
    this.subscriptionId = undefined;
    this.planInterval = undefined;
    this.planId = undefined;
    this.planName = undefined;
    this.planRecords = undefined;
    this.planStorage = undefined;
    this.couponLicenses = undefined;
    this.planNotes = undefined;
    this.userCouponforUpgrade = undefined;
    this.editUser = true;
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500)
    // await this.getPlans();
    this.adminService.getUser(userId)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          console.log(jresponse, "jresponsejresponsejresponsejresponse");
          this.user = jresponse.body;
          this.userId = jresponse.body._id;
          this.userEmail = jresponse.body.email;
          if (jresponse.body.organizations.length) {
            this.organizationIdForUpgrade = jresponse.body.organizations[0]._id;
          }
          if (jresponse.body.subscriptions.length) {
            this.subscriptionId = jresponse.body.subscriptions[0]._id;
            if (jresponse.body.coupons.length) {
              this.planInterval = (jresponse.body.coupons[jresponse.body.coupons.length - 1].period).toLowerCase();
              this.planId = jresponse.body.coupons[jresponse.body.coupons.length - 1]._id;
              this.planName = jresponse.body.coupons[jresponse.body.coupons.length - 1].planType;
              this.planRecords = jresponse.body.coupons[jresponse.body.coupons.length - 1].records;
              this.planStorage = jresponse.body.coupons[jresponse.body.coupons.length - 1].storage;
              this.couponLicenses = jresponse.body.coupons[jresponse.body.coupons.length - 1].seats_per_coupon;
              this.planNotes = jresponse.body.coupons[jresponse.body.coupons.length - 1].note;
              this.userCouponforUpgrade = jresponse.body.subscriptions[jresponse.body.subscriptions.length - 1].couponCode;
            }
          }
          else {
            this.planInterval = this.lifetimePlan.toLowerCase();
            this.planName = jresponse.body.plan;
            this.planNotes = jresponse.body.note;
            this.couponLicenses = jresponse.body.seats_per_coupon;
          }
          this.getUserCoupons(this.userEmail);
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        // this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  formatSizeUnits(bytes: any) {
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
  }

  updateStorage(bytes: any) {
    this.planStorage = bytes
  }

  deleteUser(userId) {

    this.loader = true;

    this.adminService.deleteUser(userId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.getUsers()
          this.editUser = false;
        }
        this.loader = false;
      })
      .catch((err: Error) => {
        // this.helper.showErrorToast(err.message);
        this.editUser = false;
        this.loader = false;
        throw err;
      });
  }

  deleteSubscription(userId) {

    this.loader = true;

    this.adminService.deleteSubscription(userId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (this.userId) {
            this.getUserList(this.userId)
          }
          this.getUsers()
        }
        this.loader = false;
      })
      .catch((err: any) => {
        let errMsg = 'Something went wrong';
        if (err.message) {
          errMsg = err.message;
        }
        if (err.error && err.error.message) {
          errMsg = err.error.message;
        }
        this.helper.showErrorToast(errMsg);
        this.loader = false;
        throw err;
      });
  }

  updateUserSubscription() {
    this.loader = true;
    const data = {
      subscriptionId: this.subscriptionId,
      userId: this.userId,
      userEmail: this.userEmail,
      planId: this.planId,
      planName: this.planName,
      planInterval: this.planInterval,
      couponLicenses: this.couponLicenses,
      planRecords: this.planRecords,
      planStorage: this.planStorage,
      planNotes: this.planNotes,
      couponCode: this.userCouponforUpgrade,
      organizationIdForUpgrade: this.organizationIdForUpgrade,
      upgradeAllUsersWithDomain: this.upgradeAllUsersWithDomain,
    };

    this.adminService.updateUserSubscription(data)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (this.userId) {
            console.log("-----thisss", this, "-------thisssss")
            this.getUserList(this.userId)
          }
          this.getUsers()
        }
        this.loader = false;
      })
      .catch((err: any) => {
        console.log('errerr', err)
        console.log(err.message)
        let errMsg = 'Something went wrong';
        if (err.message) {
          if (err.message && err.message.error && err.message.error.message) {
            errMsg = err.message.error.message;
          }
          else {
            console.log('err.message', err.message)
            errMsg = err.message;
          }
        }
        if (err.error && err.error.message) {
          errMsg = err.error.message;
        }
        this.helper.showErrorToast(errMsg);
        this.loader = false;
        throw err;
      });
  }
  setEditUserStatus(status) {
    this.editUser = status;
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500)
  }

  async filterUsers(event) {
    this.searchInUsers = null;
    if (event.target.value === 'paidUsers') {
      this.paidUsers = true;
      this.freeUsers = false;
      this.domainAdmins = false;
      let searchResult = this.users.filter((e: any) => e.plan !== ('Free' || 'free' || ''));
      this.filteredUsers = searchResult;
    }
    if (event.target.value === 'freeUsers') {
      this.paidUsers = false;
      this.freeUsers = true;
      this.domainAdmins = false;
      let searchResult = this.users.filter((e: any) => e.plan === ('Free' || 'free'));
      this.filteredUsers = searchResult;
    }
    if (event.target.value === 'domainAdmins') {
      this.paidUsers = false;
      this.freeUsers = false;
      this.domainAdmins = true;
      let domainAdminUsers = [];
      this.users.forEach((user: any) => {
        let userId = user._id;
        let userDomain = user.email.split('@')[1];
        if (user.organizations) {
          user.organizations.forEach((data: any) => {
            if (data.owner === userId && data.domain === userDomain) {
              if (!domainAdminUsers.includes(user)) {
                domainAdminUsers.push(user)
              }
            }
          });
        }
      });
      this.filteredUsers = domainAdminUsers;
    }
    if (event.target.value === 'allUsers') {
      this.paidUsers = false;
      this.freeUsers = false;
      this.domainAdmins = false;
      this.filteredUsers = null;
    }
  }
  dateFormat(createdDate) {
    return new Date(createdDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).split(' ').join('-');
  }

  getUserCoupons(email: any) {
    this.loader = true;
    this.adminService.getUserCoupons(email)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.userCoupons = jresponse.body;
          // this.userCouponforUpgrade = this.userCoupons[0].coupon.coupon
        }
        this.loader = false;
      })
      .catch((err: Error) => {
        // this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  upgradeAllUsersWithDomainInit(event) {
    if (this.upgradeAllUsersWithDomain) {
      this.upgradeAllUsersWithDomain = false;
    }
    else {
      this.upgradeAllUsersWithDomain = true;
    }
  }

}
