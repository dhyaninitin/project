export const MARKET_URL = '';
export const PREQUALIFY_URL = '';
export const MAILCHIMP_SUBSCRIBE_URL =
  '';
export const MAILCHIMP_SUBSCRIBE_PARAM = {
  u: '5d84779af3ac8c8e945466489',
  id: 'f8227580f0',
  hidden: 'b_5d84779af3ac8c8e945466489_f8227580f0',
};

export const SOURCE_UTM = 1; // web-app
export const COMMING_SOON_IMG =
  '';

export const FIND_STEP_SEARCH = 'search';
export const FIND_STEP_BRAND = 'brand';
export const FIND_STEP_MODEL = 'model';
export const FIND_STEP_TRIM = 'trim';
export const FIND_STEP_COLOR = 'colors';
export const FIND_STEP_OPTION = 'options';
export const FIND_STEP_REVIEW = 'review';
export const FIND_STEP_CREDIT = 'credit-assessment';
export const FIND_STEP_CUSTOM_REQUEST = 'select';
export const FIND_STEP_CUSTOM_REQUEST_CREDIT = 'credit';

export const FIND_STEPS = {
  brand: FIND_STEP_BRAND,
  model: FIND_STEP_MODEL,
  trim: FIND_STEP_TRIM,
  color: FIND_STEP_COLOR,
  spec: FIND_STEP_OPTION,
  review: FIND_STEP_REVIEW,
  credit: FIND_STEP_CREDIT,
};

export const OWN_CAR = [
  { id: 1, label: 'I Own My Car' },
  { id: 2, label: 'I Lease My Car' },
  { id: 0, label: `I Don't Have a Car` },
];

export const WILL_TRADE = [
  { id: 1, label: 'Yes' },
  { id: 0, label: 'No' },
  { id: 2, label: 'Not Sure' },
];

export const STEPS_BLOCK_LIST = [
  { id: 0, step: FIND_STEP_BRAND, label: 'brand' },
  { id: 1, step: FIND_STEP_MODEL, label: 'model' },
  { id: 2, step: FIND_STEP_TRIM, label: 'trim' },
  { id: 3, step: FIND_STEP_COLOR, label: 'color' },
  { id: 4, step: FIND_STEP_OPTION, label: 'options' },
];

export const CREDIT_APP_PERSONAL = 'credit_app/personal';
export const CREDIT_APP_RESIDENCE = 'credit_app/residence';
export const CREDIT_APP_EMPLOYMENT = 'credit_app/employment';
export const CREDIT_APP_IDENTIFICATION = 'credit_app/identification';
export const CREDIT_APP_REVIEW = 'credit_app/review';

export const STEPS_CREDIT_APPLICATION = [
  {
    id: 0,
    step: CREDIT_APP_PERSONAL,
    label: 'Personal Info',
    title: 'Personal Information',
  },
  {
    id: 1,
    step: CREDIT_APP_RESIDENCE,
    label: 'Residence Info',
    title: 'Residence Information',
  },
  {
    id: 2,
    step: CREDIT_APP_EMPLOYMENT,
    label: 'Employment Info',
    title: 'Employment Information',
  },
  {
    id: 3,
    step: CREDIT_APP_IDENTIFICATION,
    label: 'Identification',
    title: 'Identification',
  },
  {
    id: 4,
    step: CREDIT_APP_REVIEW,
    label: 'Review',
    title: 'Application Review',
  },
];

export const DEFAULT_IMAGE_FUEL_ID = 12;

export const BUYING_METHOD_LIST = [
  { id: 1, label: 'Cash' },
  { id: 2, label: 'Finance' },
  { id: 3, label: 'Lease' },
];

export const BUYING_TIME_LIST = [
  { id: 1, label: 'ASAP' },
  { id: 2, label: 'This Month' },
  { id: 3, label: 'Over a Month' },
];

