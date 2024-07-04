import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import {BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeFirstComponentFunction = new EventEmitter();
  invokeSearchJobsComponentFunction = new EventEmitter();
  subsVar: Subscription;

  private paymentSource = new Subject<any>();
  paymentModal$ = this.paymentSource.asObservable();

  data: BehaviorSubject<any>;

  constructor() {
    this.data = new BehaviorSubject(null);
  }

  onFirstComponentButtonClick(type,work,index) {
    let obj = {t:type,w:work,i:index}
    console.log(obj);
  }

  onStaffSearchComponentButtonClick(name:String,loc:String){
    let data = [];
    data.push({name:name},{location:loc})
    this.invokeFirstComponentFunction.emit(data);
  }

  onJobSearchButtonClick(name:String){
    this.invokeSearchJobsComponentFunction.emit(name);
  }
}
