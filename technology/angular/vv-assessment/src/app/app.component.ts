import { Component } from '@angular/core';
import { LoaderService } from './shared/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  contentLoaded = false;

  title = 'vv-assesment-portal';
  currentYear: number = new Date().getFullYear();

  constructor(public loaderService: LoaderService){
    this.loaderService.loading$.subscribe(loading => {
      this.contentLoaded = !loading;
    });
  }
}
