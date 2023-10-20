import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as _ from "lodash";

import { SearchService } from "../search.service";
import { HelperService } from "src/app/services/helper.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HomeService } from "../../home.service";
@Component({
  selector: "app-people",
  templateUrl: "./people.component.html",
  styleUrls: ["./people.component.scss"],
})
export class PeopleComponent implements OnInit, OnDestroy {
  displayOrg = false;
  displayLocation = false;
  users = [];
  filterSettings: any = {};
  showMenu = "";
  organizationKey = "";
  organizationOptions = [];
  searchedOrgs = [];
  locationKey = "";
  locationOptions = [];
  searchedLocations = [];
  industryOptions = [];
  totalUsers;
  loadMoreDataSubs = new Subscription();
  caller = true;
  // @HostListener("window:scroll", ["$event"])
  // scroll(event) {
  //   if (
  //     event.target.scrollingElement.scrollTop ===
  //     event.target.scrollingElement.scrollTopMax
  //   ) {
  //     this.getUserData();
  //   }
  // }

  constructor(
    private searchService: SearchService,
    public helperService: HelperService,
    public homeService: HomeService
  ) { }

  async ngOnInit() {
    await this.getUserData(0);
    this.loadMoreDataSubs = this.searchService.loadMoreData.subscribe((tab) => {
      if (tab === "people") {
        this.getUserData();
      }
    });
    this.getOrganizationOptions();
    this.getLocationOptions();
    this.getIndustryOptions();
  }

