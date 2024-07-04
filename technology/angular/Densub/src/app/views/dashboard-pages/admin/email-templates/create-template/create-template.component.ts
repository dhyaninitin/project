import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { EmailTemplatesService } from './../../../../../shared-ui/service/emailTemplates.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.scss']
})
export class CreateTemplateComponent implements OnInit {
  @ViewChild("previewModal", { static: false }) previewModal: ModalDirective;
  template: any = {
    type: '',
    subject: '',
    content: ''
  };
  previewHtml = '';
  cursorPosition: 0;
  notes: any = {
    'forgot-password': '##FIRSTNAME##, ##RECOVERPASSWORDBUTTON##',
    'add-new-user': '##FIRSTNAME##, ##LASTNAME##, ##ROLE##, ##EMAIL##, ##PASSWORD##, ##LOGINLINKBUTTON##',
    'email-verification': '##EMAIL##, ##CONFIRMEMAILBUTTON##',
    'practice-profile-verification': '##FIRSTNAME##, ##PRACTICETYPE##',
    'profile-approved': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'profile-rejected': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'profile-active': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'profile-inactive': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'promo-code': '##PROMOCODE##, ##LOGINLINKBUTTON##',
    'staff-profile-verification': '##FIRSTNAME##, ##POSITIONTYPE##',
    'warning-expire-license': '##FIRSTNAME##, ##LASTNAME##, ##EMAIL##, ##LICENSENUMBER##, ##EXPIREDAYS##, ##LICENSEDATE##,##LICENSESTATE##, ##LICENSETYPE##, ##LOGINLINKBUTTON## ',
    'expired-license': '##FIRSTNAME##, ##LASTNAME##, ##EMAIL##, ##LICENSENUMBER##, ##EXPIREDAYS##, ##LICENSEDATE##,##LICENSESTATE##, ##LICENSETYPE##, ##LOGINLINKBUTTON## ',

    'accept-offer': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'decline-offer': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'counter-offer': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'send-offer': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'payment-received': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'payment-sent': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,
    'payment-received-admin': '##FIRSTNAME##, ##EMAIL##, ##LOGINLINKBUTTON##' ,

  }

  ckeditorContent: string = '<p>Some html</p>';

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
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
    // uploadUrl: 'v1/image',
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
  templateID: any = "";


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

  onChange($event: any): void {
    console.log("onChange", $event);
  }






  constructor(
    private emailTemplatesService: EmailTemplatesService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.route.params.subscribe(res => {
      this.templateID = res.id;
      if(this.templateID){
        this.getTemplates(false);
      }
    });
  }

  ngOnInit() {
  }

  resetForm(){
    this.template= {
      type: '',
      subject: '',
      content: ''
    }
  }

  getTemplates(type) {
    if( !this.template.type && type ) {
      return false;
    }
    const condition = (type) ? {type : this.template.type} : {_id : this.templateID};
    this.spinner.show();
    this.emailTemplatesService.getTemplate(condition).subscribe(
      data => {
        if (data.status === 200 && data.data && data.data.length) {
          this.template = data.data[0];
        }
        this.spinner.hide();
      }
    );
  }

  createTemplate(){
    if (!this.template.type || !this.template.subject || !this.template.content){
      this.toastr.warning(
        'Please fill all mandatory fields first!',
        'Warning'
      );
      return;
    }
    this.spinner.show();
    this.emailTemplatesService.saveTemplate(this.template).subscribe(
      data => {
        let msg = 'Template created successfully.';
        if (this.template._id) {
          msg = 'Template updated successfully.';
        }
        this.toastr.success( msg, 'Success' );
        this.router.navigate(['/email-templates/list']);
        this.spinner.hide();
        this.resetForm();
      }
    );
  }

  getCursorPosition(tag) {
    var el = document.getElementById('contentBox');
    var val = el['value'];
    console.log("val ------- ", val);
    this.cursorPosition = val.slice(0, el['selectionStart']).length;
    console.log("this.cursorPosition ------- ", this.cursorPosition);
    // this.setHashTag(tag)
  }

  setHashTag(tag){
    var a = this.template.content;
    var b = tag;
    if(!this.cursorPosition){
      this.cursorPosition = 0;
    }
    var position = this.cursorPosition;
    this.template.content = [a.sliice(0, position), b, a.slice(position)].join('');
    this.cursorPosition++;
    this.cursorPosition++;
  }
  preview(){
    if(!this.template.type || !this.template.content){
      this.toastr.warning(
        'Please fill all mandatory fields first!',
        'Warning'
      );
      return;
    }
    this.previewHtml = "";
    let data = {
      template: this.template,
      markerData: {
        firstName: 'John',
        lastname: 'Doe',
        ROLE: 'user',
        email: 'john@gmail.com',
        password: 'john@123',
        PRACTICETYPE: 'practice',
        PROMOCODE: 'AD60L8',
        POSITIONTYPE: 'staff',
        websiteUrl: 'https://dev.densub.com/#/',
        logo: 'https://dev.densub.com/assets/img/brand/Densub_Logo.png',
        RECOVERPASSWORDBUTTON: `<a href="##RECOVERPASSWORDLINK##" Click target="_blank"> <button style="background: #1c4587 !important;color:white;padding: 5px"> Reset Your Password </button> </a>`,
        CONFIRMEMAILBUTTON: `<a href="##VERIFICATIONLINK##" Click target="_blank">
          <button style="margin: 20px 0px;background: #1c4587 !important;color:white;padding: 20px 30px;border: 0;border-radius: 30px;font-weight: 600;">
            CONFIRM YOUR EMAIL
          </button>
        </a>`,
        LOGINLINKBUTTON: `<a href="##LOGINLINK##" Click target="_blank">
          <button style="margin: 20px 0px;background: #1c4587 !important;color:white;padding: 20px 30px;border: 0;border-radius: 30px;font-weight: 600;">
            Login
          </button>
        </a>`
      },
      templatePath: 'public/assets/emailtemplates/'+this.template.type+'.html'
    }
    this.emailTemplatesService.preview(data).subscribe(
      data => {
        this.previewHtml = data.data;
        this.previewModal.show()
      }
    );
  }


}
