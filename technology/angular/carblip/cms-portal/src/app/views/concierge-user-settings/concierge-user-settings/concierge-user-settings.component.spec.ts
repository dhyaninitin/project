import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciergeUserSettingsComponent } from './concierge-user-settings.component';

describe('ConciergeUserSettingsComponent', () => {
  let component: ConciergeUserSettingsComponent;
  let fixture: ComponentFixture<ConciergeUserSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConciergeUserSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConciergeUserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
