import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
} from "@angular/core";
import { HelperService } from "src/app/services/helper.service";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { APIService } from "../../../../../../services/api.service";
import { JReponse } from "src/app/services/api.service";
import { HomeService } from "src/app/modules/application/home/home.service";
import { environment } from "../../../../../../../environments/environment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

import { ErrorStateMatcher } from "@angular/material/core";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "app-monetization",
  templateUrl: "./monetization.component.html",
  styleUrls: ["./monetization.component.scss"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {
        showError: true,
      },
    },
  ],
})
export class MonetizationComponent implements OnInit {
  upsellTitleFormControl = new FormControl("", [Validators.required]);
  videoLinkFormControl = new FormControl("", [Validators.required]);
  upsellMessageFormControl = new FormControl("", [Validators.required]);
  searchFormControl = new FormControl("", [Validators.required]);

  matcher = new MyErrorStateMatcher();

  isStripeChecked: boolean = false;
  modalRef: BsModalRef;
  step: number = 1;
  searchGroupName: string = "";
  workspaces: Array<String> = [];
  loader: boolean = false;
  stripeConnectLoader: boolean = false;
  selectedCurrency: string = "usd";
  selectedDuration: string = "Weekly";
  paymentsDurations: Array<String> = [
    "Weekly",
    "Monthly",
    "Quarterly",
    "Yearly",
    "One time",
    "Installments",
  ];

  // PAID GROUPS DATA MODAL
  paidGroups = {
    removeFromGroup: true,
    requireReSubscription: false,
    isMultipleTiers: false,
    isUpsell: false,
    upsell: {
      title: "",
      videoLink: "",
      message: "",
    },
    workspaces: [],
  };
  isRequiredWorkspaceFields: Boolean = false;
  isRequiredWorkspacePaymentFields: Boolean = false;
  isValidWorkspacePaymentFields: Boolean = false;
  isRequiredPaidGroupsUpsellField: Boolean = false;
  stripeConnectClientId: string;
  client_secret: string;
  stripeCode: string;
  paidGroupsList: any = [];
  appUrl: any;
  totalMembers:any = 0;
  deleteGroupId: any;
  isEditGroup: Boolean = false;

  constructor(
    private modalService: BsModalService,
    private http: HttpClient,
    private helper: HelperService,
    private fb: FormBuilder,
    private apiService: APIService,
    private homeService: HomeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.stripeConnectClientId = environment.STRIPE_CONNECT_CLIENT_ID;
    this.client_secret = environment.STRIPE_CLIENT_SECRET_ID;
  }

  ngOnInit() {
    console.log("this.client_secret", this.client_secret);
    this.createStripeUserSecret();
    if (!this.stripeCode) {
      this.getStripeConnection();
    }
    this.getPaidGroups();
    this.appUrl = window.location.origin;
    console.log('window.location.origin',window.location.origin)
  }

  copyToClipboard(groupUrl:any){
navigator.clipboard.writeText(groupUrl).then(() => {
  this.helper.showSuccessToast('Group link copied to clipboard');
}).catch(e => console.log(e));
  }

  // TOGGLE BTN - OPEN MODAL
  stripeToggle($event: MatSlideToggleChange) {
    this.isStripeChecked = $event.checked;
  }

  // MULTIPLE TIERS TOGGLE
  multipleTiersToggle($event: MatSlideToggleChange) {
    this.paidGroups.isMultipleTiers = $event.checked;
  }

  // UPSELL
  upsellToggle($event: MatSlideToggleChange) {
    this.paidGroups.isUpsell = $event.checked;
  }

  // MODAL CONFIG
  openModal(template: TemplateRef<any>, type = "") {

    if(!this.isEditGroup){
      this.hardResetMonetization();
    }

    this.isEditGroup = false;

    this.modalRef = this.modalService.show(template, {
      class: "paid-groups-modal relative",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false,
    });
  }

  isNumeric(value: any) {
    return /^-?\d+$/.test(value);
  }

