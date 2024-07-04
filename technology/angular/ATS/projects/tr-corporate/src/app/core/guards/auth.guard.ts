import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { Observable } from 'rxjs';
import { LSkeys } from '../../utility/configs/app.constants';
import { RouterConfigService } from '../../utility/services/router-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  loggedin!: boolean;

  config: any;
  constructor(
    private router: Router,
    private configServ: RouterConfigService,
    private LsService: LstorageService,
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.config = this.configServ.routerconfig;
    this.loggedin = !!this.LsService.getItem(LSkeys.BEARER_TOKEN);

    // For Invited user (e=existing, n=new)
    if (state.url.startsWith(this.config.USER_INVITED)) {

      const type = state.url.split('/')[4];
      const token = state.url.split('/')[5];

      if (type && token) {
        if (type === 'n') {
          this.LsService.clear();
          return true;
        }
        else if (type === 'e') {
          this.LsService.store(LSkeys.INVITE_TOKEN, token);
          this.router.navigate([this.config.AUTH])
        }
      }
      return false

    }

    // For all routes
    else {
      if (state.url.startsWith(this.config.DASHBOARD)) {
        if (this.loggedin) return true;
        else {
          this.router.navigate([this.config.AUTH]);
          return false;
        }
      } else {
        if (this.loggedin) {
          this.router.navigate([this.config.DASHBOARD]);
          return false;
        } else return true;
      }
    }


  }
}
