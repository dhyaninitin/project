import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public searchTerm$: Observable<string> = this.searchTerm.asObservable();

  constructor() {}
}
