import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPreviewComponent } from './staff-preview.component';

describe('StaffPreviewComponent', () => {
  let component: StaffPreviewComponent;
  let fixture: ComponentFixture<StaffPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
