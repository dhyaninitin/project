import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesalequotesRevenueComponent } from './wholesalequotes-revenue.component';

describe('WholesalequotesRevenueComponent', () => {
  let component: WholesalequotesRevenueComponent;
  let fixture: ComponentFixture<WholesalequotesRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WholesalequotesRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WholesalequotesRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
