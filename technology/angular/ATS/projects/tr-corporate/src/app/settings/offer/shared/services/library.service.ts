import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_routes, secure_api_routes } from 'projects/tr-corporate/src/app/utility/configs/apiConfig';
import { BehaviorSubject } from 'rxjs';
import {  Custom_Field_Delete_Response, Document_Delete_Response, 
  Get_CustomFields_Response, Post_CustomFields, Put_CustomFields } from '../interfaces/custom-fields';
import { Get_Document_Response, Get_Revise_Document_Response, UserInfo_Response } from '../interfaces/documents';
import { OfferDocumentI, OfferUploadJsonI } from '../interfaces/offer-document';
import { Offer_Delete_Response, Offer_Document_Response, Offer_Insert_Response, Update_response } from '../interfaces/offer-setting';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private api_routes;
  private secure_api_routes;
  
  public templatesList = new BehaviorSubject<[]>([]);

  public parentList = new BehaviorSubject<[]>([]);

  public url = "";
  public file: File | undefined;

  constructor(private http: HttpClient)
   {
    this.api_routes = api_routes;
    this.secure_api_routes = secure_api_routes;
   }


   isFileSizeAllowed(size: number) {
    let isFileSizeAllowed = false;
    if (size < 1000000) {
      isFileSizeAllowed = true;
    }
    return isFileSizeAllowed;
  }
  
  formatBytes(bytes: number) {
    var marker = 1024;
    var decimal = 1;
    var kiloBytes = marker;
    var megaBytes = marker * marker;
    var gigaBytes = marker * marker * marker;
    if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
    else if(bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
    else return null;
  }

   // OFFER LIBRARY CUSTOM FIELDS
   
    // Get custom Fields
   getCustomFields(pageNumber: number, limit: number, searchText: string, sortBy: string) {
    const url = `${secure_api_routes.CUSTOM_FIELDS}?pageNumber=${pageNumber}&limit=${limit}&searchText=${searchText}&sortBy=${sortBy}`
    return this.http.get<Get_CustomFields_Response>(url);
   }

   //Get custom fields count
   getCustomFieldsCount(searchText: string) {
    const url = `${secure_api_routes.GET_CUSTOM_FIELDS_COUNT}?searchText=${searchText}`
    return this.http.get<Get_CustomFields_Response>(url);
   }

   // Add custom fields
   createCustomFields(payload:any) {
     const url = `${secure_api_routes.CUSTOM_FIELDS}`
     return this.http.post<Post_CustomFields>(url,payload)
   }
   
   // Update custom fields
   updateCustomFields(payload: any) {
     const url = `${secure_api_routes.CUSTOM_FIELDS}`
     return this.http.put<Put_CustomFields>(url,payload)
   }
   
   // Delete template by template id
   deleteCustomFieldById(customfieldid: string) {
    const url = `${secure_api_routes.CUSTOM_FIELD_BY_ID}?customfieldid=${customfieldid}`
    return this.http.delete<Custom_Field_Delete_Response>(url)
   }

   // Get template by template id
   getCustomFieldById(customfieldid: string) {
    const url = `${secure_api_routes.CUSTOM_FIELD_BY_ID}?templateid=${customfieldid}`
    return this.http.get<Get_CustomFields_Response>(url)
   }

   // OFFER LIBRARY DOCUMENTS

   //Get Documents
   getDocument(pageNumber: number, limit: number, searchText: string, sortBy: string, sortByDocType: string) {
     const url = `${secure_api_routes.DOCUMENT}?pageNumber=${pageNumber}&limit=${limit}&searchText=${searchText}&sortBy=${sortBy}`
     return this.http.get<Get_Document_Response>(url)  
   }
    
   //Delete Document By ID
   deleteDocumentById(offerdocumentid: string) {
     const url = `${secure_api_routes.DOCUMENT}?offerdocumentid=${offerdocumentid}`
     return this.http.delete<Document_Delete_Response>(url)
   }

   // Get offer document by document id
   getOfferDocumentById(offerdocumentid: string) {
    const url = `${secure_api_routes.GET_DOCUMENT_BY_ID}?offerdocumentid=${offerdocumentid}`
    return this.http.get<Get_Document_Response>(url)
  }

   // Update document By ID
   updateDocumentById(payload: any) {
    const url = `${secure_api_routes.DOCUMENT}`
    return this.http.put<Update_response>(url, payload);
  }

   // Count total number of documents
   getOfferDocumentsCount(searchText: string) {
    const url = `${secure_api_routes.GET_DOCUMENT_COUNT}?searchText=${searchText}`
    return this.http.get<Get_CustomFields_Response>(url);
   }

   //Offer Document
   createOfferDocument(payload: OfferDocumentI){
    const url = `${secure_api_routes.DOCUMENT}`
    return this.http.post<Offer_Insert_Response>(url, payload);
  }

   //Revise Document
   getReviseDocument(offerdocumentid: string) {
     const url = `${secure_api_routes.REVISE_DOCUMENT}?offerdocumentid=${offerdocumentid}`
     return this.http.get<Get_Revise_Document_Response>(url)
   }

    //Create Offer Revise Document
    createOfferReviseDocument(payload: OfferDocumentI){
      const url = `${secure_api_routes.REVISE_DOCUMENT}`
      return this.http.post<Offer_Insert_Response>(url, payload);
    }

   // Delete all revise documents

   deleteAllReviseDocs(offerdocumentid: string){
    const url = `${secure_api_routes.DELETE_ALL_REVISE_DOCS}?offerdocumentid=${offerdocumentid}`
    return this.http.delete<Offer_Delete_Response>(url);
    }

    //AWS Offer documnet
    generatePresignedURL(fileType: string){
      const url = `${secure_api_routes.GET_PRESIGNED_URL}?fileType=${fileType}`
      return this.http.get<Offer_Document_Response>(url);
    }

    download(path: string, fileName: string){
      const url = `${secure_api_routes.DOWNLOAD_DOCUMENT}?path=${path}&fileName=${fileName}`
      return this.http.get<any>(url);
    }

  //Get ALl placeholders
  getAllPlaceholders(){
    const url = `${secure_api_routes.PLACEHOLDERS}`
    return this.http.get<any>(url);
  }

  //Create Offer JSON upload Document
  createOfferUploadJson(payload: OfferUploadJsonI){
    const url = `${secure_api_routes.OFFER_JSON}`
    return this.http.post<Offer_Insert_Response>(url, payload);
  }

}
