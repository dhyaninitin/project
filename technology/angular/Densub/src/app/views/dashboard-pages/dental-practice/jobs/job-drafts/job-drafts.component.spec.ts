import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDraftsComponent } from './job-drafts.component';

describe('JobDraftsComponent', () => {
  let component: JobDraftsComponent;
  let fixture: ComponentFixture<JobDraftsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobDraftsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
