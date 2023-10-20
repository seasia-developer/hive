import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationWorkspacesComponent } from './organisation-workspaces.component';

describe('OrganisationWorkspacesComponent', () => {
  let component: OrganisationWorkspacesComponent;
  let fixture: ComponentFixture<OrganisationWorkspacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationWorkspacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
