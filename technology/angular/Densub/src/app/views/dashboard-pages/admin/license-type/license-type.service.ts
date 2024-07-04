import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseTypeService {
  routePath: String = 'licenseType';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveLicenseType(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveLicenseType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getLicenseTypeList(param: object): Observable<any> {
    return this.apiService.get(`${this.routePath}/getLicenseTypeList`).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteLicenseType(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteLicenseType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
