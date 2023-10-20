import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import {
  HelperService
} from 'src/app/services/helper.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { APIService } from "../../../../../../services/api.service";
import { AdminService } from "../../../admin/admin.service"
import {
  JReponse
} from 'src/app/services/api.service';
import {
  HomeService
} from "src/app/modules/application/home/home.service";
import {
  environment
} from "../../../../../../../environments/environment";
import {
  MatSlideToggleChange
} from '@angular/material/slide-toggle';

import {
  BsModalService,
  BsModalRef
} from "ngx-bootstrap/modal";
import {
  STEPPER_GLOBAL_OPTIONS
} from '@angular/cdk/stepper';

import {
  ErrorStateMatcher
} from '@angular/material/core';
import { Console } from 'console';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: {
      showError: true
    },
  },],
})
export class BillingComponent implements OnInit {

  modalRef: BsModalRef;
  loader: boolean = false;
  isCouponCreated: boolean = true;
  userCoupon: FormGroup;
  userCouponValue: any
  subscriptions: any = [];
  userData: any;
  userDataRes: any;
  isPWA : boolean;
  

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: BsModalService,
    private helper: HelperService,
    private fb: FormBuilder,
    private apiService: APIService,
    private homeService: HomeService,
    private adminService: AdminService,
    public helperService: HelperService,
    private router : Router
  ) 
  { 
   
  }

  ngOnInit() {
    
    this.getPlatformSubscriptions();
    this.userCoupon = this.fb.group({
      userCoupon: ['', Validators.required]
    })

    this.userData = JSON.parse(localStorage.getItem('userData'));
    console.log(this.userData, "this.userdtaaaaaaaa");
    let singleuserdata = {
      userid: this.userData.owner,
      token: this.userData.token
    }
    this.getUserData()

    this.userCouponValue = JSON.parse(localStorage.getItem('userCoupn'));
    console.log(this.userCouponValue)
    if (this.userCouponValue) {
      this.isCouponCreated = false;
    }
  }
  // MODAL CONFIG
  openModal(template: TemplateRef<any>, type = "") {
    this.modalRef = this.modalService.show(template, {
      class: "paid-groups-modal relative",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
  }

 


  getUserData() {
    console.log("sssdata", this.userData.owner)
    this.adminService.getUser(this.userData.owner).
    then((res: any) => {
      console.log(res, "userresr")
      this.userDataRes = res;
    })
    .catch((err: any) => {
      if (err.message.error) {
        this.helperService.showErrorToast(err.message.error.message)
        this.userCoupon.reset()
      } else {
        this.helper.showErrorToast(err.message);
        this.userCoupon.reset()

      }
      console.log(err, "errrrrrrrrrrrrrr")
      throw err;
    });

  }


  postUserData() {
    this.adminService.applayCoupon({
      "userId": this.userData.owner,
      "userEmail": this.userDataRes.body.email,
      "couponCode": this.userCouponValue,
      "organizationIdForUpgrade": this.userDataRes.body.organizations.length > 0 ? this.userDataRes.body.organizations[0]._id : '',
      "upgradeAllUsersWithDomain": false
    }).then((res: any) => {
      console.log(res, "userresr");
      this.helperService.showSuccessToast(res.message);
      this.userCoupon.reset();
      this.getUserData()
      this.getPlatformSubscriptions();
    })
      .catch((err: any) => {
        if (err.message.error) {
          this.helperService.showErrorToast(err.message.error.message)
          this.userCoupon.reset()
        } else {
          this.helper.showErrorToast(err.message);
          this.userCoupon.reset()

        }
        console.log(err, "errrrrrrrrrrrrrr")
        throw err;
      });


  }

  // GET PLATFORM SUBSCRIPTONS
  getPlatformSubscriptions() {
    this.homeService.getPlatformSubscriptions()
      .then((jresponse: any) => {
        if (jresponse) {
          console.log('jresponse dd', jresponse.body)
          this.subscriptions = jresponse.body.filter((data) => data.status);
          if (this.subscriptions.length) {
            localStorage.setItem('isPaidPlan', 'true');
          }
          else {
            localStorage.setItem('isPaidPlan', 'false');
          }
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  getDateFormat(data: any) {
    let newDate = new Date(data * 1000);
    return newDate.toDateString();
  }

  cancelSubscription(subscriptionId: any) {
    this.homeService.cancelSubscription(subscriptionId)
      .then((jresponse: any) => {
        if (jresponse) {
          console.log('jresponse dd', jresponse.body)
          this.subscriptions = jresponse.body;
          this.loader = false;
          this.getPlatformSubscriptions();
          this.modalService.hide(1);
          this.modalService.hide(1);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.getPlatformSubscriptions();
        this.modalService.hide(1);
        this.modalService.hide(1);
        throw err;
      });
  }

  createUserCoupon() {
    if (this.userCoupon.valid) {
      this.isCouponCreated = false;
      this.userCouponValue = this.userCoupon.value.userCoupon;
      console.log(this.userCouponValue, "userCouponValueuserCouponValue")
      this.postUserData()

    }
  }

}
