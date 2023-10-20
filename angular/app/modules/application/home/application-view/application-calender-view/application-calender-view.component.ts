import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { v4 as uuid } from "uuid";
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
import { JReponse } from "src/app/services/api.service";
import { Subscription } from "rxjs";

import { AppViewService } from "../application-view.service";

@Component({
  selector: "app-application-calender-view",
  templateUrl: "./application-calender-view.component.html",
  styleUrls: ["./application-calender-view.component.scss"],
})
export class ApplicationCalenderViewComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("calendarNew", { static: false })
  INITIAL_EVENTS: EventInput[] = [];
  calendarOptions: CalendarOptions;
  calendarNew: FullCalendarComponent;
  cal: Calendar;
  updateRecordsSubs = new Subscription();

  isDelEvent = false;
  workspaceId;
  activeAppId;
  filteredEventData = [];
  allRecords: any;
  check: string;
  eventGuid = 0;
  colorInCalendar = false;
  categoryList = [];
  evColor = "";
  showInCalendar = false;
  activeView: any;

  constructor(
    private appViewService: AppViewService,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2
  ) {}

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

  async ngOnInit() {
    this.updateRecordsSubs = this.appViewService.applyFiltersInCalendar.subscribe(
      (data: any) => {
        if (data.toApply === "view") {
          this.activeView = data.view;
          this.getAppRecords(this.activeAppId);
        } else {
          this.getAppRecords(this.activeAppId, "", true);
        }
      }
    );
    this.calendarOptions = {
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
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    };

    this.appViewService.apiCalled = true;

    this.renderer.listen("window", "click", (event) => {
      let selectedRecord = "";
      if (
        document.getElementById("month-name") &&
        this.allRecords &&
        this.allRecords.length &&
        Number(event.target.innerText)
      ) {
        this.allRecords.forEach((record) => {
          const rec = record.data.find((data) =>
            moment(
              event.target.innerText +
                " " +
                document.getElementById("month-name").innerText
            ).isBetween(data.value.date, data.value.end || data.value.date)
          );
          if (rec) {
            selectedRecord = record;
          }
        });
      }
      // if (this.appViewService.tempBool) {
      if (
        event.target.className.includes("plusSign") ||
        (event.target.className.includes("fc-daygrid-day-frame") &&
          !selectedRecord)
      ) {
        this.appViewService.addCalendarRecord.next("Date");
      }
      // }
      if (selectedRecord) {
        this.appViewService.editCalendarRecord.next(selectedRecord);
      }
    });

    this.appViewService.activeAppId.subscribe((id) => {
      if (id) {
        this.activeAppId = id;
        this.getAppFields(id);
      }
    });
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.activeAppId = this.activatedRoute.snapshot.queryParams.appId;
    await this.getAppFields(this.activeAppId);
  }

  ngAfterViewInit(): void {
    this.cal = new Calendar(
      document.getElementById("calNew"),
      this.calendarOptions
    );
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
      this.calendarEvent(clickInfo.event);
    }
    this.isDelEvent = false;
  }

  async calendarEventDrop(event) {
    await this.updateRecord(event, event.event.start, event.event.end);
  }

  updateRecord(event, start, end) {
    const uniqueId = uuid();
    let selectedRecord = {};
    this.allRecords.forEach((record) => {
      if (record._id === event.event.extendedProps.recordId) {
        selectedRecord = record;
        const formData = new FormData();
        formData.append("fieldType", "date");
        let tempFieldId = "";
        record.data.forEach((element) => {
          if (element.value.date) {
            tempFieldId = element.field_id;
            return tempFieldId;
          }
        });
        formData.append("fieldId", tempFieldId);
        formData.append("application_id", this.activeAppId);
        formData.append("record_id", record._id);
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
    });
  }

  async deleteEvent(event) {
    await this.allRecords.forEach((rec) => {
      const data = rec.data.find(
        (el) =>
          el.value.date === event.start &&
          el.value.end === this.substractDays(event.end, 1)
      );
    });
    let selectedRecord = {};
    await this.allRecords.forEach((record) => {
      if (record._id === event.extendedProps.recordId) {
        selectedRecord = record;
      }
    });
    await this.appViewService.deleteCalendarRecord.next(selectedRecord);
  }

  async getAppFields(appId) {
    await this.appViewService
      .getFields(appId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (jresponse.body.length) {
            this.getAppRecords(appId);
          }
          let firstTime = false;
          let firstTimeDate = false;
          jresponse.body.forEach((element) => {
            if (element.type === "category") {
              if (!firstTime) {
                this.colorInCalendar = element.options["Color in calendar"];
                if (element.options["Color in calendar"]) {
                  this.categoryList = element.options.selectOptions;
                }
                firstTime = true;
              }
            }
            if (element.type === "date") {
              if (!firstTimeDate) {
                this.showInCalendar = element.options["Show in Calendars"];
                firstTimeDate = true;
              }
            }
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getAppRecords(appId, additional = "", applyFilters = false) {
    await this.appViewService
      .getAppRecords(appId, additional, this.activeView, applyFilters)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.allRecords = jresponse.body;
          this.appViewService.activeAppRecords = this.allRecords;
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
        (e) => {
          if (e.value) {
            return (Object.keys(e.value)[0] === "date" ||
            Object.keys(e.value)[0] === "text" ||
            Object.keys(e.value)[0] === "select")
          }
        }
          
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

    if (this.showInCalendar) {
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
            backgroundColor: this.colorInCalendar
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
            backgroundColor: this.colorInCalendar
              ? this.passColor(elem.data.select)
              : "#31BE00",
            recordId: elem.recordId,
          });
        }
      });
    }
    this.calendarOptions.events = this.INITIAL_EVENTS;
  }

  addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
  }

  substractDays(date: Date, days: number): Date {
    date.setDate(date.getDate() - days);
    return date;
  }

  passColor(label) {
    this.categoryList.forEach((element) => {
      if (element.id === label) {
        this.evColor = element.color;
      }
    });
    return this.evColor;
  }

  createEventId() {
    this.eventGuid += 1;
    return String(this.eventGuid);
  }

  ngOnDestroy() {
    this.updateRecordsSubs.unsubscribe();
  }
}
