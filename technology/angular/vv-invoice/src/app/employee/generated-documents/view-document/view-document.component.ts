import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent implements OnInit {
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  templatetype: any;
  generateddocument: any;

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer:DomSanitizer
  ){}

  ngOnInit(): void {
    this.templatetype = this.data.templatetype;
    this.generateddocument = this.data.generateddocument;
    if(this.generateddocument) {
      this.getCode()
    }
  }

  getCode( ) {
    return this.sanitizer.bypassSecurityTrustHtml(this.generateddocument);
  }

}
