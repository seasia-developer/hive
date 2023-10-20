import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { SearchService } from '../search.service';
import { JReponse } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper.service';
import { Constants } from 'src/app/constants/constants';
import { Subscription } from 'rxjs';
import { HomeService } from "../../home.service";
import * as _ from "lodash";

@Component({
  selector: 'app-industries',
  templateUrl: './industries.component.html',
  styleUrls: ['./industries.component.scss']
})
export class IndustriesComponent implements OnInit, OnDestroy {
  organizations = [];
  filterSettings: any = {};
  displayLocation = false;
  locationOptions = [];
  searchedLocations = [];
  showMenu = "";
  employees = Constants.SIZE_OF_EMPLOYEES;
  locationKey = "";
  industryOptions: any;
  totalCount;
  loadMoreDataSubs = new Subscription();
  caller = true;
  // @HostListener('window:scroll', ['$event'])
  // scroll(event) {
  //   if (event.target.scrollingElement.scrollTop === event.target.scrollingElement.scrollTopMax) {
  //     this.getIndustryData();
  //   }
  // }

  constructor(
    private searchService: SearchService,
    public helperService: HelperService,
    public homeService: HomeService
  ) { }

  async ngOnInit() {
    await this.getIndustryData();
    this.getLocationOptions();
    this.getIndustryOptions();
    this.loadMoreDataSubs = this.searchService.loadMoreData.subscribe(tab => {
      if (tab === "people") {
        this.getIndustryData();
      }
    });
  }

