import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailThreadComponent } from './mail-thread.component';

describe('MailThreadComponent', () => {
  let component: MailThreadComponent;
  let fixture: ComponentFixture<MailThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
