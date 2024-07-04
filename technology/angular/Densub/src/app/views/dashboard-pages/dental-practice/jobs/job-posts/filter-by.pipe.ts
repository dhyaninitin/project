import { Pipe } from "@angular/core";

@Pipe({
    name: 'filterBy'
  })
  export class FilterPipe {
    transform(value: [], args: any) : any {
      return value.filter((e) => {
        return (e['jobId'] == args);
      });
    }
  }