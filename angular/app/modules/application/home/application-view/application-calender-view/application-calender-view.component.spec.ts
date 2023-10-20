import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationCalenderViewComponent } from './application-calender-view.component';

describe('ApplicationCalenderViewComponent', () => {
  let component: ApplicationCalenderViewComponent;
  let fixture: ComponentFixture<ApplicationCalenderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationCalenderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationCalenderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
