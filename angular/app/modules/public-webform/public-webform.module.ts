import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicWebformComponent } from './public-webform.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MatSliderModule } from "@angular/material/slider";
import { NgxDropzoneModule } from 'ngx-dropzone';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const routes: Routes = [
  {
    path: '',
    component: PublicWebformComponent
  },
];

@NgModule({
  declarations: [PublicWebformComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatSliderModule,
    MatProgressBarModule,
    NgxCleaveDirectiveModule,
    NgxDropzoneModule,
    BsDatepickerModule.forRoot(),
  ]
})
export class PublicWebformModule { }
