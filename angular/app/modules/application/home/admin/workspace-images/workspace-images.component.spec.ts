import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceImagesComponent } from './workspace-images.component';

describe('WorkspaceImagesComponent', () => {
  let component: WorkspaceImagesComponent;
  let fixture: ComponentFixture<WorkspaceImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
