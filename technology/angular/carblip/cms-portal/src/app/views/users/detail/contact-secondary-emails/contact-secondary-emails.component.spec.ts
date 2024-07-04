import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSecondaryEmailsComponent } from './contact-secondary-emails.component';

describe('ContactSecondaryEmailsComponent', () => {
  let component: ContactSecondaryEmailsComponent;
  let fixture: ComponentFixture<ContactSecondaryEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactSecondaryEmailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactSecondaryEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
