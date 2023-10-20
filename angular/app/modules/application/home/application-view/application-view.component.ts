import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  TemplateRef,
  OnDestroy,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
import {
  ActivatedRoute,
  Router
} from "@angular/router";
import {
  Subscription
} from "rxjs";
import {
  CalendarView
} from "angular-calendar";
import {
  CdkDragDrop,
  CdkDragSortEvent,
  moveItemInArray
} from "@angular/cdk/drag-drop";
import {
  BsModalService,
  BsModalRef
} from "ngx-bootstrap/modal";
import {
  IDropdownSettings
} from "ng-multiselect-dropdown";
import {
  v4 as uuid
} from "uuid";
import {
  AgGridEvent
} from "ag-grid-community";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";
import getNodeDimensions from "get-node-dimensions";
import * as _ from "lodash";
import * as moment from "moment";
import diff from "simple-text-diff";
import {
  MentionDirective
} from "angular-mentions";

import {
  AppViewService
} from "./application-view.service";
import {
  APIService,
  JReponse
} from "src/app/services/api.service";
import {
  Constants
} from "../../../../constants/constants";
import {
  environment
} from "src/environments/environment";
import {
  HelperService
} from "src/app/services/helper.service";
import {
  CreateAppComponent
} from "../content/create-app/create-app.component";
import {
  RecordModalComponent
} from "./record-modal/record-modal.component";
import {
  HomeService
} from "../home.service";
import {
  OrgLeaveComponent
} from "../content/org-leave/org-leave.component";
import {
  UploadOrgContentComponent
} from "../content/organisation-setup/upload-org-content/upload-org-content.component";
import {
  UpgradePopupComponent
} from '../upgrade/upgrade-popup/upgrade-popup.component';
import {
  DomSanitizer
} from '@angular/platform-browser';
import {
  HelperFunctions
} from "../../../helpers/index.service";
// import { ApplicationKanbanViewComponent } from "../application-view/application-kanban-view/application-kanban-view.component";

export let selectedMentionUsers = [];
@Component({
  selector: "app-application-view",
  templateUrl: "./application-view.component.html",
  styleUrls: ["./application-view.component.scss"],
})
export class ApplicationViewComponent implements OnInit, OnDestroy {

  matContent = ''
  lastIndexOfRowData = 0;
  columnDefs;
  pinnedBottomRowData;
  @ViewChild(MentionDirective, {
    static: false
  }) mention: MentionDirective;
  @ViewChild("scrollContainer", {
    static: false
  })
  private myScrollContainer: ElementRef;
  // Form related variables
  appForm: FormGroup;
  rangeForm: FormGroup;
  phoneArray: FormArray;
  emailArray: FormArray;
  calculationFields = [];
  numberFields = [];
  // For members multiselect dropdown
  dropdownList = [];
  selectedItems = {};
  dropdownSettings: IDropdownSettings = {};

  // Field types related variables
  phoneTypes = Constants.PHONE_TYPES;
  emailTypes = Constants.EMAIL_TYPES;
  moneyTypes = Constants.CURRENCY_TYPES;
  appFieldTypes = Constants.APP_FIELD_TYPES;
  audioTypes = Constants.AUDIO_TYPE;
  imgTypes = Constants.PREVIEW_TYPE;
  isShowGridOptions = false;
  // Default modal tab
  selectedModalTab = "activity";
  // Added records list of the active app
  recordData = [];
  formattedRecordData = [];
  activeAppId: string;
  // List of apps in the current workspace
  workspaceAppsList = [];
  newAppsOrder = [];
  // All the fields of the active app
  appFields = [];
  // Grid view specific fields
  gridViewFields = [];
  // Grid view specific field records
  gridViewFieldRecords = [];
  // App fields that needs to be covered in modal
  modalFields = [];
  // Organization members' list
  members = [];
  wsMembers = [];
  // For uploaded images in the add record modal
  imageData: File[] = [];
  attachmentData = {};
  appComments = [];
  linkPreviewData = {};
  // Selected Member
  selectedMembers = {};
  recordId: string;
  workspaceId: string;
  orgId: string;
  appActivities: any;
  openAppMenu = "";
  deleteRecordId: any;
  sortType = "desc";
  showHelpText;
  canAddComment = true;
  setTextArea = [];
  mapSuggestion = {};
  mapData = {};
  progressData = {};
  imageDisplayData = {};
  number: any;
  membersList = {};
  membersListMenu = "";
  formattedRecordDataAgGrid = [];
  nextFormattedRecordDataAgGrid = [];
  tempNullData = [];
  numberData = {};
  viewType = "grid";
  showDisplayMenu = false;
  displayMenuOption: string;
  displayMenuRowOptions = [];
  displayMenuColumnOptions = [];
  selectedCategoryOptions = {};
  selectedCategoryMultipleOptions = {};
  showCategoryDropdown = "";
  showFilterMenu = false;

  modalRef: BsModalRef | null;
  recordModalRef: BsModalRef | null;
  revisionModalRef: BsModalRef | null;

  selectedAppTab: number;
  editSessionId: any;
  getRowHeight;

  recordCategory: any;
  newMultiValueRecordData: any;
  activeApplication: any;
  selectedWorkspace: any;

  // Share record/ Invite to workspace specific variables
  suggestedUsers: any;
  shareRecordMessage: any;
  selectedShareRecordUsers: any;
  selectedShareRecordUserIds: any;
  shareRecordEmailOnly: string;
  showRecordEmailOnly = false;
  shareRecordModalType = "record";
  shareWorkspaceRole = "member";
  showWorkspaceRoleOptions = false;
  showLayoutOptionMenu: number;
  isModalOpen: boolean;
  prevIndex;
  nextIndex;
  currentLeftIndex;
  currentRightIndex;
  leftRecord;
  rightRecord;
  revisionRecord;
  leftVal = "";
  rightVal = "";
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  leftValue: any;
  userData;
  isCalendarShow = false;
  mediaUrl;
  selectedImageField: any;
  mentionUsersList = [];
  domLayout;
  noRowsTemplate;
  defaultColDef;
  showProgress: boolean;
  progress: number;
  // Filter related variables
  filterDisplayType = "all";
  selectedFieldRelation: any = {};
  allRelationData = [];
  selectedFilters = [];
  selectedDateFilterOption: any = {};
  filterFields = [];
  currentFilter = "";
  createdByUserList = [];
  createdByUserKeyword = "";
  currentCustomDateFilter: any = {};
  filterCategoryOptions = [];
  filterRelationOptions = [];
  filterMemberOptions = [];
  selectedFilterCategoryOptions = [];
  selectedFilterRelationOptions = [];
  selectedFilterMemberOptions = [];
  selectedFilterLocationOptions = {
    country: [],
    state: [],
    city: [],
    postal: [],
  };
  selectedFilterCategoryOptionIds = [];
  selectedFilterRelationOptionIds = [];
  selectedFilterLocationCountryOptionIds = [];
  selectedFilterLocationStateOptionIds = [];
  selectedFilterLocationCityOptionIds = [];
  selectedFilterLocationPostalOptionIds = [];
  selectedFilterCreatedByOptionIds = [];
  currentFilterCategoryField: any;
  currentFilterRelationField: any;
  currentFilterField: any;
  selectedFilterCount: any = {};
  currentFilterLocationField: any;
  dateTypes = Constants.FILTER_DATES;
  filterMenu = Constants.FILTER_MENU;
  showValidationErrors = false;

  // Subscriptions
  newCategoryRecordSubscription = new Subscription();
  newMemberRecordSubscription = new Subscription();
  editRecordSubscription = new Subscription();
  viewTypeSubscription = new Subscription();
  uploadImageSubscription = new Subscription();
  refreshAppSubscription = new Subscription();
  refreshAppFields = new Subscription();
  activeViewSubscription = new Subscription();
  editCategoryRecordSubscription = new Subscription();
  addRecordCalendarSubscription = new Subscription();
  editRecordCalendarSubscription = new Subscription();
  deleteRecordCalendarSubscription = new Subscription();
  refreshCommentSubscription = new Subscription();
  showCustomDate = false;
  toOpenRecordId = "";
  locationType = "";
  locationDataForFilter = [];
  currentFilterRangeField: any;
  viewId: any;
  activeView = {};
  recordName = "";
  appliedFilterCount: number;
  selectedLocationLabel: any;
  selectedFilterMemberOptionIds = [];
  invalidMemberFields = [];
  invalidDurationFields = [];
  invalidImageFields = [];
  changeFocus = true;
  selectedProgressFilterOptions: any = {};
  showHiddenViewMenu = false;
  hiddenFields = [];
  hiddenFieldsCount = 0;
  isDisplayleftSide = true;
  relationSearch = false;
  allLocationData: any;
  appRecords;
  displayApps = false;
  displayDrop = false;
  selectedRecord = [];
  openingModal = true;
  dpValue: {
    event: any;field: any;type: any
  };
  dpValueChanged = false;
  dpShown = false;
  isMentionUserSelect = true;
  isFromMarketDetail = true;
  isFromWordpress = false;
  marketInfo;
  editComment = "&nbsp;";
  commentId = "";
  firstDateTypeId;
  showModal = false;
  showUpgradePlanPopup = false;
  startTime: any = '';

  // Content Editable
  defaultContent = "<p>&nbsp;</p>";
  carouselImages = [];
  followers = [];
  canDeleteRecords = [];
  orgPlan: any;

  // ROLE ACCESS
  authUserId: string = '';
  activeAppIdStore: string = '';
  isOwnerOrAdmin: boolean = false;
  isWorkspaceAdmin: boolean = false;
  allAppsData: any = '';
  isActiveAppAdmin: boolean = false;

  // SCROLL
  appsScrollLeft: boolean = false;
  appsScrollRight: boolean = false;
  scrollStep: number = 200;
  appsNav: boolean = false;
  orgRole: string = 'light_member';

