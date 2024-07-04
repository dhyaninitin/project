import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { employee_api_routes } from "../enum's/enum";

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  employeeData: any[] = [];
  getComData: any[] = [];
  showSelectComDropdown: boolean = false;

  templatePage: number = 1;
  templateSize: number = 5;
  templateSortBy: string = '';
  templateSearchedKeyword: string = '';

  globalTemplatePage: number = 1;
  globalTemplateSize: number = 5;
  globalTemplateSortBy: string = '';
  globalTemplateSearchedKeyword: string = '';

  generatedDocumentPage: number = 1;
  generatedDocumentSize: number = 5;
  generatedDocumentSortBy: string = '';
  generatedDocumentSearchedKeyword: string = '';

  callTheOninitSubject = new Subject<any>();
  delComDataFromTableSubject = new Subject<any>();
  sendEditDataSubject = new Subject<any>();
  changeSaveBtnToUpdate = new Subject<any>();
  changeTableName = new Subject<any>();
  navigationBtnsSubject = new BehaviorSubject<any>(null);
  editGlobalTemplateSubject = new BehaviorSubject<any>(null);
  removeComponentFromEditorSubject = new Subject<any>();
  hideSpinnerSubject = new BehaviorSubject<[boolean,string]>([false, '']);

  constructor(private http: HttpClient) {}

  createGeneratedDocumentSerialNo(id: any):Observable<any> {
    return this.http.put<any>(`${employee_api_routes.CREATE_GENERATED_DOCUMENT_SERIAL_NO}/${id}`,{})
  }

  getGeneratedDocumentSerialNo(id: any) {
    return this.http.get<any>(`${employee_api_routes.GET_GENERATED_DOCUMENT_SERIAL_NO}/${id}`,{})
  }

  checkTemplateNameExist(_id:any, checkTemplateName: any):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.CHECK_TEMPLATE_NAME_EXIST}/${_id}/${checkTemplateName}`)
  }

  sendInvoiceThroughEmail(recipientEmail: string,invoice: any): Observable<any> {
    return this.http.post<any>(`${employee_api_routes.SEND_INVOICE_THROUGH_EMAIL}/${recipientEmail}`,invoice);
  }

  onDelCom(componentid: any): Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_EMPLOYEE_COMPONENT}/${componentid}`,{});
  }

  deleteEmployeeRelatedCom(templateid: any): Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_EMPLOYEE_RELATED_COMPONENT}/${templateid}`,{});
  }

  onTemplateStatusChange(templateid: any, status: Number): Observable<any> {
    return this.http.put<any>(`${employee_api_routes.TEMPLATE_STATUS_CHANGE}/${templateid}/${status}`,{});
  }

  getEmployeeTemplates(id: any,page: any,size: any,searchedKeyword: String, sortBy: String): Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_EMPLOYEE_TEMPLATES}/${id}?page=${page}&limit=${size}&searchedKeyword=${searchedKeyword}&sortBy=${sortBy}`,{});
  }
  
  getEmployeeTemplatesWhileScroll(id: any,page: number,size: number): Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_EMPLOYEE_TEMPLATES_WHILE_SCROLL}/${id}?page=${page}&limit=${size}`,{});
  }

  onVerifytemplate(templateid: string):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.VERIFY_TEMPLATE}/${templateid}`, {})
  }

  createEmployeeTemplate(id: any, data: any): Observable<any> {
    return this.http.post<any>(`${employee_api_routes.CREATE_TEMPLATE}/${id}`,data);
  }

  updateEmployeeTemplate(templateid: any, data: any): Observable<any> {
    return this.http.put<any>(`${employee_api_routes.UPDATE_TEMPLATE}/${templateid}`,data);
  }

  deleteEmployeeTemplate(templateid: any, id: any): Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_TEMPLATE}/${templateid}/${id}`,{});
  }

  getTemplatesType(id: any): Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_TEMPLATES_TYPE}/${id}`);
  }

  addNewTemplateType(id: any,newTemplateType: String): Observable<any> {
    return this.http.post<any>(`${employee_api_routes.ADD_NEW_TEMPLATE_TYPE}/${id}`,{newTemplateType});
  }

  deleteAddedTemplateType(id: any): Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_ADDED_TEMPLATE_TYPE}/${id}`,{});
  }

  getLibraryTemplates(id: any):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_LIBRARY_TEMPLATES}/${id}`,{})
  }

  deleteCustomTemplate(id: String):Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_CUSTOM_TEMPLATE}/${id}`,{})
  }

  postUserFeedback(payload: any):Observable<any> {
    return this.http.post<any>(`${employee_api_routes.POST_USER_FEEDBACK}`,payload)
  }

  getUserFeedback():Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_USER_FEEDBACK}`)
  }

  updateUserFeedback(payload: any):Observable<any>{
    return this.http.put<any>(`${employee_api_routes.UPDATE_USER_FEEDBACK}`,payload)
  }

  deleteUserFeedback(id: String):Observable<any>{
    return this.http.delete<any>(`${employee_api_routes.DELETE_USER_FEEDBACK}/${id}`,{})
  }

  createDefaultLibraryTemplate(payload: any):Observable<any> {
    return this.http.post<any>(`${employee_api_routes.CREATE_DEFAULT_LIBRARY_TEMPLATE}`,payload)
  }

  addNewPlaceholder(data: any):Observable<any> {
    return this.http.post<any>(`${employee_api_routes.ADD_NEW_PLACEHOLDER}`,data)
  }

  createGlobalTemplate(id: any, data: any):Observable<any> {
    return this.http.post<any>(`${employee_api_routes.CREATE_GLOBAL_TEMPLATE}/${id}`,data)
  }
  
  checkGlobalTemplateNameExist(userid: any, checkTemplateName: any): Observable<any> {
    return this.http.get<any>(`${employee_api_routes.CHECK_GLOBAL_TEMPLATE_EXIST}/${userid}/${checkTemplateName}`)
  }

  getGlobalTemplates(id: any,page: number,size: number,searchedKeyword: String, sortBy: String):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_GLOBAL_TEMPLATES}/${id}?page=${page}&limit=${size}&searchedKeyword=${searchedKeyword}&sortBy=${sortBy}`, {})
  }

  getGlobalTemplatesWhileScroll(id: any,page: number,size: number) {
    return this.http.get<any>(`${employee_api_routes.GET_GLOBAL_TEMPLATES_WHILE_SCROLL}/${id}?page=${page}&limit=${size}`, {})
  }

  updateGlobalTemplate(id: any,data: any):Observable<any> {
    return this.http.put<any>(`${employee_api_routes.UPDATE_GLOBAL_TEMPLATE}/${id}`, data)
  }

  deleteGlobalTemplate(id: any):Observable<any> {
    return this.http.delete<any>(`${employee_api_routes.DELETE_GLOBAL_TEMPLATE}/${id}`, {})
  }

  createNewGlobalPlaceholderType(userid: any,data: any):Observable<any> {
    return this.http.post<any>(`${employee_api_routes.CREATE_NEW_GLOBAL_PLACEHOLDER_TYPE}/${userid}`,data)
  }

  getGlobalPlaceholderTypes(userid: any):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_GLOBAL_PLACEHOLDER_TYPES}/${userid}`,{})
  }

  deleteGlobalPlaceholderType(id: any) {
    return this.http.delete<any>(`${employee_api_routes.DELETE_GLOBAL_PLACEHOLDER_TYPE}/${id}`,{})
  }

  saveGeneratedDocument(userid: any, payload: any): Observable<any> {
    return this.http.post<any>(`${employee_api_routes.SAVE_GENERATED_DOCUMENT}/${userid}`, payload)
  }

  getGeneratedDocuments(userid: any,page: number,size: number,searchedKeyword: String, sortBy: String):Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_GENERATED_DOCUMENTS}/${userid}?page=${page}&limit=${size}&searchedKeyword=${searchedKeyword}&sortBy=${sortBy}`, {})
  }

  uploadUserProfile(userid: any, imageToBase64: any): Observable<any> {
    const payload = {
      base64: imageToBase64.toString()
    }
    return this.http.post<any>(`${employee_api_routes.UPLOAD_USER_PROFILE}/${userid}`, payload)
  }

  getUserProfile(userid: any) :Observable<any> {
    return this.http.get<any>(`${employee_api_routes.GET_USER_PROFILE}/${userid}`)
  }
}
