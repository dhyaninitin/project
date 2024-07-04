import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { DealStageService } from "app/shared/services/apis/dealstage.service";
import { AppState } from "app/store";
import * as actions from 'app/store/dealstage/dealstage.actions';

@Component({
	selector: 'app-dealstage-add-edit-modal',
	templateUrl: './add-edit-modal.component.html',
	styleUrls: ['./add-edit-modal.component.scss'],
})


export class DealStageAddEditModalComponent implements OnInit {
    public itemForm: FormGroup;
    public saving: Boolean = false;
    public pipelines = [
        { id: 1, name: "Sales" },
        { id: 2, name: "Concierge" }
    ];
    public type: string;
    public saveButtonLabel;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<DealStageAddEditModalComponent>,
        private fb: FormBuilder,
        private service$: DealStageService,
        private store$: Store<AppState>,
    ) {
        this.itemForm = this.fb.group({
            label: ['', Validators.required],
            pipeline: ['', Validators.required]
        });
    }
    ngOnInit(): void {
        this.type = this.data.type;
		if (this.type === 'edit') {
			this.saveButtonLabel = 'UPDATE';

            const pipeline = this.pipelines.filter(pipeline => pipeline.name == this.data.payload.pipeline);
            if(pipeline.length > 0) {
                this.data.payload.pipeline = pipeline[0].id;
            }

            this.itemForm.setValue({ label: this.data.payload.label, pipeline: this.data.payload.pipeline });
		} else {
			this.saveButtonLabel = 'CREATE';
		}
    }

    submit() {
        if(this.itemForm.valid) {
            this.saving = true;
            const { value } = this.itemForm;
            if(this.type == 'edit') {
                // update deal stage
                const payload = {
                    id: this.data.payload.id,
                    data: {
                        label: value.label,
                        pipeline: value.pipeline
                    }
                  };
                this.store$.dispatch(new actions.Update(payload));
                this.dialogRef.close(true);
                this.saving = false;
            } else {
                // Add deal stage
                this.service$.create(value).subscribe(res => {
                    this.saving = false;
                    if (!res.error) {
                        const { data } = res;
                        this.saving = false;
                        this.dialogRef.close(data);  
                    }
                })
            }
        }
    }
}