  // STEPPER NEXT BACK
  stepBackNext(event: string) {
    console.log("this.step", this.step);

    this.isRequiredWorkspaceFields = false;
    this.isRequiredWorkspacePaymentFields = false;
    this.isValidWorkspacePaymentFields = false;
    this.isRequiredPaidGroupsUpsellField = false;

    // if (this.paidGroups.isUpsell && this.step === 1) {
    //   if (this.paidGroups.upsell.title === "") {
    //     this.isRequiredPaidGroupsUpsellField = true;
    //   }
    // }

    if (this.paidGroups.isUpsell && this.step === 2) {
      if (this.paidGroups.workspaces && this.paidGroups.workspaces.length) {
        this.paidGroups.workspaces.forEach((workspace) => {
          if (workspace.isUpsell && workspace.upsell.title === "") {
            this.isRequiredWorkspaceFields = true;
          }
        });
      }
    }

    if (this.step > 2) {
      if (this.paidGroups.workspaces && this.paidGroups.workspaces.length) {
        this.paidGroups.workspaces.forEach((workspace: any) => {
          if (
            workspace &&
            workspace.paymentOptions &&
            workspace.paymentOptions.length
          ) {
            workspace.paymentOptions.forEach((option: any) => {
              if (option.price === "" || option.price <= 0) {
                this.isRequiredWorkspacePaymentFields = true;
              } else if (!this.isNumeric(option.price)) {
                this.isValidWorkspacePaymentFields = true;
              }
            });
          }
        });
      }
    }

    if (
      this.isRequiredWorkspaceFields ||
      this.isRequiredWorkspacePaymentFields ||
      this.isValidWorkspacePaymentFields || 
      this.isRequiredPaidGroupsUpsellField
    ) {
      return false;
    }

    if (event === "back") {
      if (this.step > 1) {
        this.step -= 1;
      }
    }
    // BACK END

    if (event === "next") {
      if (this.step < 4) {
        this.step += 1;
      }
    }
    // NEXT END
  }

  // REMOVE FROM GROUP | REQUIRE RESUBSCRIPTION
  subscriptionAction(event: string) {
    if (event === "remove-from-group") {
      this.paidGroups.removeFromGroup = true;
      this.paidGroups.requireReSubscription = false;
    }

    if (event === "require-resubscription") {
      this.paidGroups.removeFromGroup = false;
      this.paidGroups.requireReSubscription = true;
    }
  }

