import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationIconsComponent } from './organisation-icons.component';

describe('OrganisationIconsComponent', () => {
  let component: OrganisationIconsComponent;
  let fixture: ComponentFixture<OrganisationIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
