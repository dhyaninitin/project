import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedDocumentsComponent } from './generated-documents.component';

describe('GeneratedDocumentsComponent', () => {
  let component: GeneratedDocumentsComponent;
  let fixture: ComponentFixture<GeneratedDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratedDocumentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
