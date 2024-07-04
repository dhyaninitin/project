import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DentalStaffListComponent } from './dental-staff-list.component';

describe('DentalStaffListComponent', () => {
  let component: DentalStaffListComponent;
  let fixture: ComponentFixture<DentalStaffListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentalStaffListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentalStaffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
