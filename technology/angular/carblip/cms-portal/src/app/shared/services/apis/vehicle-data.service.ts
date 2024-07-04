
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import * as vehicledataModel from 'app/shared/models/vehicledata.model';

@Injectable()
export class VehicleDataService {
  private API_PATH = environment.apiUrl;
  constructor(
    private http: HttpClient,
  ) {}

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getAllYearList(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/vehicle-data/years`, {
    headers: this.getHttpHeaders(),
    });
  }

  getBrandList(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/vehicle-data/brands`, {
    headers: this.getHttpHeaders(),
    });
  }

  getModels(requestParams: vehicledataModel.ModelFilter): Observable<any> {
    let paramObj = {
        brand: requestParams.brand,
        year: requestParams.year,
    };
    
    return this.http.get<any>(this.API_PATH + `/vehicle-data/models`, {
    params: paramObj,
    headers: this.getHttpHeaders(),
    });
  }

  getTrims(requestParams: vehicledataModel.TrimFilter): Observable<any> {
    let paramObj = {
        brand: requestParams.brand,
        year: requestParams.year,
        model_id: requestParams.model,
    };
    
    return this.http.get<any>(this.API_PATH + `/vehicle-data/trim`, {
    params: paramObj,
    headers: this.getHttpHeaders(),
    });
  }

  updateYear(id: number,payload: any): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/vehicle-data/year/update/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  updateBrand(id: number,payload: any): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/vehicle-data/brands/update/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  updateBrandValues(payload: any): Observable<any> {
    let formData = new FormData();
    if(payload?.file && payload?.file_extention) {
      formData.append('file', payload.file);
      formData.append('file_extention', payload.file_extention);
    }
    formData.append('file_name', payload.file_name);
    formData.append('id', payload.id);
    return this.http.post<any>(this.API_PATH + `/vehicle-data/brands/values`, formData,{
      headers: new HttpHeaders({
        Authorization: `${localStorage.getItem('authorization')}`
      })
    });
  }


  updateModelValues(payload: any): Observable<any> {
    let formData = new FormData();
    if(payload?.file && payload?.file_extention) {
      formData.append('file', payload.file);
      formData.append('file_extention', payload.file_extention);
    }
    formData.append('file_name', payload.file_name);
    formData.append('id', payload.id);
    return this.http.post<any>(this.API_PATH + `/vehicle-data/model/update`, formData,{
      headers: new HttpHeaders({
        Authorization: `${localStorage.getItem('authorization')}`
      })
    });
  }

  updateTrimValues(payload: any): Observable<any> {
    let formData = new FormData();
    if(payload?.file && payload?.file_extention) {
      formData.append('file', payload.file);
      formData.append('file_extention', payload.file_extention);
    }
    formData.append('file_name', payload.file_name);
    formData.append('id', payload.id);
    return this.http.post<any>(this.API_PATH + `/vehicle-data/trim/update`, formData,{
      headers: new HttpHeaders({
        Authorization: `${localStorage.getItem('authorization')}`
      })
    });
  }

  getColors(payload:any): Observable<any> {
    let payloads = {
      vehicles:payload.trimId
    }
    return this.http.post<any>(this.API_PATH + `/vehicle-data/colors`, payloads, {
      headers: this.getHttpHeaders(),
    });
  }

  getVehicleDataLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      type: requestParams.type.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/vehicle-data/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/vehicle-data/status`, {
      headers: this.getHttpHeaders(),
    });
  }

  updateModelStatus(id: number,payload: any): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/vehicle-data/model/update/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }


  updateTrimStatus(id: number,payload: any): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/vehicle-data/trim/update/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }


  

  
}