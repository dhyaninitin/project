import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import * as workflowModel from 'app/shared/models/workflow.model';
import * as smsTemplateModel from 'app/shared/models/sms-templates.model';
import * as commonModels from 'app/shared/models/common.model';
import * as emailTemplateModel from 'app/shared/models/email-templates.model';
import * as logModels from 'app/shared/models/log.model';
import { Subject } from 'rxjs';

@Injectable()
export class WorkflowService {
  private API_PATH = environment.apiUrl;
  workflowCopyData = new Subject<any>();
  workflowCopyStatus = new Subject<any>();
  workflowCloneData = new Subject<any>();
  workflowCloneStatus:boolean = false;
  workflowActionData = new Subject<any>();
  enrollmentsCount = new Subject<{ action_uuid: string, event_master_id: number, is_open: boolean, total_enrollment: number }[]>()
  workflowId = new Subject<number>();
  showGroupBoxCondition: boolean = true;
  setCloneWorkflowId: number = null;

  constructor(
    private http: HttpClient,
  ) { }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  gettype(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow/type`, {
      headers: this.getHttpHeaders(),
    });
  }

  getpropertyColumns():Observable<any>{
    return this.http.get<any>(this.API_PATH + `/property/all/details` , {
      headers: this.getHttpHeaders(),
    });
  }


  getSendingBlueTemplate(requestParams: {per_page: number, page: number, id?: number}): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams?.id) {
      paramObj = Object.assign(paramObj, { id: requestParams.id });
    }
    return this.http.get<any>(this.API_PATH + `/workflow/email/temp`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  storeWorkflow(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow/store`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  updateWorkflow(workflowid: number, payload:any):Observable<any> {
    payload['workflow_id'] = workflowid;
    return this.http.post<any>(this.API_PATH + `/workflow/update`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  getList(requestParams: workflowModel.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      search: requestParams.search
    };
    return this.http.get<any>(this.API_PATH + `/workflow`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getworkflow(id: number): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  toggle(payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow/status`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id:number):Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow/del/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  storeSmsTemplate(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow-sms/store`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  getSmsTemplateList(requestParams: smsTemplateModel.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      search: requestParams.search
    };
    return this.http.get<any>(this.API_PATH + `/workflow-sms`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  

  getSmsTemplate(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow-sms/sms`, {
      headers: this.getHttpHeaders(),
    });
  }

  updateSmsTemplate(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow-sms/update`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  toggleSmsTemplateStatus(id: number, payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow-sms/${id}/status`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  deleteSmsTemplate(id:number):Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow-sms/del/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
  



  getDealStageList(requestParams: commonModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/dealstages/list`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getPortalDealStageList(requestParams: commonModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/portal/dealstage/list`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getPropertyAutoCompleteValue(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/property/values`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  updateWorkflowSchedule(payload:any):Observable<any> {

    return this.http.post<any>(this.API_PATH + `/workflow/schedule`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  getWorkflowLogs(requestParams: commonModels.Filter): Observable<any> {
    let paramObj = {
      // order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/workflow-logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getWorkflowLogsByid(requestParams: commonModels.Filter,id:number): Observable<any> {
    let paramObj = {
      // order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      // search:requestParams.search,
    };

    return this.http.get<any>(this.API_PATH + `/workflow-logs/${id}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getEnrollmentCount(workflowId : number){
    return this.http.get<any>(this.API_PATH + `/workflow/action/enrollment-count/${workflowId}`, {
      headers: this.getHttpHeaders(),
    });
  }

  /** Get RR schedule details by email
   * @param get all source  
   * @returns observable
   */
  getsource() {
    return this.http.get(this.API_PATH + `/request/allRequestSources`, {
      headers: this.getHttpHeaders(),
    });
  }

  /**
   * Email template section
  */

  storeEmailTemplate(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/email-template/store`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  getEmailTemplateList(requestParams: emailTemplateModel.Filter, templateId: number = null): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      search: requestParams.search
    };

    if (templateId) {
      paramObj = Object.assign(paramObj, { template_id: templateId });
    }

    return this.http.get<any>(this.API_PATH + `/email-template`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getEmailTemplate(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow-email/email`, {
      headers: this.getHttpHeaders(),
    });
  }

  updateEmailTemplate(payload:any, id:number):Observable<any> {
    return this.http.put<any>(this.API_PATH + `/email-template/${id}`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  deleteEmailTemplate(id:number):Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/email-template/del/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  toggleEmailTemplateStatus(id: number, payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow-email/${id}/status`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  getEnrollmentHistoryById(requestParams: commonModels.Filter,id:number, filter:any): Observable<any> {
    let paramObj:any = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      type:requestParams.type,
      search:requestParams.search
    };

    if(Object.keys(filter).length != 0 ){
      paramObj.filter = JSON.stringify(filter)
    }

    return this.http.get<any>(this.API_PATH + `/enrollment-history/${id}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getDropdownList(requestParams: commonModels.Filter,id:number, filter:any): Observable<any> {
    let paramObj:any = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      type:requestParams.type,
      search:requestParams.search,
      group_by:requestParams.group_by,
    };

    return this.http.get<any>(this.API_PATH + `/enrollment-history/${id}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }


  getEmailTemplateLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      type: requestParams.type.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/email-template/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  // new APIS for workflow settings

  totalEnrollmentCount(workflow_id:number){
    return this.http.get<any>(`${this.API_PATH}/workflow/enrollment/${workflow_id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  saveWorkflowSettings(payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow-setting`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  getListOfUsers(requestParams: commonModels.Filter): Observable<any> {
    let paramObj:any = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      type:requestParams.type,
      search:requestParams.search
    };

    return this.http.get<any>(this.API_PATH + `/user-list`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getWorkflowSettings(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow-setting`, {
      headers: this.getHttpHeaders(),
    });
  }

  sentOtp(workflow_id:number){
    return this.http.get<any>(`${this.API_PATH}/workflow-setting/otp/${workflow_id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  verifyOtp(payload:any){
    return this.http.post<any>(`${this.API_PATH}/workflow-setting/verify`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  getwWorkflowSettingsLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/workflow-setting/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getEnrolledContacts(requestParams: any, id:number): Observable<any> {
    let paramObj:any = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      search:requestParams.search,
      action_id : requestParams.action_id
    };
    return this.http.get<any>(this.API_PATH + `/workflow/action/enrollment/${id}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getContactEngagedWorkflowList(requestParams: any, id: number): Observable<any> {
    const paramObj: any = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      search:requestParams.search
    };
    return this.http.get<any>(this.API_PATH + `/workflow/engaged-contact/${id}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  testWebhookUrl(payload: {method: string, webhook_url: string}): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/workflow/send-webhook-test`, payload, {
      headers: this.getHttpHeaders(),
    });
  }
}

