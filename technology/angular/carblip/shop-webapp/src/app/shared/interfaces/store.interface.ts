import { IAuthGroup } from 'app/shared/states/auth/auth.interfaces';
import { IBrandsGroup } from 'app/shared/states/brands/brands.interfaces';
import { IConfigurationGroup } from 'app/shared/states/configuration/configuration.interfaces';
import { ICreditApplicaiton } from 'app/shared/states/credit-application/credit-application.interface';
import { ICustomRequest } from 'app/shared/states/custom-request/custom-request.interface';
import { ILeaseGroup } from 'app/shared/states/lease/lease.interfaces';
import { IModelsGroup } from 'app/shared/states/models/models.interfaces';
import { IMyRequests } from 'app/shared/states/my-request/myrequests.interfaces';
import { IRequest } from 'app/shared/states/request/request.interface';
import { ISearchItemGroup } from 'app/shared/states/search/search.interfaces';
import { ITrimGroup } from 'app/shared/states/trim/trim.interfaces';
import { IUi } from 'app/shared/states/ui/ui.interface';

export interface IStore {
  readonly ui: IUi;
  readonly brand: IBrandsGroup;
  readonly model: IModelsGroup;
  readonly auth: IAuthGroup;
  readonly trim: ITrimGroup;
  readonly request: IRequest;
  readonly customRequest: ICustomRequest;
  readonly myRequests: IMyRequests;
  readonly lease: ILeaseGroup;
  readonly configuration: IConfigurationGroup;
  readonly search: ISearchItemGroup;
  readonly creditApplication: ICreditApplicaiton;
}
