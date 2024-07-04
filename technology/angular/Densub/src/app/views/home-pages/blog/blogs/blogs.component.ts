import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { BlogService } from '../../../../shared-ui/service/blog.service';
import { Blog } from './../../../dashboard-pages/admin/blogs/create-blog/create-blog.modal';
import { CategoryService } from './../../../../shared-ui/service/category.service';
import { SortService } from '../../../../shared-ui/service/sort.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {

  blogList: any = [];
  recentBlogs: any = [];
  popularBlogs: any = [];
  blogTempList: any = [];
  categories: any = [];
  itemsPerPage = 10;
  setDataFilter: any;
  dataFilter: {};
  categoryId: ""; 

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private sortService: SortService
  ) {
    this.globalService.topscroll();
    this.route.params.subscribe(res => {
      this.categoryId = res.categoryId;
    })
  }

  ngOnInit() {
    this.getBlogs();
    this.getCategories();
  }

  getCategories(){
    this.categoryService.getCategoryList({}).subscribe(
      data => {
        if (data.status == 200 && data.data){
          this.categories = data.data;
        }
      }
    );
  }

  getBlogs() {
    this.spinner.show();
    this.blogService.getBlogList({status: 'active'}).subscribe(
      data => {
        if (data.status === 200) {
          this.globalService.topscroll();
          this.blogList = Object.assign([], data.data);
          this.blogTempList = Object.assign([], data.data);
          this.recentBlogs = Object.assign([], data.data);
          this.recentBlogs.splice(5);
          this.popularBlogs = Object.assign([], data.data);
          this.popularBlogs = this.sortService.descendingSort('commentCount', this.popularBlogs);
          this.popularBlogs.splice(5);
          if(this.categoryId){
            this.setFilter(this.categoryId);
          }
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

  setFilter(filterId) {
    const self =this;
    this.blogList = this.blogTempList.filter( blog => {
      console.log(blog.categories.map(function(e) { return e._id; }));
      const indexOf = blog.categories.map(function(e) { return e._id; }).indexOf(filterId);
      if(indexOf > -1) {
        return blog;
      }
    })
    this.globalService.topscroll();
  }

  resetFilter() {
    this.blogList = Object.assign([], this.blogTempList);
  }

}
