import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCompleteComponent } from './test-complete.component';

describe('TestCompleteComponent', () => {
  let component: TestCompleteComponent;
  let fixture: ComponentFixture<TestCompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestCompleteComponent]
    });
    fixture = TestBed.createComponent(TestCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
