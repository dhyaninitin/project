import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteJobsComponent } from './favorite-jobs.component';

describe('FavoriteJobsComponent', () => {
  let component: FavoriteJobsComponent;
  let fixture: ComponentFixture<FavoriteJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
