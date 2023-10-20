import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WpMarketDetailsComponent } from './wp-market-details.component';

describe('WpMarketDetailsComponent', () => {
  let component: WpMarketDetailsComponent;
  let fixture: ComponentFixture<WpMarketDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WpMarketDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WpMarketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
