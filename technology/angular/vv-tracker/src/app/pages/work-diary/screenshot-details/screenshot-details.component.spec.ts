import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotDetailsComponent } from './screenshot-details.component';

describe('ScreenshotDetailsComponent', () => {
  let component: ScreenshotDetailsComponent;
  let fixture: ComponentFixture<ScreenshotDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenshotDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenshotDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
