import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationKanbanViewComponent } from './application-kanban-view.component';

describe('ApplicationKanbanViewComponent', () => {
  let component: ApplicationKanbanViewComponent;
  let fixture: ComponentFixture<ApplicationKanbanViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationKanbanViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationKanbanViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
