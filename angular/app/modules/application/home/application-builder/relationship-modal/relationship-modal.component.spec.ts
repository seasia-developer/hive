import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipModalComponent } from './relationship-modal.component';

describe('RelationshipModalComponent', () => {
  let component: RelationshipModalComponent;
  let fixture: ComponentFixture<RelationshipModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationshipModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
