import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LibraryService } from '../../../settings/offer/shared/services/library.service';
import { TemplateListService } from '../../../settings/offer/shared/services/template-list.service';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { OfferService } from '../../shared/services/offer.service';

@Component({
	selector: 'app-salary-structure',
	templateUrl: './salary-structure.component.html',
	styleUrls: ['./salary-structure.component.scss']
})
export class SalaryStructureComponent implements OnInit {
	@Output() salaryBreakdownStructure = new EventEmitter<any>();
	scrWidth: any;
	templateList: any = []
	verifyOfferTemplate: boolean = false;
	verifyOfferDetails: any;
	selectedTemplateId = '';
	oldJson: any;
	genericJsonObject: any;
	jobCode: string = '';

	constructor(
		public offerService: OfferService,
		private templateListService: TemplateListService,
		private libraryService: LibraryService,
		private snackBar: SnackBarService
		) { }

	ngOnInit(): void {
		this.getGenericSettings()
		this.oldJson = this.offerService.oldJson;
		this.offerService.salaryStructureTemplate.subscribe(res=> {
			if(res){
				let isEmpty = Object.keys(res).length === 0
				if(!isEmpty) {
					this.verifyOfferTemplate = true;
					this.verifyOfferDetails = res;
					this.selectedTemplateId = res.templateid;
					this.offerService.salaryStructureCreated = true;
					this.offerService.salaryBreakdown = [res.salaryStructure[0],res.salaryStructure[1]];
				} else {
					this.verifyOfferTemplate = false;
          			this.offerService.salaryStructureCreated = false;
				}
			}
		})
		this.getAllTemplates(1,1000,'active','');
	}


	next(){
		if(this.verifyOfferTemplate) {
			let salaryInfo = this.offerService.salaryBreakdown;
			delete salaryInfo[1].structure
			const payload = {
				jobid: this.offerService.jobid,
				candidateEmail: this.offerService.email,
				status: 1,
				salarystructure : {
					salaryStructure: salaryInfo,
					templateid: this.selectedTemplateId
				}
			}
        	this.createJson();
			this.offerService.updateSalaryInfo(payload).subscribe(res=>{
				if(res.error) {
					this.snackBar.open(res.message)
				} else {
					let finalJson = Object.assign({}, ...this.offerService.offerJSON)
					this.generateOfferDocument(finalJson);
					this.offerService.step += 1;
				}
			})
			this.offerService.salaryStructureCreated = true;
		} else {
			this.snackBar.open("Please select one offer template");
		}
	}

	previous() {
		this.offerService.step -= 1;
	}


	getAllTemplates(pageNumber: number, limit: number, searchText: string, sortBy: string) {
		this.templateListService.getTemaplteList(pageNumber, limit, searchText, sortBy).subscribe( (res) => {
			if (res.error) {
				// error from api
				this.snackBar.open(res.message);
				this.templateList = [];
			} else {
				// success from api
				this.snackBar.open(res.message);
				this.templateList = res.data;
			}
		})
	}

	previousData = '';
	selectedTemplate(template: any) {
		this.verifyOfferTemplate = false;
		if(this.previousData == template.templateid) {
			this.verifyOfferTemplate = true;
		} else {
			setTimeout(() => {
				this.verifyOfferTemplate = true;
				this.verifyOfferDetails = template;
				// this.offerService.salaryStructureTemplate.next(template);
				this.previousData = template.templateid;
				}, 100);
		}
		this.downloadOfferTemplate(template.offerdocument.documentpath, template.offerdocument.documentname)
	}

	salaryBreakdown($event: any) {
		this.salaryBreakdownStructure.emit($event);
	}

	changeCurrency($event: any) {
		this.offerService.currencyType = $event;
	}

	downloadOfferTemplate(path: string, filename: string) {
		this.libraryService.download(path, filename).subscribe(res=>{
			if(res.error){}
			else {
				this.offerService.offerJSON.push({"templateUrl" : res.data.url});
			}
		})
	}

