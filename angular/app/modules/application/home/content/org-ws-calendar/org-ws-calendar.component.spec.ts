import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgWsCalendarComponent } from './org-ws-calendar.component';

describe('OrgWsCalendarComponent', () => {
  let component: OrgWsCalendarComponent;
  let fixture: ComponentFixture<OrgWsCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgWsCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgWsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
