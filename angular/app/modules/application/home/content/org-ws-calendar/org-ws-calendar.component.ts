import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { BsModalService } from "ngx-bootstrap/modal";
import * as moment from "moment";
import {
  CalendarOptions,
  EventClickArg,
  FullCalendarComponent,
  Calendar,
  EventInput,
} from "@fullcalendar/angular";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { v4 as uuid } from "uuid";

import { AppViewService } from "../../application-view/application-view.service";
import { JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "../../home.service";
import { RecordModalComponent } from "../../application-view/record-modal/record-modal.component";

@Component({
  selector: "app-org-ws-calendar",
  templateUrl: "./org-ws-calendar.component.html",
  styleUrls: ["./org-ws-calendar.component.scss"],
})
export class OrgWsCalendarComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("orgWsCalendar", { static: false })
  orgWsCalendar: FullCalendarComponent;
  isDelEvent = false;
  calendarOptions: CalendarOptions;
  cal: Calendar;
  workspaceId = "";
  orgId = "";
  allRecords = [];
  filteredEventData: any[];
  INITIAL_EVENTS: EventInput[] = [];
  eventGuid = 0;
  categoryFields = [];
  colorInCalendar = false;
  showInCalendar = false;
  check: any;
  deleteRecordId = "";
  evColor = "";
  updateViewSubs = new Subscription();
  connectedUsersEmails = [];

  constructor(
    private appViewService: AppViewService,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService,
    private homeService: HomeService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.helperService.showCalendarClass = true;
    this.connectedUsersEmails = await this.helperService.getLocalStore(
      "connectedUsersEmails"
    );
    await this.connectedUsersEmails.forEach((element) => {
      this.getGoogleCalendarEvents(element);
    });
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    if (this.workspaceId) {
      this.getWsRecords();
    } else if (this.orgId) {
      this.getOrgRecords();
    } else {
      this.getUserRecords();
    }

    this.updateViewSubs = this.appViewService.updateCalendarView.subscribe(
      (refresh) => {
        if (refresh) {
          if (this.workspaceId) {
            this.getWsRecords();
          } else if (this.orgId) {
            this.getOrgRecords();
          } else {
            this.getUserRecords();
          }
        }
      }
    );

    this.router.events.subscribe((el: any) => {
      if (
        el.snapshot &&
        el.snapshot.queryParams &&
        el.snapshot.queryParams.workspaceId
      ) {
        if (this.workspaceId !== el.snapshot.queryParams.workspaceId) {
          this.workspaceId = el.snapshot.queryParams.workspaceId;
          this.orgId = "";
          this.getWsRecords();
        }
      } else if (
        el.snapshot &&
        el.snapshot.queryParams &&
        el.snapshot.queryParams.orgId
      ) {
        if (this.orgId !== el.snapshot.queryParams.orgId) {
          this.orgId = el.snapshot.queryParams.orgId;
          this.workspaceId = "";
          this.getOrgRecords();
        }
      } else if (
        el.snapshot &&
        el.snapshot.queryParams &&
        (this.workspaceId || this.orgId)
      ) {
        this.workspaceId = "";
        this.orgId = "";
        this.getUserRecords();
      }
    });
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      headerToolbar: {
        left: "prev,next,today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      buttonText: {
        today: "Today",
      },
      initialView: "dayGridMonth",
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: false,
      firstDay: 1,
      eventClick: this.handleEventClick.bind(this),
      eventDrop: this.calendarEventDrop.bind(this),
      dayCellContent: this.dayCellContent.bind(this),
      eventContent: (arg) => {
        const italicEl = document.createElement("div");
        const img = document.createElement("img");
        img.setAttribute("id", "deleteEvent" + arg.event.id);
        img.setAttribute(
          "src",
          "../../../../../../assets/images/close-cal.svg"
        );
        img.addEventListener("click", () => {
          this.isDelEvent = true;
        });
        const title = document.createElement("span");
        title.innerHTML = arg.event.title;
        title.setAttribute("style", "width: 100%");
        title.addEventListener("click", () => {
          this.isDelEvent = false;
        });
        italicEl.appendChild(img);
        italicEl.appendChild(title);
        const arrayOfDomNodes = [italicEl];
        return { domNodes: arrayOfDomNodes };
      },
    };
  }

  ngAfterViewInit(): void {
    this.cal = new Calendar(
      document.getElementById("orgWsCal"),
      this.calendarOptions
    );
  }

  async getGoogleCalendarEvents(calendarId) {
    const data = {
      email: calendarId,
    };
    await this.appViewService
      .getCalendarEvents(data)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          jresponse.body.forEach((element) => {
            if (
              moment(element.start.date).format("YYYY-MM-DD") !==
              moment(this.substractDays(new Date(element.end.date), 1)).format(
                "YYYY-MM-DD"
              )
            ) {
              this.INITIAL_EVENTS.push({
                title: element.summary,
                start: element.start.date
                  ? new Date(element.start.date)
                      .toISOString()
                      .replace(/T.*$/, "")
                  : "",
                end: element.end.date ? element.end.date : "",
                id: this.createEventId(),
                backgroundColor: "#31BE00",
              });
            }
            if (
              moment(element.start.date).format("YYYY-MM-DD") ===
              moment(this.substractDays(new Date(element.end.date), 1)).format(
                "YYYY-MM-DD"
              )
            ) {
              this.INITIAL_EVENTS.push({
                title: element.summary,
                start: element.start.date
                  ? new Date(element.start.date)
                      .toISOString()
                      .replace(/T.*$/, "")
                  : "",
                id: this.createEventId(),
                backgroundColor: "#31BE00",
              });
            }
          });
          this.calendarOptions.events = this.INITIAL_EVENTS;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getWsRecords() {
    this.appViewService
      .getCalendar(this.workspaceId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.allRecords = jresponse.body;
          this.allRecords.forEach((record) => {
            record.appFields.forEach((field) => {
              if (
                field.type === "category" &&
                field.options["Color in calendar"]
              ) {
                const f = this.categoryFields.find((f) => f._id === field._id);
                if (!f) {
                  this.categoryFields.push(field);
                }
              }
            });
          });
          // this.appViewService.activeAppRecords = this.allRecords;
          this.getFilteredData(jresponse.body);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getOrgRecords() {
    this.appViewService
      .getOrgCalendar(this.orgId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.allRecords = jresponse.body;
          this.allRecords.forEach((record) => {
            record.appFields.forEach((field) => {
              if (
                field.type === "category" &&
                field.options["Color in calendar"]
              ) {
                const f = this.categoryFields.find((f) => f._id === field._id);
                if (!f) {
                  this.categoryFields.push(field);
                }
              }
            });
          });
          // this.appViewService.activeAppRecords = this.allRecords;
          this.getFilteredData(jresponse.body);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getUserRecords() {
    this.appViewService
      .getUserCalendar()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.allRecords = jresponse.body;
          this.allRecords.forEach((record) => {
            record.appFields.forEach((field) => {
              if (
                field.type === "category" &&
                field.options["Color in calendar"]
              ) {
                const f = this.categoryFields.find((f) => f._id === field._id);
                if (!f) {
                  this.categoryFields.push(field);
                }
              }
            });
          });
          // this.appViewService.activeAppRecords = this.allRecords;
          this.getFilteredData(jresponse.body);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getFilteredData(data) {
    let filteredData;
    this.filteredEventData = [];
    filteredData = data
      .filter((e) => e.data.length > 0)
      .map((e) => {
        const obj = {
          canDelete: e.appOwner || e.recordOwner || e.admin,
          data: e.data,
          recordId: e._id,
        };
        return obj;
      });
    filteredData.forEach((element) => {
      element.data = element.data.filter(
        (e) =>
          Object.keys(e.value)[0] === "date" ||
          Object.keys(e.value)[0] === "text" ||
          Object.keys(e.value)[0] === "select"
      );
      this.filteredEventData.push(element);
    });
    const innerFilteredEventData = [];
    this.filteredEventData.forEach((element) => {
      const temp = [];
      element.data.forEach((innerElement) => {
        if (temp.length > 0) {
          const keyOfTemp = temp.map((e) => e.value);
          let newTemp = [];
          keyOfTemp.forEach((iE) => {
            newTemp = [...newTemp, ...Object.keys(iE)];
          });
          if (!newTemp.includes(Object.keys(innerElement.value)[0])) {
            temp.push(innerElement);
          }
        } else {
          temp.push(innerElement);
        }
      });
      innerFilteredEventData.push({
        canDelete: element.canDelete,
        data: temp,
        recordId: element.recordId,
      });
    });
    this.filteredEventData = innerFilteredEventData;
    this.INITIAL_EVENTS = [];
    this.eventGuid = 0;
    const tempFilteredEventData = [];
    this.filteredEventData.forEach((element) => {
      let finalObj = {};
      element.data.forEach((innerElement) => {
        finalObj = {
          ...finalObj,
          ...innerElement.value,
        };
      });
      tempFilteredEventData.push({
        data: finalObj,
        canDelete: element.canDelete,
        recordId: element.recordId,
      });
    });
    tempFilteredEventData.forEach((elem) => {
      if (elem.data.end !== "") {
        this.INITIAL_EVENTS.push({
          title: elem.data.text,
          start: elem.data.date
            ? new Date(elem.data.date).toISOString().replace(/T.*$/, "")
            : "",
          end: elem.data.end
            ? this.addDays(new Date(elem.data.end), 1)
                .toISOString()
                .replace(/T.*$/, "")
            : "",
          id: this.createEventId(),
          backgroundColor: elem.data.select
            ? this.passColor(elem.data.select)
            : "#31BE00",
          recordId: elem.recordId,
        });
      }
      if (elem.data.end === "") {
        this.INITIAL_EVENTS.push({
          title: elem.data.text,
          start: elem.data.date
            ? new Date(elem.data.date).toISOString().replace(/T.*$/, "")
            : "",
          id: this.createEventId(),
          backgroundColor: elem.data.select
            ? this.passColor(elem.data.select)
            : "#31BE00",
          recordId: elem.recordId,
        });
      }
    });
    this.calendarOptions.events = this.INITIAL_EVENTS;
  }

  dayCellContent(ev) {
    const italicElA = document.createElement("a");
    italicElA.className = "fc-daygrid-day-number";
    italicElA.innerHTML = ev.dayNumberText;
    const italicElI = document.createElement("span");
    italicElI.className = "plusSign";
    italicElI.innerHTML = "+";
    const arrayOfDomNodes = [italicElA, italicElI];
    return { domNodes: arrayOfDomNodes };
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (this.isDelEvent) {
      this.deleteEvent(clickInfo.event);
    } else {
      this.editRecord(clickInfo.event["_def"].extendedProps.recordId);
      // this.calendarEvent(clickInfo.event);
    }
    this.isDelEvent = false;
  }

  editRecord(recordId) {
    const record = this.allRecords.find((rec) => rec._id === recordId);
    const initialState = {
      recordId,
      appFields: record.appFields,
      recordFormValues: record.data,
      appId: record.application_id,
      workspaceId: record.workspace_id,
      orgId: record.organization_id,
      type: "calendar",
    };
    this.homeService.recordModalRef = this.modalService.show(
      RecordModalComponent,
      { initialState, class: "modal-lg",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
  }

  async deleteEvent(event) {
    this.deleteRecordId = event.extendedProps.recordId;
    document.getElementById("deleteRecordModalButton").click();
  }

  calendarEventDrop(event) {
    this.updateRecord(event, event.event.start, event.event.end);
  }

  updateRecord(event, start, end) {
    const uniqueId = uuid();
    const selectedRecord = this.allRecords.find(
      (rec) => rec._id === event.event.extendedProps.recordId
    );
    const formData = new FormData();
    formData.append("fieldType", "date");
    const tempFieldId = selectedRecord.data.find((el) => el.value.date)
      .field_id;
    // selectedRecord.data.forEach((element) => {
    //   if (element.value.date) {
    //     tempFieldId = element.field_id;
    //     return tempFieldId;
    //   }
    // });
    formData.append("fieldId", tempFieldId);
    formData.append("application_id", selectedRecord.application_id);
    formData.append("record_id", selectedRecord._id);
    formData.append("uniqueId", uniqueId);
    formData.append(
      "value",
      JSON.stringify({
        date: moment(start).format("YYYY-MM-DD"),
        end: moment(this.substractDays(end, 1)).format("YYYY-MM-DD"),
      })
    );
    this.appViewService
      .setField(formData)
      .then(() => {})
      .catch((err: Error) => {
        throw err;
      });
  }

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  substractDays(date: Date, days: number): Date {
    date.setDate(date.getDate() - days);
    return date;
  }

  calendarEvent(event): void {
    let selectedRecord = {};
    this.allRecords.forEach((record) => {
      if (record._id === event.extendedProps.recordId) {
        selectedRecord = record;
      }
    });
    if (this.check) {
      this.appViewService.deleteCalendarRecord.next(selectedRecord);
      this.check = "";
    } else {
      this.appViewService.editCalendarRecord.next(selectedRecord);
    }
  }

  passColor(label) {
    this.evColor = "";
    this.categoryFields.forEach((element) => {
      const category = element.options.selectOptions.find(
        (op) => op.id === label
      );
      if (category) {
        this.evColor = category.color;
      }
    });
    return this.evColor || "#31BE00";
  }

  confirmDeleteRecord() {
    this.appViewService
      .deleteRecord(this.deleteRecordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.showSuccessToast(jresponse.message);
          if (this.workspaceId) {
            this.getWsRecords();
          } else if (this.orgId) {
            this.getOrgRecords();
          } else {
            this.getUserRecords();
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  createEventId() {
    this.eventGuid += 1;
    return String(this.eventGuid);
  }

  ngOnDestroy() {
    this.updateViewSubs.unsubscribe();
    this.helperService.showCalendarClass = false;
  }
}
