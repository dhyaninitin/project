import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PositionTypeService } from './positionType.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as $ from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  getMenuData: any = [];
  permissionMessage: any = 'You don\'t have permission to access this feature !';
  positionTypeData: any = [];
  jobStatusData: any = [];
  experienceData: any = [];
  milesData: any = [];
  previousRoute = '';
  showBackButtonOnPracticePublicPage = '';
   /** Here is define google recaptch Key for all website */
  siteKey: any  = '6LfzmbcUAAAAAA_AjgCnIf8YZj0p9Yysra7Ac_th'
  private subject = new Subject<any>();
  static loginRedirectURL: string;
  getActionChildToParent(): Observable<any> {
    return this.subject.asObservable();
  }
  sendActionChildToParent(action: string) {
    this.subject.next({ text: action });
  }

  getLoadingLabel(): Observable<any> {
    return this.subject.asObservable();
  }
  setLoadingLabel(action: string) {
    this.subject.next({ text: action });
  }

  baseUrl: any = environment.baseUrl;
  constructor(
    private http: HttpClient,
    private positionTypeService: PositionTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
    ) {
    if (!this.getMenuData.length) {
      this.getMenu().subscribe(data => {
        this.getMenuData = data.dataSource;
      });
    }

    if (!this.positionTypeData.length) {
      this.getPositionType().subscribe(data => {
        if (data.status === 200) {
                 if (data.data.length > 0) {
                   data.data.map(val =>{
                    this.positionTypeData.push(val.name);
                    this.positionTypeData.sort();
                  });
                 }
        } else {
          this.showError();
        }
      //  this.positionTypeData = data.dataSource;
      });
    }
    if (!this.jobStatusData.length) {
      this.getJobStatus().subscribe(data => {
        this.jobStatusData = data.dataSource;
      });
    }
    if (!this.experienceData.length) {
      this.getExperienceData().subscribe(data => {
        this.experienceData = data.dataSource;
      });
    }
    if (!this.milesData.length) {
      this.getMilesData().subscribe(data => {
        this.milesData = data.dataSource;
      });
    }
  }
  public getMenu(): Observable<any> {
    return this.http.get('./assets/menu.json');
  }

  public getPositionType(): Observable<any> {
      return this.positionTypeService.getPositionType({});
    //return this.http.get('./assets/positionType.json');
  }
  public getJobStatus(): Observable<any> {
    return this.http.get('./assets/jobStatus.json');
  }

  public getExperienceData(): Observable<any> {
    return this.http.get('./assets/experiences.json');
  }

  public getMilesData(): Observable<any> {
    return this.http.get('./assets/miles.json');
  }

  uploadFile(image: any) {
    const newName = image.name.replace(/ /g, '-');
    const formData = new FormData();
    formData.append('image', image, newName);
    return this.http.post(environment.baseUrl + 'upload', formData);
  }

   /**
   * Name : deleteGalleryFromS3bucket():
   * Description : This method will call as like global to delete AWS s3 bucket gallery.
   * @param is a array of gallery url.
   * @return it will return true/false
   */
  public deleteGalleryFromS3bucket(param: object): any {
    const apiURL = `${this.baseUrl}users/deleteGalleryFromS3bucket`;
    return this.http.post(apiURL, param);
  }

  public ValidateEmail(inputText: string) {
    if(inputText) {
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (inputText.match(mailformat)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  public topscroll() {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      500
      );
  }

  public titleCase(word) {
    if(!word) {
      return word;
    } else {
      // return word[0].toUpperCase() + word.substr(1);
      return word[0].toUpperCase() + word.substr(1).toLowerCase();
    }
  }

  // public createCharge(param: any) {
  //   const apiURL = `${this.baseUrl}stripe/createCharge`;
  //   return this.http.post(apiURL, param);
  // }

  // public connectStripe(param: any) {
  //   const apiURL = `${this.baseUrl}stripe/connected`;
  //   return this.http.get(apiURL);
  // }


  public stripeTotalAmt(amount) {
    // console.log("Global service",amount);
    const final_amount = Number(amount) + Number ((amount * 0.029 + 0.30) + (amount * 0.029 + 0.30) * 0.029 +
    ((amount * 0.029 + 0.30) * 0.029) * 0.029 + (((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029 +
    ((((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029) * 0.029);
    // console.log("Final Amount",final_amount);
    return Number((final_amount * 100).toFixed(0));
  }

  showError() {
    this.toastr.error(
      'There are some server Please check connection.',
      'Error'
    );
  }

  mergejobDatestartTime(date, time) {
    // process.env.TZ = 'Europe/Samara';
    // date = moment(new Date(date)).format('YYYY-MM-DD');
    date = moment(date).format('YYYY-MM-DD');
    time = moment(time).format('HH:mm');
    // console.log(time,moment().add(5,'minute').toISOString());
    return moment(date + ' ' + time);
  }

  error() {
    this.spinner.hide();
    this.toastr.error(
      'There are some server Please check connection.',
      'Error'
    );
  }

  shortPracticeName(pName){
    if(pName === null){
      return "...";
    }else{
    if(pName.length > 18){
      pName = pName.substr(0,15);
      pName = pName + '...';
      return pName
    }else{
      return pName;
    }
  }
}
}