  getWorkspaces(query: string) {
    this.loader = true;
    this.homeService
      .getWorkspaces(query)
      .then((jresponse: any) => {
        if (jresponse) {
          console.log("jresponse", jresponse.data);
          this.workspaces = jresponse.data;
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        this.workspaces = [];
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  // SEARCH GROUPS
  searchGroups() {
    this.loader = true;
    if (this.searchGroupName.length > 2) {
      this.getWorkspaces(this.searchGroupName);
    }
    if (this.searchGroupName.length === 0) {
      this.workspaces = [];
    }
    this.loader = false;
  }

  // ADD WORKSPACE IN PAID GROUPS
  selectWorkspace(workspace: any) {
    if(!workspace.isPaid){
      workspace.isUpsell = this.paidGroups.isUpsell;
      workspace.upsell = {};
      workspace.upsell.title = this.paidGroups.isUpsell
        ? this.paidGroups.upsell.title
        : "";
      workspace.upsell.videoLink = this.paidGroups.isUpsell
        ? this.paidGroups.upsell.videoLink
        : "";
      workspace.upsell.message = this.paidGroups.isUpsell
        ? this.paidGroups.upsell.message
        : "";
  
      workspace.paymentOptions = [];
      let option = {
        price: null,
        plan: "Monthly",
      };
      workspace.paymentOptions.push(option);
  
      this.paidGroups.workspaces = [workspace, ...this.paidGroups.workspaces];
      this.paidGroups.workspaces = [...new Set(this.paidGroups.workspaces)];
  
      console.log("this.paidGroups", this.paidGroups);
    }
  }

  // WORKSPACE UPSELL TOGGLE
  workspaceUpsellToggle(index: any) {
    if (
      this.paidGroups.workspaces.length &&
      this.paidGroups.workspaces[index]
    ) {
      if (this.paidGroups.workspaces[index].isUpsell === false) {
        this.paidGroups.workspaces[index].isUpsell = true;
      } else {
        this.paidGroups.workspaces[index].isUpsell = false;
      }
    }
  }

  // REMOVE WORKSPACE FROM PAID GROUPS
  removeWorkspace(index: any) {
    if (
      this.paidGroups.workspaces.length &&
      this.paidGroups.workspaces[index]
    ) {
      this.paidGroups.workspaces.splice(index, 1);
    }
  }

  // UPDATE PAYMENT OPTIONS PRICE
  paymentOptionsPrice($event: any, index: any) {
    console.log("$event", this.paidGroups);
  }

  // ADD PAYMENT OPTION IN WORKSPACE
  addWorkspacePaymentOption(index: any) {
    if (
      this.paidGroups.workspaces.length &&
      this.paidGroups.workspaces[index] &&
      this.paidGroups.workspaces[index].paymentOptions
    ) {
      let option = {
        price: null,
        plan: this.paymentsDurations[this.paidGroups.workspaces[index].paymentOptions.length],
      };
      this.paidGroups.workspaces[index].paymentOptions.push(option);
    }
  }

  // REMOVE PAYMENT OPTION IN WORKSPACE
  removeWorkspacePaymentOption(index: any, optionIndex: any) {
    if (
      this.paidGroups.workspaces.length &&
      this.paidGroups.workspaces[index] &&
      this.paidGroups.workspaces[index].paymentOptions[optionIndex]
    ) {
      this.paidGroups.workspaces[index].paymentOptions.splice(optionIndex, 1);
    }
  }

  // STORE PAID WORKSPACES
  storePaidWorkspaces() {
    this.loader = true;
    this.homeService
      .storePaidWorkspaces(this.paidGroups)
      .then((jresponse: any) => {
        if (jresponse) {
          console.log("jresponse", jresponse.data);
          this.loader = false;
          this.helper.showSuccessToast(jresponse.message);
          this.resetMonetization();
          this.getPaidGroups();
          this.modalService.hide(1);
          this.modalService.hide(2);
          document.body.classList.remove("modal-open");
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.modalService.hide(1);
        throw err;
      });
  }

  // CREATE STRIPE USER SECRET
  createStripeUserSecret() {
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      this.stripeCode = params.code;
      console.log(this.stripeCode);
    });

    if (this.stripeCode) {
      this.stripeConnectLoader = true;

      console.log("ddddddddddddd");
      console.log("this.loader", this.loader);

      let data = {
        code: this.stripeCode,
        grant_type: "authorization_code",
      };

      this.homeService
        .connectStripe(data)
        .then((jresponse: any) => {
          if (jresponse) {
            console.log("jresponse", jresponse);
            this.isStripeChecked = true;
            this.stripeConnectLoader = false;
            this.modalService.hide(1);
            this.helper.showSuccessToast(jresponse.message);
            this.router.navigate(["/application/home/parent/monetization"]);
          }
        })
        .catch((err: any) => {
          if (err.message && err.message.error_description) {
            this.helper.showErrorToast(err.message.error_description);
          } else {
            this.helper.showErrorToast(err.message);
          }
          this.stripeConnectLoader = false;
          this.modalService.hide(1);
          throw err;
        });
    }
  }

  // GET STRIPE CONNECTION
  getStripeConnection() {
    this.loader = true;
    this.homeService
      .getStripeConnection()
      .then((jresponse: any) => {
        if (jresponse) {
          this.isStripeChecked = true;
          this.loader = false;
          this.modalService.hide(1);
          this.helper.showSuccessToast(jresponse.message);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.modalService.hide(1);
        throw err;
      });
  }

  // RESET STRIPE CONNECTION
  resetStripeConnection() {
    this.loader = true;
    this.homeService
      .resetStripeConnection()
      .then((jresponse: any) => {
        if (jresponse) {
          this.isStripeChecked = false;
          this.loader = false;
          this.modalService.hide(1);
          this.helper.showSuccessToast(jresponse.message);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.modalService.hide(1);
        throw err;
      });
  }

  // GET PAID GROUPS
  getPaidGroups() {
    this.loader = true;
    this.homeService
      .getPaidGroups()
      .then((jresponse: any) => {
        if (jresponse) {
          console.log("jres", jresponse);
          this.paidGroupsList = jresponse.body;
          this.totalMembers = jresponse.totalMembers;
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  // GET PAID GROUP
  getPaidGroup(groupId: any) {
    this.loader = true;
    this.homeService
      .getPaidGroup(groupId)
      .then((jresponse: any) => {
        if (jresponse) {
          console.log("Test 123");

            // PAID GROUPS DATA MODAL
            this.paidGroups = {
              removeFromGroup: true,
              requireReSubscription: false,
              isMultipleTiers: false,
              isUpsell: false,
              upsell: {
                title: "",
                videoLink: "",
                message: "",
              },
              workspaces: [],
            };

          const paidGroup = jresponse.body;

          this.step = 1;

          this.paidGroups.removeFromGroup = paidGroup.removeFromGroup;
          this.paidGroups.requireReSubscription = paidGroup.requireReSubscription;
          this.paidGroups.isMultipleTiers = paidGroup.isMultipleTiers;
          this.paidGroups.isUpsell = paidGroup.isUpsell;
          this.paidGroups.upsell = paidGroup.upsell;
          this.paidGroups.workspaces.push(paidGroup);

          this.loader = false;
          this.isEditGroup = true;
          document.getElementById("paid-groups-modal").click();
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  // DELETE PAID GROUP
  confirmDeletePaidGroup(groupId: any) {
   this.deleteGroupId = groupId;
  }

  deletePaidGroup() {
    
    this.loader = true;

   let groupId = this.deleteGroupId;

    this.homeService
      .deletePaidGroup(groupId)
      .then((jresponse: any) => {
        if (jresponse) {
          this.helper.showSuccessToast("Paid Group Removed!");
          this.getPaidGroups();
          this.loader = false;
          this.modalService.hide(1);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.modalService.hide(1);
        throw err;
      });
  }

  hardResetMonetization() {
    this.step = 1;
    this.searchGroupName = "";
    this.selectedCurrency = "usd";
    this.selectedDuration = "Weekly";
    this.paymentsDurations = [
      "Monthly",
      "Yearly",
      "Quarterly",
      "One time",
      "Installments",
      "Weekly"
    ];

    // PAID GROUPS DATA MODAL
    this.paidGroups = {
      removeFromGroup: true,
      requireReSubscription: false,
      isMultipleTiers: false,
      isUpsell: false,
      upsell: {
        title: "",
        videoLink: "",
        message: "",
      },
      workspaces: [],
    };

    this.isRequiredWorkspaceFields = false;
    this.isRequiredWorkspacePaymentFields = false;
    this.isValidWorkspacePaymentFields = false;
  }

  resetMonetization() {
    this.step = 1;
    this.searchGroupName = "";
    this.workspaces = [];
    this.selectedCurrency = "usd";
    this.selectedDuration = "Weekly";
    this.paymentsDurations = [
      "Weekly",
      "Monthly",
      "Quarterly",
      "Yearly",
      "One time",
      "Installments",
    ];

    // PAID GROUPS DATA MODAL
    this.paidGroups = {
      removeFromGroup: true,
      requireReSubscription: false,
      isMultipleTiers: false,
      isUpsell: false,
      upsell: {
        title: "",
        videoLink: "",
        message: "",
      },
      workspaces: [],
    };

    this.isRequiredWorkspaceFields = false;
    this.isRequiredWorkspacePaymentFields = false;
    this.isValidWorkspacePaymentFields = false;
    this.paidGroupsList = [];
  }


}
