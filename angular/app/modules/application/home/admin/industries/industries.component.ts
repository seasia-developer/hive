import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../admin.service';
import { JReponse } from 'src/app/services/api.service';

@Component({
  selector: 'app-industries',
  templateUrl: './industries.component.html',
  styleUrls: ['./industries.component.scss']
})
export class IndustriesComponent implements OnInit {
  industries = [];
  editIndustryIds = [];
  totalIndustries;
  industriesForm: FormGroup;
  editIndustryForm: FormGroup;
  constructor(
    private helper: HelperService,
    private fb: FormBuilder,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.getIndustries();
    this.industriesForm = this.fb.group({
      title: [""]
    });
    this.editIndustryForm = this.fb.group({
      title: [""]
    });
  }

  getIndustries() {
    this.adminService.getIndustries()
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.industries = jresponse.body.data;
          this.totalIndustries = jresponse.body.totalCount;
        }
      })
    .catch((err: Error) => {
      throw err;
    });
  }

  get form() {
    return this.industriesForm.controls;
  }

  addIndustry() {
    const data = { Title: this.form.title.value };
    this.adminService.addIndustry(data)
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.industriesForm.reset();
          this.helper.showSuccessToast(jresponse.message);
          this.getIndustries();
        }
      })
    .catch((err: Error) => {
      this.helper.showErrorToast(err.message);
      throw err;
    });
  }

  removeIndustry(id){
    this.adminService.removeIndustry(id)
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helper.showSuccessToast(jresponse.message);
          this.getIndustries();
        }
      })
    .catch((err: Error) => {
      this.helper.showErrorToast(err.message);
      throw err;
    });
  }

  editIndustry(industry) {
    this.editIndustryIds.push(industry._id);
    this.editIndustryForm.controls.title.setValue(industry.Title);
    this.editIndustryForm.updateValueAndValidity();
  }

  updateIndustry(industryId) {
    const data = { Title: this.editIndustryForm.controls.title.value, industryId };
    this.adminService.updateIndustry(data)
    .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helper.showSuccessToast(jresponse.message);
          this.getIndustries();
          this.editIndustryIds.splice(this.editIndustryIds.indexOf(industryId), 1);
        }
      })
    .catch((err: Error) => {
      this.helper.showErrorToast(err.message);
      throw err;
    });
  }
}
