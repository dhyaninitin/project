import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignService {
  isDrawerOpen = new BehaviorSubject(false);
  isDrawerOpen$ = this.isDrawerOpen.asObservable();

  showAddTemplateForm = new BehaviorSubject(false);
  showAddTemplateForm$ = this.showAddTemplateForm.asObservable();

  constructor() { }

  setDrawerOpen(data: boolean) {
    this.isDrawerOpen.next(data);
  }

  addTemplate() {
    this.showAddTemplateForm.next(true);
  }

  getRoleClass(roletypeid: number) {
    return {
      'success': roletypeid === 2,
      'info': roletypeid === 1,
      'rm': roletypeid === 4,
      'dm': roletypeid === 5,
      'bm': roletypeid === 6,
      'bl': roletypeid === 7,
      'vn': roletypeid === 8,
      'nh': roletypeid === 9,
      'hr': roletypeid === 3
    }
  }
}
