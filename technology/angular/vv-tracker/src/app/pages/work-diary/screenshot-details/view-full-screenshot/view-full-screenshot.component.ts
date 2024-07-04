import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'vex-view-full-screenshot',
  templateUrl: './view-full-screenshot.component.html',
  styleUrls: ['./view-full-screenshot.component.scss']
})
export class ViewFullScreenshotComponent implements OnInit {
  screenshot: string = '';

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public screenshotUrl: any,
  ) { }

  ngOnInit(): void {
    this.screenshot = this.screenshotUrl
  }

}
