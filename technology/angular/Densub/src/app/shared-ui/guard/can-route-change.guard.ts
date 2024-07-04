import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertConfirm } from '../component/alert-confirm/alert-confirm.modal';
import { AlertConfirmService } from '../service/alertConfirm.service';
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CanRouteChangeGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private alertConfirmService: AlertConfirmService){}
  alertDetails: AlertConfirm = new AlertConfirm();
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(component.canDeactivate && component.canDeactivate()){
      // this.alertDetails = {
      //   title: 'Warning',
      //   message: {
      //     show: true, message:
      //       "Do you want to leave this page without saving? To save, please complete all sections of the profile. Yes, No option."
      //   },
      //   cancelButton: { show: true, name: 'No' },
      //   confirmButton: { show: true, name: 'Yes' },
      // };
      // this.alertConfirmService.openPopup(this.alertDetails).toPromise().then(data => { 
      //   console.log('Data val',data)
      //   if(data){
      //     return true;
      //   }else{
      //     return false;
      //   }
      // });
      if(confirm("Do you want to leave this page without saving? The changes you have made will not be saved.")) {
        return true;
      }else{
        return false;
      }
     
    }else{
      return true;
    }
  }
  
}
