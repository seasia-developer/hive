import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpMarketComponent } from './wp-market/wp-market.component';
import { WpMarketDetailsComponent } from './wp-market-details/wp-market-details.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationViewModule } from '../application-view/application-view.module';
import { ApplicationCalenderViewComponent } from '../application-view/application-calender-view/application-calender-view.component';
import { ApplicationGridViewComponent } from '../application-view/application-grid-view/application-grid-view.component';
import { ApplicationKanbanViewComponent } from '../application-view/application-kanban-view/application-kanban-view.component';
const routes: Routes = [
  {
    path: "wp-market",
    component: WpMarketComponent,
  },
  {
    path: "wp-market-detail",
    component: WpMarketDetailsComponent,
      children: [
        {
          path: "calender-view",
          component: ApplicationCalenderViewComponent,
        },
        {
          path: "grid-view",
          component: ApplicationGridViewComponent,
        },
        {
          path: "kanban-view",
          component: ApplicationKanbanViewComponent,
        },
      ],
  },
];


@NgModule({
  declarations: [WpMarketComponent, WpMarketDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ApplicationViewModule,
  ]
})
export class WordpressStructureModule { }
