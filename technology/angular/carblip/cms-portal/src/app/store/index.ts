import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';

import { AuthenticationEffects } from './auth/authentication.effect';
import { PortalUserLogsEffects } from './portaluserlogs/portaluserlogs.effects';
import { PortalUserEffects } from './portalusers/portalusers.effects';
import { DealerEffects } from './dealers/dealers.effects';
import { InventoryEffects } from './inventories/inventories.effects';
import { LocationEffects } from './locations/locations.effects';
import { MDealerEffects } from './mdealers/mdealers.effects';
import { QuoteEffects } from './quotes/quotes.effects';
import { RequestLogsEffects } from './requestlogs/requestlogs.effects';
import { RequestEffects } from './requests/requests.effects';
import { RouterEffects } from './router/router.effect';
import { UserEffects } from './users/users.effects';
import { WholesaleQuoteEffects } from './wholesale-quote/wholesale-quote.effects';

import { AuthenticationState } from './auth/authentication.state';
import { PortalUserLogsState } from './portaluserlogs/portaluserlogs.states';
import { PortalUsersState } from './portalusers/portalusers.states';
import { DealersState } from './dealers/dealers.states';
import { ErrorState } from './error/error.states';
import { InventoriesState } from './inventories/inventories.states';
import { LocationsState } from './locations/locations.states';
import { MDealersState } from './mdealers/mdealers.states';
import { QuotesState } from './quotes/quotes.states';
import { RequestLogsState } from './requestlogs/requestlogs.states';
import { RequestsState } from './requests/requests.states';
import { YearsState } from './requests/years.states';
import { RouterStateUrl } from './router/router.state';
import { UsersState } from './users/users.states';

import { authenticationReducer } from './auth/authentication.reducer';
import { portalUserLogsReducer } from './portaluserlogs/portaluserlogs.reducers';
import { portalUsersReducer } from './portalusers/portalusers.reducers';
import { dealersReducer } from './dealers/dealers.reducers';
import { errorReducer } from './error/error.reducers';
import { inventoriesReducer } from './inventories/inventories.reducers';
import { locationsReducer } from './locations/locations.reducers';
import { mDealersReducer } from './mdealers/mdealers.reducers';
import { quotesReducer } from './quotes/quotes.reducers';
import { requestLogsReducer } from './requestlogs/requestlogs.reducers';
import { requestsReducer } from './requests/requests.reducers';
import { yearReducer } from './requests/requests.reducers';
import { usersReducer } from './users/users.reducers';

