import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Options } from 'ng5-slider';

import {
  calculation,
  CALCULATOR_INFO,
  SLIDER_MESSAGES,
} from 'app/core/constant';
import { CLICK_ON_TAB_CALCULATOR, VIEW_CALCULATOR_PAGE } from 'app/core/events';
import {
  getDepreciation,
  getFinanceInterest,
  getFinancePrice,
  getFinanceTax,
  getLeasePrice,
  getLeaseTax,
  getRentCharge,
} from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent implements OnInit {
  private pageTitle = 'Loan & Lease Calculator';
  public calculatorInfo = CALCULATOR_INFO;
  vehiclePrice1 = 0;

  // model of values for Finance sliders
  public financeModel = {
    vehiclePrice: calculation.vehiclePrice,
    downPayment: calculation.downPayment,
    term: calculation.financeTerms,
    tradeInValue: calculation.tradeInValue,
    interestRate: calculation.interestRate,
    salesTax: calculation.salesTax,
  };

  // model of user input values for Finance sliders
  public userFinanceValues: any = {
    vehiclePrice: calculation.vehiclePrice,
    downPayment: calculation.downPayment,
    term: calculation.financeTerms,
    tradeInValue: calculation.tradeInValue,
  };

  // model of values for Lease sliders
  public leaseModel = {
    vehiclePrice: calculation.vehiclePrice,
    downPayment: calculation.downPayment,
    term: calculation.leaseTerm,
    tradeInValue: calculation.tradeInValue,
    annualMileage: calculation.annualMileage,
    interestRate: calculation.interestRate,
    salesTax: calculation.salesTax,
  };

  // model of user input values for Lease sliders
  public userLeaseValues: any = {
    vehiclePrice: calculation.vehiclePrice,
    downPayment: calculation.downPayment,
    term: calculation.leaseTerm,
    tradeInValue: calculation.tradeInValue,
    annualMileage: calculation.annualMileage,
  };

  public vehicleSliderOption: any = {
    floor: 0,
    ceil: 100000,
    step: 500,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public downSliderOption: any = {
    floor: 0,
    ceil: 25000,
    step: 100,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public financeTermSliderOption: any = {
    floor: 12,
    ceil: 96,
    step: 6,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public leaseTermSliderOption: any = {
    floor: 24,
    ceil: 48,
    step: 6,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public tradeInValueSliderOption: any = {
    floor: 0,
    ceil: 25000,
    step: 100,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public annualMileageSliderOption: any = {
    floor: 8000,
    ceil: 20000,
    stepsArray: calculation.mileageStep.map(item => {
      return {
        value: item,
      };
    }),
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  constructor(
    private store$: Store<IStore>,
    private segmentioService$: SegmentioService,
    public notificationService$: NotificationService
  ) {}

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_CALCULATOR_PAGE.EVENT_NAME,
      VIEW_CALCULATOR_PAGE.PROPERTY_NAME,
      VIEW_CALCULATOR_PAGE.SCREEN_NAME,
      VIEW_CALCULATOR_PAGE.ACTION_NAME
    );
    this.initSubHeader();
    this.onVehiclePriceValueChanged('finance');
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(false));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  financePrice() {
    return getFinancePrice(
      this.userFinanceValues.vehiclePrice,
      this.userFinanceValues.downPayment,
      this.userFinanceValues.term,
      this.financeModel.salesTax,
      this.financeModel.interestRate,
      this.userFinanceValues.tradeInValue
    );
  }

  financeTotalCost() {
    return (
      this.userFinanceValues.vehiclePrice +
      this.financeInterest() +
      this.financeTax()
    );
  }

  financeInterest() {
    if (this.financeModel.interestRate === 0) {
      return 0;
    } else {
      return getFinanceInterest(
        this.financePrice(),
        this.userFinanceValues.term,
        this.userFinanceValues.downPayment,
        this.userFinanceValues.tradeInValue,
        this.financeTax(),
        this.userFinanceValues.vehiclePrice
      );
    }
  }

  financeTax() {
    return getFinanceTax(
      this.userFinanceValues.vehiclePrice,
      this.financeModel.salesTax
    );
  }

  leasePrice() {
    return getLeasePrice(
      this.userLeaseValues.vehiclePrice,
      this.userLeaseValues.downPayment,
      this.userLeaseValues.term,
      this.leaseModel.salesTax,
      this.leaseModel.interestRate,
      this.userLeaseValues.tradeInValue,
      this.userLeaseValues.annualMileage
    );
  }

  leaseDepreciation() {
    return getDepreciation(
      this.userLeaseValues.vehiclePrice,
      this.userLeaseValues.downPayment,
      this.userLeaseValues.tradeInValue,
      this.userLeaseValues.annualMileage,
      this.userLeaseValues.term
    );
  }

  leaseRentCharge() {
    return getRentCharge(
      this.userLeaseValues.vehiclePrice,
      this.userLeaseValues.downPayment,
      this.userLeaseValues.term,
      this.leaseModel.interestRate,
      this.userLeaseValues.tradeInValue,
      this.userLeaseValues.annualMileage
    );
  }

  leaseTax() {
    return getLeaseTax(
      this.leaseDepreciation(),
      this.leaseRentCharge(),
      this.leaseModel.salesTax
    );
  }

  onVehiclePriceValueChanged(type: string) {
    if (type === 'finance') {
      const allowedAmount = this.userFinanceValues.vehiclePrice;
      this.vehiclePrice1 = allowedAmount;
      const totalValue =
        this.userFinanceValues.downPayment +
        this.userFinanceValues.tradeInValue;
      if (allowedAmount < totalValue) {
        let newDownpayment =
          (allowedAmount * this.userFinanceValues.downPayment) / totalValue;
        let newTradeIn =
          (allowedAmount * this.userFinanceValues.tradeInValue) / totalValue;
        newDownpayment = parseInt(newDownpayment.toFixed(0), 10);
        newTradeIn = parseInt(newTradeIn.toFixed(0), 10);
        this.userFinanceValues.downPayment = this.financeModel.downPayment = newDownpayment;
        this.userFinanceValues.tradeInValue = this.financeModel.tradeInValue = newTradeIn;
      }
      this.updateDownpaymentMaxLimit(type);
      this.updateTradeInValueMaxLimit(type);
    }
    if (type === 'lease') {
      const allowedAmount = this.userLeaseValues.vehiclePrice * 0.25;
      const totalValue =
        this.userLeaseValues.downPayment + this.userLeaseValues.tradeInValue;
      if (allowedAmount < totalValue) {
        let newDownpayment =
          (allowedAmount * this.userLeaseValues.downPayment) / totalValue;
        let newTradeIn =
          (allowedAmount * this.userLeaseValues.tradeInValue) / totalValue;
        newDownpayment = parseInt(newDownpayment.toFixed(0), 10);
        newTradeIn = parseInt(newTradeIn.toFixed(0), 10);
        this.userLeaseValues.downPayment = this.leaseModel.downPayment = newDownpayment;
        this.userLeaseValues.tradeInValue = this.leaseModel.tradeInValue = newTradeIn;
      }
      this.updateDownpaymentMaxLimit(type);
      this.updateTradeInValueMaxLimit(type);
    }
  }

  onDownpaymentValueChanged(type: string) {
    if (type === 'finance') {
      const allowedAmount = this.userFinanceValues.vehiclePrice;
      const totalValue =
        this.userFinanceValues.downPayment +
        this.userFinanceValues.tradeInValue;
      if (allowedAmount < totalValue) {
        this.userFinanceValues.downPayment = this.financeModel.downPayment =
          this.userFinanceValues.downPayment - totalValue + allowedAmount;
        this.updateDownpaymentMaxLimit(type);
      } else {
        this.updateTradeInValueMaxLimit(type);
      }
    }
    if (type === 'lease') {
      const allowedAmount = this.userLeaseValues.vehiclePrice * 0.25;
      const totalValue =
        this.userLeaseValues.downPayment + this.userLeaseValues.tradeInValue;
      if (allowedAmount < totalValue) {
        this.userLeaseValues.downPayment = this.leaseModel.downPayment =
          this.userLeaseValues.downPayment - totalValue + allowedAmount;
        this.updateDownpaymentMaxLimit(type);
      } else {
        this.updateTradeInValueMaxLimit(type);
      }
    }
  }

  onTradeInValueChanged(type: string) {
    if (type === 'finance') {
      const allowedAmount = this.userFinanceValues.vehiclePrice;
      const totalValue =
        this.userFinanceValues.downPayment +
        this.userFinanceValues.tradeInValue;
      if (allowedAmount < totalValue) {
        this.userFinanceValues.tradeInValue = this.financeModel.tradeInValue =
          this.userFinanceValues.tradeInValue - totalValue + allowedAmount;
        this.updateTradeInValueMaxLimit(type);
      } else {
        this.updateDownpaymentMaxLimit(type);
      }
    }
    if (type === 'lease') {
      const allowedAmount = this.userLeaseValues.vehiclePrice * 0.25;
      const totalValue =
        this.userLeaseValues.downPayment + this.userLeaseValues.tradeInValue;
      if (allowedAmount < totalValue) {
        this.userLeaseValues.tradeInValue = this.leaseModel.tradeInValue =
          this.userLeaseValues.tradeInValue - totalValue + allowedAmount;
        this.updateTradeInValueMaxLimit(type);
      } else {
        this.updateDownpaymentMaxLimit(type);
      }
    }
  }

  updateDownpaymentMaxLimit(type) {
    if (type === 'finance') {
      const maxLimit =
        this.userFinanceValues.vehiclePrice * calculation.downpaymentPercent;
      const newSliderOption: Options = Object.assign({}, this.downSliderOption);
      newSliderOption.maxLimit = maxLimit - this.userFinanceValues.tradeInValue;
      newSliderOption.ceil = 100000;
      this.downSliderOption = newSliderOption;
    }

    if (type === 'lease') {
      const maxLimit = this.userLeaseValues.vehiclePrice * 0.25;
      const newSliderOption: Options = Object.assign({}, this.downSliderOption);
      newSliderOption.maxLimit = maxLimit - this.userLeaseValues.tradeInValue;
      this.downSliderOption = newSliderOption;
    }
  }

  updateTradeInValueMaxLimit(type) {
    if (type === 'finance') {
      const maxLimit =
        this.userFinanceValues.vehiclePrice * calculation.downpaymentPercent;
      const newSliderOption: Options = Object.assign(
        {},
        this.tradeInValueSliderOption
      );
      newSliderOption.maxLimit = maxLimit - this.userFinanceValues.downPayment;
      newSliderOption.ceil = 100000;
      this.tradeInValueSliderOption = newSliderOption;
    }

    if (type === 'lease') {
      const maxLimit = this.userLeaseValues.vehiclePrice * 0.25;
      const newSliderOption: Options = Object.assign(
        {},
        this.tradeInValueSliderOption
      );
      newSliderOption.maxLimit = maxLimit - this.userLeaseValues.downPayment;
      this.tradeInValueSliderOption = newSliderOption;
    }
  }

  onSelectTab(type) {
    const property_name = CLICK_ON_TAB_CALCULATOR.PROPERTY_NAME.replace(
      '?',
      type
    );
    this.segmentioService$.track(
      CLICK_ON_TAB_CALCULATOR.EVENT_NAME,
      property_name,
      CLICK_ON_TAB_CALCULATOR.SCREEN_NAME,
      CLICK_ON_TAB_CALCULATOR.ACTION_NAME
    );
    this.onVehiclePriceValueChanged(type);
  }

  /*
   * Function to set user custom input value based on slider selection
   * @param screen string - type of screen
   * @param type string - type of slider
   * @return
   */

  onFormSliderChange(screen, type) {
    if (screen === 'finance') {
      switch (type) {
        case 'vehiclePrice':
          this.userFinanceValues.vehiclePrice = this.financeModel.vehiclePrice;
          this.onVehiclePriceValueChanged('finance');
          break;

        case 'downPayment':
          this.userFinanceValues.downPayment = this.financeModel.downPayment;
          this.onDownpaymentValueChanged('finance');
          break;

        case 'term':
          this.userFinanceValues.term = this.financeModel.term;
          break;

        case 'tradeInValue':
          this.userFinanceValues.tradeInValue = this.financeModel.tradeInValue;
          this.onTradeInValueChanged('finance');
          break;

        default:
          break;
      }
    } else if (screen === 'lease') {
      switch (type) {
        case 'vehiclePrice':
          this.userLeaseValues.vehiclePrice = this.leaseModel.vehiclePrice;
          this.onVehiclePriceValueChanged('lease');
          break;

        case 'downPayment':
          this.userLeaseValues.downPayment = this.leaseModel.downPayment;
          this.onDownpaymentValueChanged('lease');
          break;

        case 'term':
          this.userLeaseValues.term = this.leaseModel.term;
          break;

        case 'annualMileage':
          this.userLeaseValues.annualMileage = this.leaseModel.annualMileage;
          break;

        case 'tradeInValue':
          this.userLeaseValues.tradeInValue = this.leaseModel.tradeInValue;
          this.onTradeInValueChanged('lease');
          break;

        default:
          break;
      }
    }
  }

  /*
   * Function to set slider value based on custom input value
   * @param e object - event object
   * @param screen string - type of screen
   * @param type string - type of slider
   * @return
   */

  onUserValueChange(e, screen, type) {
    if (screen === 'finance') {
      switch (type) {
        // handle limiation logic for custom user input for finance vehicle price
        case 'vehiclePrice':
          if (
            this.userFinanceValues.vehiclePrice < this.vehicleSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Vehicle price')
              .replace('[$2]', '$' + this.vehicleSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userFinanceValues.vehiclePrice = this.vehicleSliderOption.floor;
          }
          this.financeModel.vehiclePrice = this.userFinanceValues.vehiclePrice;
          this.onVehiclePriceValueChanged('finance');
          break;

        // handle limiation logic for custom user input for finance down payment
        case 'downPayment':
          if (
            this.userFinanceValues.downPayment < this.downSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Down Payment')
              .replace('[$2]', '$' + this.downSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userFinanceValues.downPayment = this.downSliderOption.floor;
          } else if (
            this.userFinanceValues.downPayment > this.downSliderOption.maxLimit
          ) {
            const msg = SLIDER_MESSAGES.maxLimitMessage
              .replace('[$1]', 'Down Payment')
              .replace('[$2]', 'than the Vehicle Price');
            this.notificationService$.warning(msg);
            this.userFinanceValues.downPayment = this.downSliderOption.maxLimit;
          }
          this.financeModel.downPayment = this.userFinanceValues.downPayment;
          this.onDownpaymentValueChanged('finance');
          break;

        // handle limiation logic for custom user input for finance term
        case 'term':
          if (
            this.userFinanceValues.term < this.financeTermSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Term')
              .replace('[$2]', '1');
            this.notificationService$.warning(msg);
            this.userFinanceValues.term = 1;
          }
          this.financeModel.term = this.userFinanceValues.term;
          break;

        // handle limiation logic for custom user input for finance trade in value
        case 'tradeInValue':
          if (
            this.userFinanceValues.tradeInValue <
            this.tradeInValueSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Trade-In')
              .replace('[$2]', '$' + this.tradeInValueSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userFinanceValues.tradeInValue = this.tradeInValueSliderOption.floor;
          } else if (
            this.userFinanceValues.tradeInValue >
            this.tradeInValueSliderOption.maxLimit
          ) {
            const msg = SLIDER_MESSAGES.maxLimitMessage
              .replace('[$1]', 'Trade-In')
              .replace('[$2]', 'than the Vehicle Price');
            this.notificationService$.warning(msg);
            this.userFinanceValues.tradeInValue = this.tradeInValueSliderOption.maxLimit;
          }
          this.financeModel.tradeInValue = this.userFinanceValues.tradeInValue;
          this.onTradeInValueChanged('finance');
          break;

        default:
          break;
      }
    } else if (screen === 'lease') {
      switch (type) {
        // handle limiation logic for custom user input for lease vehicle price
        case 'vehiclePrice':
          if (
            this.userLeaseValues.vehiclePrice < this.vehicleSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Vehicle price')
              .replace('[$2]', '$' + this.vehicleSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userLeaseValues.vehiclePrice = this.vehicleSliderOption.floor;
          }
          this.leaseModel.vehiclePrice = this.userLeaseValues.vehiclePrice;
          this.onVehiclePriceValueChanged('lease');
          break;

        // handle limiation logic for custom user input for lease down payment
        case 'downPayment':
          if (this.userLeaseValues.downPayment < this.downSliderOption.floor) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Down Payment')
              .replace('[$2]', '$' + this.downSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userLeaseValues.downPayment = this.downSliderOption.floor;
          } else if (
            this.userLeaseValues.downPayment > this.downSliderOption.maxLimit
          ) {
            const msg = SLIDER_MESSAGES.maxLimitMessage
              .replace('[$1]', 'Down Payment')
              .replace('[$2]', 'than 1/4 of the Vehicle Price');
            this.notificationService$.warning(msg);
            this.userLeaseValues.downPayment = this.downSliderOption.maxLimit;
          }
          this.leaseModel.downPayment = this.userLeaseValues.downPayment;
          this.onDownpaymentValueChanged('lease');
          break;

        // handle limiation logic for custom user input for lease term
        case 'term':
          if (this.userLeaseValues.term < this.leaseTermSliderOption.floor) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Term')
              .replace('[$2]', '1');
            this.notificationService$.warning(msg);
            this.userLeaseValues.term = 1;
          }
          this.leaseModel.term = this.userLeaseValues.term;
          break;

        // handle limiation logic for custom user input for lease annualMileage
        case 'annualMileage':
          if (
            this.userLeaseValues.annualMileage <
            this.annualMileageSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Annual Mileage')
              .replace('[$2]', '1');
            this.notificationService$.warning(msg);
            this.userLeaseValues.annualMileage = 1;
          }
          this.leaseModel.annualMileage = this.userLeaseValues.annualMileage;
          break;

        // handle limiation logic for custom user input for lease trade in value
        case 'tradeInValue':
          if (
            this.userLeaseValues.tradeInValue <
            this.tradeInValueSliderOption.floor
          ) {
            const msg = SLIDER_MESSAGES.minLimitMessage
              .replace('[$1]', 'Trade-In')
              .replace('[$2]', '$' + this.tradeInValueSliderOption.floor);
            this.notificationService$.warning(msg);
            this.userLeaseValues.tradeInValue = this.tradeInValueSliderOption.floor;
          } else if (
            this.userLeaseValues.tradeInValue >
            this.tradeInValueSliderOption.maxLimit
          ) {
            const msg = SLIDER_MESSAGES.maxLimitMessage
              .replace('[$1]', 'Trade-In')
              .replace('[$2]', 'than 1/4 of the Vehicle Price');
            this.notificationService$.warning(msg);
            this.userLeaseValues.tradeInValue = this.tradeInValueSliderOption.maxLimit;
          }
          this.leaseModel.tradeInValue = this.userLeaseValues.tradeInValue;
          this.onTradeInValueChanged('lease');
          break;

        default:
          break;
      }
    }
  }
}
