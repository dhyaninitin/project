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
  showLeftMenuForJobs = true;
  fetchRoute = '';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveJob(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/saveJob`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public savePayementDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/savePayementDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getJobs(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/getJobs`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getJobsWithContractDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/getJobsWithContractDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getJobsWithDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/getJobsWithDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getJobCount(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/getJobCount`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public updateCounts(param: object): Observable<any> {
    console.log(param);
    return this.apiService.post(`${this.jobs}/updateCounts`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public searchJobs(param: object): Observable<any> {
    return this.apiService.post(`${this.jobs}/searchJobs`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deleteJob(param: object): Observable<any> {
    return this.apiService.delete(`${this.jobs}/deleteJob`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public checkExpiration(param:object):Observable<any> {
    return this.apiService.post(`${this.jobs}/checkExpiration`, param).pipe(map(
      data => {
        return data;
      }
  ));
  }
  public geocodeAddress(url: string): Observable<any> {
    return this.apiService.apiCall(`${url}`).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public searchJobByPracticeNameAndPosition(param:object):Observable<any> {
    return this.apiService.post(`${this.jobs}/searchJobByPracticeNameAndPosition`, param).pipe(map(
      data => {
        return data;
      }
  ));
  }

}
