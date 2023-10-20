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
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  displayLocation = false;
  filterSettings: any = {};
  organizations = [];
  employees = Constants.SIZE_OF_EMPLOYEES;
  showMenu = "";
  locationKey = "";
  locationOptions = [];
  searchedLocations = [];
  totalOrg;
  loadMoreDataSubs = new Subscription();
caller=true;
  // @HostListener('scroll', ['$event'])
  // scroll(event) {
  //   if (event.target.scrollingElement.scrollTop === event.target.scrollingElement.scrollTopMax) {
  //     this.getOrgData();
  //   }
  // }

  constructor(
    private searchService: SearchService,
    public helperService: HelperService,
    public homeService: HomeService
  ) { }

  async ngOnInit() {
    await this.getOrgData(0);
    this.loadMoreDataSubs = this.searchService.loadMoreData.subscribe(tab => {
      if (tab === "organizations") {
        this.getOrgData();
      }
    });
    this.getLocationOptions();
  }

  getOrgData(length = -1) {
    return new Promise((resolve, reject) => {
      const keyword = this.helperService.searchKeyword ? this.helperService.searchKeyword : "";
      const skipCount = length >= 0 ? length : this.organizations.length;
      if(this.caller==true){
        this.caller=false;
        this.searchService
        .getOrganizations(skipCount, keyword)
        .then((jresponse: JReponse) => {
          this.caller=true;
          const orgData = jresponse.body.organization;
          this.filterSettings = jresponse.body.setting;
          this.totalOrg = jresponse.body.totalOrg;
          orgData.map(org => {
            org.follow = org.follow ? 'true' : 'false'
            if (org.avatar) {
              org.avatar = environment.MEDIA_URL + org.avatar;
            } else {
              org.avatar = "../../../../../assets/images/nav-logo.svg";
            }
          });
          this.filterSettings.organization.location.forEach(loc => {
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
      this.filterSettings.organization.employees.push(size);
    } else {
      this.filterSettings.organization.employees.splice(this.filterSettings.organization.employees.findIndex(id => id === size), 1);
    }
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
    if (event.target.id !== "filter-menu") {
      this.showMenu = "";
    }
  }

  saveSettings(type = '') {
    const data = {
      searchOptions: this.filterSettings
    };
    //return false
    this.searchService
      .updateSettings(data)
      .then(async (jresponse: JReponse) => {

        // this.locationOptions=[];
        await this.getOrgData(0);
        // this.getLocationOptions();
        if (!type) {
          //  this.searchedLocations=[]
          this.toggleMenu('')
        }

      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }
  selectLocationOption(event, location) {
    this.displayLocation = false;
    this.filterSettings.organization.location.push(location.country);
    this.locationOptions.push(location)
    if (this.filterSettings.organization.removedLocation && this.filterSettings.organization.removedLocation.includes(location.country)) {
      this.filterSettings.organization.removedLocation.splice(
        this.filterSettings.organization.removedLocation.findIndex(
          (loc) => loc === location.country
        ),
        1
      );
    }
    this.locationKey = '';
    const el: any = document.getElementsByClassName('searchCls');
    for (let i = 0; i < el.length; i++) {
      el[i].value = "";
      el[i].innerText = "";
    }
  }
  addLocationOption(event, location) {
    if (event.target.checked) {
      this.filterSettings.organization.location.push(location);
      if (this.filterSettings.organization.removedLocation && this.filterSettings.organization.removedLocation.includes(location)) {
        this.filterSettings.organization.removedLocation.splice(
          this.filterSettings.organization.removedLocation.findIndex(
            (loc) => loc === location
          ),
          1
        );
      }
    } else {
      this.filterSettings.organization.location.splice(this.filterSettings.organization.location.findIndex(loc => loc === location), 1);
      if (this.filterSettings.organization.removedLocation && this.filterSettings.organization.removedLocation.includes(location)) {
        this.filterSettings.organization.removedLocation.splice(
          this.filterSettings.organization.removedLocation.findIndex(
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

          locations = locations.filter(
            (loc) => !this.filterSettings.organization.location.includes(loc.country)
          );
          this.locationOptions = [...this.locationOptions, ...locations];
          if (this.filterSettings.organization.removedLocation && !_.isEmpty(this.filterSettings.organization.removedLocation)) {
            this.locationOptions = this.locationOptions.map((orgData) => {
              if (this.filterSettings.organization.removedLocation.includes(orgData.country)) {
                return false
              } else {
                return orgData;
              }
            })
          }
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
            (org) => !this.filterSettings.organization.location.includes(org.country)
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
      if (search.organization.removedLocation) {
        if (!_.isEmpty(search.organization.removedLocation)) {
          search.organization.removedLocation.push(data.country);
        } else {
          search.organization.removedLocation = [data.country];
        }
      } else {
        search.organization.removedLocation = [data.country]
      }
      search.organization.removedLocation = _.uniqWith(search.organization.removedLocation, _.isEqual);
      if (search.organization.location.includes(data.country)) {

        search.organization.location.splice(
          search.organization.location.findIndex(
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
