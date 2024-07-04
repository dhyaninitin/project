import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ResultService } from '../../services/result.service';

@Component({
  selector: 'app-update-candidate',
  templateUrl: './update-candidate.component.html',
  styleUrls: ['./update-candidate.component.scss']
})
export class UpdateCandidateComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateCandidateComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      attempts: ['', Validators.required],
      education: ['', Validators.required],
      feedbackRating: ['', Validators.required],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userForm.patchValue({
      firstname: this.data.element?.firstname,
      lastname: this.data.element?.lastname,
      email: this.data.element?.email,
      phone: this.data.element?.phone,
      feedbackRating: this.data.element?.feedbackRating,
      comment: this.data.element?.comment,
      education: this.data.element?.education,
      attempts: this.data.element?.attempts
    })
  }

  onSubmit() {
    this.dialogRef.close(this.userForm.value);
  }

}
