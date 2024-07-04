import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFullScreenshotComponent } from './view-full-screenshot.component';

describe('ViewFullScreenshotComponent', () => {
  let component: ViewFullScreenshotComponent;
  let fixture: ComponentFixture<ViewFullScreenshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewFullScreenshotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFullScreenshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
