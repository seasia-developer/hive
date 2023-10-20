import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicWebformComponent } from './public-webform.component';

describe('PublicWebformComponent', () => {
  let component: PublicWebformComponent;
  let fixture: ComponentFixture<PublicWebformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicWebformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicWebformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
