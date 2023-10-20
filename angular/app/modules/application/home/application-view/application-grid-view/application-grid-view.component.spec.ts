import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationGridViewComponent } from './application-grid-view.component';

describe('ApplicationGridViewComponent', () => {
  let component: ApplicationGridViewComponent;
  let fixture: ComponentFixture<ApplicationGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
