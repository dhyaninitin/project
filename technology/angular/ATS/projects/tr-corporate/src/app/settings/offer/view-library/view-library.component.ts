import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LibraryService } from '../shared/services/library.service';

@Component({
  selector: 'app-view-library',
  templateUrl: './view-library.component.html',
  styleUrls: ['./view-library.component.scss'],
})
export class ViewLibraryComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() documentDetail: any;
  fileUrl = '';
  showPdfViewer: boolean = true;

  constructor(private libraryService: LibraryService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if(this.documentDetail){
      if(this.documentDetail.extension === 'DOCX' || this.documentDetail.extension === 'DOC') {
        this.showPdfViewer = false;
      } else {
        this.showPdfViewer = true;
      }
      this.libraryService.download(this.documentDetail.documentpath, this.documentDetail.documentname).subscribe(res=>{
        if(res.error){}
        else{
          this.fileUrl = res.data.url;
        }
      })
    }
  }

  ngOnInit(): void {
   
  }
}