import { PortalUserService } from '../shared/services/apis/portalusers.service';
import { DealerService } from '../shared/services/apis/dealer.service';
import { InventoryService } from '../shared/services/apis/inventories.service';
import { LocationService } from '../shared/services/apis/locations.service';
import { MDealerService } from '../shared/services/apis/mdealer.service';
import { QuoteService } from '../shared/services/apis/quotes.service';
import { RequestService } from '../shared/services/apis/requests.service';
import { UserService } from '../shared/services/apis/users.service';
import { QuoteLogState } from './quotelogs/quotelog.states';
import { QuoteLogEffects } from './quotelogs/quotelog.effects';
import { quotelogReducer } from './quotelogs/quotelog.reducers';
import { VendorsState } from './vendors/vendors.states';
import { VendorsEffects } from './vendors/vendors.effects';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { vendorsReducer } from './vendors/vendors.reducers';
import { PurchaseOrderEffects } from './purchase-order/purchase-order.effects';
import { PurchaseOrderService } from 'app/shared/services/apis/purchase-order.service';
import { purchaseOrderReducer } from './purchase-order/purchase-order.reducers';
import { PurchaseOrderState } from './purchase-order/purchase-order.states';
import { WholesaleQuote } from 'app/shared/models/wholesale-quote.model';
import { WholesaleQuoteService } from 'app/shared/services/apis/wholesale-quote.service';
import { wholesaleQuoteReducer } from './wholesale-quote/wholesale-quote.reducers';
import { WholesaleQuoteState } from './wholesale-quote/wholesale-quote.states';
import { WholesaleQuoteLogState } from './wholesale-quotelogs/wholesale-quotelog.states';
import { WholesaleQuoteLogEffects } from './wholesale-quotelogs/wholesale-quotelog.effects';
import { wholesaleQuotelogReducer } from './wholesale-quotelogs/wholesale-quotelog.reducers';
import { CarsDirectState } from './cars-direct/cars-direct.states';
import { CarsDirectEffects } from './cars-direct/cars-direct.effects';
import { CarsDirectService } from 'app/shared/services/apis/cars-direct.service';
import { BlockListService } from 'app/shared/services/apis/block-list.service';
import { carsDirectReducer } from './cars-direct/cars-direct.reducers';
import { BlockListEffects } from './block-list/block-list.effects';
import { BlockListState } from './block-list/block-list.states';
import { blockListReducer } from './block-list/block-list.reducers';
import { UserLogsEffects } from './userlogs/userlogs.effects';
import { userLogsReducer } from './userlogs/userlogs.reducers';
import { UserLogsState } from './userlogs/userlogs.states';
import { workflowState } from './workflows/workflows.states';
import { WorkflowEffects } from './workflows/workflows.effects';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { workflowReducer } from './workflows/workflows.reducers';
import { smsTemplateState } from './sms-templates/sms-templates.states';
import { SmsTemplateEffects } from './sms-templates/sms-templates.effects';
import { smsTemplateReducer } from './sms-templates/sms-templates.reducers';
import { WorkflowLogsState } from './workflowslogs/workflowslogs.states';
import { WorkflowsLogsEffects } from './workflowslogs/workflowslogs.effects';
import { workflowsLogsReducer } from './workflowslogs/workflowslogs.reducers';
import { PhoneNumbersListService } from 'app/shared/services/apis/phone-numbers.service';
import { PhoneNumbersListState } from './phone-numbers/phone-numbers.states';
import { PhoneNumbersListEffects } from './phone-numbers/phone-numbers.effects';
import { phoneNumbersReducer } from './phone-numbers/phone-numbers.reducers';
import { DealStageLogsState } from './dealstagelogs/dealstagelogs.states';
import { DealStageLogsEffects } from './dealstagelogs/dealstagelogs.effects';
import { dealstageLogsReducer } from './dealstagelogs/dealstagelogs.reducers';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { TasksState } from './tasks/tasks.states';
import { TasksEffects } from './tasks/tasks.effects';
import { TasksService } from 'app/shared/services/apis/tasks.service';
import { tasksReducer } from './tasks/tasks.reducers';
import { TaskLogsState } from './taskslogs/tasklogs.states';
import { TaskLogsEffects } from './taskslogs/tasklogs.effects';
import { taskLogsReducer } from './taskslogs/tasklogs.reducers';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { VehileDataState } from './vehicledata/vehicledata.states';
import { VehicleDataEffects } from './vehicledata/vehicledata.effects';
import { ModelReducer, TrimReducer, brandReducer, vehicleDataReducer } from './vehicledata/vehicledata.reducers';
import { BrandState } from './vehicledata/brand.states';
import { ModelState } from './vehicledata/model.states';
import { TrimState } from './vehicledata/trim.states';
import { VehicleDataLogsState } from './vehicledatalogs/vehicledatalogs.states';
import { VehicleDataLogsEffects } from './vehicledatalogs/vehicledatalogs.effects';
import { vehicleDataLogsReducer } from './vehicledatalogs/vehicledatalogs.reducers';
import { enrollmentHistoryState } from './enrollment-history/enrollment-history.states';
import { EnrollmentHistoryEffects } from './enrollment-history/enrollment-history.effects';
import { enrollmentHistoryReducer } from './enrollment-history/enrollment-history.reducers';
import { emailTemplateState } from './email-templates/email-templates.states';
import { EmailTemplateEffects } from './email-templates/emaIl-templates.effects';
import { emailTemplateReducer } from './email-templates/email-templates.reducers';
import { EmailTemplateLogState } from './email-template-log/email-template-log.state';
import { EmailTemplateLogEffects } from './email-template-log/email-template-log.effects';
import { emailTemplateLogReducer } from './email-template-log/email-template-log.reducers';
import { WholesaleLogsState } from './wholesale-quote-logs/wholesaleLogs.states';
import { WholesaleLogsEffects } from './wholesale-quote-logs/wholesaleLogs.effects';
import { wholesaleLogsReducer } from './wholesale-quote-logs/wholesaleLogs.reducers';
import { workflowSettingsState } from './workflow-settings/workflowSettings.states';
import { WorkflowSettingsEffects } from './workflow-settings/workflowSettings.effects';
import { workflowSettingsReducer } from './workflow-settings/workflowSettings.reducers';

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  authentication: AuthenticationState;
  users: UsersState;
  portalusers: PortalUsersState;
  portaluserlogs: PortalUserLogsState;
  locations: LocationsState;
  requests: RequestsState;
  years: YearsState;
  requestlogs: RequestLogsState;
  userlogs: UserLogsState;
  inventories: InventoriesState;
  mdealers: MDealersState;
  dealers: DealersState;
  quotes: QuotesState;
  wholesaleQuote: WholesaleQuoteState;
  quotelog: QuoteLogState;
  wholesaleQuotelog: WholesaleQuoteLogState;
  vendors: VendorsState;
  purchaseOrder: PurchaseOrderState;
  carsDirect: CarsDirectState,
  blockList: BlockListState,
  errors: ErrorState;
  workflow: workflowState,
  smsTemplate: smsTemplateState,
  workflowslogs:WorkflowLogsState,
  phoneNumbers: PhoneNumbersListState,
  dealstagelogs: DealStageLogsState,
  tasks: TasksState,
  tasklogs: TaskLogsState,
  vehiledata:VehileDataState,
  brand:BrandState,
  model:ModelState,
  trim:TrimState,
  vehicledatalogs:VehicleDataLogsState,
  enrollmentHistory:enrollmentHistoryState,
  emailTemplate:emailTemplateState,
  emailtemplatelogs:EmailTemplateLogState,
  wholesaleLogs:WholesaleLogsState,
  workflowSettings:workflowSettingsState
}

