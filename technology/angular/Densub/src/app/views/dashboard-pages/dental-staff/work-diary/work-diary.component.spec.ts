import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDiaryComponent } from './work-diary.component';

describe('WorkDiaryComponent', () => {
  let component: WorkDiaryComponent;
  let fixture: ComponentFixture<WorkDiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkDiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
