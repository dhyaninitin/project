import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  category: string = 'category';
  constructor(
    private apiService: ApiService
  ) { }

  public saveCategory(param: object): Observable<any> {
    return this.apiService.post(`${this.category}/saveCategory`, param).pipe(map(
      data => {
        return data
      }
    ));
  }
  public getCategoryList(param: object): Observable<any> {
    return this.apiService.get(`${this.category}/getCategoryList`).pipe(map(
      data => {
        return data
      }
    ));
  }
  public deleteCategory(param: object): Observable<any> {
    return this.apiService.delete(`${this.category}/deleteCategory`, param).pipe(map(
      data => {
        return data
      }
    ));
  }
}
