import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadOrgContentComponent } from './upload-org-content.component';

describe('UploadOrgContentComponent', () => {
  let component: UploadOrgContentComponent;
  let fixture: ComponentFixture<UploadOrgContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadOrgContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadOrgContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
