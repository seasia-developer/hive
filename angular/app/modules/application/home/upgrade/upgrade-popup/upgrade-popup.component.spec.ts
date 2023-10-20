import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradePopupComponent } from './upgrade-popup.component';

describe('UpgradePopupComponent', () => {
  let component: UpgradePopupComponent;
  let fixture: ComponentFixture<UpgradePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
