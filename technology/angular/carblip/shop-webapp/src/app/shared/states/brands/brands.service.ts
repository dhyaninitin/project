import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { brandInitialState } from 'app/shared/states/brands/brands.initial-state';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { environment } from 'environments/environment';

// when creating a service, you should use an abstract class to describe your methods
// this way you'll have the possibility to :
// - make sure you've got the same parameters and return types between the real service and the mock
// - search for references in Visual Studio Code and find your mock aswell on a method
@Injectable()
export abstract class BrandsService {
  abstract fetchBrandList(): Observable<IBrand[]>;
}
@Injectable()
export class BrandsServiceImpl extends BrandsService {
  constructor(private http: HttpClient) {
    super();
  }

  fetchBrandList(): Observable<IBrand[]> {
    return this.http
      .get(`${environment.urlBackend}/getBrands`)
      .pipe(
        map(brands => brands['data'].map(brand => brandInitialState(brand)))
      );
  }
}
