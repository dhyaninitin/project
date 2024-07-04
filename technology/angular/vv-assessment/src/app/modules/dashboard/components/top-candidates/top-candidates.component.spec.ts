import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCandidatesComponent } from './top-candidates.component';

describe('TopCandidatesComponent', () => {
  let component: TopCandidatesComponent;
  let fixture: ComponentFixture<TopCandidatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopCandidatesComponent]
    });
    fixture = TestBed.createComponent(TopCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
