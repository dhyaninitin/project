import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { PostLoginService } from '../../utility/services/post-login.service';

@Injectable({
  providedIn: 'root'
})
export class PostLoginResolver implements Resolve<any> {
  constructor(private postLoginService: PostLoginService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.postLoginService.loadPostLoginData();
  }
}
