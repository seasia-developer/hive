import { Component, OnInit } from "@angular/core";
import { Constants } from "../../../../../constants/constants";
@Component({
  selector: "app-sidebar-menu",
  templateUrl: "./sidebar-menu.component.html",
  styleUrls: ["./sidebar-menu.component.scss"],
})
export class SidebarMenuComponent implements OnInit {
  menuItems;
  // activeTab: string;
  constructor() {}

  ngOnInit() {
    this.menuItems = Constants.ADMIN_MENU;
    // const url = this.activatedRoute.snapshot["_routerState"].url;
    // const result = this.menuItems.find((item) => url.includes(item.route));
    // this.activeTab = this.menuItems.find((item) =>
    //   url.includes(item.route)
    // ).route;
    // if (result && result !== undefined) {
    //   this.activeTab = result.route;
    // }
  }
}
