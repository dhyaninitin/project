import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { Category } from './categories.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { CategoryService } from '../../../../../shared-ui/service/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  page: string = 'Category';
  access: any = {
    view:true,
    add:true,
    edit:true,
    delete:true
  }
  @ViewChild("deleteCategoryModal", { static: false })
  public deleteCategoryModal: ModalDirective;
  @ViewChild("addEditCategory", { static: false })
  public addEditCategory: ModalDirective;
  categoryList: any = [];
  currentCategory: Category = new Category();

  setDataFilter: any;
  order: string = "adtitle";
  reverse: boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;
  practiceTypeList: any = [];

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private router: Router,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private categoryService: CategoryService,
    private jwtService: JwtService
  ) {
    var access = this.jwtService.getAccess(this.page);
    if(access.length){
      access[0].level.map( (action) => {
        this.access[action.label] = action[action.label];
      })
    }
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCategoryData();
  }

  getCategoryData() {
    this.spinner.show();
    this.categoryService.getCategoryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.categoryList = data.data;
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

  showSaveCategoryModal(category?: any) {
    if((category && category._id && !this.access.edit) || (!category && !this.access.add)){
      this.toastr.info(this.globalService.permissionMessage, "Info");
      return;
    }
    if (category && category._id) {
      this.currentCategory = Object.assign({}, category);
    } else {
      this.currentCategory = new Category();
    }
    this.addEditCategory.show();
  }

  showDeleteCategory(category: any) {
    if(!this.access.delete){
      this.toastr.info(this.globalService.permissionMessage, "Info");
      return
    }
    this.currentCategory = category;
    this.deleteCategoryModal.show();
  }

  deleteCategory() {
    this.globalService.setLoadingLabel("Delete Processing... Please Wait.");
    this.spinner.show();
    this.categoryService.deleteCategory({ _id: this.currentCategory._id })
      .subscribe(
        data => {
          this.spinner.hide();
          this.deleteCategoryModal.hide();
          if (data.status === 200) {
            var found = this.categoryList.filter(obj => {
              return obj._id == this.currentCategory._id;
            });
            if (found.length) {
              var index = this.categoryList.indexOf(found[0]);
              this.categoryList.splice(index, 1);
            }
            this.toastr.success("Record deleted successfully. ", "Success");
          }
          this.currentCategory = new Category();
        },
        error => {
          this.spinner.hide();
          this.deleteCategoryModal.hide();
          this.toastr.error(
            "There are some server Please check connection.",
            "Error"
          );
        }
      );
  }

  saveCategoryData() {
    this.globalService.setLoadingLabel("Data submitting... Please Wait.");
    this.spinner.show();
    this.currentCategory.createdBy = this.jwtService.currentLoggedUserInfo._id;
    this.categoryService.saveCategory(this.currentCategory).subscribe(
      data => {
        this.spinner.hide();
        this.addEditCategory.hide();
        if (data.status === 200) {
          if (this.currentCategory._id) {
            var self = this;
            var found = self.categoryList.filter(obj => {
              return obj._id == this.currentCategory._id;
            });
            if (found.length) {
              var index = this.categoryList.indexOf(found[0]);
              this.categoryList[index] = data.data;
            }
          } else {
            this.categoryList.push(data.data);
          }
          this.toastr.success("Data saved successfully. ", "Success");
        }
        this.currentCategory = new Category();
      },
      error => {
        this.spinner.hide();
        this.addEditCategory.hide();
        this.toastr.error(
          "There are some server error, Please check connection.",
          "Error"
        );
      }
    );
  }

  closeModel() {
    this.addEditCategory.hide();
    this.deleteCategoryModal.hide();
    this.currentCategory = new Category();
  }

}
