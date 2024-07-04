import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BlogService } from '../../../../shared-ui/service/blog.service';
import { CategoryService } from '../../../../shared-ui/service/category.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { Blog, Comment } from '../../../dashboard-pages/admin/blogs/create-blog/create-blog.modal';
import { SortService } from '../../../../shared-ui/service/sort.service';
import { currentUser } from '../../../../layouts/home-layout/user.model';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-single-blog',
  templateUrl: './single-blog.component.html',
  styleUrls: ['./single-blog.component.scss']
})
export class SingleBlogComponent implements OnInit {

  @ViewChild("replyOfCommentModal", { static: false })
  public replyOfCommentModal: ModalDirective;
  blog: Blog = new Blog;
  comment: Comment = new Comment;
  blogList: any;
  recentBlogs: any;
  popularBlogs: any;
  commentList: any[];
  categories: any[];
  blogID: string = '';
  previousBlog: any = {};
  nextBlog: any = {};
  currentUser: currentUser = new currentUser();
  currentComment: any = {};
  replyofComment : any = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private sortService: SortService,
    private jwtService: JwtService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.route.params.subscribe(res => {
      this.blogID = res.blogId;
      if(this.blogID){
      }
    })
  }

  ngOnInit() {
    this.getCategories();
    this.getBlogs();
  }

  getCategories() {
    this.categoryService.getCategoryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.categories = data.data;
        }
      }
    );
  }

  getBlog(id?){
    this.previousBlog = {};
    this.nextBlog = {};
    this.blogService.getBlogList({ _id: id, dataFor: 'homePage' }).subscribe(
      data => {
        this.spinner.hide();
        if(data.status == 200 &&  data.data &&  data.data.length){
          this.globalService.topscroll();
          this.blog = data.data[0];
          this.getComments(this.blog._id);
          if(this.blogList && this.blogList.length){
            let found = this.blogList.filter(e => e._id === this.blog._id);
            let index = this.blogList.indexOf(found[0]);
            if(index > 0){
              this.nextBlog = this.blogList[index-1];
            }
            if(index >= 0){
              this.previousBlog = this.blogList[index+1];
            }
          }
        }
      }
    );
  }

  getComments(id?){
    this.commentList = [];
    this.blogService.getBlogComments({ blogID: id }).subscribe(
      data => {
        if(data.status == 200 && data.data && data.data.length){
          this.commentList = data.data;
        }
      }, error => {
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

  getBlogs() {
    this.spinner.show();
    this.blogService.getBlogList({status: 'active'}).subscribe(
      data => {
        if (data.status === 200) {
          this.blogList = Object.assign([], data.data);
          this.recentBlogs = Object.assign([], data.data);
          this.recentBlogs.splice(5);
          this.popularBlogs = Object.assign([], data.data);
          this.popularBlogs = this.sortService.descendingSort('commentCount', this.popularBlogs);
          this.popularBlogs.splice(5);
          this.getBlog(this.blogID);
        }
      },
      error => {
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

  postComment(){
    if(this.comment.userName == '' || this.comment.email == '' || this.comment.comment == ''){
      this.toastr.error("*Please fill all mandatory fields first.", "Error");
      return;
    }
    this.spinner.show();
    this.comment.blogID = this.blog._id;
    this.blogService.postComments(this.comment).subscribe(
      data => {
        this.spinner.hide();
        if( data.status == 200 ){
          this.commentList.push(this.comment);
          this.comment = new Comment();
          this.toastr.success( "Comment posted successfully.", "Success" );
        }
      }, error => {
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

  showReplyModal(item?){
    this.currentComment = item;
    this.replyOfCommentModal.show();
  }

  closeModel() {
    this.replyOfCommentModal.hide();
  }

  postAReply(){
    this.spinner.show();
    let postObject = {
      _id: this.currentComment._id,
      reply: this.replyofComment
    }
    this.blogService.postAReply(postObject).subscribe(
      data => {
        this.spinner.hide();
        this.replyOfCommentModal.hide();
        if( data.status == 200 ){
          this.currentComment.reply = this.replyofComment;
          this.currentComment.updatedAt = data.data.updatedAt;
          this.toastr.success( "Posted a reply successfully.", "Success" );
          this.replyofComment = "";
        }
      }, error => {
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

}
