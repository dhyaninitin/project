import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';

@Component({
  selector: 'app-blog-category',
  templateUrl: './blog-category.component.html',
  styleUrls: ['./blog-category.component.scss']
})
export class BlogCategoryComponent implements OnInit {

  constructor(
    private globalService: GlobalService
  ) {
    this.globalService.topscroll();
   }

  ngOnInit() {
  }

}
