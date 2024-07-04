import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  transform(value: [], searchValue: any): any {
    if(!value)return null;
    if(!searchValue) return value;
    searchValue = searchValue.toLowerCase();
    return value.filter(function(data){
      return JSON.stringify(data).toLowerCase().includes(searchValue);
  });
  }

}
