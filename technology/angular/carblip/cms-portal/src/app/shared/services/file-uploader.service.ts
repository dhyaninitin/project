import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploaderService {
  fileSizeUnit: number = 1024;
  private API_PATH = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }
  
  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }

    return fileSize;
  }

  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';

    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'KB';
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSizeInWords = 'MB';
      }
    }

    return fileSizeInWords;
  }

  uploadMedia(formData: any, uploadFileUrl: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .put(uploadFileUrl, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };

            case HttpEventType.Response:
              return { status: 'completed', message: event.body };
            default:
              return `Unhandled event: ${event.type}`;
          }
        })
      );
  }

  getPresignedUrl(filedata: {}) {
    return this.http.post<any>(this.API_PATH + `/email/createPresignedUrl`, filedata, {
      headers: this.getHttpHeaders(),
    });
  }

  // uploadProfile(extension: string, image: File) {
  //   let formData = new FormData();
  //   formData.append('file', image);
  //   return this.http.post<any>(this.API_PATH + `/profile/upload?extension=${extension}`, formData,{
  //     headers: new HttpHeaders({
  //       Authorization: `${localStorage.getItem('authorization')}`
  //     })
  //   });
  // }

  removefile(filedetails: {}) {
    return this.http.post<any>(this.API_PATH + `/email/file-remove`, filedetails, {
      headers: this.getHttpHeaders(),
    });
  }
}