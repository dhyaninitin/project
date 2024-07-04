import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackerErrorLogsComponent } from './tracker-error-logs.component';

describe('TrackerErrorLogsComponent', () => {
  let component: TrackerErrorLogsComponent;
  let fixture: ComponentFixture<TrackerErrorLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackerErrorLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackerErrorLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
