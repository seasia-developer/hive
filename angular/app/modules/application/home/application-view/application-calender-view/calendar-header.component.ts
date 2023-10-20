import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CalendarView } from "angular-calendar";

import { AppViewService } from "../application-view.service";
@Component({
  selector: "mwl-demo-utils-calendar-header",
  template: ` <div class="calendar-head-custom text-right m-0">
    <div class="">
      <div class="btn-group">
        <!-- <div class="filter-title">Filter</div>&nbsp;&nbsp; -->
        <!-- <div
          class="left-arrow btn"
          mwlCalendarPreviousView
          [view]="view"
          [(viewDate)]="viewDate"
          (viewDateChange)="viewDateChange.next(viewDate); calendarDataChange()"
        >
          Previous
        </div>
        <div class="current-date-month" id="month-name">
          {{ viewDate | calendarDate: view + "ViewTitle":locale }}
        </div>
        <div
          class="right-arrow btn"
          mwlCalendarNextView
          [view]="view"
          [(viewDate)]="viewDate"
          (viewDateChange)="viewDateChange.next(viewDate); calendarDataChange()"
        >
          Next
        </div>
        <div
          class="today-activated btn"
          mwlCalendarToday
          [(viewDate)]="viewDate"
          (viewDateChange)="viewDateChange.next(viewDate); calendarDataChange()"
        >
          Todayyyyy
        </div> -->
      </div>
    </div>
  </div>`,
})
export class CalendarHeaderComponent {
  @Input() view: CalendarView;

  @Input() viewDate: Date;

  @Input() locale = "en";

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;

  constructor(public appViewService: AppViewService) {}

  calendarDataChange() {
    const data = {
      view: this.view,
      viewDate: this.viewDate,
    };
    this.appViewService.sendCalendarData(data);
  }
}
