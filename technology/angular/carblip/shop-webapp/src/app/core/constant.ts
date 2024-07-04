export const MARKET_URL = 'https://www.carblip.com';
export const PREQUALIFY_URL = 'https://www.carblip.com/prequalify/';
export const MAILCHIMP_SUBSCRIBE_URL =
  'https://carblip.us16.list-manage.com/subscribe/post-json';
export const MAILCHIMP_SUBSCRIBE_PARAM = {
  u: '5d84779af3ac8c8e945466489',
  id: 'f8227580f0',
  hidden: 'b_5d84779af3ac8c8e945466489_f8227580f0',
};

export const SOURCE_UTM = 1; // web-app
export const COMMING_SOON_IMG =
  'https://s3.amazonaws.com/carblip-configurator/assets/image-coming-soon.png';

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

export const FAQ = [
  {
    id: 1,
    question: 'What is CarBlip?',
    answer:
      'CarBlip is a car buying and leasing platform that provides customers with a completely personalized car buying experience without ever having to visit a dealership. Through our car shop, customers are able to build their ideal car exactly how they want it. Someone from our CarBlip Concierge Team will then locate all options that match their preferences. Each customer is provided with a dedicated concierge who will guide them through the entire process from negotiation to delivery. CarBlip’s goal is to alleviate most, if not all, of the pain points that consumers often experience in the car buying process.',
  },
  {
    id: 2,
    question: 'Do I need to download an app to use CarBlip?',
    answer:
      'No. We have a <a target="_new" href="https://app.carblip.com/">web app version</a> but we strongly urge users to <a target="_new" href="https://itunes.apple.com/us/app/carblip/id1362042544?mt=8">download the app</a> because it provides additional features like in-app messaging and other features.',
  },
  {
    id: 3,
    question: 'I’m not sure exactly what I want. Can I get some advice?',
    answer:
      'Absolutely! One of CarBlip’s greatest assets is our sales team and their combined knowledge of more than 50 years of experience. We like to refer to our sales team as "car whisperers." They can help guide you through every aspect of the car buying process: from what car to choose, whether to finance or lease, and what warranties to get and which to skip. CarBlip is focused on getting you the best deal possible and ensuring you end up with a car that is best suited for your lifestyle and budget.',
  },
  {
    id: 4,
    question: 'Is there a fee for using this service?',
    answer:
      'No! We do not charge our customers. Unlike other auto brokers that charge the customer, we are focused on working with people who really need a car and want to work with us. Therefore, we do not feel it is appropriate to charge upfront for our service.',
  },
  {
    id: 5,
    question: 'Do you take consumer and dealer incentives into account?',
    answer:
      'Absolutely. Because we have access to rebates and incentives across all manufacturers, your dedicated CarBlip concierge provides consultation on which vehicles have the greatest discounts. CarBlip is focused on finding our customer’s the best deal possible.',
  },
  {
    id: 6,
    question: 'What information does CarBlip gather?',
    answer:
      'Once you start the car selection process, we kindly ask for your first and last name – we need to know what to call you – as well as your contact details.',
  },
  {
    id: 7,
    question:
      'Is CarBlip endorsed by or sponsored by automobile manufacturers?',
    answer:
      'Although CarBlip maintains and/or seeks cooperative business relationships with automobile manufacturers, our suppliers and dealer principals, CarBlip remains an independent company that is not endorsed or sponsored by any particular automobile manufacturer. CarBlip is focused on remaining brand agnostic and serving the best interests of our customers.',
  },
  {
    id: 8,
    question:
      'Why are vehicles photos on the CarBlip website not identical to the photos I see on manufacturer websites?',
    answer:
      'CarBlip uses a third party supplier for all car images. In most cases, CarBlip does not obtain vehicle photos from the automobile manufacturers, so the angle, orientation, lighting, and other variables may differ from photos of the same model you see on an automobile manufacturer’s website. Vehicle photos are for reference purposes only, and do not imply any endorsement by, affiliation with, or sponsorship by the automobile manufacturer of the photographed vehicle.',
  },
  {
    id: 9,
    question:
      "I have a great story that I'd like to share about how much CarBlip helped me, who can I send it to?",
    answer:
      'We would be honored and encouraged to hear how we helped! Please send your stories to <a href="mailto:feedback@carblip.com">feedback@carblip.com</a>.',
  },
  {
    id: 10,
    question: 'Where do I report missing vehicles or options?',
    answer:
      'If you catch any information missing from vehicle options, please let us know at <a href="mailto:feedback@carblip.com">feedback@carblip.com</a>.',
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

export const CALCULATOR_INFO = {
  estimatedTotalCost:
    'The Estimated Total Cost is a summation of the Amount Financed, Finance Charge and Taxes and any cash down payment and/or net trade-in amount.',
  interest: 'Interest is the dollar amount the credit will cost you.',
  tax:
    'The amount presented for taxes reflects the dollar amount of tax based on the Estimated Monthly Lease Payment and Tax Rate shown.',
  depreciation:
    'The depreciation charge is the portion of your payment which pays the leasing company for the loss in value of its vehicle, spread over the lease term (number of months), based on the miles you intend to drive and the time you intend to keep the vehicle.',
  rentCharge:
    'Rent charge is the portion of your lease payment which pays the leasing company for the use of their money. Similar to interest on a loan.',
  financeVehiclePrice:
    'Please move the slider to select the amount that you anticipate to pay for your vehicle.  If you have not reached an agreement with a CarBlip concierge, you can use your vehicle’s listed MSRP (Manufacturer Suggested Retail Price).  Please note that that MSRP does not include destination, taxes, title, registration, preparation, and documentation fees.  As this calculator is for estimation purposes only, we round values to the nearest thousand.',
  financeCashDownPayment:
    'The Down Payment is the amount that you plan to pay up front when you purchase your vehicle.  This reduces the amount that you need to finance.  You can adjust this to the amount that you wish to put down at the time of your purchase.',
  financeTerm:
    'The Term is the number of months that you plan to finance your vehicle for.  If you wish to select a different term than what is shown, you can do so by speaking to one of our CarBlip concierges who will make sure that you get exactly what you want.',
  financeTradeInValue:
    'The Trade-In Value is your vehicle’s current appraised value.  Please select the estimate for your vehicle’s value if you have a trade-in for the purchase of your vehicle.',
  financeAPR:
    'The Annual Percentage Rate (APR) is the interest rate for your vehicle financing (loan).  Please enter the rate that you believe you will qualify for.',
  financeTaxRate: 'Input the sales tax percentage in your area.',
  leaseVehiclePrice:
    'Please move the slider to select the amount that you anticipate to pay for your vehicle.  If you have not reached an agreement with a CarBlip concierge, you can use your vehicle’s listed MSRP (Manufacturer Suggested Retail Price).  Please note that that MSRP does not include destination, taxes, title, registration, preparation, and documentation fees.  As this calculator is for estimation purposes only, we round values to the nearest thousand.',
  leaseDownPayment:
    'The Down Payment is the amount that you plan to pay up front when you lease your vehicle.  This reduces the amount that you need to finance (or capitalize).  You can adjust this to the amount that you wish to put down at the time of your lease.',
  leaseTerm:
    'The Term is the number of months that you plan to lease your vehicle for.  If you wish to select a different term than what is shown, you can do so by speaking to one of our CarBlip concierges who will make sure that you get exactly what you want.',
  leaseAnnualMileage:
    'The Annual Mileage is the total number of miles per year that you are allotted to drive your vehicle before excess mileage charges are imposed.',
  leaseTradeInValue:
    'The Trade-In Value is your vehicle’s current appraised value.  Please select the estimate for your vehicle’s value if you have a trade-in for the purchase of your vehicle.',
  leaseAPR:
    'The Annual Percentage Rate (APR) is the interest rate for your vehicle lease financing.  Please enter the rate that you believe you will qualify for.',
  leaseTaxRate: 'Input the sales tax percentage in your area',
};

export const REVIEW_POPOVER_INFO = {
  financeDownPayment:
    'The Down Payment is the amount that you plan to pay up front when you purchase your vehicle.  This reduces the amount that you need to finance.  You can adjust this to the amount that you wish to put down at the time of your purchase.',
  financeTerm:
    'The Term is the number of months that you plan to finance your vehicle.  If you wish to select a different term than what is shown, you can do so by speaking to one of our CarBlip team members who will make sure that you get exactly what you want.',
  leaseDownPayment:
    'The Down Payment is the amount that you plan to pay up front when you lease your vehicle.  This reduces the amount that you need to finance.  You can adjust this to the amount that you wish to put down at the time of your lease.',
  leaseTerm:
    'The Term is the number of months that you plan to lease your vehicle for.  If you wish to select a different term than what is shown, you can do so by speaking to one of our CarBlip team members who will make sure that you get exactly what you want.',
  leaseAnnualMileage:
    'The Annual Mileage is the total number of miles per year that you are allotted to drive your vehicle before excess mileage charges are imposed.  If you don’t see the amount that you are interested in, please be sure to mention this to your CarBlip concierge.',
};

export const NOTIFICATION_LIST = {
  noMyRequestItem:
    'Please complete a simple credit app to go along with your request. Select a specific car to go along with your credit app submission.',
  noInternet:
    'CarBlip requires a network connection to work properly.  Please check your WiFi or internet connection.',
  serverDown:
    "It's taking longer than expected.  Please check your connection and try again.",
  somethingWrong:
    'Woops!  Something went wrong.  Please close the app and restart.',
  invalidPhoneNumber:
    'Please enter a valid mobile number. Messaging charges may apply.',
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
  { terms_in_months_price: 24, annual_mileage: 20000, residual_value: 54 },
  { terms_in_months_price: 30, annual_mileage: 7500, residual_value: 59 },
  { terms_in_months_price: 30, annual_mileage: 10000, residual_value: 58 },
  { terms_in_months_price: 30, annual_mileage: 12000, residual_value: 57 },
  { terms_in_months_price: 30, annual_mileage: 15000, residual_value: 55 },
  { terms_in_months_price: 30, annual_mileage: 20000, residual_value: 50 },
  { terms_in_months_price: 36, annual_mileage: 7500, residual_value: 57 },
  { terms_in_months_price: 36, annual_mileage: 10000, residual_value: 56 },
  { terms_in_months_price: 36, annual_mileage: 12000, residual_value: 55 },
  { terms_in_months_price: 36, annual_mileage: 15000, residual_value: 53 },
  { terms_in_months_price: 36, annual_mileage: 20000, residual_value: 48 },
  { terms_in_months_price: 42, annual_mileage: 7500, residual_value: 51 },
  { terms_in_months_price: 42, annual_mileage: 10000, residual_value: 50 },
  { terms_in_months_price: 42, annual_mileage: 12000, residual_value: 49 },
  { terms_in_months_price: 42, annual_mileage: 15000, residual_value: 47 },
  { terms_in_months_price: 42, annual_mileage: 20000, residual_value: 42 },
  { terms_in_months_price: 48, annual_mileage: 7500, residual_value: 46 },
  { terms_in_months_price: 48, annual_mileage: 10000, residual_value: 45 },
  { terms_in_months_price: 48, annual_mileage: 12000, residual_value: 44 },
  { terms_in_months_price: 48, annual_mileage: 15000, residual_value: 42 },
  { terms_in_months_price: 48, annual_mileage: 20000, residual_value: 37 },
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
  },
  {
    label: 'Idaho',
    id: 'ID',
  },
  {
    label: 'Illinois',
    id: 'IL',
  },
  {
    label: 'Indiana',
    id: 'IN',
  },
  {
    label: 'Iowa',
    id: 'IA',
  },
  {
    label: 'Kansas',
    id: 'KS',
  },
  {
    label: 'Kentucky',
    id: 'KY',
  },
  {
    label: 'Louisiana',
    id: 'LA',
  },
  {
    label: 'Maine',
    id: 'ME',
  },
  {
    label: 'Marshall Islands',
    id: 'MH',
  },
  {
    label: 'Maryland',
    id: 'MD',
  },
  {
    label: 'Massachusetts',
    id: 'MA',
  },
  {
    label: 'Michigan',
    id: 'MI',
  },
  {
    label: 'Minnesota',
    id: 'MN',
  },
  {
    label: 'Mississippi',
    id: 'MS',
  },
  {
    label: 'Missouri',
    id: 'MO',
  },
  {
    label: 'Montana',
    id: 'MT',
  },
  {
    label: 'Nebraska',
    id: 'NE',
  },
  {
    label: 'Nevada',
    id: 'NV',
  },
  {
    label: 'New Hampshire',
    id: 'NH',
  },
  {
    label: 'New Jersey',
    id: 'NJ',
  },
  {
    label: 'New Mexico',
    id: 'NM',
  },
  {
    label: 'New York',
    id: 'NY',
  },
  {
    label: 'North Carolina',
    id: 'NC',
  },
  {
    label: 'North Dakota',
    id: 'ND',
  },
  {
    label: 'Northern Mariana Islands',
    id: 'MP',
  },
  {
    label: 'Ohio',
    id: 'OH',
  },
  {
    label: 'Oklahoma',
    id: 'OK',
  },
  {
    label: 'Oregon',
    id: 'OR',
  },
  {
    label: 'Palau',
    id: 'PW',
  },
  {
    label: 'Pennsylvania',
    id: 'PA',
  },
  {
    label: 'Puerto Rico',
    id: 'PR',
  },
  {
    label: 'Rhode Island',
    id: 'RI',
  },
  {
    label: 'South Carolina',
    id: 'SC',
  },
  {
    label: 'South Dakota',
    id: 'SD',
  },
  {
    label: 'Tennessee',
    id: 'TN',
  },
  {
    label: 'Texas',
    id: 'TX',
  },
  {
    label: 'Utah',
    id: 'UT',
  },
  {
    label: 'Vermont',
    id: 'VT',
  },
  {
    label: 'Virgin Islands',
    id: 'VI',
  },
  {
    label: 'Virginia',
    id: 'VA',
  },
  {
    label: 'Washington',
    id: 'WA',
  },
  {
    label: 'West Virginia',
    id: 'WV',
  },
  {
    label: 'Wisconsin',
    id: 'WI',
  },
  {
    label: 'Wyoming',
    id: 'WY',
  },
];

export const CREDIT_APPLICATION_PRIMARY = 1;
export const CREDIT_APPLICATION_CO = 2;
