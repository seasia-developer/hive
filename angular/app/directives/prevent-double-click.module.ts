import { NgModule } from '@angular/core';
import { PreventDoubleClickDirective } from './prevent-double-click.directive';

@NgModule({
    imports:        [],
    declarations:   [PreventDoubleClickDirective],
    exports:        [PreventDoubleClickDirective],
})

export class PreventDoubleClickModule {

  static forRoot() {
     return {
         ngModule: PreventDoubleClickDirective,
         providers: [],
     };
  }
}