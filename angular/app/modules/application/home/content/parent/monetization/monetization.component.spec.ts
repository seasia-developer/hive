import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonetizationComponent } from './monetization.component';

describe('MonetizationComponent', () => {
  let component: MonetizationComponent;
  let fixture: ComponentFixture<MonetizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonetizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonetizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
