import { leaseCalcCombinationJson } from 'app/core/constant';

export function isDefined(val: any): boolean {
  return val !== null && val !== undefined;
}

export function liveFormatPhoneNumber(val: string): string {
  // normalize string and remove all unnecessary characters
  let phone = val.replace(/\D/g, '');
  const match = phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    phone = `${match[1]}${match[2] ? '-' : ''}${match[2]}${
      match[3] ? '-' : ''
    }${match[3]}`;
  }
  return phone;
}

export function comparePhoneNumbers(phone1: string, phone2: string) {
  const val1 = phone1.replace(/\D/g, ''),
    val2 = phone2.replace(/\D/g, '');
  return val1.substring(val1.length - 10) === val2.substring(val2.length - 10);
}

export function formatPhoneNumberDomestic(tel: string): string {
  if (!tel) {
    return '';
  }

  const value = tel
    .toString()
    .trim()
    .replace(/^\+/, '');

  if (value.match(/[^0-9]/)) {
    return tel;
  }

  let country, city, number;

  switch (value.length) {
    case 10: // +1PPP####### -> C (PPP) ###-####
      country = 1;
      city = value.slice(0, 3);
      number = value.slice(3);
      break;

    case 11: // +CPPP####### -> CCC (PP) ###-####
      country = value[0];
      city = value.slice(1, 4);
      number = value.slice(4);
      break;

    case 12: // +CCCPP####### -> CCC (PP) ###-####
      country = value.slice(0, 3);
      city = value.slice(3, 5);
      number = value.slice(5);
      break;

    default:
      return tel;
  }

  if (country === 1) {
    country = '';
  }

  number = number.slice(0, 3) + '-' + number.slice(3);

  return (city + '-' + number).trim();
}

export function getAdjustDownpaymentConfiguration(price: number) {
  // return (
  //   Math.ceil(
  //     (price * calculation.downpaymentPercent) / calculation.paymentStep
  //   ) * calculation.paymentStep
  // );
  return price;
}

export function getFinancePrice(
  vehiclePrice: number,
  downPayment: number,
  financeTerm: number,
  salesTax: number,
  interestRate: number,
  tradeIn: number
) {
  const tax = vehiclePrice * (salesTax / 100);
  const totalPrice = vehiclePrice - (downPayment + tradeIn) + tax;
  const installments = financeTerm;
  if (interestRate === 0) {
    return Math.round(totalPrice / installments);
  }
  const y = 1 + interestRate / 100.0 / 12.0;
  const monthlyPayment =
    (totalPrice * Math.pow(y, installments) * (y - 1)) /
    (Math.pow(y, installments) - 1);
  return Math.round(monthlyPayment);
}

export function getFinanceTax(vehiclePrice: number, salesTax: number) {
  return vehiclePrice * (salesTax / 100);
}

export function getFinanceInterest(
  monthlyPayment: number,
  financeTerm: number,
  downPayment: number,
  tradeIn: number,
  salesTax: number,
  vehiclePrice: number
) {
  const totalPayment = monthlyPayment * financeTerm + downPayment + tradeIn;
  const interest = totalPayment - vehiclePrice - salesTax;
  return Math.round(interest);
}

export function getLeasePrice(
  vehiclePrice: number,
  downPayment: number,
  leaseTerm: number,
  salesTax: number,
  interestRate: number,
  tradeIn: number,
  mile: number
) {
  const residual = getResidual(mile, leaseTerm);
  const a = vehiclePrice - downPayment - tradeIn;
  const b = (vehiclePrice * residual) / 100;
  const c = (a - b) / leaseTerm;
  const d = ((a + b) * interestRate) / 2400;
  const monthlyPayable = c + d;
  const tax = (c + d) * (salesTax / 100);
  const f = Math.round(monthlyPayable + tax);
  return f < 0 ? 0 : f;
}

export function getLeaseTax(
  depreciation: number,
  rentCharge: number,
  salesTax: number
) {
  const leaseTax = (depreciation + rentCharge) * (salesTax / 100);
  return Math.round(leaseTax);
}

export function getRentCharge(
  vehiclePrice: number,
  downPayment: number,
  leaseTerm: number,
  interestRate: number,
  tradeIn: number,
  mile: number
) {
  const residual = getResidual(mile, leaseTerm);
  const residualValue = (vehiclePrice * residual) / 100;
  const total = vehiclePrice - downPayment - tradeIn;
  const rentCharge = ((residualValue + total) * interestRate) / 2400;
  return Math.round(rentCharge);
}

export function getDepreciation(
  vehiclePrice: number,
  downPayment: number,
  tradeIn: number,
  mile: number,
  leaseTerm: number
) {
  const residual = getResidual(mile, leaseTerm);
  const residualValue = (vehiclePrice * residual) / 100;
  const total = vehiclePrice - downPayment - tradeIn;
  const depreciation = (total - residualValue) / leaseTerm;
  return Math.round(depreciation);
}

/*
 * Function to get closet mile from user input
 * @param mile number
 * @return closet number
 */

function getClosetMile(mile: number) {
  // set max limit for mile as 20000 for calculation
  mile = mile > 20000 ? 20000 : mile;
  // set min limit for mile as 7500 for calculation
  mile = mile < 7500 ? 7500 : mile;

  let mileCheckPoints = leaseCalcCombinationJson.map(
    item => item.annual_mileage
  );
  mileCheckPoints = mileCheckPoints.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });

  const closest = mileCheckPoints.reduce(function(prev, curr) {
    return Math.abs(curr - mile) < Math.abs(prev - mile) ? curr : prev;
  });

  return closest;
}

/*
 * Function to get closet lease term from user input
 * @param leaseTerm number
 * @return closet number
 */

function getClosetLeaseTerm(leaseTerm: number) {
  // set max limit for mile as 48 for calculation
  leaseTerm = leaseTerm > 48 ? 48 : leaseTerm;
  // set min limit for mile as 24 for calculation
  leaseTerm = leaseTerm < 24 ? 24 : leaseTerm;

  let mileCheckPoints = leaseCalcCombinationJson.map(
    item => item.terms_in_months_price
  );
  mileCheckPoints = mileCheckPoints.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });

  const closest = mileCheckPoints.reduce(function(prev, curr) {
    return Math.abs(curr - leaseTerm) < Math.abs(prev - leaseTerm)
      ? curr
      : prev;
  });

  return closest;
}

/*
 * Function to get residual value from mile and lease term
 * @param mile number
 * @param leaseTerm number
 * @return residual number
 */

function getResidual(mile: number, leaseTerm: number) {
  mile = getClosetMile(mile);
  leaseTerm = getClosetLeaseTerm(leaseTerm);

  const arrayFilter = leaseCalcCombinationJson.find(
    item =>
      item.annual_mileage === mile && item.terms_in_months_price === leaseTerm
  );
  if (arrayFilter) {
    const residual = arrayFilter['residual_value'] || 0;
    return residual;
  }
  return 0;
}

export function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(1)) + 'k'
    : Math.sign(num) * Math.abs(num);
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function isNumber(val) {
  return val >= 0 && val <= 9;
}
