import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationUserWorkspaceComponent } from './organisation-user-workspace.component';

describe('OrganisationUserWorkspaceComponent', () => {
  let component: OrganisationUserWorkspaceComponent;
  let fixture: ComponentFixture<OrganisationUserWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationUserWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationUserWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
