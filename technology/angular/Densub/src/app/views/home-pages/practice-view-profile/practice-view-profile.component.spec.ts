import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeViewProfileComponent } from './practice-view-profile.component';

describe('PracticeViewProfileComponent', () => {
  let component: PracticeViewProfileComponent;
  let fixture: ComponentFixture<PracticeViewProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeViewProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeViewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