  getIndustryData(length = -1) {
    return new Promise((resolve, reject) => {
      let keyword = this.helperService.searchKeyword ? this.helperService.searchKeyword : '';
      const skipCount = length >= 0 ? length : this.organizations.length;
      if (this.caller == true) {

        this.caller = false;
        this.searchService
          .getIndustries(keyword, skipCount)
          .then((jresponse: JReponse) => {
            this.caller = true;
            const orgData = jresponse.body.organization;
            this.filterSettings = jresponse.body.setting;
            this.totalCount = jresponse.body.totalIndustry;
            orgData.map(org => {
              org.follow = org.follow ? 'true' : 'false'
              if (org.avatar) {
                org.avatar = environment.MEDIA_URL + org.avatar;

              } else {
                org.avatar = "../../../../../assets/images/nav-logo.svg";
              }
            });
            this.filterSettings.industry.location.forEach(loc => {
              const location = this.locationOptions.find(l => l.country === loc);
              const searchedLocation = this.searchedLocations.find(l => l.country === loc);
              if (!location && !searchedLocation) {
                this.locationOptions.push({ country: loc });
              }
            });
            if (length === 0) {
              this.organizations = [];
            }
            this.organizations = [...this.organizations, ...orgData];
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

  addEmployeeOption(event, size) {
    if (event.target.checked) {
      this.filterSettings.industry.employees.push(size);
    } else {
      this.filterSettings.industry.employees.splice(this.filterSettings.industry.employees.findIndex(id => id === size), 1);
    }
  }

  toggleMenu(type) {
    if (this.showMenu !== type) {
      this.showMenu = type;
    } else {
      this.showMenu = "";
    }
  }

  saveSettings(type = '') {
    const data = {
      searchOptions: this.filterSettings
    };
    this.searchService
      .updateSettings(data)
      .then(async (jresponse: JReponse) => {
        await this.getIndustryData(0);
        // this.getLocationOptions();
        if (!type) {
          this.toggleMenu('')
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  getIndustryOptions() {
    this.searchService
      .getOrgIndustryFilterOptions()
      .then(async (jresponse: JReponse) => {
        this.industryOptions = jresponse.body;
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  selectIndustry(ind) {
    if (this.filterSettings.industry.industry === ind._id) {
      this.filterSettings.industry.industry = "";
    } else {
      this.filterSettings.industry.industry = ind._id;
    }
    this.saveSettings();
  }

  selectLocationOption(event, location) {
    this.displayLocation = false;
    this.filterSettings.industry.location.push(location.country);
    this.locationOptions.push(location)
    if (this.filterSettings.industry.removedLocation && this.filterSettings.industry.removedLocation.includes(location.country)) {
      this.filterSettings.industry.removedLocation.splice(
        this.filterSettings.industry.removedLocation.findIndex(
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
    if (event.target.checked) {
      this.filterSettings.industry.location.push(location);
      if (this.filterSettings.industry.removedLocation && this.filterSettings.industry.removedLocation.includes(location)) {
        this.filterSettings.industry.removedLocation.splice(
          this.filterSettings.industry.removedLocation.findIndex(
            (loc) => loc === location
          ),
          1
        );
      }
    } else {
      this.filterSettings.industry.location.splice(this.filterSettings.industry.location.findIndex(loc => loc === location), 1);
      if (this.filterSettings.industry.removedLocation && this.filterSettings.industry.removedLocation.includes(location)) {
        this.filterSettings.industry.removedLocation.splice(
          this.filterSettings.industry.removedLocation.findIndex(
            (loc) => loc === location
          ),
          1
        );
      }
    }
  }

  getLocationOptions(type = "default") {
    this.searchService
      .getLocationOptions(this.locationKey, "organization")
      .then((jresponse: JReponse) => {
        if (type === "default") {
          let locations = jresponse.body;
          // locations = locations.filter(loc => {
          //   const existingLocation = this.locationOptions.find(l => l.country === loc.country);
          //   if (existingLocation) {
          //     return false;
          //   } else {
          //     return !this.filterSettings.industry.location.includes(loc.country);
          //   }
          // });
          locations = locations.filter(
            (loc) => !this.filterSettings.industry.location.includes(loc.country)
          );
          this.locationOptions = [...this.locationOptions, ...locations];

          if (this.filterSettings.industry.removedLocation && !_.isEmpty(this.filterSettings.industry.removedLocation)) {
            this.locationOptions = this.locationOptions.map((orgData) => {
              if (this.filterSettings.industry.removedLocation.includes(orgData.country)) {
                return false
              } else {
                return orgData;
              }
            })
          }

          // this.locationOptions.map((orgData) => {
          //   this.searchedLocations.splice(
          //     this.searchedLocations.findIndex(
          //       (loc) => loc.country === orgData.country
          //     ),
          //     1
          //   );
          // })
          // this.locationOptions = _.compact(this.locationOptions)
          // this.locationOptions = _.uniqBy(this.locationOptions, 'country');
          this.locationOptions = _.compact(this.locationOptions);
          this.locationOptions.map((orgData) => {
            if (this.searchedLocations.includes(orgData.country)) {
              this.searchedLocations.splice(
                this.searchedLocations.findIndex(
                  (loc) => loc.country === orgData.country
                ),
                1
              );
            }

          })

          this.locationOptions = _.uniqBy(this.locationOptions, 'country');
        } else {
          this.showMenu = 'location';
          let searchedLocations = jresponse.body;

          searchedLocations = searchedLocations.filter(
            (org) => !this.filterSettings.industry.location.includes(org.country)
          );
          searchedLocations = searchedLocations.map((orgData) => {
            if (this.locationOptions.some(el => el.country === orgData.country)) {
              return false
            } else {
              return orgData;
            }
          })
          this.searchedLocations = _.compact(searchedLocations);
          this.searchedLocations = _.uniqBy(this.searchedLocations, 'country');

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
    if (type == 'location') {

      if (search.industry.removedLocation) {
        if (!_.isEmpty(search.industry.removedLocation)) {
          search.industry.removedLocation.push(data.country);
        } else {
          search.industry.removedLocation = [data.country];
        }
      } else {
        search.industry.removedLocation = [data.country]
      }
      if (search.industry.location.includes(data.country)) {
        search.industry.location.splice(
          search.industry.location.findIndex(
            (loc) => loc === data.country
          ),
          1
        );
      }
      // this.searchedLocations.splice(
      //   this.searchedLocations.findIndex(
      //     (loc) => loc.country === data.country
      //   ),
      //   1
      // );
      this.searchedLocations = _.filter(this.searchedLocations, function (f) { return f.country !== data.country })
      this.locationOptions = _.filter(this.locationOptions, function (f) { return f.country !== data.country });

      this.saveSettings('location');
    }
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

  clickedOutside(event) {
    this.searchedLocations=[];
    if (event.target.id !== "filter-menu") {
      this.showMenu = "";
    }
  }
  following(item) {
    this.homeService.addFollowing({ organization_id: item._id, followType: 'organization', type: item.follow == 'true' ? 'unfollow' : 'follow' })
      .then((jresponse: JReponse) => {
        item.follow = item.follow == 'true' ? 'false' : 'true';
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
