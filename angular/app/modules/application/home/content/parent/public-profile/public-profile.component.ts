import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-public-profile",
  templateUrl: "./public-profile.component.html",
  styleUrls: ["./public-profile.component.scss"],
})
export class PublicProfileComponent implements OnInit {
  userId;
  workspaceId;
  organisationId;
  is_search;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.activatedRoute.snapshot.queryParams.userId;
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspace_id;
  }
}
