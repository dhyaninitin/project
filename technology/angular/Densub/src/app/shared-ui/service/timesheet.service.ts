import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})

export class TimesheetService {
    timesheet: String = 'timesheet';
    constructor(private http: HttpClient, private apiService: ApiService) { }

    public addTimesheet(param: object): Observable<any> {
        return this.apiService.post(`${this.timesheet}/addTimesheet`, param).pipe(
            map(data => {
                return data;
            })
        );
    }

    public getTimesheetDetails(param: object): Observable<any> {
        return this.apiService.post(`${this.timesheet}/getTimesheetDetails`, param).pipe(
            map(data => {
                return data;
            })
        );
    }


}
