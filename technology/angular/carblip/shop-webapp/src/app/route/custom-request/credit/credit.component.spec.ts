import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRequestCreditComponent } from './credit.component';

describe('CustomRequestCreditComponent', () => {
  let component: CustomRequestCreditComponent;
  let fixture: ComponentFixture<CustomRequestCreditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomRequestCreditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomRequestCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
