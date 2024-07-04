import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  routePath: String = 'certificate';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveCertificate(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveCertificate`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getCertificateList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getCertificateList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteCertificate(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteCertificate`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public updateManyCertificate(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManyCertificate`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
