import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { Blog } from './create-blog.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { BlogService } from '../../../../../shared-ui/service/blog.service';
import { CategoryService } from '../../../../../shared-ui/service/category.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.scss']
})
export class CreateBlogComponent implements OnInit {

  blog: Blog = new Blog;
  categories: any[];
  dropdownSettings: any = {};
  blogID: string = '';
  ckeConfig: any = {
    allowedContent: false,
    forcePasteAsPlainText: true,
    font_names: 'Arial;Times New Roman;Verdana',
    toolbarGroups: [
      { name: 'document', groups: ['mode', 'document', 'doctools'] },
      { name: 'clipboard', groups: ['clipboard', 'undo'] },
      { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
      { name: 'forms', groups: ['forms'] },
      '/',
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
      // { name: 'links', groups: ['links'] },
      { name: 'insert', groups: ['insert'] },
      '/',
      { name: 'styles', groups: ['styles'] },
      // { name: 'colors', groups: ['colors'] },
      { name: 'tools', groups: ['tools'] },
      { name: 'others', groups: ['others'] },
      { name: 'about', groups: ['about'] }
    ],
    removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private jwtService: JwtService,
    private imageCompress: NgxImageCompressService,
  ) {
    this.route.params.subscribe(res => {
      this.blogID = res.id;
      if(this.blogID){
        this.getBlog();
      }
    })
  }

  ngOnInit() {
    this.getCategories();
  }

  showDiv = {
    previous: false,
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '350px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    // fonts: [
    //   { class: 'arial', name: 'Arial' },
    //   { class: 'times-new-roman', name: 'Times New Roman' },
    //   { class: 'calibri', name: 'Calibri' },
    //   { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    // ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      // ['bold', 'italic'],
      // ['fontSize']
      ['insertVideo', 'toggleEditorMode', 'fontSize', 'removeFormat'],
      ['fontName'],
    ]
  };

  getCategories() {
    this.categoryService.getCategoryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.categories = data.data;
        }
      }
    );
  }

  getBlog(){
    this.blogService.getBlogList({ _id: this.blogID }).subscribe(
      data => {
        if(data.status == 200 &&  data.data &&  data.data.length){
          this.blog = data.data[0];
        }
      }
    );
  }

  saveBlog(type?){
    if(!this.blog.title || !this.blog.description || !this.blog.categories){
      this.toastr.error("*Please fill all mandatory fields first!", "Error");
      return;
    }
    if(!this.blog.photo){
      this.blog.photo = '../../../../../../assets/img/common/default-img.jpg';
    }
    this.blog.status = 'inactive';
    if(type == 'publish'){
      this.blog.status = 'active';
    }
    this.spinner.show();
    this.blogService.saveBlog(this.blog).subscribe(
      data => {
        this.spinner.hide();
        if(data.status == 200){
          this.toastr.success("Data saved successfully. ", "Success");
          this.router.navigate(['/all-blogs']);
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error( "There are some server error, Please check connection.", "Error" );
      }
    );
  }
  isCategorySelect: any[];

  setUnsetCategory(isCategorySelect, category){
    console.log(isCategorySelect, category);
    return;
    if(isCategorySelect){
      this.blog.categories.push(category._id);
    }else{
      this.blog.categories.splice(category._id, 1);
    }
  }

  uploadFile(event){
    let file = event.target.files[0];
    const self = this;
    self.globalService.setLoadingLabel('Please Wait. file uploading...');
    self.spinner.show();
    /* self.compressFile(file.file, file.type, (err, resp) => {
      console.log("resp ----------- ", resp);
      if (err) {
        resp = file.file;
      } */
      self.globalService.uploadFile(file).subscribe(
        (data: any) => {
          self.spinner.hide();
          if (data.status == 200 && data.imgPath) {
            this.blog.photo = data.imgPath;
          }
        },
        error => {
          self.spinner.hide();
          self.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      );
    /* }); */
  }

  compressFile(files?: any, type?: any, cb?: Function) {
    if (type) {
    // if (type !== 'docs') {
      cb(true, null);
    } else {
      // tslint:disable-next-line: prefer-const
      let self = this;
      const imageFile = files;
      const fileReader = new FileReader();

      fileReader.onload = function(fileLoadedEvent: any) {
        // self.uploadData[type][index].name = files.name;
        // console.warn('Size in bytes was:', self.imageCompress.byteCount(fileLoadedEvent.target.result));
        self.imageCompress
          .compressFile(fileLoadedEvent.target.result, -1, 75, 50)
          .then(result => {
            // console.warn('Size in bytes is now:', self.imageCompress.byteCount(result));
            const base64 = result;
            const ImageData = base64;
            const block = ImageData.split(';');
            const contentType = block[0].split(':')[1];
            const realData = block[1].split(',')[1];
            const blob = self.b64toBlob([realData], contentType, '');
            const blobs = new File([blob], files.name, { type: files.type });
            cb(false, blobs);
          });
      };
      fileReader.readAsDataURL(imageFile);
    }
  }

  /**
   * Name: b64toBlob():
   * Description: This method will change base64 image to blog image.
   * @param b64Data is image base64 data.
   * @param contentType is image type like jpg/png.
   * @param sliceSize is a image size
   * @return it will return blog image.
   */
  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