	generateOfferDocument(json: any) { 
		if(JSON.stringify(json) === JSON.stringify(this.oldJson) && this.offerService.offerUrl.length > 2) {
			this.offerService.equalJSON = true;
		} else {
			this.offerService.equalJSON = false;
			this.offerService.oldJson = json;
			this.offerService.generateOfferDocument(json).subscribe(res=> {
				if(res.error) {
					this.snackBar.open(res.message);
				} else {
					this.snackBar.open(res.message);
					const document = {
						path: res.path,
						fileName: res.fileName,
						extension: 'DOC',
						jobid: this.offerService.jobid,
						email: this.offerService.email
					}
          this.libraryService.download(document.path, document.fileName).subscribe(res=>{
            if(res.error){}
            else {
				this.offerService.offerUrl = res.data.url;
            //   const payload = {
            //     jobid: document.jobid,
            //     email: document.email,
            //     docUrl: res.data.url
            //   }
			//   console.log(payload)
            //   this.offerService.generateDocToPdf(payload).subscribe(res=> {
            //     if(res.error) {} else {
            //       this.libraryService.download(res.data.path, res.data.fileName).subscribe(res=>{ 
            //         if(res.error) {} else {
            //           this.offerService.offerUrl = res.data.url;
            //         }
            //       })
            //     }
            //   })
            }
          })
				}
			}) 
		}
	}

	createJson() {
		let generalInfo: any = [];
		this.offerService.generalInfoForm.subscribe(res => {
			if(res) {
				generalInfo = res;
			}
		})
		let salaryStructure : any = {};
		let salaryDetails: any = {};
		let customFields: any = {};
		const object = {
			"##CandidateName##" : this.offerService.candidateInfo.firstname + " " + this.offerService.candidateInfo.middlename + " " + this.offerService.candidateInfo.lastname,
			'##ApprovedDate##' : new Date().getDate() + "/" +new Date().getMonth() + "/" + new Date().getFullYear(),
			'##State##' : generalInfo.offerLocation,
			'##CanLocation#' : generalInfo.offerLocation,
			'##Country##' : "India",
			'##CanEmail##' : this.offerService.candidateInfo.email,
			'##PhoneNo##' : this.offerService.candidateInfo.primaryphone,
			// '##ComOfferId##' : 
			'##OfferCTC##' : this.offerService.totalSalary,
			// '##DepartmentName##' : 
			'##Designations##' : generalInfo.offerDesignation,
			// '##OfficeOfPosting##'
			'##JoiningDate##' : this.offerService.dateOfJoining,
			// '##ClientLocation##'
			// '##OfferSender##' : 
			'##UserDesignation##' : generalInfo.offerDesignation,
			// '##SenderMobileNo##'
			'##PositionTitle##' : generalInfo.offerDesignation,
			'##TentativeDOJ##' : this.offerService.dateOfJoining,
			'##OfferCTCInWord##' : this.offerService.totalSalary,
			// '##GenderSalutation##'
			// '##CanAddress##'
			'##JobID##' : this.jobCode,
			// '##ReportingManager##'
			// '##Level##' : 
			// '##ReferenceId##' : ,
			'##OfferCreatedDate##': new Date().getDate() + "/" +new Date().getMonth() + "/" + new Date().getFullYear(), 
			"##CurrentDate##" : new Date().getDate() + "/" +new Date().getMonth() + "/" + new Date().getFullYear(), 
		}

		this.offerService.salaryBreakdown[0].map((offer: any) => {
			let title = offer.title.split(' ').join('');
			salaryStructure['##'+title+'##'] = offer.amount;
			salaryDetails[title] = offer.amount;
		})
		let arr = [object, salaryStructure];
		if(this.offerService.salaryBreakdown[1].customfields.length > 0) {
			this.offerService.salaryBreakdown[1].customfields.map( (customField:any) => {
				let keyName = Object.keys(customField)[0];
				let key = keyName.split('_').join('')
				customFields['##'+ key +'##'] = customField[keyName]
			})
			arr.push(customFields);
		}

		let secondArr = [this.genericJsonObject, {"details": salaryDetails}]
		this.offerService.offerJSON.push({"hashcodes" : Object.assign({}, ...arr)});
		this.offerService.offerJSON.push({"salaryStructure": Object.assign({}, ...secondArr)})
	}

	getGenericSettings() {
		this.genericJsonObject = {};
		this.offerService.getGenericSettings().subscribe(res=> {
			if(res.error) {
				this.snackBar.open(res.message)
			} else {
				let genericSettigs = res.data;
				let keyName = Object.keys(genericSettigs);
				this.genericJsonObject["heading"] = 'CTC';
				keyName.map(key=> {
					if(key !== 'allowtoaddcc' && key !== 'allowedccmails' && key !== 'jobtype' && key !== 'offerrelase' && key !== 'createdtime' && key !== 'modifiedtime') {
						this.genericJsonObject[key] = genericSettigs[key];
					}
				})
				this.jobCode = genericSettigs['jobcode']; 
				this.offerService.jobCode = this.jobCode; 
			}
		});
	}
}
