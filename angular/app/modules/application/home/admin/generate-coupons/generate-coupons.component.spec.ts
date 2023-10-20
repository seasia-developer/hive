import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCouponsComponent } from './generate-coupons.component';

describe('GenerateCouponsComponent', () => {
  let component: GenerateCouponsComponent;
  let fixture: ComponentFixture<GenerateCouponsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateCouponsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
