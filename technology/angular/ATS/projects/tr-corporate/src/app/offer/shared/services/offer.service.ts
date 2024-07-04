import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/internal/operators/map";
import { Store } from "@ngrx/store";
import { setOffers } from "../../../utility/store/actions/offers.action";
import { offer_api_routes, secure_api_routes } from "../../../utility/configs/apiConfig";
import { GeneralInfoI } from "../interfaces/offer-details";
import { GenericSettingsPayload } from "../../../settings/offer/shared/interfaces/genericSettings";
import { Update_response } from "../../../settings/offer/shared/interfaces/offer-setting";
@Injectable({
  providedIn: "root",
})
export class OfferService {
  //Static Data
  jobid: number = 2272;
  email: string = 'manualll@yopmail.com';
  ////

  offerUrl: string = '';

  previewDrawer = new BehaviorSubject(false);
  offerBreakdownDrawer = new BehaviorSubject(false);
  currencyType = 'USD';

  generalInfoForm = new BehaviorSubject<any>({});
  salaryStructureTemplate = new BehaviorSubject<any>({});

  step: number = 0;
  salaryStructureCreated: boolean = false;

  offerJSON: Array<{}> = [];
  equalJSON: boolean = false;
  oldJson: Array<{}> = [];
  salaryBreakdown: any  = [];
  candidateInfo: any = []

  dateOfJoining: string = '';
  totalSalary: number = 0;
  jobCode: string = '';
  count: number = 0;

  salaryDetailsForMobile = [];

  constructor(private http: HttpClient, private store: Store) {}

  jobDetailsForOfferById(param: any): Observable<any> {
    return this.http
      .get<any>(`${offer_api_routes.GET_JOB_INFO}?jobid=${param.jobid}`)
      .pipe(
        map((data: any) => {
          this.store.dispatch(setOffers({ data: data.data }));
          return data;
        })
      );
  }

  jobOfferCandidateDetails(param: any): Observable<any> {
    return this.http
      .get<any>(
        `${offer_api_routes.CANDIDATE_INFO}?jobid=${param.jobid}&email=${param.email}`
      )
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  getJobOfferDetails(param: any) {
    return this.http
      .get<any>(
        `${offer_api_routes.GET_OFFER_INFO}?jobid=${param.jobid}&email=${param.email}`
      )
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  createGeneralInfo(payload: GeneralInfoI) {
    return this.http.post<any>(`${offer_api_routes.OFFER_INFO}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  updateGeneralInfo(payload: GeneralInfoI) {
    return this.http.put<any>(`${offer_api_routes.OFFER_INFO}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  updateSalaryInfo(payload: any) {
    return this.http.put<any>(`${offer_api_routes.SALARY_STRUCTURE}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  updateApprovals(payload: any) {
    return this.http.put<any>(`${offer_api_routes.APPROVALS}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  updateFinalOffer(payload: any) {
    return this.http.put<any>(`${offer_api_routes.FINAL_OFFER}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  sendEmail(payload: any) {
    return this.http.post<any>(`${offer_api_routes.SEND_EMAIL}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  setOpenPreviewDrawer(previewDrawer: boolean) {
    this.previewDrawer.next(previewDrawer);
  }

  setOfferBreakdownDrawer(previewDrawer: boolean) {
    this.offerBreakdownDrawer.next(previewDrawer);
  }

  generateOfferDocument(json: any) {
    let token: any = localStorage.getItem('bearerToken') || null;
    let accountid: any = localStorage.getItem('defaultAccount') || null;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'accountid':  accountid,
    });

    let route = 'https://dev.api.talentmarx.in/api/v1/proffer/generate';

    //SEND HEADER
    return this.http.post<any>(route, json).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  generateDocToPdf(payload: any) {
    return this.http.post<any>(`${offer_api_routes.DOC_TO_PDF}`, payload).pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  getEmailTemplates() {
    return this.http
    .get<any>(
      `${offer_api_routes.EMAIL_TEMPLATES}?pageNumber=0&limit=20`
    )
    .pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  getGenericSettings() {
    return this.http
    .get<any>(
      `${offer_api_routes.GENERIC_SETTINGS}`
    )
    .pipe(
      map((data: any) => {
        return data;
      })
    );
  }

  updateGenericSetting(payload: any){
    const url = `${secure_api_routes.UPDATE_GENERIC_SETTINGS}`
    return this.http.put<Update_response>(url, payload);
  }

  updateCandidateSalary(payload: any) {
    const url = `${offer_api_routes.CANDIDATE_INFO}`
    return this.http.put<Update_response>(url, payload);
  }
}
