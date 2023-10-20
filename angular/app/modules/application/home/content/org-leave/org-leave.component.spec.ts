import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgLeaveComponent } from './org-leave.component';

describe('OrgLeaveComponent', () => {
  let component: OrgLeaveComponent;
  let fixture: ComponentFixture<OrgLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
