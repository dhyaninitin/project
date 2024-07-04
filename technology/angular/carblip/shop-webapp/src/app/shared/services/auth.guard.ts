import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router/src/router_state';
import { select, Store } from '@ngrx/store';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import { Observable } from 'rxjs/Observable';
import { debounceTime } from 'rxjs/operators';
import { IStore } from '../interfaces/store.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  public didFetch$: Observable<boolean>;

  constructor(
    private authService: AuthServiceImpl,
    private router: Router,
    private store$: Store<IStore>
  ) {}

  canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    if (this.authService.getToken()) {
      this.didFetch$ = this.store$.pipe(select(state => state.auth.didFetch));
      this.didFetch$.pipe(debounceTime(10)).subscribe(didFetch => {
        const token = this.authService.getToken();
        if (!didFetch && token) {
          this.store$.dispatch(new AuthActions.FetchUserData());
        }
      });

      if (routerState.url === '/register') {
        this.router.navigateByUrl('/find-my-car');
      }
      return true;
    } else if (routerState.url === '/find-my-car') {
      return true;
    } else {
      this.router.navigateByUrl('/find-my-car');
      return false;
    }
  }
}
