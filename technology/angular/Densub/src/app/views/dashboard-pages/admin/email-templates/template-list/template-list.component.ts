import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmailTemplatesService } from '../../../../../shared-ui/service/emailTemplates.service';
import { ModalDirective } from 'ngx-bootstrap';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent implements OnInit {
  @ViewChild("previewModal", { static: false }) previewModal: ModalDirective;
  @ViewChild("deleteTemplateModal", { static: false }) deleteTemplateModal: ModalDirective;
  templates: any = [];
  previewHtml: any = '';
  currentTemplate: any;

  constructor(
    private spinner: NgxSpinnerService,
    private emailTemplatesService: EmailTemplatesService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    protected sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getTemplates();
  }

  getTemplates(){
    this.spinner.show();
    this.emailTemplatesService.getTemplate({}).subscribe(
      data => {
        if(data.status == 200){
          this.templates = data.data;
        }
        this.spinner.hide();
      }
    );
  }

  preview(obj){
    this.previewHtml = "";
    let data = {
      template: obj,
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
        RECOVERPASSWORDBUTTON: `<a href="##RECOVERPASSWORDLINK##" Click target="_blank">
        <button style="margin: 20px 0px;background: #1c4587 !important;color:white;padding: 20px 30px;border: 0;border-radius: 30px;font-weight: 600;">
        Reset Your Password
        </button>
        </a>`,
        LOGINLINKBUTTON: `<a href="##LOGINLINK##" Click target="_blank">
          <button style="margin: 20px 0px;background: #1c4587 !important;color:white;padding: 20px 30px;border: 0;border-radius: 30px;font-weight: 600;">
            Login
          </button>
        </a>`
      },
      templatePath: 'public/assets/emailtemplates/'+obj.type+'.html'
    }
    this.emailTemplatesService.preview(data).subscribe(
      data => {
        console.log(data.data);
        this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(data.data);
        this.previewModal.show();
      }
    );
  }

  showDeleteTemplate(template: any) {
    this.currentTemplate = template;
    this.deleteTemplateModal.show();
  }

  deleteTemplate() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.emailTemplatesService
      .deleteTemplate({ _id: this.currentTemplate._id })
      .subscribe(
        data => {
          this.spinner.hide();
          if (data.status === 200) {
            var found = this.templates.filter(obj => {
              return obj._id == this.currentTemplate._id;
            });
            if (found.length) {
              var index = this.templates.indexOf(found[0]);
              this.templates.splice(index, 1);
            }
            this.toastr.success('Record deleted successfully.', 'Success');
          }
          this.deleteTemplateModal.hide();
        },
        error => {
          this.spinner.hide();
          this.deleteTemplateModal.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      );
  }

}
