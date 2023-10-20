import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedDomainsComponent } from './restricted-domains.component';

describe('RestrictedDomainsComponent', () => {
  let component: RestrictedDomainsComponent;
  let fixture: ComponentFixture<RestrictedDomainsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictedDomainsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedDomainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