export const rootEffects: any[] = [RouterEffects, AuthenticationEffects];

export const effects: any[] = [
  RouterEffects,
  AuthenticationEffects,
  UserEffects,
  LocationEffects,
  PortalUserEffects,
  PortalUserLogsEffects,
  RequestEffects,
  RequestLogsEffects,
  UserLogsEffects,
  InventoryEffects,
  MDealerEffects,
  DealerEffects,
  QuoteEffects,
  WholesaleQuoteEffects,
  QuoteLogEffects,
  WholesaleQuoteLogEffects,
  VendorsEffects,
  PurchaseOrderEffects,
  CarsDirectEffects,
  BlockListEffects,
  WorkflowEffects,
  WorkflowsLogsEffects,
  SmsTemplateEffects,
  PhoneNumbersListEffects,
  DealStageLogsEffects,
  TasksEffects,
  TaskLogsEffects,
  VehicleDataEffects,
  VehicleDataLogsEffects,
  EnrollmentHistoryEffects,
  EmailTemplateEffects,
  EmailTemplateLogEffects,
  WholesaleLogsEffects,
  WorkflowSettingsEffects
];

export const services: any[] = [
  UserService,
  LocationService,
  PortalUserService,
  RequestService,
  InventoryService,
  MDealerService,
  DealerService,
  QuoteService,
  WholesaleQuoteService,
  VendorsService,
  PurchaseOrderService,
  CarsDirectService,
  BlockListService,
  WorkflowService,
  PhoneNumbersListService,
  DealStageService,
  TasksService,
  VehicleDataService
];

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  authentication: authenticationReducer,
  users: usersReducer,
  portalusers: portalUsersReducer,
  portaluserlogs: portalUserLogsReducer,
  locations: locationsReducer,
  requests: requestsReducer,
  years: yearReducer,
  requestlogs: requestLogsReducer,
  userlogs: userLogsReducer,
  inventories: inventoriesReducer,
  mdealers: mDealersReducer,
  dealers: dealersReducer,
  quotes: quotesReducer,
  wholesaleQuote: wholesaleQuoteReducer,
  wholesaleQuotelog: wholesaleQuotelogReducer,
  quotelog: quotelogReducer,
  vendors: vendorsReducer,
  purchaseOrder: purchaseOrderReducer,
  carsDirect: carsDirectReducer,
  blockList: blockListReducer,
  workflow: workflowReducer,
  errors: errorReducer,
  smsTemplate: smsTemplateReducer,
  workflowslogs: workflowsLogsReducer,
  phoneNumbers: phoneNumbersReducer,
  dealstagelogs: dealstageLogsReducer,
  tasks: tasksReducer,
  tasklogs: taskLogsReducer,
  vehiledata:vehicleDataReducer,
  brand:brandReducer,
  model:ModelReducer,
  trim:TrimReducer,
  vehicledatalogs:vehicleDataLogsReducer,
  enrollmentHistory:enrollmentHistoryReducer,
  emailTemplate:emailTemplateReducer,
  emailtemplatelogs:emailTemplateLogReducer,
  wholesaleLogs:wholesaleLogsReducer,
  workflowSettings:workflowSettingsReducer
};
