import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadInvoiceComponent } from './download-invoice.component';

describe('DownloadInvoiceComponent', () => {
  let component: DownloadInvoiceComponent;
  let fixture: ComponentFixture<DownloadInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
