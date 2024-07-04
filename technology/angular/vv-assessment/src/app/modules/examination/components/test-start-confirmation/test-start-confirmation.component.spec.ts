import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStartConfirmationComponent } from './test-start-confirmation.component';

describe('TestStartConfirmationComponent', () => {
  let component: TestStartConfirmationComponent;
  let fixture: ComponentFixture<TestStartConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestStartConfirmationComponent]
    });
    fixture = TestBed.createComponent(TestStartConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
