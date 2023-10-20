import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredefinedWorkspacesComponent } from './predefined-workspaces.component';

describe('PredefinedWorkspacesComponent', () => {
  let component: PredefinedWorkspacesComponent;
  let fixture: ComponentFixture<PredefinedWorkspacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PredefinedWorkspacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PredefinedWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
