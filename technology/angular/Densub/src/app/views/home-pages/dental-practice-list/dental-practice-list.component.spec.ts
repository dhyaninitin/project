import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DentalPracticeListComponent } from './dental-practice-list.component';

describe('DentalPracticeListComponent', () => {
  let component: DentalPracticeListComponent;
  let fixture: ComponentFixture<DentalPracticeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentalPracticeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentalPracticeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
