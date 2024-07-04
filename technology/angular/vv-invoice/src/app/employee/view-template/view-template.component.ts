import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-template',
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.scss'],
})
export class ViewTemplateComponent implements OnInit{

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer:DomSanitizer
    ) {}

    ngOnInit(): void {
      if(this.data) {
        this.getCode()
      }
    }

    getCode() {
      return this.sanitizer.bypassSecurityTrustHtml(this.data.libraryData[0].html);
    }
}