  // MODAL BOX
  modalConfig = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };


  constructor(
    private fb: FormBuilder,
    public appViewService: AppViewService,
    private activatedRoute: ActivatedRoute,
    public helperService: HelperService,
    private renderer: Renderer2,
    private modalService: BsModalService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    public homeService: HomeService,
    private apiService: APIService,
    public sanitizer: DomSanitizer,
    public helperFunctions: HelperFunctions,
    // public applicationKanbanViewComponent: ApplicationKanbanViewComponent

  ) {
    if (
      this.router.url.split("?")[0] ===
      "/application/home/admin/contributed-workspaces"
    ) {
      this.isDisplayleftSide = false;
    }
    if (this.router.url.split("?")[0] === "/application/home/market-detail") {
      this.isFromMarketDetail = false;
      this.isDisplayleftSide = false;
    }
    if (this.router.url.split("?")[0] === "/wordpress/wp-market-detail") {
      this.isFromWordpress = true;
      this.isFromMarketDetail = false;
      this.isDisplayleftSide = false;
    }
    this.mediaUrl = environment.MEDIA_URL;
    this.appForm = this.fb.group({});
    this.getRowHeight = () => {
      return 30;
    };
    this.domLayout = "autoHeight";
    this.noRowsTemplate = `<span></span>`;
    this.defaultColDef = {
      resizable: true
    };

  }


  ngOnInit() {

    this.orgRole = this.helperService.getLocalStore("orgRole")

    if (this.helperService.getLocalStore("orgRole") === 'light_member') {
      this.selectedModalTab = 'comments'
    }

    // this.appViewService.tempBool = false;
    this.appViewService.selectedAppFilters = [];
    this.appViewService.selectedView = "";
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.toOpenRecordId = this.activatedRoute.snapshot.queryParams.recordId;
    let role;
    if (this.helperService.getLocalStore("workspaces")) {
      role = this.helperService
        .getLocalStore("workspaces")
        .find((ws) => ws._id === this.workspaceId);
    }

    if (role) {
      this.homeService.wsRole = !this.homeService.wsRole ?
        role.role :
        this.homeService.wsRole;
    }

    this.rangeForm = this.fb.group({
      from: new FormControl("", {
        updateOn: "blur"
      }),
      to: new FormControl("", {
        updateOn: "blur"
      }),
    });
    this.tempNullData.push({});
    this.uploadedImages();
    this.refreshAppSubscription = this.appViewService.refreshAfterDelete.subscribe(
      async (appId) => {
        const appIndex = this.appViewService.workspaceAppsList.findIndex(
          (app) => app._id === appId
        );
        await this.appViewService.refreshApps(
          this.workspaceId,
          this.homeService.wsRole
        );
        this.workspaceAppsList = this.appViewService.workspaceAppsList;
        if (appId === this.activeAppId) {
          if (this.workspaceAppsList) {
            const app = this.workspaceAppsList[appIndex];
            if (!app) {
              this.changeApplication(
                this.workspaceAppsList[this.workspaceAppsList.length - 1]._id
              );
            } else {
              this.changeApplication(app._id);
            }
          }
        }
        if (!this.appViewService.workspaceAppsList) {
          this.homeService.activityWsId = this.homeService.activeWorkspaceId;
          this.homeService.sendOrgIdForPost({
            workspace_id: this.homeService.activeWorkspaceId,
          });
          this.router.navigateByUrl("application/home");
        }
      }
    );

    this.activeViewSubscription = this.appViewService.activeView.subscribe(
      (view) => {
        this.activeView = view;
        if (this.viewType === "calender") {
          this.appViewService.applyFiltersInCalendar.next({
            toApply: "view",
            view,
          });
        } else {
          this.currentFilter = "all";
          this.selectFilterMenu(this.currentFilter);
          this.getAppFields(this.activeAppId);
          this.setFilterCounts();
        }
      }
    );

    this.refreshAppSubscription = this.appViewService.refreshAppFields.subscribe(
      (appId) => {
        this.getAppFields(appId);
      }
    );
    this.userData = this.helperService.getLocalStore("userData");
    this.editRecordCalendarSubscription = this.appViewService.editCalendarRecord.subscribe(
      (record: any) => {
        if (this.isDisplayleftSide) {
          this.recordData = this.appViewService.activeAppRecords;
          this.setRecordList();
          const formattedRecord = this.formattedRecordData.find(
            (rec) => rec.id === record._id
          );

          this.showValidationErrors = false;
          this.getUsersForMention(
            this.workspaceId,
            "mention",
            this.createdByUserKeyword
          );
          this.appForm.reset();
          this.getMembers();
          this.editSessionId = uuid();
          this.selectedMembers = {};
          this.setForm({
            label: ""
          }, true);
          setTimeout(() => {
            this.setFormValues(formattedRecord, true);
            this.openModal("edit", formattedRecord);
          }, 0);
        }
      }
    );
    this.addRecordCalendarSubscription = this.appViewService.addCalendarRecord.subscribe(
      (date: any) => {
        if (this.isDisplayleftSide) {
          this.showValidationErrors = false;
          this.getUsersForMention(
            this.workspaceId,
            "mention",
            this.createdByUserKeyword
          );
          this.appForm.reset();
          // this.getMembers();
          this.appActivities = [];
          this.appComments = [];
          this.selectedMembers = {};

          this.appViewService
            .getRecordId({
              application_id: this.activeAppId,
              data: []
            })
            .then(async (jresponse: JReponse) => {
              if (jresponse.success) {
                this.recordId = jresponse.body.record_id;
                this.openModal("add");
                this.isModalOpen = true;
              }
            })
            .catch((err: Error) => {
              this.helperService.showErrorToast(err.message);
              throw err;
            });

          // document.getElementById("recordModalButton").click();

          this.appViewService.apiCalled = false;
        }
      }
    );

    this.deleteRecordCalendarSubscription = this.appViewService.deleteCalendarRecord.subscribe(
      (record: any) => {
        if (this.isDisplayleftSide) {
          record.id = record._id;
          this.deleteRecord(record);
        }
      }
    );

    this.newCategoryRecordSubscription = this.appViewService.newCategoryRecord.subscribe(
      (category: any) => {
        if (this.isDisplayleftSide) {
          if (category.id === "None") {
            this.openModal("add");
          } else {
            this.recordCategory = category;
            this.openModal("category");
          }
        }
      }
    );

    this.newMemberRecordSubscription = this.appViewService.newCategoryMemberRecord.subscribe(
      (data: any) => {
        if (this.isDisplayleftSide) {
          this.recordCategory =
            data.category.id === "None" ? "" : data.category;
          if (data.category.id === "None" && data.member === "none") {
            // this.openModal("add");
            if (this.isDisplayleftSide) {
              this.showValidationErrors = false;
              this.getUsersForMention(
                this.workspaceId,
                "mention",
                this.createdByUserKeyword
              );
              this.appForm.reset();
              this.getMembers();
              this.appActivities = [];
              this.appComments = [];
              this.selectedMembers = {};

              this.appViewService
                .getRecordId({
                  application_id: this.activeAppId,
                  data: []
                })
                .then(async (jresponse: JReponse) => {
                  if (jresponse.success) {
                    this.recordId = jresponse.body.record_id;
                    document.getElementById("recordModalButton").click();
                    this.isModalOpen = true;
                  }
                })
                .catch((err: Error) => {
                  this.helperService.showErrorToast(err.message);
                  throw err;
                });

              this.appViewService.apiCalled = false;
            }
          } else {
            this.newMultiValueRecordData = data;
            this.openModal("member");
          }
        }
      }
    );

    this.editCategoryRecordSubscription = this.appViewService.editCategoryRecord.subscribe(
      (recordId: any) => {
        if (this.isDisplayleftSide) {
          this.recordData = this.appViewService.activeAppRecords;
          this.setRecordList();
          const formattedRecord = this.formattedRecordData.find(
            (record) => record.id === recordId
          );
          this.openModal("edit", formattedRecord);

          this.showValidationErrors = false;
          this.getUsersForMention(
            this.workspaceId,
            "mention",
            this.createdByUserKeyword
          );
          this.appForm.reset();
          this.getMembers();

          this.editSessionId = uuid();
          this.selectedMembers = {};
          this.setForm({
            label: ""
          }, true);
          setTimeout(() => {
            this.setFormValues(formattedRecord, true);
          }, 0);
        }
      }
    );


    this.refreshCommentSubscription = this.appViewService
      .getCommentFlag()
      .subscribe(async (flag) => {
        this.addComment(flag)
      });
    // this.editRecordSubscription = this.appViewService.editCategoryRecord.subscribe(
    //   (recordId: any) => {
    //     if (this.isDisplayleftSide) {
    //       this.recordData = this.appViewService.activeAppRecords;
    //       this.setRecordList();
    //       const formattedRecord = this.formattedRecordData.find(
    //         (record) => record.id === recordId
    //       );
    //       // this.openModal("edit", formattedRecord);

    //       this.showValidationErrors = false;
    //       this.getUsersForMention(
    //         this.workspaceId,
    //         "mention",
    //         this.createdByUserKeyword
    //       );
    //       this.appForm.reset();
    //       this.getMembers();

    //       this.editSessionId = uuid();
    //       this.selectedMembers = {};
    //       this.setForm({ label: "" }, true);
    //       setTimeout(() => {
    //         this.setFormValues(formattedRecord);
    //       }, 0);
    //     }
    //   }
    // );

    this.router.events.subscribe((el: any) => {
      if (el && el.url) {
        if (el.url.includes("kanban-view")) {
          this.viewType = "kanban";
        } else if (el.url.includes("calender-view")) {
          this.viewType = "calender";
        } else {
          this.viewType = "grid";
        }
      }
    });
    if (
      this.activatedRoute["_routerState"].snapshot.url.includes("kanban-view")
    ) {
      this.viewType = "kanban";
    } else if (
      this.activatedRoute["_routerState"].snapshot.url.includes("calender-view")
    ) {
      this.viewType = "calender";
    }
    if (this.isFromMarketDetail) {
      if (!this.isDisplayleftSide) {
        const wsAppData = this.helperService.getLocalStore(
          "contributedAppData"
        );
        this.workspaceId = wsAppData.wsId;
        this.activeAppId = wsAppData.appId;
        this.viewId = wsAppData.viewId;
      } else {
        this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
        // this.homeService.activeWorkspaceId = this.workspaceId;
        this.activeAppId = this.activatedRoute.snapshot.queryParams.appId;
        this.viewId = this.activatedRoute.snapshot.queryParams.viewId;
      }
    } else {
      const wsAppData = this.helperService.getLocalStore(
        "marketWorkplaceDetailData"
      );
      this.workspaceId = wsAppData.wsId;
      this.activeAppId = wsAppData.appId;
      this.viewId = wsAppData.viewId;
    }
    this.appViewService.selectedView = this.viewId;
    this.homeService.activeWorkspaceId = this.workspaceId;

    if (this.viewId) {
      setTimeout(() => {
        this.appViewService.activateViewAfterRefresh.next({
          viewId: this.viewId,
          appId: this.activeAppId,
        });
      }, 200);
    }
    // setTimeout(() => {
    //   this.appViewService.updateAppFilters.next({id: this.activeAppId, fields: this.appFields});
    // }, 1000);
    if (this.workspaceId) {
      this.getApps(this.workspaceId, this.homeService.wsRole);
    }
    // if (this.activeAppId) {
    //   this.getAppFields(this.activeAppId);
    // }
    // To close dropdown menus when clicking outside the respective menus
    this.renderer.listen("window", "click", (event) => {
      if (event.target.id !== "app-menu") {
        this.openAppMenu = "";
      }
      if (event.target.id === "icon-plus" && this.isDisplayleftSide) {
        this.showModal = true;
        if (!this.isModalOpen) {
          this.openModal("add");
        }
      }
      if (event.target.id !== "tooltip-info") {
        this.showHelpText = "";
      }
      if (event.target.id !== "members-menu") {
        this.membersListMenu = "";
      }
      if (
        event.target.id !== "display-menu-options" &&
        event.target.id !== "display-menu"
      ) {
        this.showDisplayMenu = false;
        this.displayMenuOption = "";
      }
      if (event.target.id !== "layout-option") {
        this.showLayoutOptionMenu = 0;
      }
      if (event.target.id !== "category-dropdown") {
        this.showCategoryDropdown = "";
      }
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: "item_id",
      textField: "item_text",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };

    this.appViewService.getAppId().subscribe((appId) => {
      this.changeApplicationForContributedWorkspace(appId);
    });

    this.homeService.getAppIdForMarketPlcae().subscribe((appId) => {
      this.getApps(appId.wsId, this.homeService.wsRole);
      setTimeout(() => {
        this.changeApplicationForMarketWorkspace(
          appId.app,
          appId.marketWsId,
          appId.wsId
        );
      }, 1000);
    });

    this.appViewService.getWorkspaceIdForContributedWS().subscribe((data) => {
      this.goToAddApp(data.data, data.flagForContributed);
    });

    if (!this.appViewService.workspaceAppsList.length) {
      this.appViewService.refreshApps(
        this.workspaceId,
        this.homeService.wsRole
      );
    }

    setTimeout(() => {
      this.getAppsContainerScroll()
    }, 1000);

    setInterval(() => {
      var content = document.getElementById('apps-tabs-container');
      if (content) {
        var scrollWidth = content.scrollWidth;
        content.style.width = scrollWidth + 'px';
      }
    });

  }


  // ngAfterViewInit(){
  //   setTimeout(() => {
  //     this.getAppsContainerScroll()
  //   }, 1000);
  // }

  // ngAfterViewInit(){
  //    // SLIDER
  //    const slider = document.querySelector<HTMLElement>('.apps-tabs-container');

  //    let isDown: any = false;
  //    let startX: any = 0;
  //    let scrollLeft: any = 0;

  //    slider.addEventListener('mousedown', (e) => {
  //      isDown = true;
  //      slider.classList.add('active');
  //      startX = e.pageX - slider.offsetLeft;
  //      scrollLeft = slider.scrollLeft;
  //    });
  //    slider.addEventListener('mouseleave', () => {
  //      isDown = false;
  //      slider.classList.remove('active');
  //    });
  //    slider.addEventListener('mouseup', () => {
  //      isDown = false;
  //      slider.classList.remove('active');
  //    });
  //    slider.addEventListener('mousemove', (e) => {
  //     //  if (!isDown) return;
  //      e.preventDefault();
  //      const x = e.pageX - slider.offsetLeft;
  //      const walk = (x - startX) * 3; //scroll-fast
  //      slider.scrollLeft = scrollLeft - walk;
  //    });
  // }

  goToWebform() {
    this.router.navigate(["/application/home/app-view/webform"], {
      queryParams: {
        appId: this.activeAppId,
        workspaceId: this.workspaceId,
        orgId: this.orgId,
      },
    });
  }

  openSeparateModal(templateClass, template: TemplateRef < any > , type = "") {
    if (document.getElementById("closeRecordModalBtn")) {
      document.getElementById("closeRecordModalBtn").click();
    }
    if (type === "layout-options" && this.viewType === "kanban") {
      // To set the layout options as per the application or to reset it to default
      if (
        this.appViewService.activeApp.layout_options &&
        this.appViewService.activeApp.layout_options.length
      ) {
        this.appViewService.selectedLayoutOptions = JSON.parse(
          JSON.stringify(this.appViewService.activeApp.layout_options)
        );
      } else {
        this.setDefaultLayoutOptions();
      }
      this.modalRef = this.modalService.show(template, {
        class: type,
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false
      });
    } else if (type !== "layout-options") {
      // To reset all the variables used in the share record modal
      this.selectedShareRecordUsers = [];
      this.shareRecordMessage = "";
      this.selectedShareRecordUserIds = [];
      this.suggestedUsers = [];
      this.shareWorkspaceRole = "member";
      if (this.modalRef) {
        this.modalRef.hide();
      }
      if (type) {
        this.shareRecordModalType = type;
      }
      const initialState = {
        class: templateClass,
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false
      };
      this.modalRef = this.modalService.show(template, initialState);
    }
  }

  setDefaultLayoutOptions() {
    const attachmentField = this.appFields.find(
      (field) => field.type === "image"
    );
    const textField = this.appFields.find((field) => field.type === "text");

    let descriptionTextField: any = ''

    const allTextField = this.appFields.filter((field) => field.type === "text");

    if (allTextField.length > 0) {
      descriptionTextField = allTextField[1]
    }

    if (attachmentField) {
      this.appViewService.selectedLayoutOptions[0] = attachmentField;
    }
    if (textField) {
      this.appViewService.selectedLayoutOptions[1] = textField;
    }
    if (descriptionTextField) {
      this.appViewService.selectedLayoutOptions[2] = descriptionTextField;
    }
    this.appViewService.selectedLayoutOptions[3] = {};
  }

  openUploadModal(field) {
    this.selectedImageField = field;
    const initialState = {
      caller: "addRecord",
      uploadType: "multiple"
    };
    const modalParams = Object.assign({}, {
      initialState,
      class: "small-custom-modal",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }

  goToAddApp(workspaceId, flagForContributed ? ) {
    const initialState = {
      workspaceId,
      class: "",
      flagForContributed,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("appname")) {
        document.getElementById("appname").focus();
      }
    });
    const modalParams = Object.assign({}, {
      initialState,
      class: "small-custom-modal",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
    this.modalRef = this.modalService.show(CreateAppComponent, modalParams);
  }

  showGridOptions(option) {
    if (option) {
      this.isShowGridOptions = false;
    } else {
      this.isShowGridOptions = !this.isShowGridOptions;
    }
  }

  toggleHiddenViewMenu() {
    this.showHiddenViewMenu = !this.showHiddenViewMenu;
  }

  modifyHiddenFields(field) {
    if (field.type === "category") {
      field.options["Always hidden"] = !field.options["Always hidden"];
    } else {
      field.options.Hidden = !field.options.Hidden;
    }
    this.setTableHeaders();
    this.getAppRecords(this.activeAppId);
  }

  setForm(categoryVal = {
    label: ""
  }, hiddenFieldsOnly = false) {
    this.invalidDurationFields = [];
    this.invalidImageFields = [];
    this.calculationFields = [];
    this.numberFields = [];
    // To reset form
    this.appForm = this.fb.group({});
    // To reset map data
    this.mapSuggestion = {};
    this.mapData = {};
    // To reset image data
    this.imageData = [];
    // this.imageDisplayData = [];
    // To reset progress data
    this.progressData = {};
    this.modalFields = this.appFields;
    // To reset category data
    this.selectedCategoryMultipleOptions = {};
    this.selectedCategoryOptions = {};
    this.appFields.forEach((field) => {
      if (field.type === "number" || field.type === "money") {
        this.numberFields.push(field);
      }
      if (field.type === "calculator") {
        this.calculationFields.push(field);
      }
      if (field.type === "image" && field.options.Required) {
        this.invalidImageFields.push(field._id);
      }
      if (
        !hiddenFieldsOnly ||
        (field.type !== "category" && !field.options.Hidden) ||
        (field.type === "category" && !field.options["Always hidden"])
      ) {
        switch (field.type) {
          case Constants.APP_FIELD_TYPES.TEXT:
          case Constants.APP_FIELD_TYPES.NUMBER:
          case Constants.APP_FIELD_TYPES.CALCULATOR:
          case Constants.APP_FIELD_TYPES.RELATIONSHIP:
            // this.appForm.addControl(
            //   field.label,
            //   new FormArray([this.addValue('','')])
            // );
          case Constants.APP_FIELD_TYPES.LINK:
            this.appForm.addControl(
              field.label,
              new FormControl("", {
                updateOn: "blur"
              })
            );
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
            break;

          case Constants.APP_FIELD_TYPES.PHONE:
            this.appForm.addControl(
              field.label,
              new FormArray([
                this.addPhoneArrayControl({}, field.options.Required),
              ])
            );
            // if (field.options.Required) {
            //   this.appForm.controls[field.label].setValidators(
            //     Validators.required
            //   );
            // }
            break;

          case Constants.APP_FIELD_TYPES.EMAIL:
            this.appForm.addControl(
              field.label,
              new FormArray([
                this.addEmailArrayControl({}, field.options.Required),
              ])
            );
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
            break;

          case Constants.APP_FIELD_TYPES.MONEY:
            this.appForm.addControl(
              field.label,
              new FormControl("", {
                updateOn: "blur"
              })
            );
            this.appForm.addControl(`${field.label}Type`, new FormControl(""));
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
              this.appForm.controls[`${field.label}Type`].setValidators(
                Validators.required
              );
            }
            break;

          case Constants.APP_FIELD_TYPES.MEMBER:
            this.membersList[field.label] = JSON.parse(
              JSON.stringify(this.wsMembers)
            );
            this.appForm.addControl(field.label, new FormControl(""));
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
            this.membersList[field.label].map((member) => {
              if (member.avatar && member.avatar !== "undefined") {
                member.avatar = environment.MEDIA_URL + member.avatar;
              } else {
                member.avatar = "../../../../../assets/images/user.png";
              }
            });
            break;

          case Constants.APP_FIELD_TYPES.CATEGORY:
            if (
              categoryVal["fieldId"] &&
              categoryVal["fieldId"] === field._id
            ) {
              this.appForm.addControl(
                field.label,
                new FormControl(categoryVal.label)
              );
            } else {
              this.appForm.addControl(field.label, new FormControl(""));
              if (field.options["Required field"]) {
                this.appForm.controls[field.label].setValidators(
                  Validators.required
                );
              }
            }
            break;

          case Constants.APP_FIELD_TYPES.DURATION:
            this.appForm.addControl(
              field.label,
              this.durationControl(field.options, field.options.Required)
            );
            if (field.options.Required) {
              this.invalidDurationFields.push(field._id);
            }
            break;

          case Constants.APP_FIELD_TYPES.PROGRESS:
            this.appForm.addControl(field.label, new FormControl(""));
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
            break;

          case Constants.APP_FIELD_TYPES.LOCATION:
            if (field.options.display === "Single line address") {
              this.appForm.addControl(field.label, new FormControl(""));
              if (field.options.Required) {
                this.appForm.controls[field.label].setValidators(
                  Validators.required
                );
              }
            } else {
              this.appForm.addControl(
                field.label,
                this.locationControl(field.options.Required)
              );
            }
            break;

          case Constants.APP_FIELD_TYPES.DATE:
            this.appForm.addControl(
              field.label,
              new FormControl("", {
                updateOn: "blur"
              })
            );
            if (field.options.display === "Show end date") {
              this.appForm.addControl(
                field.label + "End",
                new FormControl("", {
                  updateOn: "blur"
                })
              );
              if (field.options.Required) {
                this.appForm.controls[field.label + "End"].setValidators(
                  Validators.required
                );
              }
            }
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
            break;
        }
      }
    });
    this.appForm.updateValueAndValidity();
  }

  toggleMembersList(label) {
    if (this.membersListMenu === label) {
      this.membersListMenu = "";
    } else {
      this.membersListMenu = label;
    }
  }

  arrayControl(label) {
    return (this.appForm.get(label) as FormArray).controls;
  }

  // For phone array controls
  addAnotherPhone(label, data = {}) {
    this.phoneArray = this.appForm.get(label) as FormArray;
    this.phoneArray.push(this.addPhoneArrayControl(data));
  }

  addPhoneArrayControl(data: any = {}, isRequired = false) {
    if (Object.keys(data).length) {
      const fg = isRequired ?
        this.fb.group({
          type: [data.type, Validators.required],
          number: [data.number, Validators.required],
        }) :
        this.fb.group({
          type: [data.type],
          number: [data.number],
        });
      return fg;
    } else {
      const fg = isRequired ?
        this.fb.group({
          type: [Constants.PHONE_TYPES[1], Validators.required],
          number: ["", Validators.required],
        }) :
        this.fb.group({
          type: [Constants.PHONE_TYPES[1]],
          number: [""],
        });
      return fg;
    }
  }

  durationControl(options, isRequired) {
    const fg = new FormGroup({});
    if (options["Display days"]) {
      fg.addControl("days", new FormControl(0));
    }
    if (options["Display hours"]) {
      fg.addControl("hours", new FormControl(0));
    }
    if (options["Display minutes"]) {
      fg.addControl("minutes", new FormControl(0));
    }
    if (options["Display seconds"]) {
      fg.addControl("seconds", new FormControl(0));
    }
    // if (isRequired) {
    //   Object.keys(fg.controls).forEach(control => {
    //     fg.controls[control].setValidators([Validators.required, Validators.min(1)]);
    //   });
    // }
    return fg;
  }

  locationControl(isRequired) {
    const fg = this.fb.group({
      streetAddress: new FormControl("", {
        updateOn: "blur"
      }),
      postalCode: new FormControl("", {
        updateOn: "blur"
      }),
      city: new FormControl("", {
        updateOn: "blur"
      }),
      state: new FormControl("", {
        updateOn: "blur"
      }),
      country: new FormControl("", {
        updateOn: "blur"
      }),
    });
    if (isRequired) {
      Object.keys(fg.controls).forEach((control) => {
        fg.controls[control].setValidators(Validators.required);
      });
    }
    return fg;
  }

  durationChange(event, field) {
    let dayFlag = false;
    let hourFlag = false;
    let minuteFlag = false;
    let secondFlag = false;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (this.invalidDurationFields.includes(field._id)) {
      this.invalidDurationFields.splice(
        this.invalidDurationFields.indexOf(field._id),
        1
      );
    }
    if (field.options["Display days"]) {
      days = this.appForm.controls[field.label]["controls"].days.value;
      dayFlag = true;
    }
    if (field.options["Display hours"]) {
      hours = this.appForm.controls[field.label]["controls"].hours.value;
      hourFlag = true;
    }
    if (field.options["Display minutes"]) {
      minutes = this.appForm.controls[field.label]["controls"].minutes.value;
      minuteFlag = true;
    }
    if (field.options["Display seconds"]) {
      seconds = this.appForm.controls[field.label]["controls"].seconds.value;
      secondFlag = true;
    }
    const secondsToMinutes = secondFlag ? Math.floor(seconds / 60) : 0;
    const minutesToHours = minuteFlag ?
      Math.floor((minutes + secondsToMinutes) / 60) :
      0;
    const hoursToDays = hourFlag ?
      Math.floor((hours + minutesToHours) / 24) :
      0;
    const modSeconds = seconds % 60;
    const modMinutes = (minutes + secondsToMinutes) % 60;
    const modHours = (hours + minutesToHours) % 24;
    if (minuteFlag) {
      if (secondsToMinutes > 0) {
        seconds = modSeconds;
        minutes += secondsToMinutes;
      }
    } else {
      minutes = 0;
    }
    if (hourFlag) {
      if (minutesToHours > 0) {
        seconds = modSeconds;
        minutes = modMinutes;
        hours += minutesToHours;
      }
    } else {
      hours = 0;
    }
    if (dayFlag) {
      if (hoursToDays > 0) {
        seconds = modSeconds;
        minutes = modMinutes;
        hours = modHours;
        days += hoursToDays;
      }
    } else {
      days = 0;
    }

    if (dayFlag) {
      this.appForm.controls[field.label]["controls"].days.setValue(days);
    }
    if (hourFlag) {
      this.appForm.controls[field.label]["controls"].hours.setValue(hours);
    }
    if (minuteFlag) {
      this.appForm.controls[field.label]["controls"].minutes.setValue(minutes);
    }
    if (secondFlag) {
      this.appForm.controls[field.label]["controls"].seconds.setValue(seconds);
    }
    this.appForm.updateValueAndValidity();
    this.addRecord(event, field);
  }
  // For email array controls
  addAnotherEmail(label, data = {}) {
    this.emailArray = this.appForm.get(label) as FormArray;
    if (this.emailArray) {
      this.emailArray.push(this.addEmailArrayControl(data));
    }
  }

  addEmailArrayControl(data: any = {}, isRequired = false) {
    if (Object.keys(data).length) {
      const fg = isRequired ?
        this.fb.group({
          type: [data.type, Validators.required],
          text: [data.text, Validators.required],
        }) :
        this.fb.group({
          type: [data.type],
          text: [data.text],
        });
      return fg;
    } else {
      const fg = isRequired ?
        this.fb.group({
          type: [Constants.EMAIL_TYPES[1], Validators.required],
          text: ["", Validators.required],
        }) :
        this.fb.group({
          type: [Constants.EMAIL_TYPES[1]],
          text: [""],
        });
      return fg;
    }
  }

  openImages(images, selected) {
    if (document.querySelector('.carousel-inner .active') !== null) {
      document.querySelector('.carousel-inner .active').classList.remove('active');
    }
    this.carouselImages = [];
    this.carouselImages = images;
    setTimeout(() => {
      document.getElementById(`image-${selected}`).classList.add("active");
    }, 50);
  }

  removeMember(field, index) {
    const member = this.selectedMembers[field.label].splice(index, 1);
    if (!this.selectedMembers[field.label].length) {
      this.appForm.controls[field.label].reset();
    }
    const memberObj = this.wsMembers.find((mem) => mem._id === member[0].id);
    if (memberObj.avatar && memberObj.avatar !== "undefined") {
      memberObj.avatar = environment.MEDIA_URL + memberObj.avatar;
    } else {
      memberObj.avatar = "../../../../../assets/images/user.png";
    }
    this.membersList[field.label].push(memberObj);
    this.addRecord({}, field, "remove");
  }

  closeDp() {
    if (this.dpValueChanged) {
      this.dpValueChanged = false;
      this.dpShown = false;
      this.addRecord(this.dpValue.event, this.dpValue.field, this.dpValue.type);
    }
    this.dpShown = false;
  }

  dpValueChange(event, field, type) {
    this.dpValue = {
      event,
      field,
      type,
    };
    if (this.dpShown) {
      this.dpValueChanged = true;
    }
  }

  addRecord(event, field, type = "", index = "") {

    if (event && !this.openingModal) {
      return new Promise((resolve, reject) => {
        if (field.type === "image") {
          if (type !== "remove") {
            this.imageData.push(...event.addedFiles);
          }
          if (this.invalidImageFields.includes(field._id)) {
            this.invalidImageFields.splice(
              this.invalidImageFields.indexOf(field._id),
              1
            );
          }
        }
        if (field.type === "member" && type === "add") {
          if (!this.selectedMembers[field.label]) {
            this.selectedMembers[field.label] = [];
          }
          this.appForm.controls[field.label].setValue("1");
          this.appForm.updateValueAndValidity();
          this.membersList[field.label].splice(index, 1);
          this.membersListMenu = "";
          const avatar = event.avatar;
          const name = `${event.firstName} ${event.lastName}`;
          const id = event._id;
          this.selectedMembers[field.label].push({
            id,
            name,
            avatar,
          });
        }
        if (field.type === "link") {
          this.getLinkPreview(event.target.value, field.label);
        }
        const formData = new FormData();
        // formData.append("uniqueId", field.uniqueId);
        formData.append("fieldType", field.type);
        formData.append("fieldId", field._id);
        formData.append("application_id", this.activeAppId);
        formData.append(
          "isEventAdd",
          this.firstDateTypeId === field._id ? "true" : "false"
        );
        formData.append("record_id", this.recordId);
        formData.append("uniqueId", this.editSessionId);
        switch (field.type) {
          case this.appFieldTypes.TEXT:

          case this.appFieldTypes.LINK:
            const textData = {
              text: event.target.value
            };
            formData.append("value", JSON.stringify(textData));
            break;
          case this.appFieldTypes.PHONE:
            const telData = {
              tel: this.appForm.controls[field.label].value
            };
            formData.append("value", JSON.stringify(telData));
            break;
          case this.appFieldTypes.CALCULATOR:
            const calData = {
              text: event
            };
            formData.append("value", JSON.stringify(calData));
            break;
          case this.appFieldTypes.NUMBER:
            const numberData = {
              text: event.target.value
            };
            formData.append("value", JSON.stringify(numberData));
            break;
          case this.appFieldTypes.IMAGE:
            if (this.attachmentData[this.recordId]) {
              if (this.attachmentData[this.recordId][field.label]) {
                if (
                  this.attachmentData[this.recordId] &&
                  this.attachmentData[this.recordId][field.label].length
                ) {
                  formData.append(
                    "attachmentData",
                    JSON.stringify(
                      this.attachmentData[this.recordId][field.label]
                    )
                  );
                }
              }
            }
            for (const img of this.imageData) {
              formData.append("value[]", img);
            }
            break;
          case this.appFieldTypes.EMAIL:
            const emailData = {
              text: this.appForm.controls[field.label].value,
            };
            formData.append("value", JSON.stringify(emailData));
            break;
          case this.appFieldTypes.MONEY:
            if (type === "Select Type" && event.target.localName !== "select") {
              type = this.moneyTypes[0];
            }
            const moneyData = {
              number: this.appForm.controls[field.label]["_pendingValue"],
            };
            moneyData[`${field.label}Type`] = type || event.target.value;
            formData.append("value", JSON.stringify(moneyData));
            break;
          case this.appFieldTypes.MEMBER:
            const members = this.selectedMembers[field.label].map(
              (member) => member.id
            );
            const memberData = {
              members
            };
            formData.append("value", JSON.stringify(memberData));
            break;
          case this.appFieldTypes.DATE:
            const dateData: any = {
              date: this.appForm.controls[field.label]["_pendingValue"],
            };
            if (field.options.display === "Show end date") {
              dateData["end"] = this.appForm.controls[field.label + "End"][
                "_pendingValue"
              ];
            }
            if (type === "start") {
              dateData.date = event;
            } else {
              dateData.end = event;
            }
            formData.append("value", JSON.stringify(dateData));
            break;
          case this.appFieldTypes.CATEGORY:
            let categoryVal = "";
            if (field.options.choice === "Single choice") {
              if (event.value) {
                categoryVal = event.value;
              } else {
                // const option = field.options.selectOptions.find(
                //   (option) => option.id === event[0]
                // );
                // if (option) {
                categoryVal = event[0];
                // }
              }
            } else {
              categoryVal = event;
            }
            const categoryData = {
              select: categoryVal
            };
            formData.append("value", JSON.stringify(categoryData));
            break;
          case this.appFieldTypes.PROGRESS:
            const progressData = {
              number: event.value
            };
            this.progressData[field.label] = event.value;
            formData.append("value", JSON.stringify(progressData));
            break;
          case this.appFieldTypes.DURATION:
            const durationData = {};
            if (field.options["Display days"]) {
              durationData["days"] = this.appForm.controls[field.label][
                "controls"
              ].days.value;
            }
            if (field.options["Display hours"]) {
              durationData["hours"] = this.appForm.controls[field.label][
                "controls"
              ].hours.value;
            }
            if (field.options["Display minutes"]) {
              durationData["minutes"] = this.appForm.controls[field.label][
                "controls"
              ].minutes.value;
            }
            if (field.options["Display seconds"]) {
              durationData["seconds"] = this.appForm.controls[field.label][
                "controls"
              ].seconds.value;
            }
            formData.append("value", JSON.stringify(durationData));
            break;
          case this.appFieldTypes.LOCATION:
            if (type === "single") {
              formData.append("value", JSON.stringify(event));
            } else if (type === "multi") {
              const {
                address,
                city,
                country,
                state,
                postal,
                street,
                map,
              } = event;
              formData.append(
                "value",
                JSON.stringify({
                  address,
                  city,
                  country,
                  state,
                  postal,
                  street,
                  map,
                })
              );
            } else {
              const result = {
                address: this.mapData[field.label].address,
                city: this.appForm.controls[field.label]["controls"].city[
                  "_pendingValue"
                ],
                state: this.appForm.controls[field.label]["controls"].state[
                  "_pendingValue"
                ],
                country: this.appForm.controls[field.label]["controls"].country[
                  "_pendingValue"
                ],
                postal: this.appForm.controls[field.label]["controls"]
                  .postalCode["_pendingValue"],
                street: this.mapData[field.label].street,
              };
              formData.append("value", JSON.stringify(result));
            }
            break;
        }
        this.appViewService
          .setField(formData)
          .then((jresponse: JReponse) => {
            this.mapSuggestion = {};
            if (jresponse.success) {
              this.imageData = [];
              this.getAppFields(this.activeAppId, true);
              this.appViewService.updateAppFilters.next({
                id: this.activeAppId,
                fields: this.appFields,
              });
              this.getActivities();
              // if (!this.appViewService.apiCalled) {
              //   this.appViewService.apiCalled = true;
              //   this.appViewService.activeAppId.next('');
              //   this.appViewService.activeAppId.next(this.activeAppId);
              // }
              resolve();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            this.showProgress = false;
            throw err;
          });
      });
    }
  }

  addValue(event, field) {
    this.calculationFields.forEach((fieldObj) => {
      let formula = fieldObj.options.rawFormula;
      this.numberFields.forEach((numObj) => {
        const id = Number(numObj.uniqueId);
        let val = this.appForm.controls[numObj.label]["_pendingValue"];
        val = val.replace(/,/g, "");
        val = val && val !== "" ? val : 0;
        if (formula.includes(id)) {
          while (formula.includes(id)) {
            formula = formula.replace(id, val);
          }
          fieldObj.isChange = true;
          const calculatorVal = eval(formula);
          fieldObj.calculatorVal = calculatorVal;
          this.appForm.controls[fieldObj.label].setValue(calculatorVal);
          this.appForm.updateValueAndValidity();
        }
      });
    });
  }

  getAppId(allApps) {
    // GET OWNER / ADMIN ID
    this.authUserId = this.helperService.getLocalStore("userData").owner;
    // GET OWNER ID
    this.activeAppIdStore = (allApps.filter(element => element.id == this.activeAppId)[0]).owner;

    // CHECK IF APP OWNER === AUTH USER ID
    if (this.authUserId && this.activeAppIdStore) {
      if (this.authUserId === this.activeAppIdStore) {
        this.isOwnerOrAdmin = true;
      }
    }
  }

  getApps(workspaceId, role) {
    this.appViewService
      .getApps(workspaceId)
      .then(async (jresponse: JReponse) => {

        this.allAppsData = jresponse.body;
        // GET ACTIVE APP ID
        if (this.activeAppId) {
          this.getAppId(jresponse.body);
        }

        if (jresponse.success) {
          this.workspaceAppsList = jresponse.body;
          this.appViewService.workspaceAppsList = this.workspaceAppsList;
          this.orgId = this.workspaceAppsList[0].organization_id;
          this.getOrgPlan()
          this.getUsersForMention(
            this.workspaceId,
            "filter",
            this.createdByUserKeyword
          );

          if (!this.activeAppId) {
            this.activeApplication = this.workspaceAppsList[0];
            await this.getAppFields(this.workspaceAppsList[0]._id);
          } else {
            this.activeApplication = this.workspaceAppsList.find(
              (app) => app._id === this.activeAppId
            );
            await this.getAppFields(this.activeAppId);
          }
          this.appViewService.updateAppFilters.next({
            id: this.activeAppId,
            fields: this.appFields,
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getAppFields(appId, toRefresh = false) {
    this.appViewService.selectedAppId = appId;
    // To reset selectedMemberAvatar
    // this.selectedAppTab = ind;
    return new Promise((resolve, reject) => {
      if (this.viewType === "calender") {
        this.appViewService.activeAppId.next(appId);
      }
      this.appViewService.selectedAppTab = this.workspaceAppsList.findIndex(
        (app) => app._id === appId
      );
      this.activeAppId = appId;
      this.appViewService
        .getFields(appId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.appFields = jresponse.body;
            let firstTime = false;
            this.appFields.forEach((element) => {
              if (!firstTime) {
                if (element.type === "date") {
                  this.firstDateTypeId = element._id;
                  firstTime = true;
                }
              }
            });
            // Json
            this.hiddenFields = JSON.parse(JSON.stringify(this.appFields));
            this.displayMenuColumnOptions = [];
            this.displayMenuRowOptions = [];
            this.setDisplayMenuOptions();
            this.setFilterFields();
            if (jresponse.body.length) {
              this.orgId = this.appFields[0].organization_id;
              this.getMembers();

              //  this.getUsersForMention()
              this.getAppRecords(appId);
            }
            // To update the grid view list and relevant data accordingly
            if (!toRefresh) {
              this.setForm();
              this.setTableHeaders();
            }
            // this.setRecordList();
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  setFilterFields() {
    this.filterFields = [];
    this.appFields.forEach((field) => {
      if (
        field.type === "category" ||
        field.type === "date" ||
        field.type === "member" ||
        field.type === "relationship" ||
        field.type === "money" ||
        field.type === "number" ||
        field.type === "calculator" ||
        field.type === "progress"
      ) {
        this.filterFields.push(field);
      }
      if (
        field.type === "location" &&
        field.options.display === "Multi-line address"
      ) {
        const countryField = JSON.parse(JSON.stringify(field));
        countryField.label = `${countryField.label} Country`;
        const stateField = JSON.parse(JSON.stringify(field));
        stateField.label = `${stateField.label} State`;
        const cityField = JSON.parse(JSON.stringify(field));
        cityField.label = `${cityField.label} City`;
        const postcodeField = JSON.parse(JSON.stringify(field));
        postcodeField.label = `${postcodeField.label} Postcode`;
        this.filterFields = [
          ...this.filterFields,
          countryField,
          stateField,
          cityField,
          postcodeField,
        ];
      }
    });
  }

  setTableHeaders() {
    const fields = [];
    this.hiddenFields.forEach((field) => {
      if (
        Constants.GRID_VIEW_FIELD_TYPES.includes(field.type) &&
        ((field.type !== "category" && !field.options.Hidden) ||
          (field.type === "category" && !field.options["Always hidden"]))
      ) {
        fields.push(field);
      }
    });

    this.setHiddenFieldsCount();
    this.gridViewFields = fields;
  }

  setHiddenFieldsCount() {
    this.hiddenFieldsCount = 0;
    this.hiddenFields.forEach((field) => {
      if (
        (field.type !== "category" && field.options.Hidden) ||
        (field.type === "category" && field.options["Always hidden"])
      ) {
        this.hiddenFieldsCount += 1;
      }
    });
  }

  setRecordList() {
    const allRecords = [];
    const gridViewRowFormat = [];
    this.gridViewFields.forEach(() => gridViewRowFormat.push(""));
    const canDeleteArray = [];
    this.canDeleteRecords = [];
    let recIndex = -1;
    this.recordData.forEach((record) => {
      if (record.data.length) {
        recIndex += 1;
        // To enter values as per the field format
        const recordValues = gridViewRowFormat.slice();
        record.data.forEach((recordData) => {
          const imageField = this.appFields.find(
            (field) =>
            field._id === recordData.field_id && field.type === "image"
          );
          if (imageField) {
            this.imageDisplayData[record._id] = {};
            this.attachmentData[record._id] = {};
            this.imageDisplayData[record._id][imageField.label] = [];
            this.attachmentData[record._id][imageField.label] = [];
            if (recordData.value) {

              recordData.value.image.forEach((img) => {
                let src = environment.MEDIA_URL;
                src +=
                  img.attachment.type === "img" ?
                  img.attachment.path :
                  img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length) ?
                  img.thumbs[0].thumbPath :
                  (img.attachment.path + ',' + img.attachment.type);

                this.attachmentData[record._id][imageField.label].push(img);

                this.imageDisplayData[record._id][imageField.label].push({
                  source: src,
                  data: img.attachment,
                  type: img.attachment.type,
                  path: environment.MEDIA_URL + img.attachment.path,
                  ext: img.attachment.ext
                });
              });
            }
          }
          const field = this.gridViewFields.find(
            (data) => data._id === recordData.field_id
          );
          const fieldIndex = this.gridViewFields.findIndex(
            (data) => data._id === recordData.field_id
          );
          if (field) {
            if (recordData.value) {
              recordData.value.label = field.label;
            }
            recordValues[fieldIndex] = recordData;
            recordData.fieldType = field.type;
            if (recordData.value) {
              recordData.displayVal =
                recordData.value.text ||
                recordData.value.number ||
                recordData.value.tel ||
                recordData.value.select ||
                recordData.value.date;
              recordData.value.fieldType = field.type;
            }
            recordData.rawFormula = field.options.rawFormula;
            recordData.uniqueId = field.uniqueId;
            recordData.selectedRecord =
              field.type === "relationship" ? recordData.value.text : [];
            if (recordData.selectedRecord.length) {
              recordData.selectedRecord.forEach(record => {
                if (record && record.categoryObj) {
                  const cat = record.categoryObj.find(c => c.id === record.selectedCategory);
                  if (cat) {
                    record.selectedCategoryColor = cat.color;
                  }
                }
              });
            }
            if (field.type === "image") {
              if (recordData.value) {
                recordData.displayVal = recordData.value.image;
              }
            }
            if (field.type === "date") {
              recordData.date = moment(recordData.value.date).format(
                "MMM DD, YYYY"
              );
              if (recordData.value.date) {
                recordData.displayVal = recordData.date;
              }
            }
            if (typeof recordData.displayVal === "object") {
              recordData.displayType = "multi";
            } else {
              recordData.displayType = "single";
            }
            if (field.type === "category") {
              recordData.displayType = "single";
              if (typeof recordData.displayVal === "string") {
                const option = field.options.selectOptions.find(
                  (op) => op.id === recordData.displayVal
                );
                if (option) {
                  recordData.selectedOption = option.id;
                  recordData.displayVal = option.label;
                }
              } else if (recordData.displayVal) {
                recordData.displayVal = recordData.displayVal.reduce(
                  (result, optionId, ind) => {
                    const optionData = field.options.selectOptions.find(
                      (op) => op.id === optionId
                    );
                    result += ` ${optionData.label}${ind !== recordData.displayVal.length - 1 ? "," : ""
                      }`;
                    return result;
                  },
                  ""
                );
              }
            }
            if (field.type === "duration") {
              recordData.displayVal = {
                days: recordData.value.days || "",
                hours: recordData.value.hours || "",
                minutes: recordData.value.minutes || "",
                seconds: recordData.value.seconds || "",
              };
              recordData.displayType = "single";
            }
            if (
              field.type === "date" &&
              field.options.display === "Show end date" &&
              recordData.value.end &&
              recordData.value.end !== recordData.displayVal
            ) {
              recordData.displayVal = `${moment(recordData.value.date).format(
                "MMM DD, YYYY"
              )} - ${moment(recordData.value.end).format("MMM DD, YYYY")}`;
              recordData.end = recordData.value.end;
            }
            if (field.type === "location") {
              recordData.displayVal = "";
              if (recordData.value.street && recordData.value.street !== " ") {
                recordData.displayVal += recordData.value.street;
              }
              if (recordData.value.city && recordData.value.city !== " ") {
                if (recordData.displayVal && recordData.displayVal !== " ") {
                  recordData.displayVal += ", " + recordData.value.city;
                } else {
                  recordData.displayVal += recordData.value.city;
                }
              }
              if (recordData.value.state && recordData.value.state !== " ") {
                if (recordData.displayVal && recordData.displayVal !== " ") {
                  recordData.displayVal += ", " + recordData.value.state;
                } else {
                  recordData.displayVal += recordData.value.state;
                }
              }
              if (recordData.value.postal && recordData.value.postal !== " ") {
                if (recordData.displayVal && recordData.displayVal !== " ") {
                  recordData.displayVal += ", " + recordData.value.postal;
                } else {
                  recordData.displayVal += recordData.value.postal;
                }
              }
              if (
                recordData.value.country &&
                recordData.value.country !== " "
              ) {
                if (recordData.displayVal && recordData.displayVal !== " ") {
                  recordData.displayVal += ", " + recordData.value.country;
                } else {
                  recordData.displayVal += recordData.value.country;
                }
              }
              recordData.locationType =
                field.options.display === "Multi-line address" ?
                "multi" :
                "single";
            }
            if (field.type === "member") {
              recordData.displayVal = [];
              if (recordData.value.members.length) {
                recordData.value.members.forEach((memberId, ind) => {
                  const recordMember = this.wsMembers.find(
                    (member) => member._id === memberId
                  );
                  if (recordMember) {
                    recordData.displayVal.push({
                      name: `${recordMember.firstName} ${recordMember.lastName}`,
                      id: recordMember._id,
                    });
                  }
                });
              }
              // this.appForm.controls[recordData.value.label].setValue(this.selectedItems);
              // recordData.displayVal = `${recordMember.firstName} ${recordMember.lastName}`;
            }
            if (field.type === "relationship") {
              recordData.displayType = "single";
              recordData.selectedRecord = _.compact(recordData.value.text);
              recordData.displayVal = _.map(
                _.compact(recordData.value.text),
                (val) => {
                  if (!_.isEmpty(val)) {
                    return val.recordName;
                  }
                }
              );
              field.selectedRecord = _.compact(recordData.value.text);
            }
          }
        });
        const obj = {
          id: record._id,
          data: recordValues,
          canDelete: record.appOwner || record.recordOwner || record.admin,
        };
        if (obj.canDelete) {
          canDeleteArray.push(recIndex);
          this.canDeleteRecords.push(recIndex);
        }
        allRecords.push(obj);
      }
    });
    this.formattedRecordData = allRecords;
    this.formattedRecordDataAgGrid = [];
    this.formattedRecordData.forEach((element) => {
      if (element) {
        this.formattedRecordDataAgGrid.push(element.data);
      }
    });
    this.nextFormattedRecordDataAgGrid = [];
    this.formattedRecordDataAgGrid.forEach((records) => {
      const data = {};
      records.forEach((rowCell) => {
        if (rowCell) {
          if (rowCell.fieldType === "money") {
            data[rowCell.value.label + "Type"] = JSON.parse(
              JSON.stringify(rowCell.value[rowCell.value.label + "Type"])
            );
          }
          if (rowCell.displayVal) {
            const labelType = rowCell.value.label + "$" + rowCell.fieldType;
            data[labelType] = JSON.parse(JSON.stringify(rowCell.displayVal));
          }
        }
      });
      this.nextFormattedRecordDataAgGrid.push(data);
    });

    this.columnDefs = [{
      headerComponentParams: {
        template: '<div class="ag-cell-label-container" role="presentation">' +
          '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
          '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
          '    <span class="ag-header-cell-text" role="columnheader"><div id="add-icon-grid" class="add-icon"><img id="icon-plus" src="../../../../../assets/images/ico-plus.svg"></div></span>' +
          "  </div>" +
          "</div>",
      },
      minWidth: 50,
      maxWidth: 50,
      sortable: false,
      valueGetter: "node.rowIndex + 1",
      cellClassRules: {
        "first-cell-rules": function (params) {
          if (canDeleteArray.includes(params.value - 1)) {
            return true;
          } else {
            return false;
          }
        },
      },
      cellStyle: function (params) {
        if (!canDeleteArray.includes(params.value - 1)) {
          return {
            textAlign: 'center'
          };
        }
        return null;
      },
      cellRenderer: this.nextFormattedRecordDataAgGrid.length === 0 ?
        this.countryCellRendererForNullData :
        this.countryCellRenderer,
    }, ];
    this.gridViewFields.forEach((element) => {
      this.columnDefs.push({
        headerComponentParams: {
          template: '<div class="ag-cell-label-container" role="presentation">' +
            '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
            '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
            '    <span class="ag-header-cell-text" role="columnheader">' +
            '<img src="' +
            element.icon +
            '">' +
            element.label +
            '<div class="sort-icon"><img src="../../../../../assets/images/ico-up-arrow.svg"><img src="../../../../../assets/images/ico-down-arrow.svg"></div></span>' +
            "  </div>" +
            "</div>",
        },
        sortable: true,
        sortingOrder: ["asc", "desc"],
        width: 180,
      });
    });

    if (this.columnDefs.length >= 6) {
      this.defaultColDef = {
        resizable: true
      };
    } else {
      this.defaultColDef = {
        flex: 1,
        resizable: true
      };
    }

    const cloneGridView = [
      ...this.gridViewFields.map((element) => ({
        ...element
      })),
    ];
    const cloneNextFormatted = [
      ...this.nextFormattedRecordDataAgGrid.map((element) => ({
        ...element
      })),
    ];

    for (let i = 0; i < this.columnDefs.length; i++) {
      if (i !== 0) {
        if (this.nextFormattedRecordDataAgGrid[0]) {
          let t = "";
          for (let j = 0; j < this.gridViewFields.length; j++) {
            const element = {
              ...this.gridViewFields[j]
            };
            if (
              element.label + "$" + element.type ===
              Object.keys(this.nextFormattedRecordDataAgGrid[0])[0]
            ) {
              delete this.nextFormattedRecordDataAgGrid[0][
                Object.keys(this.nextFormattedRecordDataAgGrid[0])[0]
              ];
            }
            t = element.label + "$" + element.type;
            this.gridViewFields.splice(j, 1);
            break;
          }
          this.columnDefs[i].field = t;
        }
      } else {
        this.columnDefs[i].field = "index";
      }
    }

    this.gridViewFields = [...cloneGridView];
    this.nextFormattedRecordDataAgGrid = [...cloneNextFormatted];

    this.columnDefs.forEach((element) => {
      // if (element.field === "Attachment") {
      if (element.field) {
        if (element.field.split("$")[1] === "image") {

          element.cellRenderer = this.attachmentCellRenderer;
          element.sortable = false;
        }
      }
    });

    for (let i = 0; i < this.nextFormattedRecordDataAgGrid.length; i++) {
      Object.keys(this.nextFormattedRecordDataAgGrid[i]).forEach((element) => {
        const keys = element.split("$")[1];
        if (keys === "email") {
          if (this.nextFormattedRecordDataAgGrid[i][element].length > 0) {
            for (
              let index = 0; index < this.nextFormattedRecordDataAgGrid[i][element].length; index++
            ) {
              if (this.nextFormattedRecordDataAgGrid[i][element][index]) {
                const typeString = this.nextFormattedRecordDataAgGrid[i][
                    element
                  ][index].type ?
                  "(" +
                  this.nextFormattedRecordDataAgGrid[i][element][index].type +
                  ")" :
                  "";
                const temp1: string =
                  this.nextFormattedRecordDataAgGrid[i][element][index].text +
                  " " +
                  typeString;
                this.nextFormattedRecordDataAgGrid[i][element][index] = temp1;
              }
            }
          } else {
            if (this.nextFormattedRecordDataAgGrid[i][element][0]) {
              const typeString = this.nextFormattedRecordDataAgGrid[i][
                  element
                ][0].type ?
                "(" +
                this.nextFormattedRecordDataAgGrid[i][element][0].type +
                ")" :
                "";
              const temp1: string =
                this.nextFormattedRecordDataAgGrid[i][element][0].text +
                " " +
                typeString;
              this.nextFormattedRecordDataAgGrid[i][element][0] = temp1;
            }
          }
        }
        if (keys === "phone") {
          if (this.nextFormattedRecordDataAgGrid[i][element].length > 0) {
            for (
              let index = 0; index < this.nextFormattedRecordDataAgGrid[i][element].length; index++
            ) {
              if (this.nextFormattedRecordDataAgGrid[i][element][index]) {
                const typeString = this.nextFormattedRecordDataAgGrid[i][
                    element
                  ][index].type ?
                  "(" +
                  this.nextFormattedRecordDataAgGrid[i][element][index].type +
                  ")" :
                  "";
                const temp1: string =
                  this.nextFormattedRecordDataAgGrid[i][element][index].number +
                  " " +
                  typeString;
                this.nextFormattedRecordDataAgGrid[i][element][index] = temp1;
              }
            }
          } else {
            if (this.nextFormattedRecordDataAgGrid[i][element][0]) {
              const typeString = this.nextFormattedRecordDataAgGrid[i][
                  element
                ][0].type ?
                "(" +
                this.nextFormattedRecordDataAgGrid[i][element][0].type +
                ")" :
                "";
              const temp1: string =
                this.nextFormattedRecordDataAgGrid[i][element][0].number +
                " " +
                typeString;
              this.nextFormattedRecordDataAgGrid[i][element][0] = temp1;
            }
          }
        }
        if (keys === "member") {
          if (this.nextFormattedRecordDataAgGrid[i][element].length > 0) {
            for (
              let index = 0; index < this.nextFormattedRecordDataAgGrid[i][element].length; index++
            ) {
              if (this.nextFormattedRecordDataAgGrid[i][element][index]) {
                const temp1: string = this.nextFormattedRecordDataAgGrid[i][
                  element
                ][index].name;
                this.nextFormattedRecordDataAgGrid[i][element][index] = temp1;
              }
            }
          } else {
            if (this.nextFormattedRecordDataAgGrid[i][element][0]) {
              const temp1: string = this.nextFormattedRecordDataAgGrid[i][
                element
              ][0].name;
              this.nextFormattedRecordDataAgGrid[i][element][0] = temp1;
            }
          }
        }
        if (keys === "duration") {
          const temp1: string = this.nextFormattedRecordDataAgGrid[i][element]
            .days ?
            this.nextFormattedRecordDataAgGrid[i][element].days + " Days " :
            "";
          const temp2: string = this.nextFormattedRecordDataAgGrid[i][element]
            .hours ?
            this.nextFormattedRecordDataAgGrid[i][element].hours + " Hours " :
            "";
          const temp3: string = this.nextFormattedRecordDataAgGrid[i][element]
            .minutes ?
            this.nextFormattedRecordDataAgGrid[i][element].minutes +
            " Minutes " :
            "";
          this.nextFormattedRecordDataAgGrid[i][element] =
            temp1 + temp2 + temp3;
        }
        if (keys === "money") {
          const temp1: string = this.nextFormattedRecordDataAgGrid[i][element.split("$")[0] + "Type"];
          const temp2: string = this.nextFormattedRecordDataAgGrid[i][element];
          this.nextFormattedRecordDataAgGrid[i][element] = temp1 === temp2 ? temp1 : temp1 + " " + temp2;
        }
      });
    }

    this.lastIndexOfRowData = this.nextFormattedRecordDataAgGrid.length;

    this.pinnedBottomRowData = this.createData(1);

    if (this.nextFormattedRecordDataAgGrid.length === 0) {
      this.tempNullData = [];
      this.tempNullData.push({});
    } else {
      this.tempNullData = [];
    }

    if (this.isCalendarShow) {
      this.cdRef.detectChanges();
    }

    if (this.toOpenRecordId) {
      const formattedRecord = this.formattedRecordData.find(
        (rec) => rec.id === this.toOpenRecordId
      );
      this.openModal("edit", formattedRecord);
    }
    setTimeout(() => {
      const el = document.getElementById("add-icon-grid");
      if (el) {
        el.addEventListener("touchstart", this.plusButtonClick, {
          passive: true
        });
      }
    }, 2000);
  }

  createData(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({});
    }
    return result;
  }

  onSortChanged(e: AgGridEvent) {
    e.api.refreshCells();
  }

  public onCellClicked($event) {
    if (this.isDisplayleftSide) {
      if (
        $event.colDef.field !== "index" &&
        Object.keys($event.data).length > 0
      ) {
        this.openModal("edit", this.formattedRecordData[$event.node.id]);
      } else if (
        $event.colDef.field === "index" &&
        Object.keys($event.data).length > 0
      ) {
        if (this.canDeleteRecords.includes(($event.value - 1))) {
          this.deleteRecord(this.formattedRecordData[$event.node.id]);
        }
      } else {
        this.showModal = true;
        this.openModal("add");
      }
    }
  }

  countryCellRenderer(params) {
    return params.node.rowPinned === "bottom" ?
      "<div class='add-icon'><img src='../../../../../assets/images/ico-plus.svg'></div>" :
      params.value;
  }

  countryCellRendererForNullData() {
    return "<div class='add-icon'><img src='../../../../../assets/images/ico-plus.svg'></div>";
  }

  attachmentCellRenderer(params) {

    function getFileIconUsingExtension(extension: any) {
      switch (extension) {
        case '.ods':
          return ("../../../../../../assets/images/file-types/Ods.svg");
          break;
        case '.odt':
          return ("../../../../../../assets/images/file-types/Odt.svg");
          break;
        case '.ppt':
        case 'application/mspowerpoint':
        case 'application/powerpoint':
        case 'application/vnd.ms-powerpoint':
          return ("../../../../../../assets/images/file-types/ppt.svg");
          break;
        case '.pptx':
        case 'application/x-mspowerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return ("../../../../../../assets/images/file-types/Pptx.svg");
          break;
        case '.doc':
        case 'application/msword':
        case 'application/doc':
        case 'application/ms-doc':
        case 'application/msword':
          return ("../../../../../../assets/images/file-types/Doc.svg");
          break;
        case '.docx':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return ("../../../../../../assets/images/file-types/Docx.svg");
          break;
        case '.xls':
        case 'application/excel':
        case 'application/vnd.ms-excel':
          return ("../../../../../../assets/images/file-types/Xls.svg");
          break;
        case '.xlsx':
        case 'application/x-excel':
        case 'application/x-msexcel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return ("../../../../../../assets/images/file-types/Xlsx.svg");
          break;
        case '.mov':
          return ("../../../../../../assets/images/file-types/Mov.svg");
          break;
        case '.mp3':
          return ("../../../../../../assets/images/file-types/Mp3.svg");
          break;
        case '.mp4':
          return ("../../../../../../assets/images/file-types/Mp4.svg");
          break;
        case '.avi':
        case 'video/avi':
          return ("../../../../../../assets/images/file-types/avi.svg");
          break;
        case '.csv':
          return ("../../../../../../assets/images/file-types/Csv.svg");
          break;
        case '.wmv':
          return ("../../../../../../assets/images/file-types/Wmv.svg");
          break;
        case '.text':
          return ("../../../../../../assets/images/file-types/Txt.svg");
          break;
        case '.pdf':
          return ("../../../../../../assets/images/file-types/pdf.svg");
          break;
        default:
          return ("../../../../../../assets/images/documents.svg");
          break;
      }
    }

    if (params.value) {
      if (params.value.length === 1) {

        let src = params.value[0].attachment.type === "img" ?
          params.value[0].attachment.path :
          params.value[0].attachment.type === "vid" ? params.value[0].thumbs[1].thumbPath : (params.value[0].thumbs && params.value[0].thumbs.length) ?
          params.value[0].thumbs[0].thumbPath :
          (params.value[0].attachment.path + ',' + params.value[0].attachment.type);

        var thumbData = ""

        if (params.value[0].attachment.type == "doc") {
          thumbData = `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${getFileIconUsingExtension(params.value[0].attachment.ext)}'></div>`;
        } else if (params.value[0].attachment.type == "audio") {
          thumbData = `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${getFileIconUsingExtension(params.value[0].attachment.ext)}'></div>`;
        } else {
          thumbData = `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${environment.MEDIA_URL + src
            }'></div>`;
        }


        return params.node.rowPinned !== "bottom" ?
          thumbData :
          "";
      } else {
        let htmlString = "";
        for (let index = 0; index < params.value.length; index++) {
          const element = params.value[index];
          // for (let j = 0; j < element.thumbs.length; j++) {
          //   const innerElement = element.thumbs[j];
          let src = element.attachment.type === "img" ?
            element.attachment.path :
            element.attachment.type === "vid" ? element.thumbs[1].thumbPath : (element.thumbs && element.thumbs.length) ?
            element.thumbs[0].thumbPath :
            element.attachment.type;

          if (element.attachment.type == "doc") {
            htmlString += `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${getFileIconUsingExtension(element.attachment.ext)}'></div>`;
          } else if (element.attachment.type == "audio") {
            htmlString += `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${getFileIconUsingExtension(element.attachment.ext)}'></div>`;
          } else {
            htmlString += `<div style="padding-right: 5px;"><img style="height: 20px; width: 25px; object-fit: contain;" src='${environment.MEDIA_URL + src
              }'></div>`;
          }

          // }
        }
        return params.node.rowPinned !== "bottom" ?
          `<span style="display: inline-flex;">${htmlString}</span>` :
          "";
      }
    }
  }

  async openModal(type, recordData = "") {
    if (type == 'new') {
      this.selectedRecord = [];
      this.imageDisplayData = {};
      this.progressData = {};
    }
    this.editComment = '&nbsp;';
    this.showValidationErrors = false;
    this.showModal = true;
    await this.getUsersForMention(
      this.workspaceId,
      "mention",
      this.createdByUserKeyword
    );
    this.appForm.reset();
    await this.getMembers();

    this.editSessionId = uuid();
    if (
      type === "add" ||
      type === "category" ||
      type === "member" ||
      type === "calendar" ||
      type === "new"
    ) {
      // To reset form and other sections
      type === "category" || (type === "member" && this.recordCategory) ?
        this.setForm(this.recordCategory, true) :
        this.setForm({
          label: ""
        }, true);
      this.appActivities = [];
      this.appComments = [];

      // To reset selected member
      this.selectedMembers = {};

      this.appViewService
        .getRecordId({
          application_id: this.activeAppId,
          data: []
        })
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.recordId = jresponse.body.record_id;
            this.openingModal = false;
            if (type === "category" || type === "member") {
              // Formatting the object as per the event object in order to use the addRecord function directly
              const obj = {
                value: this.recordCategory.id
              };
              const categoryField = this.appFields.find(
                (field) => field._id === this.recordCategory.fieldId
              );
              if (type === "member") {
                this.appViewService.apiCalled = true;
              }
              if (categoryField) {
                this.selectedCategoryOptions[this.recordId] = {};
                const option = categoryField.options.selectOptions.find(
                  (option) => option.id === this.recordCategory.id
                );
                this.selectedCategoryOptions[this.recordId][
                  categoryField._id
                ] = [option.id];
                await this.addRecord(obj, categoryField);
              }
            }
            if (type === "member") {
              const memberField = this.appFields.find(
                (field) => field._id === this.newMultiValueRecordData.fieldId
              );
              this.appViewService.apiCalled = false;
              if (
                this.newMultiValueRecordData.member &&
                this.newMultiValueRecordData.member !== "none" &&
                memberField
              ) {
                // tslint:disable-next-line: max-line-length
                const memberData = JSON.parse(
                  JSON.stringify(
                    this.appViewService.wsMembers.find(
                      (member) =>
                      member._id === this.newMultiValueRecordData.member
                    )
                  )
                );
                memberData.avatar =
                  memberData.avatar && memberData.avatar !== "undefined" ?
                  environment.MEDIA_URL + memberData.avatar :
                  "../../../../../assets/images/user.png";
                // tslint:disable-next-line: max-line-length
                const index = this.membersList[memberField.label].findIndex(
                  (member) => member._id === this.newMultiValueRecordData.member
                );
                await this.addRecord(memberData, memberField, "add", index);
              }
            }
            if (type !== "new") {
              document.getElementById("recordModalButton").click();
            }
            setTimeout(() => {
              this.isModalOpen = true;
            }, 200);
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });

      this.appViewService.apiCalled = false;
    } else if (type === "edit") {
      // this.openingModal = true;
      // To reset selected member
      this.selectedMembers = {};
      this.setForm({
        label: ""
      }, true);
      // To set form values only after the form is set
      setTimeout(() => {
        this.setFormValues(recordData);
        const record = this.recordData.find(rec => rec._id === this.recordId);
        if (record) {
          this.followers = record.followers;
        }
      }, 0);
    }
  }

  followRecord(recordId = this.recordId) {
    this.apiService.postWithHeader(`record/follow`, {
        recordId
      })
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (this.followers.includes(this.userData.owner)) {
            this.followers.splice(this.followers.indexOf(this.userData.owner), 1);
          } else {
            this.followers.push(this.userData.owner);
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  getRolesAccess(allMembers) {
    // GET AUTH USER ID
    this.authUserId = this.helperService.getLocalStore("userData").owner;
    // GET OWNER USER
    const getAuthAppMember = allMembers.filter(element => element._id === this.authUserId)[0];
    if (getAuthAppMember) {
      const isWorkspaceAdmin = getAuthAppMember.role;
      if (isWorkspaceAdmin === 'admin') {
        this.isWorkspaceAdmin = true;
      }
      if (this.activeAppId) {
        const getActiveAppMember = this.allAppsData.filter(element => element.id === this.activeAppId)[0];
        this.isActiveAppAdmin = false;
        if (getActiveAppMember.owner === this.authUserId || this.isWorkspaceAdmin) {
          this.isActiveAppAdmin = true;
        }
      }
    }
  }


  async getMembers(keyword = "", toSearch = false) {

    return new Promise((resolve, reject) => {

      this.appViewService
        // .getWithHeader(`workspace/${this.workspaceId}/user-management`)
        .getAllMembersEmployeesOfOrgAndWS(this.orgId)
        // .getMembers(this.orgId)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            if (jresponse.success) {

              // GET ACCESS ON BASISS OF AUTH ROLES & ACTIVE APP ID
              this.getRolesAccess(jresponse.body);

              if (!toSearch) {
                this.members = jresponse.body;
                this.appViewService.members = this.members;
                this.mentionUsersList = [];
                this.mentionUsersList = this.members;
                this.mentionUsersList = this.mentionUsersList.filter(
                  (element) => {
                    return element !== null;
                  }
                );
                if (this.mentionUsersList.length) {
                  console.log('this.mentionUsersList', this.mentionUsersList)
                  this.mentionUsersList = this.mentionUsersList.map((e) => {
                    return {
                      fullName: e.lastName && !_.isEmpty(e.lastName) ? e.firstName + ' ' + e.lastName : e.firstName
                    };
                  });
                }
              }
              this.createdByUserList = jresponse.body;
              resolve();
              this.formatMultiselectOptions();
            }
          }
        })
        .catch((err: any) => {
          throw err;
        });

    });
  }

  getLinkPreview(url, label) {
    this.appViewService
      .getLinkPreview(url)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (!this.linkPreviewData[this.recordId]) {
            this.linkPreviewData[this.recordId] = {};
          }
          if (jresponse.body.html) {
            this.linkPreviewData[this.recordId][label] = jresponse.body;
          } else {
            delete this.linkPreviewData[this.recordId][label];
          }
        }
      })
      .catch((err: Error) => {
        if (
          this.linkPreviewData[this.recordId] &&
          this.linkPreviewData[this.recordId][label]
        ) {
          delete this.linkPreviewData[this.recordId][label];
        }
        throw err;
      });
  }

  async getAppRecords(appId, additional = "", applyFilters = false) {
    const view = this.activeView;
    if (additional) {
      additional = `sort_mode=${this.sortType}&sort_by=${additional}`;
      this.sortType =
        this.sortType === "desc" ?
        (this.sortType = "asc") :
        (this.sortType = "desc");
    }
    this.appViewService
      .getAppRecords(appId, additional, view, applyFilters)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.recordData = jresponse.body;
          this.setRecordList();
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  setFormValues(record, toRefresh = false) {
    // To set current record's id
    this.recordId = record.id;
    this.getComments();
    this.getActivities();
    // Reset multiple option dropdown values
    this.selectedCategoryMultipleOptions = {};
    // Reset selected members
    this.selectedItems = {};
    // Reset link html data
    this.linkPreviewData = {};
    const particularRecord = this.recordData.find(
      (fieldRecord) => fieldRecord._id === record.id
    );
    // For category fields
    // tslint:disable-next-line: max-line-length

    // return false;
    particularRecord.data
      .filter((data) => Object.keys(data.value).includes("select"))
      .forEach((field) => {
        const recordField = this.appFields.find(
          (appField) => appField._id === field.field_id
        );
        if (recordField) {
          this.appForm.controls[recordField.label].setValue(field.value.select);
        }
      });

    // For image fields
    // particularRecord.data
    //   .filter((data) => Object.keys(data.value).includes("image"))
    //   .forEach((field) => {
    //     const label = this.appFields.find(
    //       (appField) => appField._id === field.field_id
    //     ).label;
    //     // this.imageData[this.recordId] = {};
    //     // this.imageData[this.recordId][label] =
    //     //   environment.MEDIA_URL + field.value.image;
    //   });
    // For rest of the fields
    record.data.forEach((record) => {
      if (record) {
        // if (record.value.fieldType === "number" || record.value.fieldType === "money") {
        //   this.numberFields.push(record);
        // }
        // if (record.value.fieldType === "calculator") {
        //   this.calculationFields.push(record);
        // }
        if (this.imageDisplayData[this.recordId]) {
          if (
            record.fieldType === "image" &&
            this.imageDisplayData[this.recordId][record.value.label].length
          ) {
            const ind = this.invalidImageFields.indexOf(record.field_id);
            this.invalidImageFields.splice(ind, 1);
          }
        }
        if (record.displayType === "multi") {
          // To remove the empty control
          if (record.value.fieldType === "phone") {
            this.phoneArray = this.appForm.get(record.value.label) as FormArray;
            if (this.phoneArray) {
              this.phoneArray.removeAt(0);
            }
          } else if (record.value.fieldType === "email") {
            this.emailArray = this.appForm.get(record.value.label) as FormArray;
            if (this.emailArray) {
              this.emailArray.removeAt(0);
            }
          }
          // To set values in form array
          record.displayVal.forEach((data) => {
            if (record.value.fieldType === "phone") {
              this.addAnotherPhone(record.value.label, data);
            } else if (record.value.fieldType === "email") {
              this.addAnotherEmail(record.value.label, data);
            }
          });
        } else if (
          record.displayType === "single" &&
          record.value.fieldType !== "duration" &&
          record.value.fieldType !== "member" &&
          record.value.fieldType !== "location" &&
          record.value.fieldType !== "category"
        ) {
          this.appForm.controls[record.value.label].setValue(record.displayVal);
          if (record.value[`${record.value.label}Type`] && (record.value[`${record.value.label}Type`] !== record.value.number)) {
            this.appForm.controls[`${record.value.label}Type`].setValue(
              record.value[`${record.value.label}Type`]
            );
          }
          if (
            this.appFields.find((field) => field._id === record.field_id)
            .options.lines === "Multi line"
          ) {
            this.setTextArea.push(record.value.label);
          }
        } else if (record.value.fieldType === "duration") {
          let validDuration = false;
          Object.keys(record.displayVal).forEach((key) => {
            if (record.value[key]) {
              validDuration = true;
              this.appForm.controls[record.value.label]["controls"][
                key
              ].setValue(record.value[key]);
            }
          });
          if (validDuration) {
            this.invalidDurationFields.splice(
              this.invalidDurationFields.indexOf(record.field_id),
              1
            );
          }
          // this.appForm.controls[record.value.label]["controls"].hours.setValue(record.value.hours);
          // this.appForm.controls[record.value.label]["controls"].minutes.setValue(record.value.minutes);
          // this.appForm.controls[record.value.label]["controls"].seconds.setValue(record.value.seconds);
        } else if (record.value.fieldType === "member" && record.displayVal) {
          const members = [];
          const selectedMembers = [];
          record.displayVal.forEach((member, ind) => {
            // this.dropdownList.find(el => el.item_text === member.name);
            const mem = this.dropdownList.find(
              (el) => el.item_text === member.name
            );
            if (mem) {
              members.push({
                item_id: mem.item_id,
                item_text: member.name,
              });
            }
            const m = this.wsMembers.find((mem) => mem._id === member.id);
            selectedMembers.push({
              id: m._id,
              // tslint:disable-next-line: max-line-length
              avatar: m.avatar && m.avatar !== "undefined" ?
                environment.MEDIA_URL + m.avatar :
                "../../../../../assets/images/user.png",
              name: `${m.firstName} ${m.lastName}`,
            });
            // tslint:disable-next-line: max-line-length
            this.membersList[record.value.label].splice(
              this.membersList[record.value.label].findIndex(
                (member) => m._id === member._id
              ),
              1
            );
          });
          this.selectedItems[record.value.label] = members;
          this.selectedMembers[record.value.label] = selectedMembers;
          if (selectedMembers.length) {
            this.appForm.controls[record.value.label].setValue("1");
            this.appForm.updateValueAndValidity();
          }
          // this.appForm.controls[record.value.label].setValue(this.selectedItems);
        } else if (record.value.fieldType === "location") {
          this.mapData[record.value.label] = record.value;
          if (record.locationType === "single") {
            this.appForm.controls[record.value.label].setValue(
              record.value.address
            );
          } else {
            this.appForm.controls[record.value.label][
              "controls"
            ].streetAddress.setValue(record.value.street);
            this.appForm.controls[record.value.label][
              "controls"
            ].postalCode.setValue(record.value.postal);
            this.appForm.controls[record.value.label]["controls"].city.setValue(
              record.value.city
            );
            this.appForm.controls[record.value.label][
              "controls"
            ].state.setValue(record.value.state);
            this.appForm.controls[record.value.label][
              "controls"
            ].country.setValue(record.value.country);
          }
        }
        if (record.value.fieldType === "relationship") {
          this.selectedRecord[record.value.label] = _.compact(
            record.value.text
          );
        }
        if (record.value.fieldType === "link") {
          // this.linkPreviewData[this.recordId] = {};
          // this.linkPreviewData[this.recordId][record.value.label] = { html: record.displayVal };
          this.getLinkPreview(record.displayVal, record.value.label);
        }
        if (record.value.fieldType === "progress") {
          this.progressData[record.value.label] = record.displayVal;
        }
        if (record.value.fieldType === "category") {
          if (!this.selectedCategoryOptions[this.recordId]) {
            this.selectedCategoryOptions[this.recordId] = {};
          }
          this.selectedCategoryOptions[this.recordId][record.field_id] = [];
          if (record.selectedOption) {
            this.selectedCategoryOptions[this.recordId][record.field_id].push(
              record.selectedOption
            );
          } else {
            this.selectedCategoryOptions[this.recordId][record.field_id] =
              record.value.select;
          }
          this.selectedCategoryMultipleOptions[record.field_id] =
            record.displayVal;
        }
        if (record.value.fieldType === "date") {
          this.appForm.controls[record.value.label].setValue(
            new Date(record.date)
          );
          if (
            record.value.end &&
            this.appForm.controls[record.value.label + "End"]
          ) {
            this.appForm.controls[record.value.label + "End"].setValue(
              new Date(record.value.end)
            );
          }
        }
      }
    });
    this.appForm.updateValueAndValidity();
    if (!toRefresh) {
      document.getElementById("recordModalButton").click();
      setTimeout(() => {
        this.isModalOpen = true;
        this.setTextArea.forEach((label) => {
          this.setTextAreaLength(label);
        });
      }, 150);
    }
    this.openingModal = false;
  }

  openMentionList() {
    const el = document.getElementById("commentSection");
    el.focus();
    this.mention.startSearch();
  }

  falseMentionUserSelect() {
    this.isMentionUserSelect = false;
  }

  trueMentionUserSelect() {
    setTimeout(() => {
      this.isMentionUserSelect = true;
    }, 250);
  }

  addComment(commentText) {
    commentText = this.helperService.removeTags(commentText);
    this.editComment = this.helperService.removeTags(this.editComment);
    this.editComment = this.editComment.trim();
    if (commentText && this.editComment === "&nbsp;") {
      const data = {
        application_id: this.activeAppId,
        record_id: this.recordId,
        comment: commentText.trim(),
      };
      this.appViewService
        .addComment(data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            commentText = "";
            this.appViewService.sendMentionData({
              comment: "",
              comment_for_update: "",
              selectedMentionUsers: []
            });
            this.editComment = "&nbsp;";
            this.getComments();
            this.getActivities();
          }
        })
        .catch((err: Error) => {
          this.canAddComment = true;
          throw err;
        });
    } else if (commentText) {
      const data = {
        comment: commentText.trim(),
      };
      this.apiService
        .postWithHeader(`record/${this.commentId}/editRecordComment`, data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            commentText = "";
            this.appViewService.sendMentionData({
              comment: "",
              comment_for_update: "",
              selectedMentionUsers: []
            });
            this.editComment = "&nbsp;";
            this.getComments();
            this.getActivities();
          }
        })
        .catch((err: any) => {
          throw err;
        });
    }


    // if (charCode == 13 && event.shiftKey) {
    //   this.canAddComment = true;
    //   event.stopPropagation();
    // } else if (charCode == 13 && this.isMentionUserSelect && commentText.length && this.canAddComment || event.addedFiles) {
    //   event.preventDefault();
    //   this.canAddComment = false;
    //   this.editComment = this.editComment.trim();
    //   if (this.editComment === "&nbsp;") {
    //     const data = {
    //       application_id: this.activeAppId,
    //       record_id: this.recordId,
    //       comment: commentText.trim(),
    //     };
    //     this.appViewService
    //       .addComment(data)
    //       .then((jresponse: JReponse) => {
    //         this.canAddComment = true;
    //         if (jresponse.success) {
    //           this.helperService.showSuccessToast(jresponse.message);
    //           event.srcElement.value = "";
    //           event.target.innerText = "";
    //           this.editComment = "&nbsp;";
    //           this.getComments();
    //           this.getActivities();
    //         }
    //       })
    //       .catch((err: Error) => {
    //         this.canAddComment = true;
    //         throw err;
    //       });
    //   } else {
    //     const data = {
    //       comment: commentText.trim(),
    //     };
    //     this.apiService
    //       .postWithHeader(`record/${this.commentId}/editRecordComment`, data)
    //       .then((jresponse: JReponse) => {
    //         this.canAddComment = true;
    //         if (jresponse.success) {
    //           this.helperService.showSuccessToast(jresponse.message);
    //           event.srcElement.value = "";
    //           event.target.innerText = "";
    //           this.editComment = "&nbsp;";
    //           this.getComments();
    //           this.getActivities();
    //         }
    //       })
    //       .catch((err: any) => {
    //         throw err;
    //       });
    //   }

    // }
  }
  // addComment(event) {
  //   let commentText = event.target.innerText;

  //   selectedMentionUsers.forEach((element) => {
  //     commentText = commentText.replace(element.name, element.id);
  //   });
  //   commentText = commentText.trim();
  //   const charCode = event.which ? event.which : event.keyCode;

  //   if (charCode == 13 && event.shiftKey) {
  //     this.canAddComment = true;
  //     event.stopPropagation();
  //   } else if (charCode == 13 && this.isMentionUserSelect && commentText.length && this.canAddComment || event.addedFiles) {
  //     event.preventDefault();
  //     this.canAddComment = false;
  //     this.editComment = this.editComment.trim();
  //     if (this.editComment === "&nbsp;") {
  //       const data = {
  //         application_id: this.activeAppId,
  //         record_id: this.recordId,
  //         comment: commentText.trim(),
  //       };
  //       this.appViewService
  //         .addComment(data)
  //         .then((jresponse: JReponse) => {
  //           this.canAddComment = true;
  //           if (jresponse.success) {
  //             this.helperService.showSuccessToast(jresponse.message);
  //             event.srcElement.value = "";
  //             event.target.innerText = "";
  //             this.editComment = "&nbsp;";
  //             this.getComments();
  //             this.getActivities();
  //           }
  //         })
  //         .catch((err: Error) => {
  //           this.canAddComment = true;
  //           throw err;
  //         });
  //     } else {
  //       const data = {
  //         comment: commentText.trim(),
  //       };
  //       this.apiService
  //         .postWithHeader(`record/${this.commentId}/editRecordComment`, data)
  //         .then((jresponse: JReponse) => {
  //           this.canAddComment = true;
  //           if (jresponse.success) {
  //             this.helperService.showSuccessToast(jresponse.message);
  //             event.srcElement.value = "";
  //             event.target.innerText = "";
  //             this.editComment = "&nbsp;";
  //             this.getComments();
  //             this.getActivities();
  //           }
  //         })
  //         .catch((err: any) => {
  //           throw err;
  //         });
  //     }

  //   }
  // }

  async getComments() {
    await this.appViewService
      .getComments(this.recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.appComments = jresponse.body;
          if (this.appComments) {
            this.appComments.map((comment) => {
              if (
                comment.user_id.avatar &&
                comment.user_id.avatar !== "undefined"
              ) {
                comment.user_id.avatar =
                  environment.MEDIA_URL + comment.user_id.avatar;
              } else {
                comment.user_id.avatar =
                  "../../../../../assets/images/user.png";
              }
            });
          }
          // To update kanban records list
          // if (!this.appViewService.apiCalled && this.viewType === "kanban") {
          //   this.appViewService.apiCalled = true;
          //   this.appViewService.activeAppId.next('');
          //   this.appViewService.activeAppId.next(this.activeAppId);
          // }
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getActivities() {
    console.log("console 111111111111111111111111111111")
    await this.appViewService
      .getActivities(this.workspaceId, this.activeAppId, this.recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.appActivities = jresponse.body;
          this.appActivities.map((activity) => {
            if (activity.cells && activity.cells.length) {
              activity.cells.map((cell) => {
                if (cell.old_value[0].text) {
                  cell.record = _.map(cell.old_value[0].text, (val) => {
                    if (val.hasOwnProperty("recordName")) {
                      return val.recordName;
                    }
                  });
                  cell.record = _.compact(cell.record).toString();
                  cell.type =
                    typeof cell.old_value[0].text === "object" ?
                    "object" :
                    "string";
                }
                if (typeof cell.old_value[0].text === "number") {
                  cell.old_value[0].text = String(cell.old_value[0].text);
                }
              });
            }
            if (activity.user.avatar && activity.user.avatar !== "undefined") {
              activity.user.avatar =
                environment.MEDIA_URL + activity.user.avatar;
            } else {
              activity.user.avatar = "../../../../../assets/images/user.png";
            }
          });
          // if (!this.appViewService.apiCalled && this.viewType === "kanban") {
          //   this.appViewService.apiCalled = true;
          //   this.appViewService.activeAppId.next('');
          //   this.appViewService.activeAppId.next(this.activeAppId);
          // }
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  toggleAppMenu(id) {
    const dimensions = JSON.parse(
      JSON.stringify(getNodeDimensions(document.getElementById(id)))
    );
    this.leftValue = dimensions.left;
    if (this.openAppMenu === id) {
      this.openAppMenu = "";
    } else {
      this.openAppMenu = id;
    }
  }

  editApplication(app) {
    const initialState = {
      isEdit: true,
      workspace_id_for_edit: app.workspace_id._id,
      application_id_for_edit: app._id,
      appName_for_edit: app.name,
      appDescription_for_edit: app.description,
    };
    const modalParams = Object.assign({}, {
      initialState,
      class: "small-custom-modal",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
    this.modalRef = this.modalService.show(CreateAppComponent, modalParams);
  }

  toggleHelpText(label) {
    if (this.showHelpText === label) {
      this.showHelpText = "";
    } else {
      this.showHelpText = label;
    }
  }

  deleteRecord(record) {
    this.deleteRecordId = record.id;
    document.getElementById("deleteRecordModalButton").click();
  }

  setTextAreaLength(label) {
    if (document.getElementById(label)) {
      const element = document.getElementById(label);
      element.style.height = "1px";
      element.style.height = 2 + element.scrollHeight + "px";
    }
  }

  confirmDeleteRecord() {
    this.appViewService
      .deleteRecord(this.deleteRecordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.showSuccessToast(jresponse.message);
          this.appViewService.updateAppFilters.next({
            id: this.activeAppId,
            fields: this.appFields,
          });
          this.getAppRecords(this.activeAppId);
          this.appViewService.activeAppId.next(this.activeAppId);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  dragTab(event: CdkDragSortEvent < any[] > ) {
    document.getElementById('apps-slider-container-cs').classList.add('overflow-hidden-imp')
  }

  dropTab(event: CdkDragDrop < any[] > ) {
    document.getElementById('apps-slider-container-cs').classList.remove('overflow-hidden-imp')
    if (this.homeService.wsRole &&
      this.homeService.wsRole == 'admin') {

      moveItemInArray(
        this.workspaceAppsList,
        event.previousIndex,
        event.currentIndex
      );
      this.appViewService.workspaceAppsList = this.workspaceAppsList;
      const length = this.workspaceAppsList.length;
      this.newAppsOrder = [];
      for (let i = 0; i < length; i++) {
        this.newAppsOrder.push(this.workspaceAppsList[i]._id);
      }
      const data = {
        workspace_id: this.workspaceId,
        applications: this.newAppsOrder,
      };
      this.appViewService
        .changeAppOrder(data)
        .then((jresponse: JReponse) => {})
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          throw err;
        });
    }
  }

  formatMultiselectOptions() {
    this.dropdownList = [];
    this.wsMembers.forEach((member, ind) => {
      if (member._id) {
        const obj = {
          item_id: ind + 1,
          item_text: member.firstName ?
            `${member.firstName} ${member.lastName}` :
            member.email,
          item_data: member,
        };
        this.dropdownList.push(obj);
      }
    });
  }

  getGeoCode(event, field) {
    this.appViewService
      .getGeoCode(event.target.value)
      .then((jresponse: JReponse) => {
        if (jresponse.body.data[0]) {
          if (jresponse.body.data[0].address) {
            this.mapSuggestion[field.label] = jresponse.body.data;
          }
        }
        // this.helperService.setLocalStore("applications", this.workspaceAppsList);
      })
      .catch((err: any) => {
        // this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  getMap(item, field, type = "") {
    if (type === "single") {
      this.appForm.controls[field.label].setValue(item.address);
      this.appForm.updateValueAndValidity();
    }
    this.appViewService
      .getMap(item.coordinate)
      .then((jresponse: JReponse) => {
        if (jresponse.body.data.map) {
          const mapData = this.mapSuggestion[field.label].find(
            (map) => map.address === item.address
          );
          mapData.map = jresponse.body.data.map;
          let url = mapData.map.substring(0, mapData.map.indexOf("{"));
          const queries = JSON.parse(
            mapData.map.substring(mapData.map.indexOf("{"))
          );
          Object.keys(queries).forEach((key) => {
            url += `${key}=${queries[key]}&`;
          });
          mapData.map = url;
          this.mapData[field.label] = mapData;
          if (type === "multi") {
            this.appForm.controls[field.label][
              "controls"
            ].streetAddress.setValue(this.mapData[field.label].street);
            this.appForm.controls[field.label]["controls"].postalCode.setValue(
              this.mapData[field.label].postal
            );
            this.appForm.controls[field.label]["controls"].city.setValue(
              this.mapData[field.label].city
            );
            this.appForm.controls[field.label]["controls"].state.setValue(
              this.mapData[field.label].state
            );
            this.appForm.controls[field.label]["controls"].country.setValue(
              this.mapData[field.label].country
            );
            this.appForm.updateValueAndValidity();
          }
          this.addRecord(this.mapData[field.label], field, type);
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  removeFile(data, field) {
    // this.imageData = this.imageData.filter(f => f.name !== file.name && f.size !== file.size);
    // this.addRecord("", field, "remove");

    // VIDEO RESPONSE INCLUDE SOURCE IN 'PATH'
    if (data.type === 'vid') {
      var imageData = this.attachmentData[this.recordId][field.label].find(
        (el) =>
        data.path.includes(el.attachment.path)
      );

      this.attachmentData[this.recordId][field.label] = this.attachmentData[
        this.recordId
      ][field.label].filter(
        (el) =>
        !data.path.includes(el.attachment.path)
      );
    }

    // ATTACHMENT DATA'S SOURCE IN 'SOURCE'
    if (data.type !== 'vid') {
      var imageData = this.attachmentData[this.recordId][field.label].find(
        (el) =>
        data.source.includes(el.attachment.path)
      );

      this.attachmentData[this.recordId][field.label] = this.attachmentData[
        this.recordId
      ][field.label].filter(
        (el) =>
        !data.source.includes(el.attachment.path)
      );
    }

    if (
      !this.attachmentData[this.recordId][field.label].length &&
      !this.invalidImageFields.includes(field._id) &&
      field.options.Required
    ) {
      this.invalidImageFields.push(field._id);
    }
    const formData = new FormData();
    formData.append("fieldId", field._id);
    formData.append("fieldType", field.type);
    formData.append("application_id", this.activeAppId);
    formData.append("record_id", this.recordId);
    formData.append("uniqueId", this.editSessionId);
    formData.append(
      "attachmentData",
      JSON.stringify({
        toRemove: imageData,
        toSave: this.attachmentData[this.recordId][field.label],
      })
    );
    // tslint:disable-next-line: max-line-length
    // this.imageDisplayData[field.label].splice(this.imageDisplayData[field.label].indexOf(this.imageDisplayData[field.lable].find( img => img.source === data.source)), 1);
    this.appViewService
      .deleteAttachment(formData)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.getAppFields(this.activeAppId, true);
          this.getActivities();
          this.getAppRecords(this.activeAppId);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  selectCategoryOption(option, field) {
    if (!this.selectedCategoryOptions[this.recordId]) {
      this.selectedCategoryOptions[this.recordId] = {};
      this.selectedCategoryOptions[this.recordId][field._id] = [];
    } else if (!this.selectedCategoryOptions[this.recordId][field._id]) {
      this.selectedCategoryOptions[this.recordId][field._id] = [];
    }
    if (field.options.choice === "Single choice") {
      if (
        this.selectedCategoryOptions[this.recordId][field._id][0] !== option.id
      ) {
        this.selectedCategoryOptions[this.recordId][field._id][0] = option.id;
        this.appForm.controls[field.label].setValue(option.id);
        this.selectedCategoryMultipleOptions[field._id] = option.label;
        this.showCategoryDropdown = "";
      } else {
        // this.appForm.controls[field.label].reset();
        // this.selectedCategoryOptions[this.recordId][field._id] = [];
        // this.selectedCategoryMultipleOptions[field._id] = "";
      }
    } else {
      if (
        !this.selectedCategoryOptions[this.recordId][field._id].includes(
          option.id
        )
      ) {
        this.selectedCategoryOptions[this.recordId][field._id].push(option.id);
        this.appForm.controls[field.label].setValue(option.id);
      } else {
        // tslint:disable-next-line: max-line-length
        this.selectedCategoryOptions[this.recordId][field._id].splice(
          this.selectedCategoryOptions[this.recordId][field._id].indexOf(
            option.id
          ),
          1
        );
        if (!this.selectedCategoryOptions[this.recordId][field._id].length) {
          this.appForm.controls[field.label].reset();
        }
      }
      // tslint:disable-next-line: max-line-length
      this.selectedCategoryMultipleOptions[
        field._id
      ] = this.selectedCategoryOptions[this.recordId][field._id].reduce(
        (result, optionId, ind) => {
          const optionData = field.options.selectOptions.find(
            (op) => op.id === optionId
          );
          result += ` ${optionData.label}${ind !==
            this.selectedCategoryOptions[this.recordId][field._id].length - 1
            ? ","
            : ""
            }`;
          return result;
        },
        ""
      );
      this.appForm.updateValueAndValidity();
    }
    this.addRecord(
      this.selectedCategoryOptions[this.recordId][field._id],
      field
    );
  }

  scrollToBottom() {
    if (this.myScrollContainer) {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight + 100;
    }
  }

  toggleDisplayMenu() {
    if (this.showDisplayMenu) {
      this.showDisplayMenu = false;
    } else {
      this.showDisplayMenu = true;
    }
  }

  toggleDisplayMenuOption(type) {
    if (
      !this.displayMenuOption ||
      (this.displayMenuOption && this.displayMenuOption !== type)
    ) {
      this.displayMenuOption = type;
    } else {
      this.displayMenuOption = "";
    }
  }

  setDisplayMenuOptions() {

    // return false
    this.appFields.forEach((field) => {
      if (
        field.type === "category" &&
        field.options.choice === "Single choice"
      ) {

        if (this.activeApplication.columnId != "" && field._id.toString() == this.activeApplication.columnId) {
          this.appViewService.displayColumnOption = field;
        } else if (!this.appViewService.displayColumnOption) {
          this.appViewService.displayColumnOption = field;
        }
        this.displayMenuColumnOptions.push(field);
      }
      if (field.type === "member") {
        this.displayMenuRowOptions.push(field);
      }
    });
  }

  setDisplayOption(option, type) {


    this.showDisplayMenu = false;
    this.displayMenuOption = "";
    if (type === "column") {
      this.updateView(
        "",
        this.appViewService.displayRowOption ?
        this.appViewService.displayRowOption._id :
        "",
        option._id || ""
      );
      this.appViewService.displayColumnOption = option;
      this.router.navigateByUrl(
        `/application/home/app-view/applicationView/kanban-view?appId=${this.activeAppId
        }&workspaceId=${this.workspaceId}&column=${option._id || ""}&row=${this.appViewService.displayRowOption
          ? this.appViewService.displayRowOption._id
          : ""
        }`
      );
      setTimeout(() => {
        this.appViewService.columnOption.next(option);
      }, 0);
    } else {

      this.updateView(
        "",
        option._id || "no",
        this.appViewService.displayColumnOption ?
        this.appViewService.displayColumnOption._id :
        ""
      );
      this.appViewService.displayRowOption = option;
      this.router.navigateByUrl(
        `/application/home/app-view/applicationView/kanban-view?appId=${this.activeAppId
        }&workspaceId=${this.workspaceId}&row=${option._id || ""}&column=${this.appViewService.displayColumnOption
          ? this.appViewService.displayColumnOption._id
          : ""
        }`
      );
      setTimeout(() => {
        this.appViewService.rowOption.next(option);
      }, 0);
    }
  }

  async updateView(type = "", row = "", column = "") {
    if (type === "calendar") {
      this.isCalendarShow = true;
    } else {
      this.isCalendarShow = false;
    }
    const appData = this.appViewService.workspaceAppsList.find(
      (app) => app._id === this.activeAppId
    );
    if (type) {
      appData.view_mode = type;
    }
    appData.workspace_id = this.workspaceId || appData.workspace_id._id;
    appData.application_id = appData._id;
    if (type === 'kanban' || row || column) {
      // ? this.appViewService.displayRowOption._id
      // : "",
      if (row && row == 'no') {
        appData.rowId = "";
      } else {
        appData.rowId = row && row != "" ? row : appData.rowId;
      }
      appData.columnId = column && column != "" ? column : appData.columnId;
    }
    // else{
    //   delete appData.rowId;
    //   delete appData.columnId;
    // }
    //  return false
    this.appViewService
      .updateAppView(appData)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.getApps(this.workspaceId, this.homeService.wsRole);
          // this.getAppFields(this.activeAppId, true);
          // this.getActivities();
          // this.getAppRecords(this.activeAppId);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async changeApplication(id) {
    this.hiddenFields = [];
    this.hiddenFieldsCount = 0;
    // To reset filter options
    this.appViewService.selectedLayoutOptions = [{}, {}, {}];
    this.appViewService.selectedAppFilters = [];
    this.appViewService.selectedView = "";
    this.currentFilter = "all";
    this.appViewService.showViewMenu = false;
    this.appViewService.showCreateViewMenu = false;
    this.selectFilterMenu(this.currentFilter);
    this.getTotalCount();
    this.activeApplication = this.workspaceAppsList.find(
      (app) => app._id === id
    );
    await this.getAppFields(id);
    const app = this.appViewService.workspaceAppsList.find(
      (app) => app._id === id
    );
    let url = "/application/home/app-view/applicationView";
    let query = `?appId=${this.activeAppId}&workspaceId=${this.workspaceId}`;
    let rowField: any = {};
    let columnField: any = {};
    if (
      app.view_mode &&
      app.view_mode !== "grid" &&
      app.view_mode !== "gridView"
    ) {
      url += app.view_mode === "kanban" ? "/kanban-view" : "/calender-view";
    }
    if (app.rowId) {
      rowField = this.appFields.find((field) => field._id === app.rowId);
      query += `&row=${app.rowId}`;
      this.appViewService.displayRowOption = rowField;
    } else {
      this.appViewService.displayRowOption = "";
    }
    if (app.columnId) {
      columnField = this.appFields.find((field) => field._id === app.columnId);
      query += `&column=${app.columnId}`;
      this.appViewService.displayColumnOption = columnField;
    } else {
      this.appViewService.displayColumnOption = "";
    }
    this.router.navigateByUrl(url + query);
    if (app.view_mode === "kanban") {
      this.appViewService.changeApplication.next(id);
    }
    this.appViewService.updateAppFilters.next({
      id,
      fields: this.appFields
    });
  }

  async changeApplicationForContributedWorkspace(id) {
    this.hiddenFields = [];
    this.hiddenFieldsCount = 0;
    this.appViewService.selectedLayoutOptions = [{}, {}, {}];
    this.appViewService.selectedAppFilters = [];
    this.appViewService.selectedView = "";
    this.currentFilter = "all";
    this.appViewService.showViewMenu = false;
    this.appViewService.showCreateViewMenu = false;
    this.selectFilterMenu(this.currentFilter);
    this.getTotalCount();
    this.activeApplication = this.workspaceAppsList.find(
      (app) => app._id === id
    );
    await this.getAppFields(id);
    const app = this.appViewService.workspaceAppsList.find(
      (app) => app._id === id
    );
    let url = "/application/home/admin/contributed-workspaces";
    let query = `?appId=${this.activeAppId}&workspaceId=${this.workspaceId}`;
    let rowField: any = {};
    let columnField: any = {};
    if (
      app.view_mode &&
      app.view_mode !== "grid" &&
      app.view_mode !== "gridView"
    ) {
      url += app.view_mode === "kanban" ? "/kanban-view" : "/calender-view";
    }
    if (app.rowId) {
      rowField = this.appFields.find((field) => field._id === app.rowId);
      query += `&row=${app.rowId}`;
      this.appViewService.displayRowOption = rowField;
    } else {
      this.appViewService.displayRowOption = "";
    }
    if (app.columnId) {
      columnField = this.appFields.find((field) => field._id === app.columnId);
      query += `&column=${app.columnId}`;
      this.appViewService.displayColumnOption = columnField;
    } else {
      this.appViewService.displayColumnOption = "";
    }
    this.router.navigateByUrl(url + query);
    if (app.view_mode === "kanban") {
      this.appViewService.changeApplication.next(id);
    }
    this.appViewService.updateAppFilters.next({
      id,
      fields: this.appFields
    });
  }

  async changeApplicationForMarketWorkspace(id, marketWsId, wsId) {
    this.marketInfo = this.helperService.getLocalStore("wpMarket");
    this.hiddenFields = [];
    this.hiddenFieldsCount = 0;
    this.appViewService.selectedLayoutOptions = [{}, {}, {}];
    this.appViewService.selectedAppFilters = [];
    this.appViewService.selectedView = "";
    this.currentFilter = "all";
    this.appViewService.showViewMenu = false;
    this.appViewService.showCreateViewMenu = false;
    this.selectFilterMenu(this.currentFilter);
    this.getTotalCount();
    this.activeApplication = this.workspaceAppsList.find(
      (app) => app._id === id
    );
    await this.getAppFields(id);
    const app = this.appViewService.workspaceAppsList.find(
      (app) => app._id === id
    );
    let url = "";
    if (this.marketInfo && this.marketInfo.marketAuth == false) {
      url = "/wordpress/wp-market-detail";
    } else {
      url = "/application/home/market-detail";
    }
    let query = `?marketId=${marketWsId}&appId=${this.activeAppId}&workspaceId=${wsId}`;
    let rowField: any = {};
    let columnField: any = {};
    if (
      app.view_mode &&
      app.view_mode !== "grid" &&
      app.view_mode !== "gridView"
    ) {
      url += app.view_mode === "kanban" ? "/kanban-view" : "/calender-view";
    }
    if (app.rowId) {
      rowField = this.appFields.find((field) => field._id === app.rowId);
      query += `&row=${app.rowId}`;
      this.appViewService.displayRowOption = rowField;
    } else {
      this.appViewService.displayRowOption = "";
    }
    if (app.columnId) {
      columnField = this.appFields.find((field) => field._id === app.columnId);
      query += `&column=${app.columnId}`;
      this.appViewService.displayColumnOption = columnField;
    } else {
      this.appViewService.displayColumnOption = "";
    }
    this.router.navigateByUrl(url + query);
    if (app.view_mode === "kanban") {
      this.appViewService.changeApplication.next(id);
    }
    this.appViewService.updateAppFilters.next({
      id,
      fields: this.appFields
    });
  }

  searchUsers(event) {
    this.shareRecordEmailOnly = event.target.value;
    if (event.target.value.length >= 3) {
      this.appViewService
        .getUsers(this.orgId, event.target.value)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.suggestedUsers = jresponse.body;
            if (!this.suggestedUsers.length) {
              this.showRecordEmailOnly = true;
            } else {
              this.showRecordEmailOnly = false;
              this.suggestedUsers = this.suggestedUsers.filter(
                (user) =>
                !this.selectedShareRecordUserIds.includes(user.user_id._id)
              );
            }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      this.suggestedUsers = [];
      this.showRecordEmailOnly = false;
    }
  }

  addMessage(event) {
    this.shareRecordMessage = event.target.value;
  }

  uploadedImages() {
    this.uploadImageSubscription = this.appViewService.uploadedImages.subscribe(
      async (images) => {
        if (this.selectedImageField) {
          this.showProgress = true;
          this.progress = 1;
          const interval = setInterval(() => {
            if (this.progress < 80) {
              this.progress += 1;
            }
          }, 500);
          await this.addRecord({
            addedFiles: images
          }, this.selectedImageField);
          clearInterval(interval);
          for (let i = this.progress; i <= 100; i++) {
            setTimeout(() => {
              this.progress = i;
              if (this.progress === 100) {
                this.showProgress = false;
              }
            }, 0);
          }
        }
      }
    );
  }

  addUser(user) {
    if (user) {
      this.suggestedUsers.splice(
        this.suggestedUsers.findIndex(
          (data) => data.user_id._id === user.user_id._id
        ),
        1
      );
      this.selectedShareRecordUsers.push(user);
      this.selectedShareRecordUserIds.push(user.user_id._id);
    } else {
      this.selectedShareRecordUsers.push(this.shareRecordEmailOnly);
    }
  }

  shareRecord() {
    const users = this.selectedShareRecordUsers.map((user) => {
      const userObj = {
        user_id: "",
        email: ""
      };
      if (user.user_id) {
        userObj.user_id = user.user_id._id;
        userObj.email = user.user_id.email;
      } else {
        userObj.email = user;
      }
      return userObj;
    });
    const checkBoxEl: any = document.getElementById("readOnlyCheckbox");
    const data: any = {
      application_id: this.activeAppId,
      record_id: this.recordId,
      users,
      message: this.shareRecordMessage,
    };
    if (this.shareRecordModalType === "record") {
      data.readOnly = checkBoxEl.checked;
      this.appViewService
        .shareRecord(data)
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.modalRef.hide();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      data.users.forEach((user) => {
        user.role = this.shareWorkspaceRole;
      });
      data.organization_id = this.orgId;
      data.workspace_id = this.activeApplication.workspace_id._id;
      this.appViewService
        .workspaceInvitation(data)
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.modalRef.hide();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  removeSelectedShareRecordUser(user, type = "") {
    if (type === "email-only") {
      this.selectedShareRecordUsers.splice(
        this.selectedShareRecordUsers.findIndex((u) => u === user),
        1
      );
    } else {
      this.selectedShareRecordUsers.splice(
        this.selectedShareRecordUsers.findIndex(
          (user) => user.user_id._id === user.user_id._id
        ),
        1
      );
      this.selectedShareRecordUserIds.splice(
        this.selectedShareRecordUserIds.findIndex(
          (userId) => userId === user.user_id._id
        ),
        1
      );
      if (this.shareRecordEmailOnly.length >= 3 && !this.showRecordEmailOnly) {
        this.suggestedUsers.push(user);
      }
    }
  }

  setWorkspaceRole(type) {
    this.showWorkspaceRoleOptions = false;
    if (type === "admin") {
      this.shareWorkspaceRole = "admin";
    } else if (type === "member") {
      this.shareWorkspaceRole = "member";
    } else {
      this.shareWorkspaceRole = "light-member";
    }
  }

  updateAppLayoutOptions() {
    const appData = JSON.parse(JSON.stringify(this.appViewService.activeApp));
    appData.workspace_id = appData.workspace_id._id || this.workspaceId;
    appData.application_id = appData._id;
    appData.layout_options = this.appViewService.selectedLayoutOptions;
    // return false
    this.appViewService
      .updateAppView(appData)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          await this.appViewService.refreshApps(
            this.workspaceId,
            this.homeService.wsRole
          );
          this.appViewService.activeAppId.next("");
          this.appViewService.activeAppId.next(this.activeAppId);
          this.modalRef.hide();
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  toggleLayoutOptionsMenu(index) {
    if (this.showLayoutOptionMenu === index) {
      this.showLayoutOptionMenu = 0;
    } else {
      this.showLayoutOptionMenu = index;
    }
  }

  modalClosed(event) {
    this.displayApps = false;
    // if (this.appViewService.tempBool) {
    let validMemberField = true;
    // let validDurationField = true;
    this.appFields.forEach((field) => {
      if (
        field.type === "member" &&
        field.options.Required &&
        this.selectedMembers[field.label] &&
        !this.selectedMembers[field.label].length
      ) {
        validMemberField = false;
        this.invalidMemberFields.push(field._id);
      }
      // if (field.type === "duration" && this.appForm.controls[field.label].invalid &&
      // ((this.appForm.controls[field.label]["controls"].days && this.appForm.controls[field.label]["controls"].days.value == 0) &&
      // (this.appForm.controls[field.label]["controls"].hours && this.appForm.controls[field.label]["controls"].hours.value == 0) &&
      // (this.appForm.controls[field.label]["controls"].minutes && this.appForm.controls[field.label]["controls"].minutes.value == 0) &&
      // (this.appForm.controls[field.label]["controls"].seconds && this.appForm.controls[field.label]["controls"].seconds.value == 0))) {
      //   validDurationField = false;
      // }
    });
    if (
      !this.invalidImageFields.length &&
      !this.invalidDurationFields.length &&
      validMemberField &&
      this.appForm.valid &&
      this.isModalOpen &&
      event &&
      (event.target.id === "closeRecordModalBtn" ||
        event.target.className === "modal fade show modal-static")
    ) {
      document.getElementById("closeRecordModal").click();

      this.calculationFields.forEach((variable) => {
        this.openingModal = false;
        if (variable.isChange && variable.isChange === true) {
          this.addRecord(variable.calculatorVal, variable);
        }
      });
      this.isModalOpen = false;
      this.showModal = false;
      this.appViewService.activeAppId.next("");
      this.appViewService.activeAppId.next(this.activeAppId);
      this.calculationFields = [];
      this.selectedRecord = [];
      if (document.getElementById("newRecordId")) {
        document.getElementById("newRecordId").scrollTop = 0;
      }
    } else if (

      !this.appForm.valid &&
      this.isModalOpen &&
      event &&
      (event.target.id === "closeRecordModalBtn" ||
        event.target.className === "modal fade show modal-static")
    ) {
      this.showValidationErrors = true;
      this.appFields.forEach((field) => {
        if (
          this.appForm.controls[field.label] &&
          this.appForm.controls[field.label].invalid &&
          this.changeFocus
        ) {
          if (
            field.type === "location" &&
            field.options.display === "Multi-line address"
          ) {
            if (
              this.appForm.controls[field.label]["controls"].streetAddress
              .invalid
            ) {
              document.getElementById(field.label + "street").focus();
            } else if (
              this.appForm.controls[field.label]["controls"].postalCode.invalid
            ) {
              document.getElementById(field.label + "postal").focus();
            } else if (
              this.appForm.controls[field.label]["controls"].city.invalid
            ) {
              document.getElementById(field.label + "city").focus();
            } else if (
              this.appForm.controls[field.label]["controls"].state.invalid
            ) {
              document.getElementById(field.label + "state").focus();
            } else {
              document.getElementById(field.label + "country").focus();
            }
          } else if (field.type === "phone" || field.type === "email") {
            const lastInd = this.arrayControl(field.label).length - 1;
            if (
              (this.changeFocus &&
                field.type === "email" &&
                !this.appForm.controls[field.label].value[lastInd].text) ||
              (field.type === "phone" &&
                !this.appForm.controls[field.label].value[lastInd].number)
            ) {
              document.getElementById(field.label + lastInd).focus();
              this.changeFocus = false;
            }
          } else {
            const el = document.getElementById(field.label);
            if (el) {
              el.focus();
            }
            this.changeFocus = false;
          }
        }
      });
      this.changeFocus = true;
      if (document.getElementById("newRecordId")) {
        document.getElementById("newRecordId").scrollTop = 0;
      }
    }
    if (
      (this.invalidDurationFields.length || this.invalidImageFields.length) &&
      event &&
      (event.target.id === "closeRecordModalBtn" ||
        event.target.className === "modal fade show modal-static")
    ) {
      this.showValidationErrors = true;
      if (document.getElementById("newRecordId")) {
        document.getElementById("newRecordId").scrollTop = 0;
      }
    }
    // }
  }

  goToDeleteApp(appName, appId) {
    const initialState = {
      isDeleteApp: true,
      deleteAppName: appName,
      deleteAppId: appId,
    };
    this.modalRef = this.modalService.show(OrgLeaveComponent, {
      initialState,
      class: "right-custom-popup leave-right-custom-popup",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
  }

  // deleteApplication(appId) {
  //   this.appViewService
  //     .deleteApp(appId)
  //     .then(async (jresponse: JReponse) => {
  //       if (jresponse.success) {
  //         const appIndex = this.appViewService.workspaceAppsList.findIndex(
  //           (app) => app._id === appId
  //         );
  //         await this.appViewService.refreshApps(this.workspaceId);
  //         this.workspaceAppsList = this.appViewService.workspaceAppsList;
  //         if (appId === this.activeAppId) {
  //           this.changeApplication(this.workspaceAppsList[appIndex]._id);
  //         }
  //       }
  //     })
  //     .catch((err: Error) => {
  //       throw err;
  //     });
  // }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  modifyTemplate() {
    document.getElementById("closeRecordModal").click();
    this.router.navigateByUrl(
      `/application/home/application-builder?appId=${this.activeAppId}`
    );
  }

  hideLinkPreview(label) {
    this.linkPreviewData[this.recordId][label] = {};
  }

  itemMentioned(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };


    selectedMentionUsers.push(data);
    const el = document.getElementById("commentSection");

    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
    // let formatedText = `<b>${tag.fullName}</b>&nbsp;`;
    // const formatedText = `
    // <div contenteditable="false" class="commnet-mention-wrrapper">
    //     <img class="commnet-mention-user-image" src="${image}">
    //     <label class="commnet-mention-user-label">
    //       ${tag.fullName}
    //     </label>
    // </div> &nbsp;`;
    const formatedText = `<div contenteditable="false" class="client-name"><img src="${image}"> ${tag.fullName} </div>&nbsp;`;

    let oldValue = el.innerHTML;
    el.innerHTML = "";
    // oldValue = oldValue.replace("@", "");
    var atIndex = oldValue.indexOf("@");
    oldValue = oldValue.substring(0, atIndex);
    oldValue = oldValue + " " + formatedText;
    el.innerHTML = oldValue;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    el.scrollTop = el.scrollHeight;
    return "";
  }

  async getUsersForMention(wsId: string, type: string, keyword: string) {
    await this.appViewService
      .mentionUserForComment(wsId, keyword)
      .then((jresponse: JReponse) => {
        this.wsMembers = jresponse.body;
        this.appViewService.wsMembers = this.wsMembers;
        if (!keyword.length) {
          this.getMembers();
        }
        if (type === "filter" && keyword.length) {
          this.createdByUserList = [];
          this.createdByUserList = jresponse.body;
          this.createdByUserList = this.createdByUserList.filter((element) => {
            return element !== null;
          });
          // this.createdByUserList.forEach((element) => {
          //   element.isSelected = false;
          //   this.filterMemberOptions.push({
          //     _id: element._id,
          //     label: element.firstName + " " + element.lastName,
          //     avatar: element.avatar,
          //   });
          // this.selectedFilterMemberOptions.push({
          //   _id: element._id,
          //   label: element.firstName + " " + element.lastName,
          //   avatar: element.avatar,
          // });
          // });
        }
        // else {
        // this.mentionUsersList = [];
        // this.mentionUsersList = jresponse.body;
        // this.mentionUsersList = this.mentionUsersList.filter((element) => {
        //   return element !== null;
        // });
        // if (this.mentionUsersList.length) {
        //   this.mentionUsersList = this.mentionUsersList.map((e) => {
        //     return {
        //       ...e,
        //       fullName: e.firstName + " " + e.lastName,
        //     };
        //   });
        // }
        // }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  selectMemberFilter(user) {
    // this.createdByUserList.forEach((element) => {
    //   if (element._id === user._id) {
    //     element.isSelected = !element.isSelected;
    //   }
    // });
    // const filterCount = this.createdByUserList.filter((element) => {
    //   return element.isSelected === true;
    // });
    if (this.selectedFilterMemberOptionIds.includes(user._id)) {
      const ind = this.selectedFilterMemberOptions.findIndex(
        (op) => op.id === user._id
      );
      this.selectedFilterMemberOptions.splice(ind, 1);
      this.selectedFilterMemberOptionIds.splice(ind, 1);
    } else {
      this.selectedFilterMemberOptions.push(user);
      this.selectedFilterMemberOptionIds.push(user._id);
    }
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    this.selectedFilterCount[
      this.currentFilter
    ] = this.selectedFilterMemberOptions.length;
    if (!filterObj) {
      const filter = {
        id: this.currentFilter,
        value: JSON.parse(JSON.stringify(this.selectedFilterMemberOptions)),
        label: "",
        type: "member",
      };
      if (this.filterMenu[this.currentFilter]) {
        filter.label = this.filterMenu[this.currentFilter];
      } else {
        const field = this.appFields.find((f) => f._id === this.currentFilter);
        filter.label = field.label;
      }
      this.appViewService.selectedAppFilters.push(filter);
    } else {
      filterObj.value = JSON.parse(
        JSON.stringify(this.selectedFilterMemberOptions)
      );
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    // this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });

    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
    // this.selectedFilterCount[this.currentFilter] = filterCount.length;
    // this.getTotalCount();
  }

  removeSelectedMember(user, ind) {
    this.selectedFilterCount[this.currentFilter] -= 1;
    const filter = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    filter.value.splice(ind, 1);
    this.selectedFilterMemberOptions.splice(ind, 1);
    this.selectedFilterMemberOptionIds.splice(ind, 1);
    if (!filter.value.length) {
      this.appViewService.selectedAppFilters.splice(
        this.appViewService.selectedAppFilters.findIndex(
          (f) => f.id === filter.id
        ),
        1
      );
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  openRevisionModal(
    activities,
    template: TemplateRef < any > ,
    fieldId,
    cell,
    index,
    currentActivity
  ) {
    let matchedActivity = JSON.parse(
      JSON.stringify(_.filter(activities, {
        cells: [{
          _id: cell._id
        }]
      }))
    );
    const record = this.recordData.find(
      (record) => record._id === this.recordId
    );
    const title = _.find(record.data, {
      fieldType: "text"
    });
    this.recordName = title ? title.value.text : "";
    let newObj = matchedActivity.filter((activity) => {
      if (
        activity.cells &&
        activity.cells.length &&
        activity.activity_sub_type === "UPDATED_RECORD"
      ) {
        activity.cells = activity.cells.filter((el) => {
          if (el.field_id._id.toString() === fieldId.toString()) {
            return el;
          }
        });
        if (activity.cells.length > 0) {
          return activity;
        } else {
          return false;
        }
      }
    });
    // let sorted = _.orderBy(
    //   newObj,
    //   [
    //     (d) => {
    //       return new Date(d.createdAt);
    //     },
    //   ],
    //   ["asc"] // 'desc' orders by date descending
    // );
    // let currentIndex = newObj.indexOf(currentActivity);
    let currentIndex = newObj.findIndex(
      (data) => data._id === currentActivity._id
    );
    let nextIndex = currentIndex + 1;
    if (currentIndex == 0 || currentIndex == "0") {
      currentIndex = -1;
      nextIndex = 0;
    }
    this.revisionRecord = newObj;
    let next = newObj[nextIndex];
    let current = newObj[currentIndex];
    this.currentLeftIndex = nextIndex - 1;
    this.currentRightIndex = nextIndex;
    if (parseInt(this.revisionRecord.length) == parseInt(nextIndex)) {
      next = newObj[currentIndex];
      current = newObj[currentIndex - 1];
      this.currentLeftIndex = this.currentLeftIndex - 1;
      this.currentRightIndex = this.currentRightIndex - 1;
    }
    this.leftRecord = current ? current : {};
    this.rightRecord = next ? next : {};
    this.displayDiff();

    this.revisionModalRef = this.modalService.show(template, {
      class: "market-process-modal",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
  }

  changeRecord(type) {
    if (type === "left") {
      this.leftRecord = this.revisionRecord[this.currentLeftIndex - 1] ?
        this.revisionRecord[this.currentLeftIndex - 1] :
        "";
      this.rightRecord = this.revisionRecord[this.currentRightIndex - 1] ?
        this.revisionRecord[this.currentRightIndex - 1] :
        "";
      this.currentLeftIndex = this.currentLeftIndex - 1;
      //  this.currentLeftIndex = this.currentRightIndex < 0 ? 0: this.currentRightIndex - 1;
      this.currentRightIndex = this.currentRightIndex - 1;
      this.displayDiff();
    } else {
      this.leftRecord = this.revisionRecord[this.currentLeftIndex + 1] ?
        this.revisionRecord[this.currentLeftIndex + 1] :
        "";
      this.rightRecord = this.revisionRecord[this.currentRightIndex + 1] ?
        this.revisionRecord[this.currentRightIndex + 1] :
        "";
      this.currentLeftIndex = this.currentLeftIndex + 1;
      // this.currentLeftIndex = this.currentRightIndex ;
      this.currentRightIndex = this.currentRightIndex + 1;

      this.displayDiff();
    }
  }

  displayDiff() {
    this.leftVal = "";
    this.rightVal = "";

    if (this.leftRecord && !_.isEmpty(this.leftRecord)) {
      let filterObj = this.filterFields.find(
        (filter) => filter._id === this.leftRecord.cells[0].field_id._id
      );
      let left;
      if (
        (this.leftRecord.cells[0].old_value[0].text &&
          this.leftRecord.cells[0].old_value[0].text.length <= 20 &&
          this.leftRecord.cells[0].type === "string") ||
        this.leftRecord.cells[0].old_value[0].number ||
        this.leftRecord.cells[0].old_value[0].date
      ) {
        let num = this.leftRecord.cells[0].old_value[0].MoneyType ?
          this.leftRecord.cells[0].old_value[0].MoneyType +
          " " +
          this.leftRecord.cells[0].old_value[0].number :
          this.leftRecord.cells[0].old_value[0].number;
        let dates =
          this.leftRecord.cells[0].old_value[0].date &&
          this.leftRecord.cells[0].old_value[0].end ?
          moment(this.leftRecord.cells[0].old_value[0].date).format(
            "DD/MM/YYYY"
          ) +
          "-" +
          moment(this.leftRecord.cells[0].old_value[0].end).format(
            "DD/MM/YYYY"
          ) :
          this.leftRecord.cells[0].old_value[0].date ?
          moment(this.leftRecord.cells[0].old_value[0].date).format(
            "DD/MMYYYY"
          ) :
          "";
        left = this.leftRecord.cells[0].old_value[0].text || num || dates;
      } else if (this.leftRecord.cells[0].old_value[0].tel) {
        left = _.map(
          this.leftRecord.cells[0].old_value[0].tel,
          function (value) {
            return value.type + " - " + value.number;
          }
        );
      } else if (this.leftRecord.cells[0].old_value[0].members) {
        let member = this.appViewService.wsMembers;
        let final = _.map(
          this.leftRecord.cells[0].old_value[0].members,
          function (object) {
            let variable = _.chain(member)
              .filter((user) => user._id === object)
              .map((data) => {
                return data.firstName + " " + data.lastName;
              })
              .value();
            return variable;
          }
        );
        left = final;
      } else {
        left = _.map(this.leftRecord.cells[0].old_value, function (value) {
          if (value.hasOwnProperty("days")) {
            return (
              value.days +
              " Days " +
              value.hours +
              " Hours " +
              value.minutes +
              " Minutes"
            );
          } else if (value.hasOwnProperty("address")) {
            return value.address;
          } else if (
            value.hasOwnProperty("text") &&
            typeof value.text == "string"
          ) {
            return value.text;
          } else if (value.hasOwnProperty("image")) {
            let images = _.map(value.image, function (val) {
              return (
                "Name : " +
                (val.attachment.name ? val.attachment.name : "") +
                " , Size : " +
                (val.attachment.size ? val.attachment.size + " Bytes" : "") +
                " , Extension : " +
                (val.attachment.ext ? val.attachment.ext : "")
              );
            });
            return images;
          } else if (value.hasOwnProperty("select")) {
            let categories = JSON.parse(
              JSON.stringify(filterObj.options.selectOptions)
            );
            let filtered = categories.filter(function (itm) {
              return value.select.indexOf(itm.id) > -1;
            });
            filtered = filtered
              .map(function (e) {
                return e.label;
              })
              .join(", ");
            return filtered;
          } else {
            let emails = _.map(value.text, function (val) {
              if (val.hasOwnProperty("recordName")) {
                return val.recordName;
              } else {
                return val.type + " - " + val.text;
              }
            });
            return emails;
          }
        });
      }
      this.leftVal = left.toString();
    } else {
      this.leftVal = "";
    }
    if (this.rightRecord && !_.isEmpty(this.rightRecord)) {

      let right;
      let filterRightObj = this.filterFields.find(
        (filter) => filter._id === this.rightRecord.cells[0].field_id._id
      );
      if (
        (this.rightRecord.cells[0].old_value[0].text &&
          this.rightRecord.cells[0].old_value[0].text.length <= 20 &&
          this.rightRecord.cells[0].type === "string") ||
        this.rightRecord.cells[0].old_value[0].number ||
        this.rightRecord.cells[0].old_value[0].date
      ) {
        let num = this.rightRecord.cells[0].old_value[0].MoneyType ?
          this.rightRecord.cells[0].old_value[0].MoneyType +
          " " +
          this.rightRecord.cells[0].old_value[0].number :
          this.rightRecord.cells[0].old_value[0].number;
        let dates =
          this.rightRecord.cells[0].old_value[0].date &&
          this.rightRecord.cells[0].old_value[0].end ?
          moment(this.rightRecord.cells[0].old_value[0].date).format(
            "DD/MM/YYYY"
          ) +
          "-" +
          moment(this.rightRecord.cells[0].old_value[0].end).format(
            "DD/MM/YYYY"
          ) :
          this.rightRecord.cells[0].old_value[0].date ?
          moment(this.rightRecord.cells[0].old_value[0].date).format(
            "DD/MM/YYYY"
          ) :
          "";
        right = this.rightRecord.cells[0].old_value[0].text || num || dates;
      } else if (this.rightRecord.cells[0].old_value[0].tel) {
        right = _.map(
          this.rightRecord.cells[0].old_value[0].tel,
          function (value) {
            return value.type + " - " + value.number;
          }
        );
      } else if (this.rightRecord.cells[0].old_value[0].members) {
        const member = this.appViewService.wsMembers;
        const final = _.map(
          this.rightRecord.cells[0].old_value[0].members,
          function (object) {
            let variable = _.chain(member)
              .filter((user) => user._id === object)
              .map((data) => {
                return data.firstName + " " + data.lastName;
              })
              .value();
            return variable;
          }
        );
        right = final;
      } else {
        right = _.map(this.rightRecord.cells[0].old_value, function (value) {
          if (value.hasOwnProperty("days")) {
            return (
              value.days +
              " Days " +
              value.hours +
              " Hours " +
              value.minutes +
              " Minutes"
            );
          } else if (value.hasOwnProperty("address")) {
            return value.address;
          } else if (
            value.hasOwnProperty("text") &&
            typeof value.text === "string"
          ) {
            return value.text;
          } else if (value.hasOwnProperty("image")) {
            let images = _.map(value.image, function (val) {
              return (
                "Name : " +
                (val.attachment.name ? val.attachment.name : "") +
                " , Size : " +
                (val.attachment.size ? val.attachment.size + " Bytes" : "") +
                " , Extension : " +
                (val.attachment.ext ? val.attachment.ext : "")
              );
            });
            return images;
          } else if (value.hasOwnProperty("select")) {
            let categoriesRight = JSON.parse(
              JSON.stringify(filterRightObj.options.selectOptions)
            );
            let filteredRight = categoriesRight.filter(function (itm) {
              return value.select.indexOf(itm.id) > -1;
            });
            filteredRight = filteredRight
              .map(function (e) {
                return e.label;
              })
              .join(", ");
            return filteredRight;
          } else {
            let emails = _.map(value.text, function (val) {
              if (val.hasOwnProperty("recordName")) {
                return val.recordName;
              } else {
                return val.type + " - " + val.text;
              }
            });
            return emails;
          }
        });
      }
      this.rightVal = right.toString();
    } else {
      this.rightVal = "";
    }

    const result1 = diff.diffPatch(this.leftVal, this.rightVal);
    this.leftVal = result1.before;
    this.rightVal = result1.after;
  }

  selectFilterMenu(type = "", field: any = {}) {
    this.selectedFilterLocationOptions = {
      country: [],
      state: [],
      city: [],
      postal: [],
    };
    this.filterRelationOptions = [];
    this.selectedFilterLocationCountryOptionIds = [];
    this.selectedFilterLocationCityOptionIds = [];
    this.selectedFilterLocationStateOptionIds = [];
    this.selectedFilterLocationPostalOptionIds = [];
    this.rangeForm.reset();
    this.currentFilter = type;
    if (type === "createdBy") {
      this.filterDisplayType = "member";
      this.getUsersForMention(
        this.workspaceId,
        "filter",
        this.createdByUserKeyword
      );
    } else if (type === "createdOn" || type === "lastEdited") {
      this.filterDisplayType = "date";
    } else if (type === "all") {
      this.filterDisplayType = "all";
    } else {
      this.currentFilter = field._id;
      if (field.type === "category") {
        this.filterDisplayType = "category";
        this.filterCategoryOptions = field.options.selectOptions;
        this.currentFilterCategoryField = field;
      } else if (field.type === "member") {
        this.filterDisplayType = "member";
        this.getUsersForMention(
          this.workspaceId,
          "filter",
          this.createdByUserKeyword
        );
      } else if (field.type === "date") {
        this.filterDisplayType = "date";
      } else if (
        field.type === "number" ||
        field.type === "money" ||
        field.type === "calculator" ||
        field.type === "progress"
      ) {
        this.filterDisplayType = "number";
        this.currentFilterRangeField = field;
      } else if (field.type === "location") {
        this.filterDisplayType = "location";
        this.selectedLocationLabel = field.label;
        if (field.label.includes("Country")) {
          this.locationType = "country";
        } else if (field.label.includes("State")) {
          this.locationType = "state";
        } else if (field.label.includes("City")) {
          this.locationType = "city";
        } else {
          this.locationType = "postal";
        }
        this.getLocations();
        this.currentFilterLocationField = field;
      } else if (field.type === "relationship") {
        this.filterDisplayType = "relationship";
        this.currentFilterRelationField = field;
      }
    }
    // To highlight the selected filter option in date filter menu
    let filter = this.appViewService.selectedAppFilters.find(
      (f) => f.id === type
    );
    if (!filter) {
      if (field.type !== "location") {
        filter = this.appViewService.selectedAppFilters.find(
          (f) => f.id === field._id
        );
      } else {
        filter = this.appViewService.selectedAppFilters.find(
          (f) => f.id === field._id && f.label === field.label
        );
      }
    }
    if (filter && filter.type === "date") {
      this.selectedDateFilterOption = filter.value.type;
    } else if (filter && filter.type === "category") {
      this.selectedFilterCategoryOptions = filter.value;
      filter.value.forEach((option) => {
        this.selectedFilterCategoryOptionIds.push(option.id);
      });
    } else if (filter && filter.type === "progress") {
      this.selectedProgressFilterOptions = filter.value;
      this.rangeForm.controls.to.setValue(filter.value.to);
      this.rangeForm.controls.from.setValue(filter.value.from);
      this.rangeForm.updateValueAndValidity();
      this.currentFilterRangeField = filter;
    } else if (filter && filter.type === "member") {
      this.selectedFilterMemberOptionIds = [];
      this.selectedFilterMemberOptions = filter.value;
      filter.value.forEach((member) => {
        this.selectedFilterMemberOptionIds.push(member._id);
      });
    } else if (filter && filter.type === "number") {
      this.rangeForm.controls.from.setValue(filter.value.from);
      this.rangeForm.controls.to.setValue(filter.value.to);
      this.rangeForm.updateValueAndValidity();
      this.currentFilterRangeField = filter;
    } else if (filter && filter.type === "location") {
      this.selectedLocationLabel = field.label;
      // this.selectedFilterLocationOptions = filter.value;
      filter.value.forEach((option) => {
        if (this.locationType === "country" && option.country) {
          this.selectedFilterLocationOptions.country.push(option);
          this.selectedFilterLocationCountryOptionIds.push(option._id);
        } else if (this.locationType === "state" && option.state) {
          this.selectedFilterLocationOptions.state.push(option);
          this.selectedFilterLocationStateOptionIds.push(option._id);
        } else if (this.locationType === "city" && option.city) {
          this.selectedFilterLocationOptions.city.push(option);
          this.selectedFilterLocationCityOptionIds.push(option._id);
        } else if (this.locationType === "postal" && option.postal) {
          this.selectedFilterLocationOptions.postal.push(option);
          this.selectedFilterLocationPostalOptionIds.push(option._id);
        }
      });
    } else if (filter && filter.type === "relationship") {
      this.selectedFilterRelationOptions = filter.value;
      filter.value.forEach((option) => {
        this.selectedFilterRelationOptionIds.push(option._id);
      });
    } else {
      // Reset filter options

      this.selectedFilterCategoryOptions = [];
      this.selectedFilterCategoryOptionIds = [];
      this.selectedFilterRelationOptions = [];
      this.selectedFilterRelationOptionIds = [];
      this.selectedFilterLocationOptions = {
        country: [],
        state: [],
        city: [],
        postal: [],
      };
      this.selectedFilterLocationCountryOptionIds = [];
      this.selectedFilterLocationStateOptionIds = [];
      this.selectedFilterLocationCityOptionIds = [];
      this.selectedFilterLocationPostalOptionIds = [];
      this.selectedFilterMemberOptions = [];
      this.selectedFilterMemberOptionIds = [];
      this.selectedDateFilterOption = "";
    }
  }

  getRecordList(event) {
    let field = this.currentFilterRelationField;
    this.appViewService
      .getAppRelationRecords({
        field_id: field._id,
        app: field.options.selectedApps,
      })
      .then((jresponse: JReponse) => {
        if (jresponse.body && jresponse.body.length > 0) {
          const records = _.map(jresponse.body, function (obj) {
            return obj.data;
          });

          let finalData = [];
          for (let i = 0; i < records.length; i++) {
            finalData = [...finalData, ...records[i]];
          }
          let list;
          if (event.target.value) {
            list = finalData.filter((data) =>
              data.recordName
              .toLowerCase()
              .includes(event.target.value.toLowerCase())
            );
          } else {
            list = finalData;
          }

          this.filterRelationOptions = list;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  closeFilterMenu(event) {
    if (
      event.target.id !== "filter-menu-btn" &&
      event.target.id !== "remove-btn" &&
      event.target.id !== "member" &&
      event.target.id !== "view-menu"
    ) {
      this.showFilterMenu = false;
    }
  }

  searchForCreatedBy(data) {
    this.createdByUserKeyword = data.target.value.toLowerCase();
    if (!this.createdByUserKeyword) {
      this.createdByUserList = JSON.parse(
        JSON.stringify(this.members.map((user) => user.user_id))
      );
    } else {
      const members = this.members.filter(
        (user) =>
        user.user_id.firstName
        .toLowerCase()
        .includes(this.createdByUserKeyword) ||
        user.user_id.lastName
        .toLowerCase()
        .includes(this.createdByUserKeyword)
      );
      this.createdByUserList = JSON.parse(
        JSON.stringify(members.map((user) => user.user_id))
      );
    }
    // this.getMembers(this.createdByUserKeyword, true);
    // this.getUsersForMention(
    //   this.workspaceId,
    //   "filter",
    //   this.createdByUserKeyword
    // );
  }

  selectDateFilter(type) {
    const dateObj = {
      startDate: "",
      endDate: ""
    };
    let valLabel = "";
    switch (type) {
      case this.dateTypes.custom:
        valLabel = "custom";
        this.showCustomDate = true;
        break;

      case this.dateTypes.all:
        valLabel = "All";
        dateObj.startDate = null;
        dateObj.endDate = null;
        break;

      case this.dateTypes.yesterday:
        valLabel = "Yesterday";
        dateObj.startDate = moment()
          .subtract(1, "days")
          .startOf("day")
          .format();
        dateObj.endDate = moment().subtract(1, "days").endOf("day").format();
        break;

      case this.dateTypes.today:
        valLabel = "Today";
        dateObj.startDate = moment().startOf("day").format();
        dateObj.endDate = moment().endOf("day").format();
        break;

      case this.dateTypes.tomorrow:
        valLabel = "Tomorrow";
        dateObj.startDate = moment().add(1, "days").startOf("day").format();
        dateObj.endDate = moment().add(1, "days").endOf("day").format();
        break;

      case this.dateTypes.past.seven:
        valLabel = "Past - 7 Days";
        dateObj.startDate = moment()
          .subtract(6, "days")
          .startOf("day")
          .format();
        dateObj.endDate = moment().endOf("day").format();
        break;

      case this.dateTypes.past.thirty:
        valLabel = "Past - 30 Days";
        dateObj.startDate = moment()
          .subtract(29, "days")
          .startOf("day")
          .format();
        dateObj.endDate = moment().endOf("day").format();
        break;

      case this.dateTypes.past.week:
        valLabel = "Last Calendar Week";
        dateObj.startDate = moment()
          .subtract(1, "weeks")
          .startOf("week")
          .format();
        dateObj.endDate = moment().subtract(1, "weeks").endOf("week").format();
        break;

      case this.dateTypes.past.month:
        valLabel = "Last Calendar Month";
        dateObj.startDate = moment()
          .subtract(1, "months")
          .startOf("month")
          .format();
        dateObj.endDate = moment()
          .subtract(1, "months")
          .endOf("month")
          .format();
        break;

      case this.dateTypes.past.calYear:
        valLabel = "Last Calendar Year";
        dateObj.startDate = moment()
          .subtract(1, "years")
          .startOf("year")
          .format();
        dateObj.endDate = moment().subtract(1, "years").endOf("year").format();
        break;

      case this.dateTypes.past.year:
        valLabel = "Past - Year";
        dateObj.startDate = moment()
          .subtract(364, "days")
          .startOf("day")
          .format();
        dateObj.endDate = moment().endOf("day").format();
        break;

      case this.dateTypes.past.all:
        valLabel = "Past - All";
        dateObj.startDate = null;
        dateObj.endDate = moment().format();
        break;

      case this.dateTypes.current.week:
        valLabel = "Current Week";
        dateObj.startDate = moment().startOf("week").format();
        dateObj.endDate = moment().endOf("week").format();
        break;

      case this.dateTypes.current.month:
        valLabel = "Current Month";
        dateObj.startDate = moment().startOf("month").format();
        dateObj.endDate = moment().endOf("month").format();
        break;

      case this.dateTypes.current.year:
        valLabel = "Current Year";
        dateObj.startDate = moment().startOf("year").format();
        dateObj.endDate = moment().endOf("year").format();
        break;

      case this.dateTypes.future.seven:
        valLabel = "Future - 7 Days";
        dateObj.startDate = moment().endOf("day").format();
        dateObj.endDate = moment().add(6, "days").startOf("day").format();
        break;

      case this.dateTypes.future.thirty:
        valLabel = "Future - 30 Days";
        dateObj.startDate = moment().endOf("day").format();
        dateObj.endDate = moment().add(29, "days").startOf("day").format();
        break;

      case this.dateTypes.future.week:
        valLabel = "Next Calendar Week";
        dateObj.startDate = moment().add(1, "weeks").startOf("week").format();
        dateObj.endDate = moment().add(1, "weeks").endOf("week").format();
        break;

      case this.dateTypes.future.month:
        valLabel = "Next Calendar Month";
        dateObj.startDate = moment().add(1, "months").startOf("month").format();
        dateObj.endDate = moment().add(1, "months").endOf("month").format();
        break;

      case this.dateTypes.future.calYear:
        valLabel = "Next Calendar Year";
        dateObj.startDate = moment().add(1, "years").startOf("year").format();
        dateObj.endDate = moment().add(1, "years").endOf("year").format();
        break;

      case this.dateTypes.future.year:
        valLabel = "Future - Year";
        dateObj.startDate = moment().endOf("day").format();
        dateObj.endDate = moment().add(364, "days").startOf("day").format();
        break;

      case this.dateTypes.future.all:
        valLabel = "Future - All";
        dateObj.startDate = moment().format();
        dateObj.endDate = null;
        break;
    }
    const filter = {
      id: this.currentFilter,
      value: {
        label: valLabel,
        type
      },
      label: "",
      type: "date",
    };
    if (this.filterMenu[this.currentFilter]) {
      filter.label = this.filterMenu[this.currentFilter];
    } else {
      const field = this.appFields.find((f) => f._id === this.currentFilter);
      filter.label = field.label;
    }
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    if (
      filterObj &&
      JSON.stringify(filterObj.value) ===
      JSON.stringify({
        ...filter.value,
        ...dateObj
      })
    ) {
      this.appViewService.selectedAppFilters.splice(
        this.appViewService.selectedAppFilters.findIndex(
          (f) => f.id === filterObj.id
        ),
        1
      );
      this.selectedDateFilterOption = {};
      this.selectedFilterCount[this.currentFilter] = 0;
      if (this.viewType === "calender") {
        this.appViewService.applyFiltersInCalendar.next({
          toApply: "filters",
        });
      } else {
        this.getAppRecords(this.activeAppId, "", true);
      }
      this.getTotalCount();
    } else if (valLabel !== "custom") {
      this.selectedFilterCount[this.currentFilter] = 1;
      if (filterObj) {
        filterObj.value = dateObj;
        filterObj.value.label = valLabel;
        filterObj.value.type = type;
        this.selectedDateFilterOption = filterObj;
      } else {
        filter.value = {
          ...filter.value,
          ...dateObj
        };
        this.selectedDateFilterOption = filter;
        this.appViewService.selectedAppFilters.push(filter);
      }
      if (this.viewType === "calender") {
        this.appViewService.applyFiltersInCalendar.next({
          toApply: "filters",
        });
      } else {
        this.getAppRecords(this.activeAppId, "", true);
      }
      this.getTotalCount();
    } else {
      if (filterObj) {
        filterObj.value.label = valLabel;
        filterObj.value.type = type;
        this.currentCustomDateFilter = filterObj;
        // filterObj.value = dateObj;
      } else {
        this.currentCustomDateFilter = filter;
        // filter.value = dateObj;
      }
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
  }

  removeDateFilter(filter) {
    this.appViewService.selectedAppFilters.splice(
      this.appViewService.selectedAppFilters.findIndex(
        (f) => f.id === filter.id
      ),
      1
    );
    this.selectedDateFilterOption = {};
    this.selectedFilterCount[this.currentFilter] = 0;
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  removeFilter(ind) {
    this.selectedFilterCount[
      this.appViewService.selectedAppFilters[ind].id
    ] = 0;
    this.appViewService.selectedAppFilters.splice(ind, 1);
    this.selectedDateFilterOption = "";
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  selectFilterCategoryOption(option) {
    if (this.selectedFilterCategoryOptionIds.includes(option.id)) {
      const ind = this.selectedFilterCategoryOptions.findIndex(
        (op) => op.id === option.id
      );
      this.selectedFilterCategoryOptions.splice(ind, 1);
      this.selectedFilterCategoryOptionIds.splice(ind, 1);
    } else {
      this.selectedFilterCategoryOptions.push(option);
      this.selectedFilterCategoryOptionIds.push(option.id);
    }
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    this.selectedFilterCount[
      this.currentFilter
    ] = this.selectedFilterCategoryOptions.length;
    if (!filterObj) {
      const filter = {
        id: this.currentFilter,
        value: JSON.parse(JSON.stringify(this.selectedFilterCategoryOptions)),
        label: this.currentFilterCategoryField.label,
        type: "category",
      };
      this.appViewService.selectedAppFilters.push(filter);
    } else {
      if (this.selectedFilterCategoryOptions.length) {
        filterObj.value = JSON.parse(
          JSON.stringify(this.selectedFilterCategoryOptions)
        );
      } else {
        const id = this.appViewService.selectedAppFilters.findIndex(
          (filter) => filter.id === filter.id
        );
        this.appViewService.selectedAppFilters.splice(id, 1);
      }
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  selectFilterRelationOption(option) {
    if (this.selectedFilterRelationOptionIds.includes(option._id)) {
      const ind = this.selectedFilterRelationOptions.findIndex(
        (op) => op._id === option._id
      );
      this.selectedFilterRelationOptions.splice(ind, 1);
      this.selectedFilterRelationOptionIds.splice(ind, 1);
    } else {
      let obj = {
        _id: option._id,
        appId: option.appId,
        recordName: option.recordName,
      };
      this.selectedFilterRelationOptions.push(obj);
      this.selectedFilterRelationOptionIds.push(option._id);
    }

    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    this.selectedFilterCount[
      this.currentFilter
    ] = this.selectedFilterRelationOptions.length;
    if (!filterObj) {
      const filter = {
        id: this.currentFilter,
        value: JSON.parse(JSON.stringify(this.selectedFilterRelationOptions)),
        label: this.currentFilterRelationField.label,
        type: "relationship",
      };
      this.appViewService.selectedAppFilters.push(filter);
    } else {
      if (this.selectedFilterRelationOptions.length) {
        filterObj.value = JSON.parse(
          JSON.stringify(this.selectedFilterRelationOptions)
        );
      } else {
        const id = this.appViewService.selectedAppFilters.findIndex(
          (filter) => filter.id === filter.id
        );
        this.appViewService.selectedAppFilters.splice(id, 1);
      }
    }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }
  // selectFilterMemberOption(option) {
  //   if (this.selectedFilterCategoryOptionIds.includes(option.id)) {
  //     const ind = this.selectedFilterCategoryOptions.findIndex(
  //       (op) => op.id === option.id
  //     );
  //     this.selectedFilterCategoryOptions.splice(ind, 1);
  //     this.selectedFilterCategoryOptionIds.splice(ind, 1);
  //   } else {
  //     this.selectedFilterCategoryOptions.push(option);
  //     this.selectedFilterCategoryOptionIds.push(option.id);
  //   }
  //   const filterObj = this.appViewService.selectedAppFilters.find(
  //     (filter) => filter.id === this.currentFilter
  //   );
  //   this.selectedFilterCount[
  //     this.currentFilter
  //   ] = this.selectedFilterCategoryOptions.length;
  //   this.getTotalCount();
  //   if (!filterObj) {
  //     const filter = {
  //       id: this.currentFilter,
  //       value: JSON.parse(JSON.stringify(this.selectedFilterCategoryOptions)),
  //       label: this.currentFilterCategoryField.label,
  //       type: "category",
  //     };
  //     this.appViewService.selectedAppFilters.push(filter);
  //   } else {
  //     filterObj.value = JSON.parse(
  //       JSON.stringify(this.selectedFilterCategoryOptions)
  //     );
  //   }
  //   if (this.appViewService.selectedView) {
  //     this.appViewService.isViewUnsaved = true;
  //   }
  // }

  selectFilterLocationOption(option, locationType: string) {
    if (locationType === "country") {
      if (this.selectedFilterLocationCountryOptionIds.includes(option._id)) {
        const ind = this.selectedFilterLocationOptions.country.findIndex(
          (op) => op._id === option._id
        );
        this.selectedFilterLocationOptions.country.splice(ind, 1);
        this.selectedFilterLocationCountryOptionIds.splice(ind, 1);
      } else {
        this.selectedFilterLocationOptions.country.push(option);
        this.selectedFilterLocationCountryOptionIds.push(option._id);
      }
      if (!this.selectedFilterCount[this.currentFilter]) {
        this.selectedFilterCount[this.currentFilter] = {
          country: 0
        };
      }
      this.selectedFilterCount[
        this.currentFilter
      ].country = this.selectedFilterLocationCountryOptionIds.length;
    } else if (locationType === "state") {
      if (this.selectedFilterLocationStateOptionIds.includes(option._id)) {
        const ind = this.selectedFilterLocationOptions.state.findIndex(
          (op) => op._id === option._id
        );
        this.selectedFilterLocationOptions.state.splice(ind, 1);
        this.selectedFilterLocationStateOptionIds.splice(ind, 1);
      } else {
        this.selectedFilterLocationOptions.state.push(option);
        this.selectedFilterLocationStateOptionIds.push(option._id);
      }
      if (!this.selectedFilterCount[this.currentFilter]) {
        this.selectedFilterCount[this.currentFilter] = {
          state: 0
        };
      }
      this.selectedFilterCount[
        this.currentFilter
      ].state = this.selectedFilterLocationStateOptionIds.length;
    } else if (locationType === "city") {
      if (this.selectedFilterLocationCityOptionIds.includes(option._id)) {
        const ind = this.selectedFilterLocationOptions.city.findIndex(
          (op) => op._id === option._id
        );
        this.selectedFilterLocationOptions.city.splice(ind, 1);
        this.selectedFilterLocationCityOptionIds.splice(ind, 1);
      } else {
        this.selectedFilterLocationOptions.city.push(option);
        this.selectedFilterLocationCityOptionIds.push(option._id);
      }
      if (!this.selectedFilterCount[this.currentFilter]) {
        this.selectedFilterCount[this.currentFilter] = {
          city: 0
        };
      }

      this.selectedFilterCount[
        this.currentFilter
      ].city = this.selectedFilterLocationCityOptionIds.length;
    } else {

      if (this.selectedFilterLocationPostalOptionIds.includes(option._id)) {

        const ind = this.selectedFilterLocationOptions.postal.findIndex(
          (op) => op._id === option._id
        );

        this.selectedFilterLocationOptions.postal.splice(ind, 1);
        this.selectedFilterLocationPostalOptionIds.splice(ind, 1);
      } else {
        this.selectedFilterLocationOptions.postal.push(option);
        this.selectedFilterLocationPostalOptionIds.push(option._id);
      }
      if (!this.selectedFilterCount[this.currentFilter]) {
        this.selectedFilterCount[this.currentFilter] = {
          postal: 0
        };
      }
      this.selectedFilterCount[
        this.currentFilter
      ].postal = this.selectedFilterLocationPostalOptionIds.length;
    }
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) =>
      filter.id === this.currentFilter &&
      filter.label === this.selectedLocationLabel
    );
    if (!filterObj) {
      let filter = {};
      if (locationType === "country") {

        filter = {

          id: this.currentFilter,
          value: JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.country)
          ),
          label: this.currentFilterLocationField.label,
          type: "location",
        };
      } else if (locationType === "state") {
        filter = {
          id: this.currentFilter,
          value: JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.state)
          ),
          label: this.currentFilterLocationField.label,
          type: "location",
        };
      } else if (locationType === "city") {
        filter = {
          id: this.currentFilter,
          value: JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.city)
          ),

          label: this.currentFilterLocationField.label,
          type: "location",
        };
      } else {
        filter = {
          id: this.currentFilter,
          value: JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.postal)
          ),
          label: this.currentFilterLocationField.label,
          type: "location",
        };
      }
      this.appViewService.selectedAppFilters.push(filter);
    } else {
      if (locationType === "country") {
        if (!this.selectedFilterLocationOptions.country.length) {
          this.appViewService.selectedAppFilters.splice(
            this.appViewService.selectedAppFilters.findIndex(
              (f) => f.id === filterObj.id && f.label === filterObj.label
            ),
            1
          );
        } else {
          filterObj.value = JSON.parse(

            JSON.stringify(this.selectedFilterLocationOptions.country)
          );
        }
      } else if (locationType === "state") {
        if (!this.selectedFilterLocationOptions.state.length) {
          this.appViewService.selectedAppFilters.splice(
            this.appViewService.selectedAppFilters.findIndex(
              (f) => f.id === filterObj.id && f.label === filterObj.label
            ),
            1
          );
        } else {
          filterObj.value = JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.state)
          );
        }
      } else if (locationType === "city") {

        if (!this.selectedFilterLocationOptions.city.length) {
          this.appViewService.selectedAppFilters.splice(
            this.appViewService.selectedAppFilters.findIndex(
              (f) => f.id === filterObj.id && f.label === filterObj.label
            ),
            1
          );
        } else {
          filterObj.value = JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.city)
          );
        }
      } else {
        if (!this.selectedFilterLocationOptions.postal.length) {
          this.appViewService.selectedAppFilters.splice(
            this.appViewService.selectedAppFilters.findIndex(
              (f) => f.id === filterObj.id && f.label === filterObj.label
            ),
            1
          );

        } else {
          filterObj.value = JSON.parse(
            JSON.stringify(this.selectedFilterLocationOptions.postal)
          );
        }
      }
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  selectRange(event, type) {
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentFilter
    );
    if (
      this.rangeForm.controls.from.value ||
      this.rangeForm.controls.to.value
    ) {
      this.selectedFilterCount[this.currentFilter] = 1;
    }
    if (!filterObj) {
      const filter = {
        id: this.currentFilter,
        value: {
          from: this.rangeForm.controls.from["_pendingValue"],
          to: this.rangeForm.controls.to["_pendingValue"],
        },
        label: this.currentFilterRangeField.label,
        type: "number",
      };
      // if (type === "from") {
      //   filter.value.from = event.target.value;
      // } else {
      //   filter.value.to = event.target.value;
      // }
      if (
        this.rangeForm.controls.from.value ||
        this.rangeForm.controls.to.value
      ) {
        this.selectedFilterCount[this.currentFilter] = 1;
        this.appViewService.selectedAppFilters.push(filter);
      }
    } else {
      if (
        !this.rangeForm.controls.from.value &&
        !this.rangeForm.controls.to.value
      ) {
        this.appViewService.selectedAppFilters.splice(
          this.appViewService.selectedAppFilters.findIndex(
            (f) => f.id === filterObj.id
          ),
          1
        );
        this.selectedFilterCount[this.currentFilter] = 0;
      } else if (type === "from") {
        filterObj.value.from = this.rangeForm.controls.from.value;
      } else {
        filterObj.value.to = this.rangeForm.controls.to.value;
      }
      // filterObj.value = JSON.parse(JSON.stringify(this.selectedFilterCategoryOptions));
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  removeRange() {
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.selectedFilterCount[this.currentFilter] = 0;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    this.rangeForm.reset();
    this.appViewService.selectedAppFilters.splice(
      this.appViewService.selectedAppFilters.findIndex(
        (f) => f.id === this.currentFilter
      ),
      1
    );
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  searchLocation(event, type) {
    if (!event.target.value) {
      this.locationDataForFilter = JSON.parse(
        JSON.stringify(this.allLocationData)
      );
    } else {
      this.locationDataForFilter = JSON.parse(
        JSON.stringify(
          this.allLocationData.filter((data) =>
            data[type].toLowerCase().includes(event.target.value.toLowerCase())
          )
        )
      );
    }
  }

  // selectProgress(event, type) {
  //   this.selectedProgressFilterOptions[type] = event.value;
  //   // this.rangeForm.controls[type].setValue(event.value);
  //   const filterObj = this.appViewService.selectedAppFilters.find(
  //     (filter) => filter.id === this.currentFilter
  //   );
  //   if (!filterObj) {
  //     const filter = {
  //       id: this.currentFilter,
  //       value: {
  //         from: "",
  //         to: "",
  //       },
  //       label: this.currentFilterRangeField.label,
  //       type: "progress",
  //     };
  //     if (type === "from") {
  //       filter.value.from = event.value;
  //     } else {
  //       filter.value.to = event.value;
  //     }
  //     this.appViewService.selectedAppFilters.push(filter);
  //   } else {
  //     if (type === "from") {
  //       filterObj.value.from = event.value;
  //     } else {
  //       filterObj.value.to = event.value;
  //     }
  //     // filterObj.value = JSON.parse(JSON.stringify(this.selectedFilterCategoryOptions));
  //   }
  //   if (this.appViewService.selectedView) {
  //     this.appViewService.isViewUnsaved = true;
  //   }
  //   this.appViewService.openViewMenu.next({ workspaceId: this.workspaceId });
  //   this.selectedFilterCount[this.currentFilter] = 1;
  //   if (this.viewType === "calender") {
  //     this.appViewService.applyFiltersInCalendar.next({
  //       toApply: "filters",
  //     });
  //   } else {
  //     this.getAppRecords(this.activeAppId, "", true);
  //     this.getTotalCount();
  //   }
  // }

  removeCategoryFilter(filter, ind) {
    filter.value.splice(ind, 1);
    if (!filter.value.length) {
      this.appViewService.selectedAppFilters.splice(
        this.appViewService.selectedAppFilters.findIndex(
          (f) => f.id === filter.id
        ),
        1
      );
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.selectedFilterCount[filter.id] -= 1;
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
  }

  removeLocationFilter(filter, ind) {
    if (filter.label.includes("Country")) {
      this.selectedFilterLocationCountryOptionIds.splice(ind, 1);
      this.selectedFilterCount[filter.id].country -= 1;
    } else if (filter.label.includes("State")) {
      this.selectedFilterLocationStateOptionIds.splice(ind, 1);
      this.selectedFilterCount[filter.id].state -= 1;
    } else if (filter.label.includes("City")) {
      this.selectedFilterLocationCityOptionIds.splice(ind, 1);
      this.selectedFilterCount[filter.id].city -= 1;
    } else {
      this.selectedFilterLocationPostalOptionIds.splice(ind, 1);
      this.selectedFilterCount[filter.id].postal -= 1;
    }
    filter.value.splice(ind, 1);
    if (!filter.value.length) {
      this.appViewService.selectedAppFilters.splice(
        this.appViewService.selectedAppFilters.findIndex(
          (f) => f.id === filter.id && f.label === filter.label
        ),
        1
      );
    }
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    this.appViewService.openViewMenu.next({
      workspaceId: this.workspaceId
    });
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  addCustomDate(start, end) {
    const filterObj = this.appViewService.selectedAppFilters.find(
      (filter) => filter.id === this.currentCustomDateFilter.id
    );
    this.selectedDateFilterOption = filterObj;
    this.currentCustomDateFilter.value = {
      type: "custom",
      label: this.currentCustomDateFilter.value.label,
      startDate: moment(start).format(),
      endDate: moment(end).format(),
    };
    if (!filterObj) {
      this.appViewService.selectedAppFilters.push(this.currentCustomDateFilter);
      this.selectedDateFilterOption = this.currentCustomDateFilter;
    }
    this.selectedFilterCount[this.currentFilter] = 1;
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
    this.showCustomDate = false;
  }

  cancelCustomDate() {
    this.showCustomDate = false;
    this.currentCustomDateFilter = {};
    this.selectedDateFilterOption = "";
  }

  async getLocations() {
    await this.appViewService
      .getLocationsForFilter(this.activeAppId, this.locationType)
      .then((jresponse: JReponse) => {
        this.locationDataForFilter = jresponse.body;
        this.allLocationData = JSON.parse(
          JSON.stringify(this.locationDataForFilter)
        );
      })
      .catch((err: any) => {
        throw err;
      });
  }

  editRecord(record) {
    return new Promise((resolve, reject) => {
      delete record.cells[0].old_value[0].uniqueId;
      delete record.cells[0].old_value[0].created_date;
      const formattedRecord = this.recordData[0].data;
      const field = _.find(this.appFields, {
        _id: record.cells[0].field_id._id,
      });
      const formData = new FormData();
      formData.append("fieldType", field.type);
      formData.append("fieldId", field._id);
      formData.append("application_id", this.activeAppId);
      formData.append("record_id", this.recordId);
      formData.append("uniqueId", this.editSessionId);
      switch (field.type) {
        case this.appFieldTypes.TEXT:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.LINK:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.PHONE:
          const telData = {
            tel: this.appForm.controls[field.label].value
          };
          formData.append("value", JSON.stringify(telData));
          break;
        case this.appFieldTypes.CALCULATOR:
          const calData = {
            text: event
          };
          formData.append("value", JSON.stringify(calData));
          break;
        case this.appFieldTypes.NUMBER:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.IMAGE:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.EMAIL:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.MONEY:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.MEMBER:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.DATE:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.CATEGORY:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.PROGRESS:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.DURATION:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.LOCATION:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
        case this.appFieldTypes.RELATIONSHIP:
          formData.append(
            "value",
            JSON.stringify(record.cells[0].old_value[0])
          );
          break;
      }
      this.appViewService
        .setField(formData)
        .then((jresponse: JReponse) => {
          this.mapSuggestion = {};
          if (jresponse.success) {
            this.imageData = [];
            if (field.type === "number" || field.type === "money") {
              const numFields = _.filter(formattedRecord, (obj) => {
                if (obj.fieldType == "money" || obj.fieldType == "number") {
                  if (
                    obj.uniqueId == field.uniqueId &&
                    obj.fieldType == "number"
                  ) {
                    obj.displayVal = record.cells[0].old_value[0].text;
                  } else if (
                    obj.uniqueId == field.uniqueId &&
                    obj.fieldType == "money"
                  ) {
                    obj.displayVal = record.cells[0].old_value[0].number;
                  }
                  return true;
                }
              });
              const calculationFields = _.filter(formattedRecord, {
                fieldType: "calculator",
              });
              if (!_.isEmpty(calculationFields) && calculationFields.length) {
                calculationFields.forEach((fieldObj) => {
                  let formula = fieldObj.rawFormula;
                  numFields.forEach((numObj) => {
                    const id = Number(numObj.uniqueId);
                    let val = numObj.displayVal;
                    val = val.replace(/,/g, "");
                    val = val && val !== "" ? val : 0;
                    if (formula.includes(id)) {
                      while (formula.includes(id)) {
                        formula = formula.replace(id, val);
                      }
                      fieldObj.isChange = true;
                      const calculatorVal = eval(formula);
                      fieldObj.calculatorVal = calculatorVal;
                    }
                  });
                });
                calculationFields.forEach((variable) => {
                  if (variable.isChange && variable.isChange === true) {
                    const formData = new FormData();
                    formData.append("fieldType", "calculator");
                    formData.append("fieldId", variable.field_id);
                    formData.append("application_id", this.activeAppId);
                    formData.append("record_id", this.recordId);
                    formData.append("uniqueId", this.editSessionId);
                    formData.append(
                      "value",
                      JSON.stringify({
                        text: variable.calculatorVal
                      })
                    );
                    this.appViewService
                      .setField(formData)
                      .then((jresponse: JReponse) => {
                        this.mapSuggestion = {};
                        if (jresponse.success) {
                          this.revisionModalRef.hide();
                          this.appViewService
                            .getAppRecords(this.activeAppId)
                            .then((jresponse: JReponse) => {
                              if (jresponse.success) {
                                this.recordData = jresponse.body;
                                this.setRecordList();
                                const formattedRecord = this.formattedRecordData.find(
                                  (record) => record.id === this.recordId
                                );
                                this.setFormValues(formattedRecord, true);
                              }
                            })
                            .catch((err: Error) => {
                              throw err;
                            });
                        }
                      })
                      .catch((err: Error) => {
                        throw err;
                      });
                  }
                });
              } else {
                this.revisionModalRef.hide();
                this.appViewService
                  .getAppRecords(this.activeAppId)
                  .then((jresponse: JReponse) => {
                    if (jresponse.success) {
                      this.recordData = jresponse.body;
                      this.setRecordList();
                      const formattedRecord = this.formattedRecordData.find(
                        (record) => record.id === this.recordId
                      );
                      this.setFormValues(formattedRecord, true);
                    }
                  })
                  .catch((err: Error) => {
                    throw err;
                  });
              }
            } else {
              this.revisionModalRef.hide();
              this.appViewService
                .getAppRecords(this.activeAppId)
                .then((jresponse: JReponse) => {
                  if (jresponse.success) {
                    this.recordData = jresponse.body;
                    this.setRecordList();
                    const formattedRecord = this.formattedRecordData.find(
                      (record) => record.id === this.recordId
                    );
                    this.setFormValues(formattedRecord, true);
                  }
                })
                .catch((err: Error) => {
                  throw err;
                });
            }

            resolve();
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          this.showProgress = false;
          reject();
          throw err;
        });
    });
  }

  setFilterCounts() {
    this.appliedFilterCount = 0;
    this.selectedFilterCount = {};
    this.appViewService.selectedAppFilters.forEach((filter) => {
      if (filter.type === "member" || filter.type === "category") {
        this.appliedFilterCount += +1;
        this.selectedFilterCount[filter.id] = filter.value.length;
      } else if (filter.type === "location") {
        if (!this.selectedFilterCount[filter.id]) {
          this.selectedFilterCount[filter.id] = {};
        }
        if (filter.label.includes("Country")) {
          this.selectedFilterCount[filter.id].country = filter.value.length;
        } else if (filter.label.includes("State")) {
          this.selectedFilterCount[filter.id].state = filter.value.length;
        } else if (filter.label.includes("City")) {
          this.selectedFilterCount[filter.id].city = filter.value.length;
        } else {
          this.selectedFilterCount[filter.id].postal = filter.value.length;
        }
        this.appliedFilterCount += +1;
      } else {
        this.appliedFilterCount += 1;
        this.selectedFilterCount[filter.id] = 1;
      }
    });
  }

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  getTotalCount() {
    // this.appliedFilterCount = this.appViewService.selectedAppFilters.length;
    this.appliedFilterCount = 0;
    Object.keys(this.selectedFilterCount).forEach((key) => {
      // if (this.selectedFilterCount[key]) {
      this.appliedFilterCount += this.selectedFilterCount[key];
      // }
    });
  }

  emptyFilters() {
    this.appViewService.selectedAppFilters = [];
    this.selectedFilterCount = {};
    this.appliedFilterCount = 0;
    // if (this.appViewService.selectedView) {
    //   const view =
    //     this.appViewService.allViews.team.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     ) ||
    //     this.appViewService.allViews.private.find(
    //       (view) => view._id === this.appViewService.selectedView
    //     );
    //   if (view.name !== "All") {
    //     this.appViewService.isViewUnsaved = true;
    //   }
    // }
    this.appViewService.isViewUnsaved = true;
    if (this.viewType === "calender") {
      this.appViewService.applyFiltersInCalendar.next({
        toApply: "filters",
      });
    } else {
      this.getAppRecords(this.activeAppId, "", true);
    }
    this.getTotalCount();
  }

  ngOnDestroy() {
    this.newMemberRecordSubscription.unsubscribe();
    this.newCategoryRecordSubscription.unsubscribe();
    this.editRecordSubscription.unsubscribe();
    this.uploadImageSubscription.unsubscribe();
    this.refreshAppSubscription.unsubscribe();
    this.refreshAppFields.unsubscribe();
    this.activeViewSubscription.unsubscribe();
    this.editCategoryRecordSubscription.unsubscribe();
    this.addRecordCalendarSubscription.unsubscribe();
    this.editRecordCalendarSubscription.unsubscribe();
    this.deleteRecordCalendarSubscription.unsubscribe();
    this.refreshCommentSubscription.unsubscribe();
  }

  plusButtonClick() {
    document.getElementById("grid-mobile-add-button").click();
  }

  displaySearch(field) {
    field.relationSearch = true;
  }

  getAppList(event, field) {
    this.appFields.forEach((element) => {
      if (element.appRecords) {
        element.appRecords = [];
      }
    })
    document.getElementById(field._id.toString()).focus();
    const keyword = event.target.value;
    let query = "";
    if (keyword) {
      query = `?keyword=${keyword}`;
    }
    this.appViewService
      .getAppList({
        applications: field.options.selectedApps
      }, query)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.displayApps = true;
          field.appRecords = jresponse.body;
          field.appRecords.forEach((field) => {
            field.list.forEach((record) => {
              const options = _.find(record.data, (fieldobj) => {
                if (fieldobj.value.text) {
                  return fieldobj.value.text;
                }
              });
              const member = _.find(record.data, (fieldobj) => {
                if (fieldobj.value.members) {
                  return fieldobj.value.members[0];
                }
              });
              const category = _.find(record.data, (fieldobj) => {
                if (
                  fieldobj.value.select &&
                  fieldobj.field_id.options &&
                  fieldobj.field_id.options.choice == "Single choice"
                ) {
                  return fieldobj.value.select;
                }
              });
              const title =
                options &&
                !_.isEmpty(options) &&
                typeof options.value.text == "string" ?
                options.value.text :
                "";
              const user =
                member && !_.isEmpty(member) ? member.value.members[0] : "";
              const categorySingle =
                category &&
                !_.isEmpty(category) &&
                typeof category.value.select == "string" ?
                category.value.select :
                "";
              record.recordName = title;
              record.member = user;
              record.category = categorySingle;
            });
            let list;
            if (keyword) {
              list = field.list.filter((data) =>
                data.recordName
                .toLowerCase()
                .includes(event.target.value.toLowerCase())
              );
            } else {
              list = _.filter(field.list, (source) => {
                if (source.recordName) {
                  return source;
                }
              });
            }
            field.list = list;
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  selectRecord(app, record, field) {
    field.relationSearch = false;
    this.displayApps = false;
    // return false
    const recordObj = {
      _id: record._id,
      recordName: record.recordName,
      member: record.member ? record.member : "",
      category: record.category ? record.category : "",
      appId: record.application_id,
      application_id: {
        _id: record.application_id,
        name: record.application.name,
      },
      workspace_id: {
        _id: record.application.workspace_id._id,
        name: record.application.workspace_id.name,
      },
    };
    this.selectedRecord[field.label] = this.selectedRecord[field.label] ?
      this.selectedRecord[field.label] :
      [];
    const availableRecord = _.find(this.selectedRecord[field.label], {
      _id: record._id,
    });
    if (!availableRecord) {
      this.selectedRecord[field.label].push(recordObj);
    } else {
      const title = _.find(this.selectedRecord[field.label], {
        _id: record._id,
      });
      title.recordName = record.recordName;
    }
    const json = JSON.parse(JSON.stringify(this.selectedRecord[field.label]));
    const filterObj = _.filter(json, (obj) => {
      delete obj.workspace_id;
      delete obj.memberObj;
      delete obj.application_id;
      delete obj.selectedCategory;
      delete obj.categoryObj;
      return obj;
    });

    // return false
    const recordData = {
      fieldType: "relationship",
      application_id: this.activeAppId,
      record_id: this.recordId,
      uniqueId: this.editSessionId,
      fieldId: field._id,
      value: JSON.stringify({
        text: filterObj
      }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getAppRecords(this.activeAppId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              this.recordData = jresponse.body;

              this.setRecordList();
              const formattedRecord = this.formattedRecordData.find(
                (record) => record.id === this.recordId
              );
              this.setFormValues(formattedRecord, true);
            }
          })
          .catch((err: Error) => {
            this.helperService.showErrorToast(err.message);
            this.showProgress = false;
            throw err;
          });
      }
    }).catch((err: Error) => {
      throw err;
    });;
  }

  removeRecord(record, index, field) {
    this.displayApps = false;
    this.selectedRecord[field.label].splice(index, 1);
    const json = JSON.parse(JSON.stringify(this.selectedRecord[field.label]));
    const filterObj = _.filter(json, (obj) => {
      delete obj.workspace_id;
      delete obj.memberObj;
      delete obj.application_id;
      delete obj.selectedCategory;
      delete obj.categoryObj;
      return obj;
    });

    const recordData = {
      fieldType: "relationship",
      application_id: this.activeAppId,
      record_id: this.recordId,
      uniqueId: this.editSessionId,
      fieldId: field._id,
      value: JSON.stringify({
        text: filterObj
      }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getAppRecords(this.activeAppId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              this.recordData = jresponse.body;
              this.setRecordList();
              const formattedRecord = this.formattedRecordData.find(
                (record) => record.id === this.recordId
              );
              this.setFormValues(formattedRecord, true);
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }).catch((err: Error) => {
      this.helperService.showErrorToast(err.message);
      this.showProgress = false;
      throw err;
    });;
  }

  openRelationRecordModal(recordData) {
    const recordId = recordData._id;
    this.appViewService
      .getSingleRecord(recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          const allRecords = jresponse.body;
          const record = jresponse.body[0];
          const initialState = {
            recordId,
            appFields: record.appFields,
            recordFormValues: record.data,
            appId: record.application_id,
            workspaceId: record.workspace_id,
            orgId: record.organization_id,
            type: "relation",
          };
          document.getElementById("closeRecordModal").click();
          this.homeService.recordModalRef = this.modalService.show(
            RecordModalComponent, {
              initialState,
              class: "modal-lg",
              animated: true,
              keyboard: true,
              backdrop: true,
              ignoreBackdropClick: false
            }
          );
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  changeCategory(event, record, field) {

    record.category = event.id;
    this.selectedRecord[field.label] = this.selectedRecord[field.label] ?
      this.selectedRecord[field.label] :
      [];
    const availableRecord = _.find(this.selectedRecord[field.label], {
      _id: record._id,
    });
    if (!availableRecord) {
      this.selectedRecord[field.label].push(record);
    } else {
      const title = _.find(this.selectedRecord[field.label], {
        _id: record._id,
      });
      title.recordName = record.recordName;
    }

    const recordData = {
      fieldType: "relationship",
      application_id: record.appId,
      record_id: record._id,
      uniqueId: this.editSessionId,
      fieldId: record.field,
      value: JSON.stringify({
        select: event.id
      }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getAppRecords(this.activeAppId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              this.recordData = jresponse.body;
              this.setRecordList();
              const formattedRecord = this.formattedRecordData.find(
                (record) => record.id === this.recordId
              );
              this.setFormValues(formattedRecord, true);
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }).catch((err: Error) => {
      this.helperService.showErrorToast(err.message);
      this.showProgress = false;
      throw err;
    });;
  }

  async getData(field, fieldObj) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getAppRelationRecords({
          field_id: field._id,
          app: field.options.selectedApps,
        })
        .then((jresponse: JReponse) => {
          resolve();
          fieldObj.selectedApps = jresponse.body;
          //   fieldObj.records=[];
          const records = _.map(jresponse.body, (obj) => {
            return obj.data;
          });

          let finalData = [];
          for (let i = 0; i < records.length; i++) {
            finalData = [...finalData, ...records[i]];
          }
          fieldObj.records = finalData;
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  goToPublicProfile(id) {
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
  }

  async deleteRecordComment(id) {
    await this.apiService
      .deleteWithHeader(`record/${id}/deleteComment`)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.getComments();
        this.getActivities();
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async likeRecordComment(id) {
    await this.apiService
      .getWithHeader(`record/${id}/commentLikes`)
      .then((jresponse: JReponse) => {
        this.getComments();
        this.getActivities();
      })
      .catch((err: any) => {
        throw err;
      });
  }

  editRecordComment(id, comment) {
    let commentText;
    let userIds = [];
    if (comment.comment_for_update && comment.comment_for_update != '') {
      commentText = comment.comment_for_update.split('{{');
      commentText = commentText.filter(e => e.includes('}}'));
      commentText.forEach(e => {
        userIds.push((e.split('}}')[0]));
        // splitText = e.split('}}')[1];
      });
      let data = _.chain(this.createdByUserList)
        .keyBy('_id')
        .at(userIds)
        .value();
      let latestField = data.map(obj => {
        let newObj = obj;
        newObj.old_id = `{{${newObj._id}}}`
        newObj.old_name = obj.lastName && !_.isEmpty(obj.lastName) ? obj.firstName + ' ' + obj.lastName : obj.firstName;
        newObj.fullName = obj.old_name.trim();
        newObj.id = obj.old_id;
        newObj.name = obj.old_name;
        delete newObj.old_id;
        delete newObj.old_name
        return newObj
      })
      selectedMentionUsers = latestField;
    }
    this.editComment = comment.comment;
    this.commentId = id;
    this.appViewService.sendMentionData({
      comment: this.editComment,
      comment_for_update: comment.comment_for_update,
      selectedMentionUsers: selectedMentionUsers
    });
    this.cdRef.detectChanges();
    let elms = document.querySelectorAll("div.client-name");
    for (let i = 0; i < elms.length; i++) {
      elms[i].setAttribute("contenteditable", "false");
    }
  }

  getOrgPlan() {
    this.appViewService
      .getOrgPlan(this.orgId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.orgPlan = jresponse.body.plan;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  shareRecordCheckBoxClicked() {
    if (this.orgPlan !== 'pro') {
      this.showUpgradePlanPopup = true;
    }
  }

  hideUpgradePlanPopup(event) {
    if (event.target.className !== "checkmark") {
      this.showUpgradePlanPopup = false;
    }
  }

  upgradePlan() {
    if (this.helperService.orgList) {
      this.modalRef.hide();
      if (this.helperService.orgList.length > 1) {
        this.openUpgradeModal();
      } else {
        document.getElementById("closeRecordModalBtn").click();
        this.router.navigateByUrl(
          `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
        );
      }
      this.showUpgradePlanPopup = false;
    }
  }
  hideShowApps(option) {
    if (option) {
      this.displayDrop = false;
    } else {
      this.displayDrop = !this.displayDrop;
    }
  }
  openUpgradeModal() {
    const modalParams = Object.assign({}, {
      class: "small-custom-modal custom-upgrade-modal",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
    this.modalRef = this.modalService.show(UpgradePopupComponent, modalParams);
  }
  appViewServiceFunc(appViewServiceFunc) {}

  getAppsContainerScroll() {
    var content = document.getElementById('apps-tabs-container')

    if (content && content.scrollWidth && content.offsetWidth) {
      let scrollWidth = content.scrollWidth
      let contentWidth = content.offsetWidth

      if (scrollWidth > contentWidth) {
        this.appsNav = true
      } else {
        this.appsNav = false
      }
    }

  }

  scrollAppTabToRight() {

    document.getElementById('apps-tabs-container').className += ' scroll-behavior ';

    const content = document.getElementById('apps-tabs-container')

    if (content && content.scrollWidth && content.offsetWidth) {
      let scrollLeft = content.scrollLeft
      let scrollWidth = content.scrollWidth
      let contentWidth = content.offsetWidth

      if ((scrollLeft + contentWidth) >= scrollWidth) {
        content.scrollTo(scrollWidth + 20, 0);
      } else {
        content.scrollTo((scrollLeft + this.scrollStep + 20), 0);
      }
    }

    document.getElementById('apps-tabs-container').classList.remove("scroll-behavior");

  }

  scrollAppTabToLeft() {

    document.getElementById('apps-tabs-container').className += ' scroll-behavior ';

    const content = document.getElementById('apps-tabs-container')
    let scrollLeft = content.scrollLeft;

    if ((scrollLeft - this.scrollStep) <= 0) {
      content.scrollTo(0, 0);
    } else {
      content.scrollTo((scrollLeft - this.scrollStep - 20), 0);
    }

    document.getElementById('apps-tabs-container').classList.remove("scroll-behavior");

  }

  // CHECK FILE - IMAGE / DOC
  // TO RENDER FILE VIEW COMPONENT
  checkTypeAndGetImageDoc(getImagePath: any) {
    return this.helperFunctions.checkTypeAndGetImageDoc(getImagePath);
  }

  // GET ATTACHMENT URL
  // IF URL CONTAINS 'DOC' PARAM
  getAttachmentcUrl(getImagePath: any, action: any = 'view') {
    return this.helperFunctions.getAttachmentcUrl(getImagePath, action);
  }

  // DOWNALOD API FOR ATTACHMENT - IN MODAL BOX
  async getDownloadAttachment(filename: any) {
    return this.helperFunctions.getDownloadAttachment(filename);
  }

  // GET FILE ICON USING EXTENSION
  getFileIconUsingExtension(extension: any) {
    return this.helperFunctions.getFileIconUsingExtension(extension);
  }

  // GET FILE SUPPORTED FORMAT
  getSupportedFormat(fileExtension: any) {
    return this.helperFunctions.getSupportedFormat(fileExtension);
  }

  closeModalBox() {
    return this.helperFunctions.closeModalBox();
  }

}
