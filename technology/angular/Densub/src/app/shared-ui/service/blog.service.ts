import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  blog: string = 'blog';
  constructor(
    private apiService: ApiService
  ) { }

  public saveBlog(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/saveBlog`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public getBlogList(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/getBlogList`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public getBlogComments(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/getBlogComments`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public postComments(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/postComment`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public updateStatus(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/updateStatus`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public postAReply(param: object): Observable<any> {
    return this.apiService.post(`${this.blog}/postAReply`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
  public deleteBlog(param: object): Observable<any> {
    return this.apiService.delete(`${this.blog}/deleteBlog`, param).pipe(map(
      data => {
        return data;
      }
    ));
  }
}
