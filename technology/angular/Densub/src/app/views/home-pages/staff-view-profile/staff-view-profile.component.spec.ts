import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffViewProfileComponent } from './staff-view-profile.component';

describe('StaffViewProfileComponent', () => {
  let component: StaffViewProfileComponent;
  let fixture: ComponentFixture<StaffViewProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffViewProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffViewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
