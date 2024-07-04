import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRevenueComponent } from './quote-revenue.component';

describe('QuoteRevenueComponent', () => {
  let component: QuoteRevenueComponent;
  let fixture: ComponentFixture<QuoteRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
