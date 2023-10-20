import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { APIService, JReponse } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  userData;
  wsId;
  orgId;
  userEmail;

  constructor(
    public helperService: HelperService,
    private apiService: APIService,
    public homeService: HomeService,
    private modalService: BsModalService,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.userData = this.helperService.getLocalStore("userData");
    this.activatedroute.queryParams.subscribe(params => {
      this.wsId = params['wsId'];
      this.orgId = params['orgId']
    });
  
if(this.wsId && this.orgId){
  if (this.userData) {
    this.userEmail = this.userData.email
    console.log('this.useremail', this.userEmail);
    const data = {
      organization_id : this.orgId,
      workspace_id : this.wsId,
      users : [{
        email : this.userEmail,
        role : 'light_member'
      }]
    }
    console.log(data);
    this.apiService
      .postWithHeader("workspace/assign-users", data)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.helperService.showSuccessToast(`successfully Added in the Orgnisation`);
          this.router.navigate(['application/home'])
        }
        else{
          this.helperService.showErrorToast("Error")
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });

  }
}


  }

}
