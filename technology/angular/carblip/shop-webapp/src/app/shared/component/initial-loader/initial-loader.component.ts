import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-initial-loader',
  templateUrl: './initial-loader.component.html',
  styleUrls: ['./initial-loader.component.scss'],
})
export class InitialLoaderComponent implements OnInit {
  public slideUp: boolean;
  public isVisible: boolean;

  constructor() {
    this.isVisible = true;
    this.slideUp = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.slideUp = true;
      setTimeout(() => {
        this.isVisible = false;
      }, 500);
    }, 1500);
  }
}
