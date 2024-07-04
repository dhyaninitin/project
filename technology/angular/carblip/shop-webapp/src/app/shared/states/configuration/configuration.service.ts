import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  configurationInitialState,
  exteriorColorInitialState,
  interiorColorInitialState,
} from 'app/shared/states/configuration/configuration.initial-state';
import {
  IColorOptionGroup,
  IRequestFecthDataById,
} from 'app/shared/states/configuration/configuration.interfaces';
import {
  IConfiguration,
  IRequestFecthData,
  IRequestToggleOption,
} from 'app/shared/states/configuration/configuration.interfaces';
import { environment } from 'environments/environment';

// when creating a service, you should use an abstract class to describe your methods
// this way you'll have the possibility to :
// - make sure you've got the same parameters and return types between the real service and the mock
// - search for references in Visual Studio Code and find your mock aswell on a method
@Injectable()
export abstract class ConfigurationService {
  abstract fetchDefaultConfiguration(
    requestParam: IRequestFecthData
  ): Observable<IConfiguration>;
  abstract fetchConfigurationById(
    requestParam: IRequestFecthDataById
  ): Observable<IConfiguration>;
  abstract toggleOption(
    requestParam: IRequestToggleOption
  ): Observable<IConfiguration>;
}
@Injectable()
export class ConfigurationServiceImpl extends ConfigurationService {
  constructor(private http: HttpClient) {
    super();
  }

  fetchDefaultConfiguration(
    requestParam: IRequestFecthData
  ): Observable<IConfiguration> {
    return this.http
      .post(`${environment.urlBackend}/getDefaultConfiguration`, requestParam)
      .pipe(
        map(response => {
          const data = response['data'];
          return configurationInitialState(data);
        })
      );
  }

  fetchConfigurationById(
    requestParam: IRequestFecthDataById
  ): Observable<IConfiguration> {
    return this.http
      .post(`${environment.urlBackend}/getConfigurationById`, requestParam)
      .pipe(
        map(response => {
          const data = response['data'];
          return configurationInitialState(data);
        })
      );
  }

  toggleOption(requestParam: IRequestFecthData): Observable<IConfiguration> {
    return this.http
      .post(`${environment.urlBackend}/toggleOption`, requestParam)
      .pipe(
        map(response => {
          const data = response['data'];
          return configurationInitialState(data);
        })
      );
  }

  getColorOptionById(requestParam): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/getColorOptionsById`, requestParam)
      .pipe(
        map(response => {
          const data: IColorOptionGroup = response['data'];
          const result: IColorOptionGroup = {
            exterior_colors: data.exterior_colors.map(item =>
              exteriorColorInitialState(item)
            ),
            interior_colors: data.interior_colors.map(item =>
              interiorColorInitialState(item)
            ),
          };
          return result;
        })
      );
  }
}
