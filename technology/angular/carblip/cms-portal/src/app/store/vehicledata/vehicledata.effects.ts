import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { VEHICLEDATABRAND, VEHICLEDATAMODEL, VEHICLEDATATRIM, VEHICLEDATAYEARS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './vehicledata.actions';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { initialState } from './vehicledata.states';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class VehicleDataEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList)),
    switchMap(payload => {
      return from(this.service$.getAllYearList()).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATAYEARS.TYPE,
              message: formatErrorMessage(err, VEHICLEDATAYEARS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATAYEARS.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  getBrand$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetBrand)),
    switchMap(payload => {
      return from(this.service$.getBrandList()).pipe(
        map(result => {
          return new actions.GetListBrand(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATABRAND.TYPE,
              message: formatErrorMessage(err, VEHICLEDATABRAND.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATABRAND.LIST_ERROR,
            })
          );
        })
      );
    })
  );
  
  @Effect()
  update$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE_YEAR),
    map(action => (action as actions.UpdateYear).payload),
    switchMap(payload => {
      return from(this.service$.updateYear(payload.id,payload)).pipe(
        map(result => {
          let type:string;
          let statusType :string;
          if(payload.hasOwnProperty('is_active')){
            type = 'shop';
            statusType = result.data?.is_active === 1 ? 'active' : 'in-active';
          }else{
            type = 'scraper'
            statusType = result.data?.is_scrapable === 1 ? 'active' : 'in-active';
          }
          const msg = result.data?.year + " marked as "+ statusType +" for "+ type +" successfully";

          this.snack$.open(msg, 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateYearSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATAYEARS.TYPE,
              message: formatErrorMessage(err, VEHICLEDATAYEARS.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATAYEARS.EDIT_ERROR,
            })
          );
        })
      );
    })
  );

  // Update brand effects

  @Effect()
  updateBrand$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE_BRAND),
    map(action => (action as actions.UpdateBrand).payload),
    switchMap(payload => {
      return from(this.service$.updateBrand(payload.id,payload)).pipe(
        map(result => {
          const statusType = payload?.is_active === 0 ? ' in-active' : ' active';
          const msg = result.data?.name +" is "+ statusType +" for "+ payload.years +" successfully";
          this.snack$.open(msg, 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateBrandSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATABRAND.TYPE,
              message: formatErrorMessage(err, VEHICLEDATABRAND.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATABRAND.EDIT_ERROR,
            })
          );
        })
      );
    })
  );


  @Effect()
  updateBrandValues$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE_BRAND_DATA),
    map(action => (action as actions.UpdateBrandValues).payload),
    switchMap(payload => {
      this.loader.open();
      // console.log('payloadsssss',payload);
      return from(this.service$.updateBrandValues(payload)).pipe(
        map(result => {
          this.loader.close();
          this.snack$.open('Brand updated successfully', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateBrandValuesSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATABRAND.TYPE,
              message: formatErrorMessage(err, VEHICLEDATABRAND.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATABRAND.EDIT_ERROR,
            })
          );
        })
      );
    })
  );

  // get Models List

  @Effect()
  getModels$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_MODEL),
    map(action => (action as actions.GetModel).payload),
    switchMap(payload => {
      return from(this.service$.getModels(payload)).pipe(
        map(result => {
          return new actions.GetListModelSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATAMODEL.TYPE,
              message: formatErrorMessage(err, VEHICLEDATAMODEL.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATAMODEL.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  // update Model

  @Effect()
  updateModelValues$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE_MODEL_DATA),
    map(action => (action as actions.UpdateModelValues).payload),
    switchMap(payload => {
      this.loader.open();
      return from(this.service$.updateModelValues(payload)).pipe(
        map(result => {
          this.loader.close();
          this.snack$.open('Model updated successfully', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateModelValuesSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATAMODEL.TYPE,
              message: formatErrorMessage(err, VEHICLEDATAMODEL.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATAMODEL.EDIT_ERROR,
            })
          );
        })
      );
    })
  );

  
  // get trim list
  @Effect()
  getTrim$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_TRIM),
    map(action => (action as actions.GetTrim).payload),
    switchMap(payload => {
      return from(this.service$.getTrims(payload)).pipe(
        map(result => {
          return new actions.GetTrimListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATATRIM.TYPE,
              message: formatErrorMessage(err, VEHICLEDATATRIM.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATATRIM.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  // Update Trim Value
  @Effect()
  updateTrim$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE_TRIM_DATA),
    map(action => (action as actions.UpdateTrim).payload),
    switchMap(payload => {
      this.loader.open();
      return from(this.service$.updateTrimValues(payload)).pipe(
        map(result => {
          this.loader.close();
          this.snack$.open('Trim updated successfully', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateTrimSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATATRIM.TYPE,
              message: formatErrorMessage(err, VEHICLEDATATRIM.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATATRIM.EDIT_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: VehicleDataService,
    private store$: Store<AppState>,
    private loader: AppLoaderService,
    private snack$: MatSnackBar,
  ) {}
}