export const CREDIT_ASSESSMENT_LIST = [
  {
    id: 1,
    label: 'Excellent',
    score: '720-850',
    description:
      'You have established your credit and have never been sent to a collections department.',
  },
  {
    id: 2,
    label: 'Good',
    score: '690-719',
    description:
      'You have established your credit with a few late payments or you are currently working on building your credit.',
  },
  {
    id: 3,
    label: 'Fair',
    score: '630-689',
    description:
      'You do not have established credit and you are currently working on building.',
  },
  {
    id: 4,
    label: 'Poor',
    score: 'Under 630',
    description:
      'You may need some extra help qualify and might be required to pay a higher interest rate.',
  },
];

// limit colors of color-selection page
export const LIMIT_COLORS = 3;

export const SMOKE_FREE_LIST = [
  {
    id: 1,
    label: 'Yes',
  },
  {
    id: 0,
    label: 'No',
  },
];

export const VEHICLE_CONDITIONS = [
  {
    id: 1,
    label: 'Excellent',
  },
  {
    id: 2,
    label: 'Good',
  },
  {
    id: 3,
    label: 'Fair',
  },
  {
    id: 4,
    label: 'Poor',
  },
];

export const NUMBER_KEYS = [1, 2, 3].map(value => {
  return {
    id: value,
    label: value,
  };
});

export const chromeSelectionStatus = {
  selected: 'Selected',
  unselected: 'Unselected',
  included: 'Included',
  required: 'Required',
  excluded: 'Excluded',
};

export const calculation = {
  vehiclePrice: 35000,
  downPayment: 2000,
  financeTerms: 60,
  leaseTerm: 36,
  salesTax: 0.0,
  interestRate: 1.9,
  annualMileage: 7500,
  tradeInValue: 0,
  downpaymentPercent: 1,
  paymentStep: 500,
  termStep: 6,
  mileageStep: [7500, 10000, 12000, 15000, 20000],
};


export const SLIDER_MESSAGES = {
  minLimitMessage: 'The [$1] must be at least [$2].',
  maxLimitMessage: 'The [$1] cannot be more than [$2].',
};

export const leaseCalcCombinationJson = [
  { terms_in_months_price: 24, annual_mileage: 7500, residual_value: 63 },
  { terms_in_months_price: 24, annual_mileage: 10000, residual_value: 62 },
  { terms_in_months_price: 24, annual_mileage: 12000, residual_value: 61 },
  { terms_in_months_price: 24, annual_mileage: 15000, residual_value: 59 },
];

export const VEHICLE_TYPE_LIST = [
  {
    id: 1,
    label: 'Sedan',
    img: 'icSedan.png',
  },
  {
    id: 2,
    label: 'Convertible',
    img: 'icConvertible.png',
  },
  {
    id: 3,
    label: 'Coupe',
    img: 'icCoupe.png',
  },
  {
    id: 4,
    label: 'SUV',
    img: 'icSuv.png',
  },
  {
    id: 5,
    label: 'Luxury',
    img: 'icLuxury.png',
  },
  {
    id: 6,
    label: 'Electric',
    img: 'icElectric.png',
  },
];

export const RESIDENCE_TYPES = [
  {
    id: 1,
    label: 'Own',
  },
  {
    id: 2,
    label: 'Rent',
  },
];

export const STATE_LIST = [
  {
    label: 'Alabama',
    id: 'AL',
  },
  {
    label: 'Alaska',
    id: 'AK',
  },
  {
    label: 'American Samoa',
    id: 'AS',
  },
  {
    label: 'Arizona',
    id: 'AZ',
  },
  {
    label: 'Arkansas',
    id: 'AR',
  },
  {
    label: 'California',
    id: 'CA',
  },
  {
    label: 'Colorado',
    id: 'CO',
  },
  {
    label: 'Connecticut',
    id: 'CT',
  },
  {
    label: 'Delaware',
    id: 'DE',
  },
  {
    label: 'District Of Columbia',
    id: 'DC',
  },
  {
    label: 'Federated States Of Micronesia',
    id: 'FM',
  },
  {
    label: 'Florida',
    id: 'FL',
  },
  {
    label: 'Georgia',
    id: 'GA',
  },
  {
    label: 'Guam',
    id: 'GU',
  },
  {
    label: 'Hawaii',
    id: 'HI',
  }
];

export const CREDIT_APPLICATION_PRIMARY = 1;
export const CREDIT_APPLICATION_CO = 2;
