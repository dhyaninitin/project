import {
  Injectable
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortService {

  ascendingSort(sortVal, sortArr, type = '') {
    return sortArr.sort((a, b) => {
      if (typeof (a[sortVal]) === 'string' && typeof (b[sortVal]) === 'string') {
        a[sortVal] = a[sortVal].toLowerCase().trim();
        b[sortVal] = b[sortVal].toLowerCase().trim();
      }
      if (type === 'date') {
        a[sortVal] = new Date(a[sortVal]).getTime();
        b[sortVal] = new Date(b[sortVal]).getTime();
      }
      // a should come before b in the sorted order
      if (a[sortVal] < b[sortVal]) {
        return -1;
        // a should come after b in the sorted order
      } else if (a[sortVal] > b[sortVal]) {
        return 1;
        // and and b are the same
      } else {
        return 0;
      }
    });
  }

  descendingSort(sortVal, sortArr, type = '') {
    return sortArr.sort((a, b) => {
      if (typeof (a[sortVal]) === 'string' && typeof (b[sortVal]) === 'string') {
        a[sortVal] = a[sortVal].toLowerCase().trim();
        b[sortVal] = b[sortVal].toLowerCase().trim();
      }
      if (type === 'date') {
        a[sortVal] = new Date(a[sortVal]).getTime();
        b[sortVal] = new Date(b[sortVal]).getTime();
      }
      // a should come before b in the sorted order
      if (a[sortVal] > b[sortVal]) {
        return -1;
        // a should come after b in the sorted order
      } else if (a[sortVal] < b[sortVal]) {
        return 1;
        // and and b are the same
      } else {
        return 0;
      }
    });
  }

  calulateDistance(lat1, lon1, lat2, lon2, unit= 'K') {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0;
    }
    else {
      let radlat1 = Math.PI * lat1 / 180;
      let radlat2 = Math.PI * lat2 / 180;
      let theta = lon1 - lon2;
      let radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "M") { dist = dist * 0.8684 }
      // if (unit == "N") { dist = dist * 0.8684 }
      return dist;
    }
  }

}


