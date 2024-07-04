import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesalequotesComponent } from './wholesalequotes.component';

describe('WholesalequotesComponent', () => {
  let component: WholesalequotesComponent;
  let fixture: ComponentFixture<WholesalequotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WholesalequotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WholesalequotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
