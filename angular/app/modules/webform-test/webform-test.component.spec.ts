import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformTestComponent } from './webform-test.component';

describe('WebformTestComponent', () => {
  let component: WebformTestComponent;
  let fixture: ComponentFixture<WebformTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
