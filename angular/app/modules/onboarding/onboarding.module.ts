import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { BusinessPersonalComponent } from './business-personal/business-personal.component';
import { CategoryComponent } from './category/category.component';
import { Routes, RouterModule } from '@angular/router';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
    {
      path: '',
      component: OnboardingComponent
    },
    {
      path: 'business-personal',
      component: BusinessPersonalComponent
    },
    {
        path: 'category',
        component: CategoryComponent
    },
    // {
    //     path: 'services',
    //     component: ServicesComponent
    // }
  ];

@NgModule({
  declarations: [
    OnboardingComponent,
    BusinessPersonalComponent,
    CategoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OnbordingModule { }
