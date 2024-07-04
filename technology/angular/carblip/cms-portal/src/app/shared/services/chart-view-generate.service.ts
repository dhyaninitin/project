import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class ChartViewGenerateService {
  monthViewResult = [];
  constructor() { }

  generateWeekView(data) {
    if (data.length > 0) {
      data = this.sort(data);
      let day = new Date(data[0].date).getDay();
      let result = [];
      let temp1 = []
      let i = 0; let count = 0;
      day = 7-day;
      for (i = 0; i < day; i++) {
        let keys = Object.keys(data[i]);
        let newData = data[i];
        keys = keys.filter(key => key !== 'date');
        keys.map(key=> {
          temp1.push({
            "name" : "Total " + key.charAt(0).toUpperCase() + key.substring(1).toLowerCase(),
            "value": newData[key]
          })
        })
        count = count + 1;
        if (i == day-1) {
          temp1 = this.sumOfTwoKeysWithSimilarValue(temp1);
          let msg = this.formatDate(data[0].date, data[i].date)
          let object = {
            "name": msg,
            "series": temp1
          }
          result.push(object);
          temp1 = [];
        }
      }
      i = 0; count = 0; let temp = 0;
      let lengthOfRemaining = (data.length - (day));
      for (i = 0; i < lengthOfRemaining; i++) {
        let keys = Object.keys(data[i + day]);
        let newData = data[i + day];
        keys = keys.filter(key => key !== 'date');
        keys.map(key=> {
          temp1.push({
            "name" : "Total " + key.charAt(0).toUpperCase() + key.substring(1).toLowerCase(),
            "value": newData[key]
          })
        })
        count = count + 1;
        // temp = temp + data[i + day].count;
        if (count == 7) {
          temp1 = this.sumOfTwoKeysWithSimilarValue(temp1);
          let msg = this.formatDate(data[i + day].date, data[i + day].date)
          let object = {
            "name": msg,
            "series": temp1
          }
          result.push(object);
          temp1 = [];
          count = 0; temp = 0;
        } else if ((lengthOfRemaining - 1) == i) {
          temp1 = this.sumOfTwoKeysWithSimilarValue(temp1);
          let msg = this.formatDate(data[i + day].date, data[i + day].date)
          let object = {
            "name": msg,
            "series": temp1
          }
          result.push(object);
          temp1 = [];
          temp = 0;
        }
      }
      return result;
    } else {
      return [];
    }
  }

  generateDayView(data) {
    if (data.length > 0) {
      data = this.sort(data);
      let result = [];
      data.map(x => {
        let keys = Object.keys(x);
        let temp = [];
        keys = keys.filter(key => key !== 'date');
        keys.map(key=> {
          temp.push({
            "name" : "Total " + key.charAt(0).toUpperCase() + key.substring(1).toLowerCase(),
            "value": x[key]
          })
        })
        let object = {
          "name": moment(new Date(x.date)).format('MMM') + ' ' + new Date(x.date).getDate(),
          "series": temp
        }
        result.push(object);
      })
      return result;
    } else {
      return [];
    }
  }

  generateMonthView(data) {
    if (data.length > 0) {
      this.monthViewResult = [];
      data = this.sort(data);
      this.filterForMonthView(data);
      return this.monthViewResult;
    } else {
      return [];
    }
  }

  filterForMonthView(data) {
    let i = 0;
    let temp: any = [];
    if (new Date(data[0].date).getMonth() > new Date(data[data.length - 1].date).getMonth()) {
      let start = new Date(data[0].date).getMonth();
      let end = new Date(data[data.length - 1].date).getMonth();
      while (start != end + 1) {
        temp = this.filterData(data, start);
        this.createMonthViewArray(temp);
        if (start == 11) { start = 0; } else { start = start + 1; }
      }
    } else if (new Date(data[0].date).getMonth() == new Date(data[data.length - 1].date).getMonth()) {
      let start = new Date(data[0].date).getMonth();
      temp = this.filterData(data, start);
      this.createMonthViewArray(temp);
    } else {
      let start = new Date(data[0].date).getMonth();
      let end = new Date(data[data.length - 1].date).getMonth();
      while (start != end + 1) {
        temp = this.filterData(data, start);
        this.createMonthViewArray(temp);
        start = start + 1;
      }
    }
  }

  filterData(data, breakValue) {
    let temp = data.filter(x => {
      let d = (new Date(x.date)).getMonth();
      return (d == breakValue);
    });
    return temp;
  }

  createMonthViewArray(temp) {
    let temp1 = [];
      temp.map((data: any, i: number)=>{
        let keys = Object.keys(data);
          keys = keys.filter(key => key !== 'date');
          keys.map(key=> {
            temp1.push({
              "name" : "Total " + key.charAt(0).toUpperCase() + key.substring(1).toLowerCase(),
              "value": data[key]
            })
        })
        if (i == temp.length - 1) {
          temp1 = this.sumOfTwoKeysWithSimilarValue(temp1);
          let object = {
            "name": moment(data.date).format('MMM'),
            "series": temp1
          }
          this.monthViewResult.push(object);
          temp1 = []
        }
      })
  }

  formatDate(date1, date2) {
    date2 = new Date(date2);
    let end_date = moment(date2).format('MMM') + ' ' + date2.getDate();
    let message = 'Sun-Sat ( ' + '' + end_date + ' )';
    return message;
  }

  sort(data) {
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  sum(data) {
    let total = 0;
    data.map(x => total += x.count);
    return total;
  }

  createChartData(data, start_date, end_date) {
    let finalArray = [];
    data = this.sort(data);
    let date1 = moment(start_date);
    let date2 = moment(end_date);
    let days = date2.diff(date1, 'days')
    let tomorrow  = moment(date1).add(-1,'days');
    for(let i=1;i<=days;i++) {
      let d  = moment(tomorrow).add(1,'days');
      let date = moment(d);
      tomorrow = date;
      let formatDate = moment(tomorrow).format('MMMM DD, YYYY')
      let arr = data.filter(x=> {
        if(x.date === formatDate){
         return x;
        }
      })
      if(arr.length > 0) {
        let temp = this.createDynamicObject(arr[0]);
        finalArray.push(temp);
      } else {
        let temp = this.createDynamicObjectWithEmptyValues(data[0],formatDate);
        finalArray.push(temp);
      }
    }
    return this.sort(finalArray);
  }

  createDynamicObjectWithEmptyValues(data, date) {
    let keys = Object.keys(data);
    let newtemp = [];
    keys.map(key=> {
      newtemp.push({
        [key]: key == 'date' ? date : 0
      })
    })
    newtemp = Object.assign({}, ...newtemp);
    return newtemp;
  }

  createDynamicObject(arr) {
    let keys = Object.keys(arr);
    let newtemp = [];
    keys.map(key=> {
      newtemp.push({
        [key]: arr[key]
      })
    })
    newtemp = Object.assign({}, ...newtemp);
    return newtemp;
  }

  /**
   * To Filter and add if there is duplicate objects are coming - Only for revenue
   * @param obj 
   * @returns 
   */
  sumObjectsValuesByKey(obj) {
    let tempHolder = {};
    let tempHolder1 = {};
    let tempHolder2 = {};

    obj.forEach((d) => {
      if (tempHolder.hasOwnProperty(d.date)) {
        tempHolder[d.date] = tempHolder[d.date] + d.gross;
      } else {
        tempHolder[d.date] = d.gross;
      }
    });
    
    obj.forEach((d) => {
      if (tempHolder1.hasOwnProperty(d.date)) {
        tempHolder1[d.date] = tempHolder1[d.date] + d.net;
      } else {
        tempHolder1[d.date] = d.net;
      }
    });

    obj.forEach((d) => {
      if (tempHolder2.hasOwnProperty(d.date)) {
        tempHolder2[d.date] = tempHolder2[d.date] + d.companynet;
      } else {
        tempHolder2[d.date] = d.companynet;
      }
    });
    
    let finalResult = [];
    for (let prop in tempHolder) {
      finalResult.push({ date: prop, gross: tempHolder[prop], net: tempHolder1[prop], companynet: tempHolder2[prop]});
    }
    return finalResult;  
  }

  sumOfTwoKeysWithSimilarValue(obj) {
    let holder = {};
    obj.forEach(function(d) {
      if (holder.hasOwnProperty(d.name)) {
        holder[d.name] = holder[d.name] + d.value;
      } else {
        holder[d.name] = d.value;
      }
    });
    let obj2 = [];
    for (var prop in holder) {
      obj2.push({ name: prop, value: holder[prop] });
    }
    return obj2;
  }

  totalRevenue(data) {
    let total = {gross: 0, net: 0, companynet: 0};
    data.map(x => {
      total.gross += x.gross;
      total.net += x.net;
      total.companynet += x.companynet;
    });
    return total;
  }

}
