import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStatasticComponent } from './post-statastic.component';

describe('PostStatasticComponent', () => {
  let component: PostStatasticComponent;
  let fixture: ComponentFixture<PostStatasticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostStatasticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostStatasticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
