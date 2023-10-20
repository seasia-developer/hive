import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationWorkspaceListComponent } from './organisation-workspaceList.component';

describe('OrganisationWorkspaceListComponent', () => {
  let component: OrganisationWorkspaceListComponent;
  let fixture: ComponentFixture<OrganisationWorkspaceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationWorkspaceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationWorkspaceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
