import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPersonalComponent } from './business-personal.component';

describe('BusinessPersonalComponent', () => {
  let component: BusinessPersonalComponent;
  let fixture: ComponentFixture<BusinessPersonalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessPersonalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
