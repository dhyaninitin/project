import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'practiceJobFilter'
})
export class PracticeJobFilterPipe implements PipeTransform {

  transform(value: [], args: any) : any {
    return value.filter((e) => {
      let practice = [];
      practice = e['practiceName'];
      return (practice['_id'] == args);
    });
  }
}
