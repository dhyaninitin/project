import * as moment from 'moment-timezone';

const startDateFormat = 'YYYY-MM-DD 00:00:00';
const endDateFormat = 'YYYY-MM-DD 23:59:59';

export const DASHBOARD_DATES = [
  {
    display: 'Today',
    name: 'today',
    value: {
      start_date: moment()
        .tz('UTC')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .format(endDateFormat),
    },
  },
  {
    display: 'Yesterday',
    name: 'yesterday',
    value: {
      start_date: moment()
        .tz('UTC')
        .subtract(1, 'day')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .subtract(1, 'day')
        .format(endDateFormat),
    },
  },
  {
    display: 'Last 3 Days',
    name: 'last-three',
    value: {
      start_date: moment()
        .tz('UTC')
        .subtract(3, 'day')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .subtract(1, 'day')
        .format(endDateFormat),
    },
  },
  {
    display: 'Last 7 Days',
    name: 'last-seven',
    value: {
      start_date: moment()
        .tz('UTC')
        .subtract(7, 'day')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .subtract(1, 'day')
        .format(endDateFormat),
    },
  },
  {
    display: 'Last Week',
    name: 'last-week',
    value: {
      start_date: moment()
        .tz('UTC')
        .subtract(1, 'week')
        .startOf('week')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .subtract(1, 'week')
        .endOf('week')
        .format(endDateFormat),
    },
  },
  {
    display: 'This Month',
    name: 'this-month',
    value: {
      start_date: moment()
        .tz('UTC')
        .startOf('month')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .endOf('month')
        .format(endDateFormat),
    },
  },
  {
    display: 'Last Month',
    name: 'last-month',
    value: {
      start_date: moment()
        .tz('UTC')
        .subtract(1, 'month')
        .startOf('month')
        .format(startDateFormat),
      end_date: moment()
        .tz('UTC')
        .subtract(1, 'month')
        .endOf('month')
        .format(endDateFormat),
    },
  },
  {
    display: 'All',
    name: 'all',
    value: {
      start_date: undefined,
      end_date: undefined,
    },
  },
];
export const ROLE_LIST = [
  {
    id: 1,
    name: 'superadmin',
    label: 'Super Admin',
  },
  {
    id: 2,
    name: 'admin',
    label: 'Admin',
  },
  {
    id: 3,
    name: 'administrative',
    label: 'Administrative',
  },
  {
    id: 4,
    name: 'manager',
    label: 'Manager',
  },
  {
    id: 5,
    name: 'salesperson',
    label: 'Salesperson',
  },
  {
    id: 6,
    name: 'concierge',
    label: 'Concierge',
  },
];

export const CREDIT_SCORE = {
  1: 'Excellent',
  2: 'Good',
  3: 'Fair',
  4: 'Poor',
};

export const CREDIT_SCORE_VALUE = {
  1: '720-850',
  2: '690-719',
  3: '630-689',
  4: 'Under 630',
};

export const BUYING_TIME = {
  1: 'ASAP',
  2: 'This Month',
  3: 'Over a Month',
};

export const BUYING_METHOD = {
  1: 'Cash',
  2: 'Finance',
  3: 'Lease',
};

export const SOURCE_UTM_LIST = {
  1: 'Web',
  2: 'Mobile',
};

export const WHOLESALE_TYPE = {
  1: 'Lease Returned',
  2: 'Auction',
};

export const WHOLESALE_PAID_TO = {
  1: 'Paid To Dealer',
  2: 'Paid To CarBlip',
};

export const WHOLESALE_PAYMENT_TYPE = {
  1: 'Check',
  2: 'Credit Card',
  3: 'Cash',
  4: 'Wire',
};

export const VENDOR_PAYMENT_BY = {
  1: 'Paid by Dealer',
  2: 'Paid by Customer',
};

export const STATE_LIST = [
  { value: 'AL', label: 'AL' },
  { value: 'AK', label: 'AK' },
  { value: 'AR', label: 'AR' },
  { value: 'AZ', label: 'AZ' },
  { value: 'CA', label: 'CA' },
  { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' },
  { value: 'DC', label: 'DC' },
  { value: 'DE', label: 'DE' },
  { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' },
  { value: 'HI', label: 'HI' },
  { value: 'IA', label: 'IA' },
  { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' },
  { value: 'IN', label: 'IN' },
  { value: 'KS', label: 'KS' },
  { value: 'KY', label: 'KY' },
  { value: 'LA', label: 'LA' },
  { value: 'MA', label: 'MA' },
  { value: 'MD', label: 'MD' },
  { value: 'ME', label: 'ME' },
  { value: 'MI', label: 'MI' },
  { value: 'MN', label: 'MN' },
  { value: 'MO', label: 'MO' },
  { value: 'MS', label: 'MS' },
  { value: 'MT', label: 'MT' },
  { value: 'NC', label: 'NC' },
  { value: 'NE', label: 'NE' },
  { value: 'NH', label: 'NH' },
  { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' },
  { value: 'NV', label: 'NV' },
  { value: 'NY', label: 'NY' },
  { value: 'ND', label: 'ND' },
  { value: 'OH', label: 'OH' },
  { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' },
  { value: 'PA', label: 'PA' },
  { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' },
  { value: 'SD', label: 'SD' },
  { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' },
  { value: 'UT', label: 'UT' },
  { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' },
  { value: 'WA', label: 'WA' },
  { value: 'WI', label: 'WI' },
  { value: 'WV', label: 'WV' },
  { value: 'WY', label: 'WY' },
];
