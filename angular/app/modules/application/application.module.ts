import { NgModule, NO_ERRORS_SCHEMA ,CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
// import { MentionUserListComponent } from "./mention-user-list/mention-user-list.component";
const routes: Routes = [
  // {
  //   path: "mention-user-list",
  //   component: MentionUserListComponent,
  // },
  {
    path: "home",
    loadChildren: "./home/home.module#HomeModule",
  },
  {
    path: "chat",
    loadChildren: "./chat/chat.module#ChatModule",
  }
];

@NgModule({
  declarations: [], //MentionUserListComponent
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule],
  schemas: [NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA]
})
export class ApplicationModule { }
