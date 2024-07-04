import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffFavouriteComponent } from './staff-favourite.component';

describe('StaffFavouriteComponent', () => {
  let component: StaffFavouriteComponent;
  let fixture: ComponentFixture<StaffFavouriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffFavouriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffFavouriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
