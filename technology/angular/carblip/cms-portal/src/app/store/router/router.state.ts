import {
  ActivatedRouteSnapshot,
  Params,
  RouterStateSnapshot,
} from '@angular/router';
import { RouterReducerState } from '@ngrx/router-store';
import * as fromRouter from '@ngrx/router-store';

export interface RouterStateUrl {
  url: string;
  queryParams: Params;
  params: Params;
}

export type RouterStateType = RouterReducerState<RouterStateUrl>;

export class CustomSerializer
  implements fromRouter.RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    const { url } = routerState;
    const { queryParams } = routerState.root;

    let state: ActivatedRouteSnapshot = routerState.root;
    while (state.firstChild) {
      state = state.firstChild;
    }
    const { params } = state;

    return {
      url,
      queryParams,
      params,
    };
  }
}
