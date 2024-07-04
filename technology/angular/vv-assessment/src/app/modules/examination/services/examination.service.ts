import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurl } from 'src/app/core/apiurl';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ExaminationService {
  appURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  startTest(): any {
    return this.http.post(this.appURL + apiurl.API_START_TEST, {});
  }

  submitTest(data: any): any {
    return this.http.post(this.appURL + apiurl.API_SUBMIT_TEST, data);
  }
}