import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';
@Injectable({
  providedIn: 'root'
})
export class JobsService {
  jobs: String = 'jobs';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }
  public getJobs(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/getJobs`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deleteJob(param: object): Observable<any> {
    return this.apiService.delete(`${this.jobs}/deleteJob`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
