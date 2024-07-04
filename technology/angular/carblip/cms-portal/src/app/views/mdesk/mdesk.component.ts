import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-mdesk',
  templateUrl: './mdesk.component.html',
  styleUrls: ['./mdesk.component.scss']
})
export class MdeskComponent implements OnInit {
  iframeSrc: any;

  constructor(private sanitizer: DomSanitizer) {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.mdesking.com/default.aspx');
  }

  ngOnInit(): void {
  }

}
