import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveWorkspacesComponent } from './save-workspaces.component';

describe('SaveWorkspacesComponent', () => {
  let component: SaveWorkspacesComponent;
  let fixture: ComponentFixture<SaveWorkspacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveWorkspacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
