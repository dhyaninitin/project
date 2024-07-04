import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalTemplateComponent } from './add-global-template.component';

describe('AddGlobalTemplateComponent', () => {
  let component: AddGlobalTemplateComponent;
  let fixture: ComponentFixture<AddGlobalTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGlobalTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGlobalTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
