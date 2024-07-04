import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSecondaryPhoneNumberComponent } from './contact-secondary-phone-number.component';

describe('ContactSecondaryPhoneNumberComponent', () => {
  let component: ContactSecondaryPhoneNumberComponent;
  let fixture: ComponentFixture<ContactSecondaryPhoneNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactSecondaryPhoneNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactSecondaryPhoneNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
