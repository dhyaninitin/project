import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  SimpleChanges,
  ElementRef,
  ViewChild,
  TemplateRef,
  Renderer2,
} from "@angular/core";
import { Observable, of } from "rxjs";
import { MatDrawer } from "@angular/material/sidenav";

import { fadeAnimation } from "../../../animations";
import { ValidationConstants } from "../../../utility/configs/app.constants";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
//import { UserService } from '../shared/services/user.service';
import { State } from "../../../utility/store/reducers";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";
import { Irole } from "../../../utility/store/interfaces/role";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { SETTINGS_LN } from "../../shared/settings.lang";
//import { GetUser_response } from './../shared/interfaces/get-user';
import { GetUser_response } from "../../permission/shared/interfaces/get-user";
import { getUserEmail } from "../../../utility/store/selectors/user.selector";
import { Subscription } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { CountryCodes } from "../../../auth/register/countrycodes";
import { MatOptionSelectionChange } from "@angular/material/core";
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from "ngx-file-drop";
import { DesignService } from "../../../utility/services/design.service";
import { LibraryService } from "../shared/services/library.service";
import { DocumentI } from "../shared/interfaces/documents";
import { TemplateListService } from '../shared/services/template-list.service';
import { UploadImageService } from "../../../account/shared/upload-image.service";
import { v1 as uuidv1 } from 'uuid';
@Component({
  selector: "app-associate-user",
  templateUrl: "./associate-user.component.html",
  styleUrls: ["./associate-user.component.scss"],
  animations: [fadeAnimation],
})
export class AssociateUserComponent implements OnInit {
  @Input() documentInfo: any;
  @Input() offertemplateid: string = '';
  @Output() updateConfirm = new EventEmitter<boolean>(false);
  
  userInfo: any = [];
  pdfUrl = '';
  extension: any;
  userid: number = 0;
  deletedDoc = false;


  newUser!: any;
  isLoading = false;
  selected2 = "pankaj";
  roles: Irole[] = [];
  businessverticals!: any[];
  countrycodes = CountryCodes;
  rolesData: any;
  viewLibrary: boolean = false;
  LibraryView: boolean = false;
  rolesArray: any;
  reviseDocuments: DocumentI[] = [];
  displayedColumns = ["document", "uploadedBy", "uploadedOn"];
  @Input() edit: boolean = false;
  @Input() userEmail!: string;
  @Input() isOpen: boolean = false;
  dataimage: any;
  @ViewChild("dialogRef")
  dialogRef!: TemplateRef<any>;
  myFooList = [
    "Some Item",
    "Item Second",
    "Other In Row",
    "What to write",
    "Blah To Do",
  ];
  @ViewChild("fileInput")
  fileInput!: ElementRef;
  fileAttr = "";
  @Output() statusChange = new EventEmitter();
  @Output() userUpdate = new EventEmitter();

  getaccountrole: any;
  user!: GetUser_response["data"] | null;
  accountID!: string;
  isCurrentUser!: boolean;
  selectedDocumentDetail: any;

  ln = SETTINGS_LN;

  isDisabled = false;
  userAPISubscription!: Subscription;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;

  constructor(
    private snackBar: SnackBarService,
    public designService: DesignService,
    public dialog: MatDialog,
    private libraryService: LibraryService,
    private templateListService: TemplateListService,
    private uploadImageService: UploadImageService,
    private renderer: Renderer2
  ) {}

  onCategorySelection(role: any) {
    this.getaccountrole = role;
  }

  uploadFileEvt(imgFile: any) {}

  ngOnInit(): void {
    this.deletedDoc = false;
    if(this.documentInfo.extension !== "") {
    }
  }

