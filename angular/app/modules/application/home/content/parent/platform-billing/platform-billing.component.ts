import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  Inject,
  PLATFORM_ID
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
  STEPPER_GLOBAL_OPTIONS
} from '@angular/cdk/stepper';

import {
  ErrorStateMatcher
} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-platform-billing',
  templateUrl: './platform-billing.component.html',
  styleUrls: ['./platform-billing.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: {
      showError: true
    },
  }, ],
})
export class PlatformBillingComponent implements OnInit {

  growthPlanUrl: any;
  starterPlanUrl: any;
  subscriptions: any;
  loader: any;
  isStarterPlanObject: any;
  isGrowthPlanObject: any;
  isPWA : boolean;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private helper: HelperService,
    private apiService: APIService,
    private homeService: HomeService,

  ) {
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches;
    console.log(this.isPWA , "pwaaaaaaaaa" , this.platformId)
    const authEmail = JSON.parse(localStorage.getItem('userData')).email;
    this.growthPlanUrl = environment.STRIPE_GROWTH_PLAN + '?prefilled_email='+authEmail;
    this.starterPlanUrl = environment.STRIPE_STARTER_PLAN+ '?prefilled_email='+authEmail;
  }

  ngOnInit() {
    this.getPlatformSubscriptions();
  }

    // GET PLATFORM SUBSCRIPTONS
    getPlatformSubscriptions() {
      this.homeService.getPlatformSubscriptions()
        .then((jresponse: any) => {
          if (jresponse) {
            console.log('jresponse dd', jresponse.body)
            this.subscriptions = jresponse.body.filter((data) => data.status);

            if(this.subscriptions.length){
              localStorage.setItem('isPaidPlan','true');
            }
            else{
              localStorage.setItem('isPaidPlan','false');
            }

            let starterPlanObject = this.subscriptions.find((data) => data.planAmount == 2900 && data.status == true && data.source === 'stripe');

            let growthPlanObject = this.subscriptions.find((data) => data.planAmount == 9900 && data.status == true && data.source === 'stripe');

            if(starterPlanObject){
               this.isStarterPlanObject = true;
            }

            if(growthPlanObject){
              this.isGrowthPlanObject = true;
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

}
