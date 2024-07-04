import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'titleCase',
  pure: true
})

export class TitleCasePipe implements PipeTransform {
  transform(word: any, args?: any) : any {
      if(!word) {
        return word;
      } else {
         return word[0].toUpperCase() + word.substr(1).toLowerCase();
      }
  }
}
