import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'removeLinebreak' })
export class RemoveLinebreakPipe implements PipeTransform {
  transform(text: string, limit: number = 5) {
    if (typeof text !== 'string') {
      return text;
    }
    return text.replace(/(\r\n|\n|\r)/gm, ' ');
  }
}
