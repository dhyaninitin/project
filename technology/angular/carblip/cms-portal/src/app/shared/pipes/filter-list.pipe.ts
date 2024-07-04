import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterList'
})
export class FilterListPipe implements PipeTransform {
  transform(data: any, key?: any, args?: any, matchWith?: any): any {
    let finalResult = null;
    if(data !== undefined){
      let selectedComponents = args.slice();
      if( matchWith ) { 
        let index = args.indexOf(matchWith);
        if(index !== -1) {
          selectedComponents.splice(index,1);
        } 
      } 
      console.log(selectedComponents)
      finalResult = data.map(params=> {
        let found = selectedComponents.indexOf(params[key]);
        if(found == -1){
          return params;
        }
      });
      finalResult = finalResult.filter(t=> { return t!== undefined });
    }
    return finalResult;
  }
}
