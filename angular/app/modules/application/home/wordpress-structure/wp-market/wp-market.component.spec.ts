import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WpMarketComponent } from './wp-market.component';

describe('WpMarketComponent', () => {
  let component: WpMarketComponent;
  let fixture: ComponentFixture<WpMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WpMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WpMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
