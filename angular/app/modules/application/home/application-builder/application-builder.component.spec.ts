import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationBuilderComponent } from './application-builder.component';

describe('ApplicationBuilderComponent', () => {
  let component: ApplicationBuilderComponent;
  let fixture: ComponentFixture<ApplicationBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
