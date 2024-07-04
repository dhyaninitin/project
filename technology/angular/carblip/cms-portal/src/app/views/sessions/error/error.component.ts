import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent implements OnInit {
  constructor(private router: Router,
    private globalService: GlobalService) {
    router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      if(event.url != event.urlAfterRedirects) {
        this.createLog('Test', event.url);
      }
    });
  }

  ngOnInit() {}

  private createLog(userName: string, pageUrl: string) {
    const payload = {
      type: 500,
      username: userName,
      page: pageUrl
    };
    this.globalService.createPageAndServerLogs(payload).subscribe(res=> {

    }, error => {
      console.log(error)
    })
  }
}