  getOfferReviseDocuments(offerdocumentid: string) {
    this.libraryService.getReviseDocument(offerdocumentid).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.reviseDocuments = res.data;
        this.snackBar.open(res.message);
      }
    })
  }

  downloadDocument(element: any) {
    this.libraryService.download(element.documentpath, element.documentname).subscribe(res=>{
      if(res.error){}
      else{
        const link = this.renderer.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', res.data.url);
        link.setAttribute('download', 'text.pdf');
        link.click();
        link.remove()
      }
    })
  }

  addDocumentFromLib($event: any) {
    const payload = {
      templateid: this.offertemplateid,
      offerdocument: {
        offerdocumentid: $event.offerdocumentid,
        documentname: $event.documentname,
        documentoriginalname: $event.documentoriginalname,
        extension: $event.extension.toUpperCase(),
        documentpath: $event.documentpath,
        size: $event.size,
      }
    }
    this.templateListService.updateTemplateById(payload).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.getTemplateById(this.offertemplateid);
        this.deletedDoc = false;
        this.getOfferReviseDocuments($event.offerdocumentid);
        this.updateConfirm.emit(true);
      }
    });
  }

  deleteDocument() {
    const payload = {
      templateid: this.offertemplateid,
      offerdocument: {
        offerdocumentid: '',
        documentname: '',
        documentoriginalname: '',
        extension: '',
        documentpath: '',
        size: ''
      }
    }
    this.templateListService.updateTemplateById(payload).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.deletedDoc = true;
        this.updateConfirm.emit(true);
        this.getOfferReviseDocuments('');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {}


  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.getFileInfo(files);
  }

  getFileInfo(files: NgxFileDropEntry[]) {
    const droppedFile = files[0]
      if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          if (this.libraryService.isFileSizeAllowed(file.size)) {
            const fileSize = this.libraryService.formatBytes(file.size);
            this.extension = this.extension[1];

            // Genreate Presigned URL 
            this.libraryService.generatePresignedURL(this.extension).subscribe(res => {
              if (res.error) {
                this.snackBar.open(res.message);
              } else {
                const payload = {
                  offerdocumentid: uuidv1(),
                  documentname: res.data.fileName,
                  documentoriginalname: droppedFile.fileEntry.name,
                  extension: this.extension,
                  documentpath: res.data.bucketPath,
                  size: fileSize
                }
                  this.uploadImageService.upload(res.data.url, file).subscribe((res: any) => {
                    this.saveOfferDocument(payload);
                  });
                this.snackBar.open(res.message);
              }
            }) 
          } else {
            this.snackBar.open("Max size of a file allowed is 10 MB, files with size more than 1mb are discarded.");
          }
        });
      } else {
        this.snackBar.open("Only files in '.pdf, .docx, .doc, .jpg' format are accepted and directories are not allowed.");
      }
}

  
isFileAllowed(fileName: string) {
  let isFileAllowed = false;
  const allowedFiles = ['.pdf', '.jpg', '.doc', '.docx'];
  const regex = /(?:\.([^.]+))?$/;
  this.extension = regex.exec(fileName);
  if (undefined !== this.extension && null !== this.extension) {
    for (const ext of allowedFiles) {
      if (ext === this.extension[0]) {
        isFileAllowed = true;
      }
    }
  }
  return isFileAllowed;
 }


 saveOfferDocument(documentInfo: any) {
  documentInfo.status = documentInfo.status = 0;
  documentInfo.latestversionid = '';
  documentInfo.offerdocumentid = documentInfo.offerdocumentid,
  this.libraryService.createOfferDocument(documentInfo).subscribe(res => {
    if(res.error) {
      this.snackBar.open(res.message);
    } else {
      this.snackBar.open(res.message);
      this.addDocumentFromLib(documentInfo);
    }
  })
 }


getTemplateById(templateid: string) {
  this.templateListService.getTemplateById(templateid).subscribe(res => {
    if(res.error) {
      this.snackBar.open(res.message);
    } else {
      this.snackBar.open(res.message);
      this.documentInfo = res.data.offerdocument;
    }
  })
}

  public fileOver(event: any) {}

  public fileLeave(event: any) {}
  reloadForm() {}
  
  uploadLibrary() {
    this.drawer.open();
    this.LibraryView = false;
    this.viewLibrary = true;
  }

  viewDocument(document: any) {
    this.drawer.open();
    this.LibraryView = true;
    this.viewLibrary = false;
    this.selectedDocumentDetail = document;
  }

  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }
  upload() {
    const myTempDialog = this.dialog.open(this.dialogRef, {
      data: this.myFooList,
    });
  }
  ngOnDestroy() {}
}
