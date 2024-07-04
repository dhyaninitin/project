import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showLoadin: Boolean =  true;

  constructor(

  ) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.showLoadin = false;
    }, 200);
  }

}
