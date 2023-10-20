import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationSetupComponent } from './organisation-setup.component';

describe('OrganisationSetupComponent', () => {
  let component: OrganisationSetupComponent;
  let fixture: ComponentFixture<OrganisationSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
