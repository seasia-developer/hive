import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadOrgContentComponent } from './upload-org-content.component';
import { PreventDoubleClickModule } from 'src/app/directives/prevent-double-click.module';
import { MatProgressBarModule } from '@angular/material';
import { NgxDropzoneModule } from 'ngx-dropzone';



@NgModule({
  declarations: [
    UploadOrgContentComponent
  ],
  imports: [
    CommonModule,
    PreventDoubleClickModule,
    MatProgressBarModule,
    NgxDropzoneModule
  ],
  exports: [
    UploadOrgContentComponent
  ],
  entryComponents: [
    UploadOrgContentComponent
  ]
})
export class UploadOrgContentModule { }
