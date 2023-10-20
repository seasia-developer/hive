import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyWorkspacesComponent } from './my-workspaces.component';

describe('MyWorkspacesComponent', () => {
  let component: MyWorkspacesComponent;
  let fixture: ComponentFixture<MyWorkspacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyWorkspacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