  getUserData(length = -1) {
    return new Promise((resolve, reject) => {
      const keyword = this.helperService.searchKeyword
        ? this.helperService.searchKeyword
        : "";
      const skipCount = length >= 0 ? length : this.users.length;
      if (this.caller == true) {
        this.caller = false;

        this.searchService
          .getUsers(skipCount, keyword)
          .then((jresponse: JReponse) => {
            this.caller = true;
            const userData = jresponse.body.people;
            this.filterSettings = jresponse.body.setting;
            this.totalUsers = jresponse.body.totalUsers;
            userData.map((user) => {
              user.follow = user.follow ? 'true' : 'false'
              let city = user.city && user.city != "" ? user.city + ', ' : "";
              let country = user.country && user.country != "" ? user.country : "";
              user.address = city + country;

              if (user.avatar) {
                user.avatar = environment.MEDIA_URL + user.avatar;
              } else {
                user.avatar = "../../../../../assets/images/user.png";
              }
            });

            this.filterSettings.people.organization = this.filterSettings.people.organization.map(
              (org) => {
                const organization = this.organizationOptions.find(
                  (o) => o._id === org._id
                );
                const searchedOrg = this.searchedOrgs.find(
                  (o) => o._id === org._id
                );
                if (!organization && !searchedOrg) {
                  this.organizationOptions.push(org);

                }
                const id = org._id;
                return id;
              }
            );
            this.filterSettings.people.industry = this.filterSettings.people.industry.map(
              (ind) => ind._id
            );
            this.filterSettings.people.location.forEach((loc) => {
              const location = this.locationOptions.find(
                (l) => l.country === loc
              );
              const searchedLocation = this.searchedLocations.find(
                (l) => l.country === loc
              );
              if (!location && !searchedLocation) {
                this.locationOptions.push({ country: loc });
              }
            });
            if (length === 0) {
              this.users = [];
            }
            this.users = [...this.users, ...userData];
            resolve();
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error.message);
            reject();
            throw err;
          });
      }
    });
  }

  getOrganizationOptions(type = "default") {
    this.searchService
      .getOrgOptions(this.organizationKey)
      .then((jresponse: JReponse) => {
        if (type === "default") {
          let orgs = jresponse.body;
          orgs = orgs.filter(
            (org) => !this.filterSettings.people.organization.includes(org._id)
          );
          this.organizationOptions = [...this.organizationOptions, ...orgs];
          if (this.filterSettings.people.removedOrg && !_.isEmpty(this.filterSettings.people.removedOrg)) {
            this.organizationOptions = this.organizationOptions.map((orgData) => {
              if (this.filterSettings.people.removedOrg.includes(orgData._id)) {
                return false
              } else {
                return orgData;
              }
            })
          }
          this.organizationOptions = _.compact(this.organizationOptions)

        } else {
          this.showMenu = 'org';
          this.displayOrg = true;
          let searchedOrgs = jresponse.body;
          searchedOrgs = searchedOrgs.filter(
            (org) => !this.filterSettings.people.organization.includes(org._id)
          );
          searchedOrgs = searchedOrgs.map((orgData) => {
            if (this.organizationOptions.some(el => el._id === orgData._id)) {
              return false
            } else {
              return orgData;
            }
          })
          this.searchedOrgs = _.compact(searchedOrgs);
          this.organizationKey = '';

        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  searchOrgs(event) {

    this.organizationKey = event.target.value;
    this.displayOrg = true;
    if (this.organizationKey) {
      this.getOrganizationOptions("search");
    } else {
      this.searchedOrgs = [];
    }
  }


  getIndustryOptions() {
    this.searchService
      .getIndustryFilterOptions()
      .then(async (jresponse: JReponse) => {
        let industry = jresponse.body.data;
        let list = _.filter(industry, (source) => {
          if (source.organizationCount > 0) {
            return source;
          }
        });
        this.industryOptions = list;
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  toggleMenu(type) {
    if (this.showMenu !== type) {
      this.showMenu = type;
    } else {
      this.showMenu = "";
    }
  }

  clickedOutside(event) {
    this.searchedLocations=[];
    this.searchedOrgs=[];
    if (event.target.id !== "filter-menu") {
      this.showMenu = "";
    }
  }
  selectOrg(event, org) {
    this.displayOrg = false;
    this.organizationOptions.push(org)
    this.filterSettings.people.organization.push(org._id);
    if (this.filterSettings.people.removedOrg && this.filterSettings.people.removedOrg.includes(org._id)) {
      this.filterSettings.people.removedOrg.splice(
        this.filterSettings.people.removedOrg.findIndex(
          (loc) => loc === org._id
        ),
        1
      );
    }
    const el: any = document.getElementsByClassName('searchCls');
    for (let i = 0; i < el.length; i++) {
      el[i].value = "";
      el[i].innerText = "";
    }
  }
  addOrgOption(event, orgId) {
    this.showMenu = 'org';
    if (event.target.checked) {
      this.filterSettings.people.organization.push(orgId);
      if (this.filterSettings.people.removedOrg && this.filterSettings.people.removedOrg.includes(orgId)) {
        this.filterSettings.people.removedOrg.splice(
          this.filterSettings.people.removedOrg.findIndex(
            (loc) => loc === orgId
          ),
          1
        );
      }
    } else {
      this.filterSettings.people.organization.splice(
        this.filterSettings.people.organization.findIndex((id) => id === orgId),
        1
      );
      if (this.filterSettings.people.removedOrg && this.filterSettings.people.removedOrg.includes(orgId)) {
        this.filterSettings.people.removedOrg.splice(
          this.filterSettings.people.removedOrg.findIndex(
            (loc) => loc === orgId
          ),
          1
        );
      }
    }
  }

  addIndustryOption(event, ind) {
    if (event.target.checked) {
      this.filterSettings.people.industry.push(ind._id);
    } else {
      this.filterSettings.people.industry.splice(
        this.filterSettings.people.industry.findIndex((id) => id === ind._id),
        1
      );
    }
  }
  addFollowOption(event, val) {
    this.filterSettings.people.following = val;
  }
  saveSettings(type = '') {

    const data = {
      searchOptions: this.filterSettings
    };
    // return false
    this.searchService
      .updateSettings(data)
      .then((jresponse: JReponse) => {
        this.getUserData(0);
        if (!type) {
          this.toggleMenu('');
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }
  removeSettings(data, type) {
    const el: any = document.getElementsByClassName('searchCls');
    for (let i = 0; i < el.length; i++) {
      el[i].value = "";
      el[i].innerText = "";
    }
    this.showMenu == (type == 'organization' ? 'org' : 'location');
    const search = this.filterSettings;
    if (type == 'organization') {
      this.organizationKey = '';
      if (search.people.removedOrg) {
        if (!_.isEmpty(search.people.removedOrg)) {
          search.people.removedOrg.push(data._id);
        } else {
          search.people.removedOrg = [data._id];
        }
      } else {
        search.people.removedOrg = [data._id]
      }
      search.people.removedOrg = _.uniqWith(search.people.removedOrg, _.isEqual);
      if (search.people.organization.includes(data._id)) {
        search.people.organization.splice(
          search.people.organization.findIndex((id) => id === data._id),
          1
        );
      }

      this.organizationOptions = _.filter(this.organizationOptions, function (f) { return f._id.toString() !== data._id.toString() });
      //   this.searchedOrgs = _.filter(this.searchedOrgs, function (f) { return f._id.toString() !== data._id.toString() });

      this.saveSettings('org');
    } else if (type == 'location') {
      this.locationKey = '';
      if (search.people.removedLocation) {
        if (!_.isEmpty(search.people.removedLocation)) {
          search.people.removedLocation.push(data.country);
        } else {
          search.people.removedLocation = [data.country];
        }
      } else {
        search.people.removedLocation = [data.country]
      }
      search.people.removedLocation = _.uniqWith(search.people.removedLocation, _.isEqual);
      if (search.people.location.includes(data.country)) {
        search.people.location.splice(
          search.people.location.findIndex(
            (loc) => loc === data.country
          ),
          1
        );
      }
      this.locationOptions = _.filter(this.locationOptions, function (f) { return f.country !== data.country });

      this.saveSettings('location');
    }
  }
  selectLocationOption(event, location) {
    this.displayLocation = false;
    this.filterSettings.people.location.push(location.country);
    this.locationOptions.push(location)
    if (this.filterSettings.people.removedLocation && this.filterSettings.people.removedLocation.includes(location.country)) {
      this.filterSettings.people.removedLocation.splice(
        this.filterSettings.people.removedLocation.findIndex(
          (loc) => loc === location.country
        ),
        1
      );
    }
    const el: any = document.getElementsByClassName('searchCls');
    for (let i = 0; i < el.length; i++) {
      el[i].value = "";
      el[i].innerText = "";
    }
  }
  addLocationOption(event, location) {
    this.showMenu = 'location';
    if (event.target.checked) {
      this.filterSettings.people.location.push(location);
      if (this.filterSettings.people.removedLocation && this.filterSettings.people.removedLocation.includes(location)) {
        this.filterSettings.people.removedLocation.splice(
          this.filterSettings.people.removedLocation.findIndex(
            (loc) => loc === location
          ),
          1
        );
      }
    } else {
      this.filterSettings.people.location.splice(
        this.filterSettings.people.location.findIndex(
          (loc) => loc === location
        ),
        1
      );
      if (this.filterSettings.people.removedLocation && this.filterSettings.people.removedLocation.includes(location)) {
        this.filterSettings.people.removedLocation.splice(
          this.filterSettings.people.removedLocation.findIndex(
            (loc) => loc === location
          ),
          1
        );
      }

    }
  }

  getLocationOptions(type = "default") {
    this.searchService
      .getLocationOptions(this.locationKey)
      .then((jresponse: JReponse) => {
        if (type === "default") {
          let locations = jresponse.body;
          locations = locations.filter(
            (loc) => !this.filterSettings.people.location.includes(loc.country)
          );
          this.locationOptions = [...this.locationOptions, ...locations];
          if (this.filterSettings.people.removedLocation && !_.isEmpty(this.filterSettings.people.removedLocation)) {
            this.locationOptions = this.locationOptions.map((orgData) => {
              if (this.filterSettings.people.removedLocation.includes(orgData.country)) {
                return false
              } else {
                return orgData;
              }
            })
          }
          this.locationOptions.map((orgData) => {
            this.searchedLocations.splice(
              this.searchedLocations.findIndex(
                (loc) => loc.country === orgData.country
              ),
              1
            );
          })
          this.locationOptions = _.compact(this.locationOptions)
          this.locationOptions = _.uniqBy(this.locationOptions, 'country');

        } else {
          this.showMenu = 'location';
          let searchedLocations = jresponse.body;
          // searchedLocations = searchedLocations.filter((loc) => {
          //   const existingLocation = this.locationOptions.find(
          //     (l) => l.country === loc.country
          //   );
          //   if (existingLocation) {
          //     return false;
          //   } else {
          //     return !this.filterSettings.people.location.includes(loc.country);
          //   }
          // });
          // this.searchedLocations = _.compact(searchedLocations);
          // this.searchedLocations = _.uniqBy(this.searchedLocations, 'country');
          searchedLocations = searchedLocations.filter(
            (org) => !this.filterSettings.people.location.includes(org.country)
          );
          searchedLocations = searchedLocations.map((orgData) => {
            if (this.locationOptions.some(el => el.country === orgData.country)) {
              return false
            } else {
              return orgData;
            }
          })
          // this.searchedLocations = (searchedLocations);
          this.searchedLocations = _.compact(searchedLocations);
          this.searchedLocations = _.uniqBy(this.searchedLocations, 'country');
          this.locationKey = '';

        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err);
        throw err;
      });
  }

  searchLocations(event) {
    this.showMenu = 'location';
    this.displayLocation = true;
    this.locationKey = event.target.value;
    if (this.locationKey) {
      this.getLocationOptions("search");
    } else {
      this.searchedLocations = [];
    }
  }
  following(item) {
    this.homeService
      .addFollowing({
        following: item._id,
        followType: "people",
        type: item.follow && item.follow == 'true' ? 'unfollow' : 'follow'
      })
      .then((jresponse: JReponse) => {
        item.follow = item.follow && item.follow == 'true' ? 'false' : 'true';
        item.totalFollow = item.follow == 'false' ? item.totalFollow - 1 : item.totalFollow + 1;

        this.helperService.showSuccessToast(jresponse.message);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  ngOnDestroy() {
    this.loadMoreDataSubs.unsubscribe();
  }
}
