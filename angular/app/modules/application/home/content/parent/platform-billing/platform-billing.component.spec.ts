import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformBillingComponent } from './platform-billing.component';

describe('PlatformBillingComponent', () => {
  let component: PlatformBillingComponent;
  let fixture: ComponentFixture<PlatformBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatformBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
