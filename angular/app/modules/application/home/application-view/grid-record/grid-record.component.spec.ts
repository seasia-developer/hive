import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridRecordComponent } from './grid-record.component';

describe('GridRecordComponent', () => {
  let component: GridRecordComponent;
  let fixture: ComponentFixture<GridRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
