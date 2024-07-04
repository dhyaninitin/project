import { formatCurrency } from '@angular/common';
import {
  BUYING_METHOD,
  BUYING_TIME,
  CREDIT_SCORE,
  CREDIT_SCORE_VALUE,
  SOURCE_UTM_LIST,
} from 'app/core/constants';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { Filter } from 'app/shared/models/common.model';
import { Request } from 'app/shared/models/request.model';
import { User } from 'app/shared/models/user.model';
import {
  ParseError,
  parsePhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/min';
import * as moment from 'moment-timezone';
import {Location} from '../models/location.model';

export function getIndexBy(array: Array<{}>, { name, value }): number {
  for (let i = 0; i < array.length; i++) {
    if (array[i][name] === value) {
      return i;
    }
  }
  return -1;
}

export function sortByFilter(filter: Filter, data: Array<any>) {
  if (filter.order_dir === 'asc') {
    return data.sort((a, b) => {
      if (!a[filter.order_by]) {
        return -1;
      }
      if (!b[filter.order_by]) {
        return 1;
      }
      return a[filter.order_by] > b[filter.order_by] ? 1 : -1;
    });
  } else {
    return data.sort((a, b) => {
      if (!a[filter.order_by]) {
        return 1;
      }
      if (!b[filter.order_by]) {
        return -1;
      }
      return a[filter.order_by] < b[filter.order_by] ? 1 : -1;
    });
  }
}

export function filterBySearch(
  searchKey: string,
  filterableFields: Array<string>,
  data: Array<any>
) {
  return data.filter((item: any) => {
    return filterableFields.reduce((memo, filter_item) => {
      let result = false;
      if (typeof item[filter_item] === 'string') {
        result =
          memo ||
          item[filter_item].toLowerCase().indexOf(searchKey.toLowerCase()) !==
            -1;
      } else if (typeof item[filter_item] === 'number') {
        result =
          memo ||
          item[filter_item]
            .toString()
            .toLowerCase()
            .indexOf(searchKey.toLowerCase()) !== -1;
      } else {
        result = memo;
      }
      return result;
    }, false);
  });
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

export function formatPhoneNumber(val: string): string {
  let phoneNumber;
  try {
    phoneNumber = parsePhoneNumber(val, 'US');
  } catch (error) {
    phoneNumber = '';
  }
  return phoneNumber;
}

export function formatPhoneNumberToNational(val: string): string {
  let phoneNumber;
  try {
    const ob = parsePhoneNumberFromString(phoneNumber['number']);
    phoneNumber = ob.formatNational();
  } catch (error) {
    phoneNumber = '';
  }
  return phoneNumber;
}

export function numberWithCommas(x: number) {
  if (typeof x !== 'undefined' && x !== null) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    return '';
  }
}

export function formatMiles(x: number) {
  if (x >= 1000) {
    return parseFloat((x / 1000).toFixed(2)) + 'k';
  } else {
    return x ? x.toString() : '';
  }
}

export function getUserFullName(user: User | PortalUser): string {
  if (user) {
    return user.full_name;
  }
  return '';
}

export function getBoolColor(value: any) {
  if (value) {
    return 'accent';
  } else if (!value) {
    return 'warn';
  }
  return '';
}

export function getYearArray(offset) {
  const start = new Date().getFullYear() + 1,
    stop = start + offset,
    step = -1;
  const arr = Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  );
  return arr.map(x => ({
    id: x,
    name: x.toString(),
  }));
}

export function getYearArrayFrom(from) {
  const start = new Date().getFullYear() + 1,
    stop = from,
    step = -1;
  const arr = Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  );
  return arr.map(x => ({
    id: x,
    name: x.toString(),
  }));
}

export function setCookie(cname, cvalue, exhrs) {
  const d = new Date();
  d.setTime(d.getTime() + exhrs * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function getCookie(cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}


export function formatLogMessage(logMessage: string) {
  if(logMessage !== undefined && logMessage !== null) {
    let logMsgArray = logMessage.split(" ");
    if(logMsgArray[logMsgArray.length - 1] == "on") {
      return '';
    } else {
      return " on"
    }
  }
}

export function filterPortalUsersBasedOnLocation(portalUserLocations: Location[], loggedInUserLocations: Location[]) {
  for (const location1 of loggedInUserLocations) {
    for (const location2 of portalUserLocations) {
      if (location1.id === location2.id) {
        return true;
      }
    }
  }
  return false;
}

export function setNameAsNAForDeals(deal, key) {
  if(deal.source_utm == 'Direct' && deal.brand == "" && deal.model == "") {
    return "N/A";
  }
  return deal[key];
}

export function textTruncate(text:string, maxCount: number){
  if(text) {
    if(text.length > maxCount) {
      return text.substring(0, maxCount) + "...";
    } else {
      return text;
    }
  }
  return "";
}

  export function collapseSection(element: HTMLElement, collapseDuration: number): void {
    const defaultDuration = 300;
    const duration = collapseDuration || defaultDuration;

    const startHeight = element.scrollHeight;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease, padding ${duration}ms ease`;

    // Set height to current height to ensure a smooth animation
    element.style.height = `${startHeight}px`;
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';

    // Use setTimeout to ensure the transition gets applied in the next frame
    setTimeout(() => {
      element.style.height = '0';
      element.style.paddingTop = '0';
      element.style.paddingBottom = '0';
    }, 0);
  }

  export function expandSection(element: HTMLElement, collapseDuration: number) {
    const defaultDuration = 300;
    const duration = collapseDuration || defaultDuration;

    element.style.display = 'block';
    const startHeight = 0;
    const endHeight = element.scrollHeight;

    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease, padding ${duration}ms ease`;

    // Set height to 0 to ensure a smooth animation
    element.style.height = `${startHeight}px`;
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';

    // Use setTimeout to ensure the transition gets applied in the next frame
    setTimeout(() => {
      element.style.height = `${endHeight}px`;
      element.style.paddingTop = '';
      element.style.paddingBottom = '';
    }, 0);

    setTimeout(() => {
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
    }, duration);
  }