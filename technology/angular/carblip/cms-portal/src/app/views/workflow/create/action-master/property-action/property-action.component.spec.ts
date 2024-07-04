import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyActionComponent } from './property-action.component';

describe('PropertyActionComponent', () => {
  let component: PropertyActionComponent;
  let fixture: ComponentFixture<PropertyActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
