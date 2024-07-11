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
  }
];


export const STATE_LIST = [
  { value: 'AL', label: 'AL' },
  { value: 'AK', label: 'AK' },
  { value: 'AR', label: 'AR' },
  { value: 'AZ', label: 'AZ' },
  { value: 'CA', label: 'CA' },
];
