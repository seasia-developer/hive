import {
  Component,
  OnInit,
  TemplateRef,
  Renderer2,
  QueryList,
  ViewChildren,
  AfterViewChecked,
  OnDestroy
} from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { v4 as uuid } from "uuid";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { AppViewService } from "../application-view.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { Constants } from "src/app/constants/constants";
import { AppBuilderService } from "../../application-builder/application-builder.service";
import { HomeService } from "../../home.service";
import * as _ from "lodash";
import { HelperFunctions } from "../../../../helpers/index.service";
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: "app-application-kanban-view",
  templateUrl: "./application-kanban-view.component.html",
  styleUrls: ["./application-kanban-view.component.scss"],
})

export class ApplicationKanbanViewComponent
  implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChildren("list") components: QueryList<any>;
  modalRef: BsModalRef;
  categoryColors = Constants.CATEGORY_COLORS;
  selectedColor = this.categoryColors[0];
  newCategoryName = "";
  showColorMenu = false;
  workspaceId: any;
  activeAppId: any;
  selectedAppTab: number;
  appFields: any;
  recordData: any;
  recordCategoryField: any;
  hasCategoryField: boolean;
  categories = {};
  selectedCategory: string;
  columnView: any;
  selectedRow: any;
  appLayoutOptions = [];
  showLayoutOptionMenu = 0;
  selectedLayoutOptions: any = [{}, {}, {}];
  recordLayoutData: any = [{}, {}, {}];
  editSessionId: any;
  showRecords = false;
  updatedData = {};
  appRecordComments: any;
  isDisplayleftSide = true;
  listIds = [];
  optionsCount: any;
  membersCount = 1;
  groupedIds = [[]];
  toUpdateHeight = false;
  hasNoneCategory = true;
  delayDrag = false;
  recordDisplayIndex:any = 0;


  // Subscriptions
  activeAppSubs = new Subscription();
  changeAppSubs = new Subscription();
  rowOptionsSubs = new Subscription();
  columnOptionsSubs = new Subscription();

  // count the clicks
  private clickTimeout = null;

  editKanbanRecordId:any;
  orgRole:any = 'light_member';

  constructor(
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private appViewService: AppViewService,
    private renderer: Renderer2,
    private appBuilderService: AppBuilderService,
    private router: Router,
    private homeService: HomeService,
    public helperFunctions: HelperFunctions,
    private helperService: HelperService
  ) {
    if (
      this.router.url.includes("/application/home/admin/contributed-workspaces")
    ) {
      this.isDisplayleftSide = false;
    }
  }

  openModal(template: TemplateRef<any>, type = "") {
    if (this.isDisplayleftSide) {
      if (type === "layout-options") {
        // To set the layout options as per the application or to reset it to default
        if (
          this.appViewService.activeApp.layout_options &&
          this.appViewService.activeApp.layout_options.length
        ) {
          this.selectedLayoutOptions = JSON.parse(
            JSON.stringify(this.appViewService.activeApp.layout_options)
          );
        } else {
          this.setDefaultLayoutOptions();
        }
        this.modalRef = this.modalService.show(template, { class: type,animated: true,
          keyboard: true,
          backdrop: true,
          ignoreBackdropClick: false });
      } else {
        this.newCategoryName = "";
        this.modalRef = this.modalService.show(template, { class: type,animated: true,
          keyboard: true,
          backdrop: true,
          ignoreBackdropClick: false });
      }
    }
  }

  ngAfterViewChecked() {
    // To connect all the lists in order to make drag and drop work
    this.components["_results"].forEach((dropList) => {
      this.components["_results"].forEach((list) => {
        // To connect the lists as per the groups
        // tslint:disable-next-line: max-line-length
        if (
          list.id &&
          !dropList.connectedTo.includes(list.id) &&
          ((list.id.includes("row") && dropList.id.includes("row")) ||
            (list.id.includes("column") && dropList.id.includes("column")))
        ) {
          if (!this.listIds.includes(list.id)) {
            if (this.selectedRow && !list.id.includes("column")) {
              this.listIds.push(list.id);
              let isUnique = true;
              this.groupedIds.forEach((group) => {
                if (group.includes(list.id)) {
                  isUnique = false;
                }
              });
              if (isUnique) {
                if (
                  this.groupedIds[this.groupedIds.length - 1].length <
                  this.membersCount
                ) {
                  this.groupedIds[this.groupedIds.length - 1].push(list.id);
                } else {
                  const newList = [list.id];
                  this.groupedIds.push(newList);
                }
              }
              if (
                this.listIds.length ===
                this.optionsCount * (this.selectedRow ? this.membersCount : 1)
              ) {
                // const el3 = document.getElementById(list.id);
                // const el2 = document.getElementById(this.listIds[1]);
                // el3.style.height = `${el2.clientHeight + 4}px`;
                for (let i = 0; i < this.membersCount; i++) {
                  const heights = [];
                  this.groupedIds.forEach((group) => {
                    heights.push(
                      document.getElementById(group[i]).clientHeight
                    );
                  });
                  const max = Math.max(...heights);
                  this.groupedIds.forEach((group, ind) => {
                    const el = document.getElementById(group[i]);
                    if (el.clientHeight < max) {
                      // const cat = this.categories[this.selectedCategory].find(c => c.id === "16af8a87-fc10-42d9-af3d-98d8b4b2ff51");
                      const cat = this.categories[this.selectedCategory].find(
                        (c) =>
                          c.id ===
                          group[i].substring(0, group[i].indexOf("none"))
                      );
                      el.style.minHeight = `${
                        max +
                        (i === 0 && cat && !cat.rowGroups.none.length ? 4 : 0)
                        }px`;
                    }
                  });
                }
              }
            }
          }
          if (
            this.toUpdateHeight &&
            this.listIds.length ===
            this.optionsCount * (this.selectedRow ? this.membersCount : 1)
          ) {
            // const el3 = document.getElementById(list.id);
            // const el2 = document.getElementById(this.listIds[1]);
            // el3.style.height = `${el2.clientHeight + 4}px`;
            this.toUpdateHeight = false;
            for (let i = 0; i < this.membersCount; i++) {
              const heights = [];
              this.groupedIds.forEach((group) => {
                heights.push(document.getElementById(group[i]).clientHeight);
              });
              const max = Math.max(...heights);
              this.groupedIds.forEach((group) => {
                const el = document.getElementById(group[i]);
                if (el.clientHeight < max) {
                  const cat = this.categories[this.selectedCategory].find(
                    (c) =>
                      c.id === group[i].substring(0, group[i].indexOf("none"))
                  );
                  el.style.minHeight = `${
                    max + (i === 0 && cat && !cat.rowGroups.none.length ? 4 : 0)
                    }px`;
                }
              });
            }
          }
          dropList.connectedTo.push(list.id);
        }
      });
    });
  }

  updateHeight() {
    for (let i = 0; i < this.membersCount; i++) {
      const heights = [];
      this.groupedIds.forEach((group) => {
        heights.push(document.getElementById(group[i]).clientHeight);
      });
      const max = Math.max(...heights);
      this.groupedIds.forEach((group) => {
        const el = document.getElementById(group[i]);
        if (el.clientHeight <= max) {
          const cat = this.categories[this.selectedCategory].find(
            (c) => c.id === group[i].substring(0, group[i].indexOf("none"))
          );
          el.style.minHeight = `${
            max + (i === 0 && cat && !cat.rowGroups.none.length ? 4 : 0)
            }px`;
        }
      });
    }
  }

  async updateOrder(event, category, rowId = "", type = "column") {
    if ((this.selectedRow && rowId) || !this.selectedRow) {
      if (event.previousContainer === event.container) {
        if (!rowId) {
          // For column only sorting
          moveItemInArray(
            category.records,
            event.previousIndex,
            event.currentIndex
          );
          this.updateSortingOrder(category);
        } else {
          moveItemInArray(
            category.rowGroups[rowId],
            event.previousIndex,
            event.currentIndex
          );
          this.updateSortingOrder(category, rowId);
        }
      } else {
        const item = this.recordData.find(
          (record) => record._id === event.item.element.nativeElement.id
        );
        const columnId = category.id;
        this.editSessionId = uuid();
        if (!rowId) {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          await this.updateRecord(item, columnId, "category");
          this.updateSortingOrder(category);
        } else {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          const oldMember = event.previousContainer.element.nativeElement.className.split(
            " "
          );
          const recordMemberField = item.data.find(
            (data) => data.field_id === this.selectedRow
          );
          let newMembers = [];
          if (recordMemberField) {
            newMembers = recordMemberField.value.members;
            const index = recordMemberField.value.members.findIndex(
              (member) => oldMember[0] === member
            );
            newMembers.splice(index, 1);
          }
          // const categoryFieldId = this.appFields.find(data => data.label === this.selectedCategory)._id;
          const recordCategoryField = item.data.find(
            (data) => data.field_id === this.selectedCategory
          );
          if (
            !recordCategoryField ||
            (recordCategoryField &&
              recordCategoryField.value.select !== category.id)
          ) {
            await this.updateRecord(item, columnId, "category");
          }
          if (
            !recordMemberField ||
            !recordMemberField.value.members.includes(rowId)
          ) {
            if (rowId !== "none") {
              newMembers.push(rowId);
            }
            await this.updateRecord(item, newMembers, "member");
          }
          this.updateSortingOrder(category, rowId);
          this.updateHeight();
          // setTimeout(() => {
          // }, 50);
        }
      }
    }
  }

  ngOnInit() {

    if (window.innerWidth < 767) {
      this.delayDrag = true;
    } else {
      this.delayDrag = false;
    }

    if(this.helperService.getLocalStore("orgRole") === 'light_member'){
      this.orgRole = 'light_member';
    }

    // // To reset column and row options for new application
    // this.appViewService.displayColumnOption = "";
    // this.appViewService.displayRowOption = "";

    this.renderer.listen("window", "click", (event) => {
      // tslint:disable-next-line: max-line-length
      if (event.target.id !== "color-menu") {
        this.showColorMenu = false;
      }
      if (event.target.id !== "layout-option") {
        this.showLayoutOptionMenu = 0;
      }
    });

    // To update data when application in changed
    this.activeAppSubs = this.appViewService.activeAppId.subscribe((id) => {
      // To reset the category in order to refresh the categories list after adding a new record
      if (!id) {
        this.activeAppId = "";
      }
      // To avoid multiple calls of app fields API for the same app
      if (id && this.activeAppId !== id) {
        this.activeAppId = id;
        // To reset categories
        this.categories = {};
        this.getAppFields(id);
        this.toUpdateHeight = true;
      }
    });

    this.changeAppSubs = this.appViewService.changeApplication.subscribe(
      (id) => {
        this.activeAppId = id;
        // To reset categories
        this.categories = {};
        this.updatedData = {};
        this.getAppFields(id);
        this.toUpdateHeight = true;
      }
    );
    // To group the records as per the selected column
    this.columnOptionsSubs = this.appViewService.columnOption.subscribe(
      (option: any) => {
        if (this.selectedCategory !== option._id) {
          this.selectedCategory = option._id;
          this.categories = {};
          this.getAppFields(this.activeAppId);
          this.toUpdateHeight = true;
        }
      }
    );

    // To group the records as per the selected row
    this.rowOptionsSubs = this.appViewService.rowOption.subscribe(
      (option: any) => {
        if (
          !this.selectedRow ||
          (this.selectedRow && this.selectedRow !== option._id)
        ) {
          this.selectedRow = option._id;
          this.toUpdateHeight = true;
          this.categories = {};
          this.getAppFields(this.activeAppId);
        }
      }
    );

    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.activeAppId = this.activatedRoute.snapshot.queryParams.appId;
    this.selectedCategory = this.activatedRoute.snapshot.queryParams.column;
    this.selectedRow = this.activatedRoute.snapshot.queryParams.row;

    // if (activeApp.layout_options) {
    //   this.selectedLayoutOptions = activeApp.layout_options;
    // }

    // To reset categories
    this.categories = {};
    this.getAppFields(this.activeAppId);
  }

  async getAppFields(appId) {

    // To reset record category field
    this.recordCategoryField = "";
    // To reset selected row
    if (this.appViewService.displayRowOption === undefined) {
      this.selectedRow = this.activatedRoute.snapshot.queryParams.row;
    } else {
      this.selectedRow = this.appViewService.displayRowOption._id;
    }

    if (!this.appViewService.displayColumnOption) {
      this.selectedCategory = this.activatedRoute.snapshot.queryParams.column;
    } else {
      this.selectedCategory = this.appViewService.displayColumnOption._id;
    }
    // To ensure that workspace app list is loaded
    if (!this.appViewService.workspaceAppsList.length) {
      await this.appViewService.refreshApps(
        this.workspaceId,
        this.homeService.wsRole
      );
    }
    // this.appViewService.displayRowOption = this.activatedRoute.snapshot.queryParams.row;
    this.appViewService.selectedAppTab = this.appViewService.workspaceAppsList.findIndex(
      (app) => app._id === appId
    );
    this.appViewService
      .getFields(appId)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.appFields = jresponse.body;
          await this.getRecordComments();
          if (!this.appViewService.displayRowOption) {
            this.appViewService.displayRowOption = this.appFields.find(
              (field) => field._id === this.selectedRow
            );
          }
          if (!this.appViewService.displayColumnOption) {
            this.appViewService.displayColumnOption = this.appFields.find(
              (field) => field._id === this.selectedCategory
            );

          }
          this.appViewService.activeApp = this.appViewService.workspaceAppsList.find(
            (app) => app._id === this.activeAppId
          );
          // To set layout option default fields
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

          this.appFields.forEach((field) => {
            this.appLayoutOptions.push(field.label);
          });
          if (this.activatedRoute.snapshot.queryParams.column) {
            this.selectedCategory = this.activatedRoute.snapshot.queryParams.column;
          } else {
            this.selectedCategory = this.appViewService.activeApp.columnId;
          }
          //  this.selectedCategory = this.activatedRoute.snapshot.queryParams.column;
          // For no column grouping
          if (!this.selectedCategory) {
            const categoryData = this.appFields.find(
              (field) =>
                field.type === "category" &&
                field.options.choice === "Single choice"
            );
            if (categoryData) {
              this.recordCategoryField = JSON.parse(
                JSON.stringify(categoryData)
              );
              this.selectedCategory = this.recordCategoryField._id;
            }
          } else {
            const field = this.appFields.find(
              (field) =>
                field.type === "category" && field._id === this.selectedCategory
            );
            // tslint:disable-next-line: max-line-length
            if (field) {
              this.recordCategoryField = JSON.parse(JSON.stringify(field));
            }
          }
          this.hasCategoryField = Boolean(this.recordCategoryField);
          if (!this.hasCategoryField) {
            this.appViewService.apiCalled = false;
          }
          this.categories[this.selectedCategory] = [];
          if (this.recordCategoryField) {
            this.membersCount = 1 + this.appViewService.wsMembers.length;
            this.recordCategoryField.options.selectOptions.forEach((option) => {
              option.records = [];
              option.fieldId = this.recordCategoryField._id;
              this.categories[this.selectedCategory].push(option);
            });
            const noCategoryRecord = {
              id: "None",
              label: "None",
              fieldId: this.recordCategoryField._id,
              records: [],
            };
            this.categories[this.selectedCategory].unshift(noCategoryRecord);
            this.optionsCount = this.categories[this.selectedCategory].length;
            this.getAppRecords(appId);
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getRecordComments() {
    return new Promise((resolve, reject) => {
      this.appViewService
        .appRecordComments(this.activeAppId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.appRecordComments = jresponse.body;
            resolve();
            // this.appViewService.apiCalled = false;
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  getAppRecords(appId) {
    this.appViewService
      .getAppRecords(appId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.recordData = jresponse.body;
          this.appViewService.activeAppRecords = this.recordData;
          this.addRecordsInCategories();
          // this.appViewService.apiCalled = false;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async addRecordsInCategories() {
    this.showRecords = false;
    this.recordData.forEach((record) => {
      let categoryData = record.data.find(
        (data) => data.field_id === this.recordCategoryField._id
      );
      categoryData = _.compact(categoryData)
      // categoryData = categoryData
      if (categoryData) {
        if (categoryData.value) {
          const categoryObj = this.categories[this.selectedCategory].find(
            (category) => category.id === categoryData.value.select
          );
          if (categoryObj) {
            categoryObj.records.push("");
          } else {
            this.categories[this.selectedCategory][0].records.push("");
          }
        } else {
          this.categories[this.selectedCategory][0].records.push("");
        }


      } else {
        this.categories[this.selectedCategory][0].records.push("");
      }
    });
    for (const record of this.recordData) {
      if (record.data.length) {
        const commentCount = this.appRecordComments[record._id]
          ? this.appRecordComments[record._id].length
          : 0;
        let categoryData = record.data.find(
          (data) => data.field_id === this.recordCategoryField._id
        );
        record.display = ["", "", ""];
        record.date = false;
        const dateField = this.appFields.find(
          (field) =>
            field.type === "date" && field.options.display === "Show end date"
        );
        if (dateField) {
          const recordDateField = record.data.find(
            (data) => data.field_id === dateField._id
          );
          if (recordDateField && recordDateField.value.end) {
            record.date = recordDateField.value.end;
          }
        }
        // To order respective record values as per the layout option display
        for (let i = 0; i < 3; i++) {
          const fieldData = this.appFields.find(
            (field) =>
              field._id === this.appViewService.selectedLayoutOptions[i]._id
          );
          if (fieldData) {
            const recordData = record.data.find(
              (data) => data.field_id === fieldData._id
            );
            if (recordData) {
              const layoutData = JSON.parse(
                JSON.stringify(
                  record.data.find((data) => data.field_id === fieldData._id)
                )
              );
              layoutData.type = fieldData.type;
              if (
                fieldData.type === "image" && layoutData.value &&
                layoutData.value.image[layoutData.value.image.length - 1]
              ) {
                layoutData.attachment =
                  environment.MEDIA_URL +
                  layoutData.value.image[layoutData.value.image.length - 1]
                    .attachment.path;

                record.display[i] = layoutData;
              } else if (layoutData) {
                if (layoutData.type === "date" && layoutData.value.date) {
                  layoutData.val = moment(layoutData.value.date).format(
                    "MMM DD, YYYY"
                  );
                  if (layoutData.value.end) {
                    layoutData.val = `${layoutData.val} - ${moment(layoutData.value.end).format(
                      "MMM DD, YYYY"
                    )}`
                  }
                } else if (layoutData.type === "category") {
                  if (layoutData.value && layoutData.value.select) {
                    const category = fieldData.options.selectOptions.find(cat => cat.id === layoutData.value.select);
                    if (category) {
                      layoutData.val = category.label;
                    } else {
                      layoutData.val = "";
                    }
                  } else {
                    layoutData.val = "";
                  }
                } else if (layoutData.type === "member") {
                  layoutData.val = layoutData.value.members.reduce((res, member) => {
                    const mem = this.appViewService.members.find(m => m.user_id._id === member);
                    if (mem) {
                      res = `${res}${res ? "," : ""} ${mem.user_id.firstName} ${mem.user_id.lastName}`;
                      return res;
                    } else {
                      return "";
                    }
                  }, "")
                } else if (layoutData.type === "phone") {
                  layoutData.val = layoutData.value.tel.reduce((res, phone) => {
                    res = `${res}${res ? "," : ""} (${phone.type}) ${phone.number}`;
                    return res;
                  }, "")
                } else if (layoutData.type === "email") {
                  layoutData.val = layoutData.value.text.reduce((res, email) => {
                    res = `${res}${res ? "," : ""} (${email.type}) ${email.text}`;
                    return res;
                  }, "")
                } else if (layoutData.type === "money") {
                  layoutData.val = `${layoutData.value.number} (${layoutData.value[`${fieldData.label}Type`]})`;
                } else if (layoutData.type === "location") {
                  layoutData.val = layoutData.value.address;
                } else if (layoutData.type === "duration") {
                  let value = "";
                  if (layoutData.value.days) {
                    value = `${layoutData.value.days} Day${layoutData.value.days > 1 ? "s" : ""}`;
                  }
                  if (layoutData.value.hours) {
                    value += ` ${layoutData.value.hours} Hour${layoutData.value.hours > 1 ? "s" : ""}`;
                  }
                  if (layoutData.value.minutes) {
                    value += ` ${layoutData.value.minutes} Minute${layoutData.value.minutes > 1 ? "s" : ""}`;
                  }
                  if (layoutData.value.seconds) {
                    value += ` ${layoutData.value.seconds} Second${layoutData.value.seconds > 1 ? "s" : ""}`;
                  }
                  layoutData.val = value;
                } else {
                  layoutData.val = !_.isEmpty(layoutData.value) ?
                    layoutData.value.text ||
                    layoutData.value.number:"";
                }
                record.display[i] = layoutData;
              }
            }
          }
        }

        record.display = record.display.filter((data) => data !== "");
        let attachmentCount = 0;
        record.showDescription = false;
        record.avatar = "";
        record.users = [];
        for (const data of record.data) {
          // For description logo
          const fieldData = this.appFields.find(
            (field) => field._id === data.field_id
          );
          const recordData = record.data.find(
            (data) => data.field_id === fieldData._id
          );
          if (
            fieldData.type === "text" &&
            fieldData.options.lines === "Multi line" &&
            recordData &&
            recordData.value.text.length
          ) {
            record.showDescription = true;
          }
          // To update record's attachment count
          if (fieldData.type === "image") {
            attachmentCount =data.value && data.value.image ?  data.value.image.length:0;
          }
        }
        const memberField = record.data.find(
          (data) => {
            if (data.value && data.value.members) {
              return data.value.members && data.value.members.length
            }
          }
        );
        if (memberField) {
          memberField.value.members.forEach((m) => {
            const mem = this.appViewService.wsMembers.find(
              (member) => member._id === m
            );
            if (mem) {
              record.users.push(
                JSON.parse(
                  JSON.stringify(
                    mem
                  )
                )
              );
            }
          });
          record.users.forEach((user) => {
            if (user.avatar) {
              user.avatar = environment.MEDIA_URL + user.avatar;
            } else {
              user.avatar = "../../../../../../assets/images/user.png";
            }
          });
          if (record.users.length) record.avatar = true;
        }

        // Record's comment count
        record.commentCount = commentCount;
        record.attachmentCount = attachmentCount;
        let categoryObj: any = {};

        // categoryData = _.compact(categoryData)
        categoryData = (categoryData)

        if(categoryData === undefined || categoryData == ''){
          categoryObj = this.categories[this.selectedCategory][0];
        }
        else{
          if (categoryData.value) {
              categoryObj = this.categories[this.selectedCategory].find(
                (category) => category.id === categoryData.value.select
              );
              if (!categoryObj) {
                categoryObj = this.categories[this.selectedCategory][0];
              }
            } else {
              categoryObj = this.categories[this.selectedCategory][0];
            }
        }

        if (
          record.filterObject &&
          record.filterObject[categoryObj.id] &&
          record.filterObject[categoryObj.id].basicIndex >= 0
        ) {

          categoryObj.records[
            record.filterObject[categoryObj.id].basicIndex
          ] = record;

        } else {
          categoryObj.records.push(record);
        }
      }
    }

    if (this.categories[this.selectedCategory]) {
      this.categories[this.selectedCategory].forEach((category) => {
        category.records = category.records.filter((record) => record != "");
      });
    }
    this.showRecords = true;
    if (!this.categories[this.selectedCategory][0].records.length) {
      this.categories[this.selectedCategory].shift();
      this.optionsCount -= 1;
      if (
        this.groupedIds.length > this.categories[this.selectedCategory].length
      ) {
        this.groupedIds.pop();
        this.hasNoneCategory = false;
      }
    }
    if (this.selectedRow) {
      this.groupRecordsInRows();
    } else {
      this.updatedData = this.categories;
      this.appViewService.apiCalled = false;
    }
  }

  groupRecordsInRows() {
    const fieldId = this.selectedRow;
    for (const category of this.categories[this.selectedCategory]) {
      category.rowGroups = { none: [] };
      for (const member of this.appViewService.wsMembers) {
        const id = member._id;
        category.rowGroups[id] = [];
        if (!category.members) {
          category.members = {};
        }
        category.members[id] = `${member.firstName} ${member.lastName}`;
      }
      // To access group arrays in the loop
      category.rowKeys = [...Object.keys(category.rowGroups)];
      for (const record of category.records) {
        // When the selectedRow is taken from query params
        // if (!this.selectedRow) {
        //   this.selectedRow._id = this.appFields.find(field => field.label === this.selectedRow.label)._id;
        // }
        const recordMemberfield = record.data.find(
          (data) => this.selectedRow === data.field_id
        );
        if (recordMemberfield) {
          const members = recordMemberfield.value.members;
          for (const member of members) {
            category.rowGroups[member].push("");
          }
          // tslint:disable-next-line: max-line-length
          // if (record.filterObject && record.filterObject[category.id] && record.filterObject[category.id][fieldId] && (record.filterObject[category.id][fieldId][member] >= 0)) {
          //   // category.rowGroups[member].splice(record.filterObject[category.id][fieldId][member], 0, record);
          // } else {
          //   // category.rowGroups[member].push(record);
          // }
        } else {
          category.rowGroups.none.push("");
          // category.rowGroups.none.push(record);
        }
      }
    }
    this.fillValuesByOrder(fieldId);
    this.appViewService.apiCalled = false;
  }

  fillValuesByOrder(fieldId) {
    for (const category of this.categories[this.selectedCategory]) {
      for (const record of category.records) {
        // When the selectedRow is taken from query params
        // if (!this.selectedRow._id) {
        //   this.selectedRow._id = this.appFields.find(field => field.label === this.selectedRow.label)._id;
        // }
        const recordMemberfield = record.data.find(
          (data) => this.selectedRow === data.field_id
        );
        if (recordMemberfield && recordMemberfield.value.members.length) {
          const members = recordMemberfield.value.members;
          for (const member of members) {
            // tslint:disable-next-line: max-line-length
            if (
              record.filterObject &&
              record.filterObject[category.id] &&
              record.filterObject[category.id][fieldId] &&
              record.filterObject[category.id][fieldId][member] >= 0
            ) {
              category.rowGroups[member][
                record.filterObject[category.id][fieldId][member]
              ] = record;
            } else {
              category.rowGroups[member].push(record);
            }
          }
        } else {
          // tslint:disable-next-line: max-line-length
          if (
            record.filterObject &&
            record.filterObject[category.id] &&
            record.filterObject[category.id][fieldId] &&
            record.filterObject[category.id][fieldId].none >= 0
          ) {
            category.rowGroups.none[
              record.filterObject[category.id][fieldId].none
            ] = record;
          } else {
            category.rowGroups.none.push(record);
          }
        }
      }
    }
    this.removeEmptyValues();
  }

  removeEmptyValues() {
    for (const category of this.categories[this.selectedCategory]) {
      for (const key of category.rowKeys) {
        category.rowGroups[key] = category.rowGroups[key].filter(
          (data) => data !== ""
        );
      }
    }
    this.updatedData = this.categories;
    if (!this.hasNoneCategory) {
      setTimeout(() => {
        this.updateHeight();
      }, 0);
      this.hasNoneCategory = true;
    }
  }

  addNewRecord(category, member = "") {
    this.toUpdateHeight = true;
    if (!this.appViewService.apiCalled) {
      this.appViewService.apiCalled = true;
      if (member) {
        const data = { category, member, fieldId: this.selectedRow };
        this.appViewService.newCategoryMemberRecord.next(data);
      } else {
        this.appViewService.newCategoryRecord.next(category);
      }
    }
  }

  async editRecord(recordId:any) {
    this.editKanbanRecordId = recordId
    if (this.clickTimeout) {
        this.setClickTimeout(() => {
        });
    } else {
      this.setClickTimeout(() =>
         this.handleSingleClick()
      )
    }
  }

  setClickTimeout(callback) {
    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(() => {
      this.clickTimeout = null;
      callback();
    }, 500);
  }

  async handleSingleClick() {
    this.toUpdateHeight = true;
    await this.appViewService.refreshAppRecords(this.activeAppId);
    this.appViewService.editCategoryRecord.next(this.editKanbanRecordId);
  }

  async getComments(recordId) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getComments(recordId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            resolve(jresponse.body.length);
          }
        })
        .catch((err: Error) => {
          // reject(err);
          throw err;
        });
    });
  }

  addNewCategoryOption() {
    const newCategoryOption = {
      id: uuid(),
      label: this.newCategoryName,
      color: this.selectedColor,
    };
    const result = { application_id: this.activeAppId, template: [] };
    this.appFields.forEach((field) => {

    var addlabel = field.label;
    addlabel = this.helperService.removeTags(addlabel);

      // Sauda
      const obj = {
        _id: field._id,
        type: field.type,
        label: addlabel,
        icon: field.icon,
        index: field.index,
        options: field.options,
      };
      if (field._id === this.selectedCategory) {
        obj.options.selectOptions.push(newCategoryOption);
      }
      result.template.push(obj);
    });
    this.appBuilderService
      .createAppBuilder(result)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.modalRef.hide();
          this.getAppFields(this.activeAppId);
          this.appViewService.refreshAppFields.next(this.activeAppId);
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

  updateSortingOrder(category, rowId = "") {
    let recordsArray = [];
    if (!rowId) {
      category.records.forEach((record, ind) => {
        if (!record.filterObject) {
          record.filterObject = {};
          record.filterObject[category.id] = {};
          record.filterObject[category.id].basicIndex = ind;
        } else if (!record.filterObject[category.id]) {
          record.filterObject[category.id] = {};
          record.filterObject[category.id].basicIndex = ind;
        } else {
          record.filterObject[category.id].basicIndex = ind;
        }
      });
      recordsArray = category.records;
    } else {
      const fieldId = this.selectedRow;
      category.rowGroups[rowId].forEach((record, ind) => {
        if (!record.filterObject) {
          record.filterObject = {};
          record.filterObject[category.id] = {};
          record.filterObject[category.id][fieldId] = {};
          record.filterObject[category.id][fieldId][rowId] = ind;
        } else if (!record.filterObject[category.id]) {
          record.filterObject[category.id] = {};
          record.filterObject[category.id][fieldId] = {};
          record.filterObject[category.id][fieldId][rowId] = ind;
        } else if (!record.filterObject[category.id][fieldId]) {
          record.filterObject[category.id][fieldId] = {};
          record.filterObject[category.id][fieldId][rowId] = ind;
        } else {
          record.filterObject[category.id][fieldId][rowId] = ind;
        }
      });
      recordsArray = category.rowGroups[rowId];
    }
    this.appViewService
      .updateSortingOrder({
        application_id: this.activeAppId,
        records: recordsArray,
      })
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async updateRecord(item, value, type) {
    const formData = new FormData();
    let field: any = {};
    if (type === "category") {
      field = this.appFields.find(
        (field) =>
          field.type === "category" && field._id === this.selectedCategory
      );
    } else {
      field = this.appFields.find((field) => field._id === this.selectedRow);
    }
    formData.append("fieldType", field.type);
    formData.append("fieldId", field._id);
    formData.append("application_id", this.activeAppId);
    formData.append("record_id", item._id);
    formData.append("uniqueId", this.editSessionId);
    if (type === "category") {
      const label = this.categories[this.selectedCategory].find(
        (category) => category.id === value
      ).id;
      // tslint:disable-next-line: max-line-length
      formData.append(
        "value",
        JSON.stringify({ select: label === "None" ? "" : label })
      );
    } else {
      formData.append("value", JSON.stringify({ members: value }));
    }
    return new Promise((resolve, reject) => {
      this.appViewService
        .setField(formData)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            resolve();
          }
        })
        .catch((err: Error) => {
          reject(err);
          throw err;
        });
    });
  }

  setDefaultLayoutOptions() {
    const attachmentField = this.appFields.find(
      (field) => field.type === "image"
    );
    const textField = this.appFields.find((field) => field.type === "text");
    if (attachmentField) {
      this.appViewService.selectedLayoutOptions[0] = attachmentField;
    }
    if (textField) {
      this.appViewService.selectedLayoutOptions[1] = textField;
    }
    this.appViewService.selectedLayoutOptions[3] = {};
  }

  updateAppLayoutOptions() {
    const appData = JSON.parse(JSON.stringify(this.appViewService.activeApp));
    appData.workspace_id = appData.workspace_id._id;
    appData.application_id = appData._id;
    appData.layout_options = this.appViewService.selectedLayoutOptions;
    this.appViewService
      .updateAppView(appData)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          await this.appViewService.refreshApps(
            this.workspaceId,
            this.homeService.wsRole
          );
          this.getAppFields(this.activeAppId);
          this.modalRef.hide();
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  kanbanCardDomManipulation(){
    // GET ALL KANBAN CARDS
    var kanbanCards = document.getElementsByClassName("kanban-card-conatiner");
    // GET ALL TEXT ROWS
    for(var i = 0; i < kanbanCards.length; i++) {
      var kanbanTextRow = kanbanCards[i].getElementsByClassName("kanban-text-row");
      if(kanbanTextRow.length){
        // ADD CLASS TO FIRST TEXT ELEMENT
        (kanbanTextRow[0]).classList.add("font-weight-bold")
        // IF ROW HAS DESCRIPTION
        if(kanbanTextRow.length > 0){
          // GET DESCRIPTION LENGTH
          if(kanbanTextRow[1] && kanbanTextRow[1].innerHTML){
            var textLength = kanbanTextRow[1].innerHTML.length
            if(textLength > 140){
              (kanbanTextRow[1]).classList.add("height-90")
            }
          }
        }
      }
    }
  }

  // CHECK FILE - IMAGE / DOC
  // TO RENDER FILE VIEW COMPONENT
  checkTypeAndGetImageDoc(getImagePath:any){
    return this.helperFunctions.checkTypeAndGetImageDoc(getImagePath);
  }

  // GET FILE ICON USING EXTENSION
  getFileIconUsingExtension(extension:any){
    return this.helperFunctions.getFileIconUsingExtension(extension);
  }

  checkFileExtensionType(option){
    if(option.value && option.value.image && option.value.image[option.value.image.length - 1] && option.value.image[option.value.image.length - 1].attachment && option.value.image[option.value.image.length - 1].attachment.type){
      return option.value.image[option.value.image.length - 1].attachment.type
    }
  }

  getFileExtensionType(option){
    if(option.value && option.value.image && option.value.image[option.value.image.length - 1] && option.value.image[option.value.image.length - 1].attachment && option.value.image[option.value.image.length - 1].attachment.type){
      return option.value.image[option.value.image.length - 1].attachment.ext
    }
  }

  ngOnDestroy() {
    this.activeAppSubs.unsubscribe();
    this.changeAppSubs.unsubscribe();
    this.rowOptionsSubs.unsubscribe();
    this.columnOptionsSubs.unsubscribe();
  }
}
