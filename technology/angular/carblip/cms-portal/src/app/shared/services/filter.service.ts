import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }

  // Advance Search filter
  saveAdvanceFilter(payload, type: string) {
    localStorage.setItem(type, JSON.stringify(payload))
  }

  getAdvanceFilter(payload, type?: string) {
    const formKeys = payload.form.value
    let advanceFilter = JSON.parse(localStorage.getItem(payload.advance))
    advanceFilter = advanceFilter ? advanceFilter : {}
    this.getCommonFilter(payload)
    if (advanceFilter) {
      for (let key in formKeys) {
        if (formKeys.hasOwnProperty(key) && key in advanceFilter) {
          if (Array.isArray(advanceFilter[key])) {
            formKeys[key] = advanceFilter[key];
            if (!type) {
              advanceFilter[key] = String(advanceFilter[key])
            }
          } else {
            formKeys[key] = advanceFilter[key];
          }
        }
      }

      if (advanceFilter.start_date && advanceFilter.end_date) {
        advanceFilter.start_date = moment(advanceFilter.start_date).format('yyyy/MM/DD');
        advanceFilter.end_date = moment(advanceFilter.end_date).format('yyyy/MM/DD');
      }

      payload.filter["filter"] = { ...payload.filter["filter"], ...advanceFilter };
    }
    return payload

  }

  // common filter (pagination sorting & search)
  setCommonFilter(type: string, payload) {
    let commonFilter = JSON.parse(localStorage.getItem(type))
    if (commonFilter) {
      for (let key in payload) {
        if (key in commonFilter) {
          commonFilter[key] = payload[key];
        }
      }
      commonFilter = { ...commonFilter, ...payload }
    }
    localStorage.setItem(type, JSON.stringify(commonFilter ? commonFilter : payload))
  }


  getCommonFilter(payload) {
    const commonFilter = JSON.parse(localStorage.getItem(payload.common))
    if (commonFilter) {
      for (let key in payload.filter) {
        if (key in commonFilter) {
          payload.filter[key] = commonFilter[key];
        }
      }
    }
  }

  getSortingDirection(type){
    return JSON.parse(localStorage.getItem(type))
  }
}
