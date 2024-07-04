import { Component, HostListener, OnInit } from '@angular/core';
import { ReportsService } from 'app/shared/services/apis/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  
  scrWidth:any;
  view: any[] = [1200, 450];
  listOfSources = [];
  constructor(private service$: ReportsService) { }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
      this.scrWidth = window.innerWidth; 
      if( this.scrWidth >= 960) { this.view = [this.scrWidth-300, 450]; } 
      else { this.view = [this.scrWidth-50, 450]; }
  }

  ngOnInit() {
    this.getAllsource();
    this.getScreenSize();
  }

	/** get all Source
	* @param
	* @return
	**/
  getAllsource() {
    this.service$.getsource().subscribe((res: any) => {
      if (res.statusCode == 200 && res.data) {
        this.listOfSources.push({ id: 0, name: 'All', disabled: false });
        const sources = res.data.map(el => { return { ...el, disabled: true } })
        sources.sort((a, b) => a.name.localeCompare(b.name));
        this.listOfSources = [...this.listOfSources, ...sources];
      }
    });
  }

}
