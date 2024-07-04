import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarQuotesComponent } from './car-quotes.component';

describe('CarQuotesComponent', () => {
  let component: CarQuotesComponent;
  let fixture: ComponentFixture<CarQuotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarQuotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
