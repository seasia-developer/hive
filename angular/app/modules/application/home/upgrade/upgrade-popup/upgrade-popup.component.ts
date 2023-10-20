import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";

import { HelperService } from "src/app/services/helper.service";
import { BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: "app-upgrade-popup",
  templateUrl: "./upgrade-popup.component.html",
  styleUrls: ["./upgrade-popup.component.scss"],
})
export class UpgradePopupComponent implements OnInit {
  showOrgList = false;
  orgList = [];
  selectedOrg: any = {};
  constructor(
    public helperService: HelperService,
    private router: Router,
    public bsModalRef: BsModalRef,
    ) {
    this.orgList = 
    
    _.filter(this.helperService.getLocalStore("organizations"), (source) => {
      if (source.role=='admin' && (source.customerId && source.customerId!='')) {
        return source;
      }
    });
    
  }

  ngOnInit() {}

  goToUpgradePage() {
    if (this.selectedOrg._id) {
      this.bsModalRef.hide();
      const el = document.getElementById("closeRecordModalBtn");
      if (el) {
        el.click();
      }
      this.router.navigate(["application/home/upgrade"], {
        queryParams: {
          orgId: this.selectedOrg._id,
        },
      });
    } else {
      this.helperService.showErrorToast("Please select any organization");
    }
  }
}
