import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../../../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateAppService {

  constructor(
    private apiservice: APIService,
    ) { }

  createApp(data, token) {
    return this.apiservice.postWithHeader(`/application/addApplication`, data, token);
  }

  editApp(data, token) {
    return this.apiservice.postWithHeader(`/application/editApplication`, data, token);
  }


}
