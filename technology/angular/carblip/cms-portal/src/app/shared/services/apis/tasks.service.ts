
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import * as tasksModel from 'app/shared/models/tasks.model';
import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';


@Injectable()
export class TasksService {
  private API_PATH = environment.apiUrl;
  public isEnableAddNewTaskBtn: boolean = false;
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

  getList(requestParams: tasksModel.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: JSON.stringify(requestParams.filter) || "",
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    if (requestParams.show_completed) {
      paramObj = Object.assign(paramObj, { show_completed: requestParams.show_completed });
    }

    return this.http.get<any>(this.API_PATH + `/tasks`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }


  getListOfOwners(requestParams: commonModels.Filter, ownerid=null): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search && requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    if (ownerid != null && !requestParams.search && !requestParams.search.trim()) {
      paramObj['owner_id'] = ownerid;
    }
    
    return this.http.get<any>(this.API_PATH + `/tasks/owners`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: tasksModel.AddTask): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/tasks/create`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: tasksModel.UpdateTask): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/tasks/update/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  getTaskLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/tasks/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }
}