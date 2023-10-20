import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordpressStructureComponent } from './wordpress-structure.component';

describe('WordpressStructureComponent', () => {
  let component: WordpressStructureComponent;
  let fixture: ComponentFixture<WordpressStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordpressStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordpressStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
