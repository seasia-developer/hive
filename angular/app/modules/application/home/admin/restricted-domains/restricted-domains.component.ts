import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AdminService } from '../admin.service';
import { JReponse } from 'src/app/services/api.service';

@Component({
  selector: 'app-restricted-domains',
  templateUrl: './restricted-domains.component.html',
  styleUrls: ['./restricted-domains.component.scss']
})
export class RestrictedDomainsComponent implements OnInit {
  restrictedDomainForm: FormGroup;
  domains = [];
  constructor(
    private helper: HelperService,
    private fb: FormBuilder,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.getDomains();
    this.restrictedDomainForm = this.fb.group({
      domain: [""]
    });
  }

  get form() {
    return this.restrictedDomainForm.controls;
  }

  addDomain() {
    const data = { domain: this.form.domain.value };
    this.adminService.addRestrictedDomain(data)
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.restrictedDomainForm.reset();
          this.helper.showSuccessToast(jresponse.message);
          this.getDomains();
        }
      })
    .catch((err: Error) => {
      this.helper.showErrorToast(err.message); 
      throw err;
    });
  }

  removeDomain(id){
    this.adminService.removeRestrictedDomain(id)
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helper.showSuccessToast(jresponse.message);
          this.getDomains();
        }
      })
    .catch((err: Error) => {
      // this.helper.showErrorToast(err.message);
      throw err;
    });
  }

  getDomains() {
    this.adminService.getRestrictedDomains()
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.domains = jresponse.body;
        }
      })
    .catch((err: Error) => {
      // this.helper.showErrorToast(err.message);
      throw err;
    });
  }
}
