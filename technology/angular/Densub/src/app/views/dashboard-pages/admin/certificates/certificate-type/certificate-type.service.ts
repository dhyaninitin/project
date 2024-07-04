import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})

export class CertificateTypeService {
  routePath: String = 'certificateType';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveCertificateType(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveCertificateType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getCertificateTypeList(param: object): Observable<any> {
    return this.apiService.get(`${this.routePath}/getCertificateTypeList`).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteCertificateType(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteCertificateType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
