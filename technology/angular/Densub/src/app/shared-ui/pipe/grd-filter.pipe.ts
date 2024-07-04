import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'grdFilter'
})
export class GrdFilterPipe implements PipeTransform {
  transform(items: any, filter: any, defaultFilter: boolean, multilevel = []): any {
    if (!filter) {
      return items;
    }
    if (!Array.isArray(items)) {
      return items;
    }
    if (filter && Array.isArray(items)) {
      let filterKeys = Object.keys(filter);

      const found = filterKeys.filter((obj) => {
        return ((multilevel.length > 0) ? (filter[obj] && multilevel.indexOf(obj) === -1) : filter[obj]);
        // return filter[obj];
      });

      /* ----Modified By Prakhar------ */
      filterKeys = found;
      /* ---------------------------- */
      if (!found.length && multilevel.length === 0) {
        return items;
      }
      /* ----------------- Multilevel --------------------------------------- */
      const multilevelObj = {};
      if (multilevel.length > 0) {
        multilevel.map(value => {
          let keys = filter[value] && Object.keys(filter[value]);
          let found = keys && keys.filter((obj) => {
            return filter[value][obj];
          });
          if (found && found.length > 0) {
            multilevelObj[value] = found;
          }
        });
      }
      const multilevelKeys = Object.keys(multilevelObj);
      if (!filterKeys.length && !multilevelKeys.length) {
        return items;
      }
      /* -------------------------------------------------------------------- */

      if (defaultFilter) {
        return items.filter(item =>
          filterKeys.reduce((x, keyName) =>
            (x && new RegExp(filter[keyName], 'gi').test(item[keyName])) && filter[keyName] !== "", true));
      } else if (multilevel.length > 0 && multilevelKeys.length > 0) {
        return items.filter(item => {
          /* ---------------------------------- Single Level---------------------------------- */
          const singleLevel = filterKeys.filter((keyName) => {
            let value = item[keyName];
            // used for checking Date
            if (typeof (value) !== 'number' && moment(value).isValid() && keyName != 'jobTitle') {
              value = moment(value).format('MMM DD,YYYY');
              if (Object.keys(multilevelObj).length) {
                for (const key in multilevelObj) {
                  if (keyName === 'jobDate' || keyName === 'updatedAt') {
                    value = item[key] && item[key][keyName];
                    value = moment(value).format('MMM DD,YYYY');
                    return filter[key][keyName] !== '' && new RegExp(filter[key][keyName], 'gi').test(value);
                  }
                }
              }
            } else if(keyName === 'contractStatus'){
              return filter[keyName] !== '' && (filter[keyName].indexOf(item[keyName]) != -1 || new RegExp(filter[keyName], 'gi').test(item[keyName]));
            }else {
              return filter[keyName] !== '' && new RegExp(filter[keyName], 'gi').test(value);
            }
          });
          /* ------------------------------------------------------------------------------------------- */
          const multilevelArr = [];
          var flag = 0;
          // tslint:disable-next-line: forin
          for (const key in multilevelObj) {
            const checkValues = multilevelObj[key].filter((keyName) => {
              if(keyName === 'jobDateTo'){
                return false;
              }
              let value = item[key] && item[key][keyName];
              // used for checking Date
              if (typeof (value) !== 'number' && moment(value).isValid() && keyName != 'jobTitle') {
                value = moment(value).format('MMM DD,YYYY');
                if(keyName === 'jobDate'  && multilevelObj[key].includes("jobDateTo")){
                  if(filter[key][keyName] !== '' &&  filter[key]['jobDateTo'] !== '' && value >= filter[key][keyName] && value <= filter[key]['jobDateTo']){
                    flag = 1;
                  }else{
                    flag = 0;
                  }
                  return  filter[key][keyName] !== '' &&  filter[key]['jobDateTo'] !== '' && value >= filter[key][keyName] && value <= filter[key]['jobDateTo'];
                }
              }
              return filter[key][keyName] !== '' && (filter[key][keyName].indexOf(value) != -1 || new RegExp(filter[key][keyName], 'gi').test(value));
            });
            if (checkValues.length+1 === multilevelObj[key].length && flag === 1) {
              multilevelArr.push(key);
            }
            else if (checkValues.length === multilevelObj[key].length) {
              multilevelArr.push(key);
            }
          }
          return (singleLevel.length === filterKeys.length) && (multilevelKeys.length === multilevelArr.length);
        });
      } else {
        return items.filter(item => {
          var flag = 0;
          /* ---------------------------------- Modified By Prakhar --------------------------------- */
          const found = filterKeys.filter((keyName) => {
            if(keyName === 'jobDateTo'){
            }
            else if(keyName === 'jobDate'  && filterKeys.includes("jobDateTo")){
              flag = 1;
              const date = moment(item[keyName]).format('MMM DD,YYYY');
              // // item['jobDateTo'] = date;
              // if(filter[keyName] === ''){
              //       return new RegExp(filter['jobDateTo'], 'gi').test(date);
              // }else{
              //   return  filter[keyName] !== '' &&  filter['jobDateTo'] !== '' && date >= filter[keyName] && date <= filter['jobDateTo'];
              // }
              return  filter[keyName] !== '' &&  filter['jobDateTo'] !== '' && date >= filter[keyName] && date <= filter['jobDateTo'];
            }
            else if (keyName === 'jobDate' || keyName === 'updatedAt') {
              const date = moment(item[keyName]).format('MMM DD,YYYY');
              return filter[keyName] !== '' && new RegExp(filter[keyName], 'gi').test(date);
            } else {
              return filter[keyName] !== '' && (filter[keyName].indexOf(item[keyName]) != -1 || new RegExp(filter[keyName], 'gi').test(item[keyName]));
            }
          });
          if(filterKeys.includes("jobDateTo") && filterKeys.includes("jobDate") && flag == 1){
          return found.length+1 === filterKeys.length;
          }
          return found.length === filterKeys.length;
          /* ------------------------------------------------------------------------------------------- */

          /* return filterKeys.some((keyName) => {
            return filter[keyName] !== '' && new RegExp(filter[keyName], 'gi').test(item[keyName]);
            // return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] == "";
          }); */
        });
      }
    }
  }
}
