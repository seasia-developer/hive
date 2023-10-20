import { NgModule } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';
import { DateFormatPipeActivity } from './date-format.pipe-activity';

@NgModule({
    imports:        [],
    declarations:   [DateFormatPipe,DateFormatPipeActivity],
    exports:        [DateFormatPipe,DateFormatPipeActivity],
})

export class PipeModule {

  static forRoot() {
     return {
         ngModule: PipeModule,
         providers: [],
     };
  }
}