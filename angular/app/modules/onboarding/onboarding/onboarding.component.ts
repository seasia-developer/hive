import { Component, OnInit } from '@angular/core';
import { SharedOnboardingService } from '../shared-onboarding.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  businessOrPersonal: any;
  constructor(private helper: HelperService) { }

  ngOnInit() {
  }

  onPersonal(event) {
    this.businessOrPersonal = event;
    this.helper.setLocalStore('userType', this.businessOrPersonal);
  }

  onBusiness(event) {
    this.businessOrPersonal = event;
    this.helper.setLocalStore('userType', this.businessOrPersonal);
  }
}
