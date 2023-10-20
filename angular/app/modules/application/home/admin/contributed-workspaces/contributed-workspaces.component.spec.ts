import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributedWorkspacesComponent } from './contributed-workspaces.component';

describe('ContributedWorkspacesComponent', () => {
  let component: ContributedWorkspacesComponent;
  let fixture: ComponentFixture<ContributedWorkspacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributedWorkspacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributedWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
