import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { BlogService } from '../../../../../shared-ui/service/blog.service';
import { Blog } from './../create-blog/create-blog.modal';

@Component({
  selector: 'app-all-blogs',
  templateUrl: './all-blogs.component.html',
  styleUrls: ['./all-blogs.component.scss']
})
export class AllBlogsComponent implements OnInit {

  @ViewChild("deleteBlogModal", { static: false })
  public deleteBlogModal: ModalDirective;
  @ViewChild("addEditCategory", { static: false })
  public addEditCategory: ModalDirective;

  blogList: any = [];
  currentBlog: Blog = new Blog;

  setDataFilter: any;
  order: string = "adtitle";
  reverse: boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private blogService: BlogService
  ) {

  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getBlogs();
  }

  getBlogs() {
    this.spinner.show();
    this.blogService.getBlogList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.blogList = data.data;
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

  showDeleteBlog(item: any) {
    this.currentBlog = item;
    this.deleteBlogModal.show();
  }

  deleteBlog() {
    this.globalService.setLoadingLabel("Delete Processing... Please Wait.");
    this.spinner.show();
    this.blogService.deleteBlog({ _id: this.currentBlog._id })
      .subscribe(
        data => {
          this.spinner.hide();
          this.deleteBlogModal.hide();
          if (data.status === 200) {
            var found = this.blogList.filter(obj => {
              return obj._id == this.currentBlog._id;
            });
            if (found.length) {
              var index = this.blogList.indexOf(found[0]);
              this.blogList.splice(index, 1);
            }
            this.toastr.success("Record deleted successfully. ", "Success");
          }
          this.currentBlog = new Blog();
        },
        error => {
          this.spinner.hide();
          this.deleteBlogModal.hide();
          this.toastr.error(
            "There are some server Please check connection.",
            "Error"
          );
        }
      );
  }

  updateStatus(id?, status?){
    let postObj = { _id: id };
    if(status == 'active'){
      postObj['status'] = "inactive"
    }else{
      postObj['status'] = "active"
    }
    this.spinner.show();
    this.blogService.updateStatus(postObj).subscribe(
      data => {
        this.spinner.hide();
        if( data.status == 200 ){
          let found = this.blogList.filter(e => e._id == id);
          if(found && found.length){
            found[0].status = postObj['status'];
          }
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(
          "There are some server Please check connection.",
          "Error"
        );
      }
    );
  }

  closeModel() {
    this.addEditCategory.hide();
    this.deleteBlogModal.hide();
    this.currentBlog = new Blog();
  }


}
