import { Component, OnInit } from '@angular/core';

import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class PendingChangesGuard
  implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private confirmService$: AppConfirmService) {}

  canDeactivate(
    component: ComponentCanDeactivate
  ): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() ? true : this.openConfirmDialog();
  }

  openConfirmDialog() {
    return this.confirmService$.confirm({
      message: `Are you sure you want to proceed without saving your updates?  Please note that all your changes will be lost`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }
}
