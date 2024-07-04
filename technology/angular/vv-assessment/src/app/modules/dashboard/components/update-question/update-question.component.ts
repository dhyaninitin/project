import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.scss']
})
export class UpdateQuestionComponent {
  questionform: FormGroup;
  categories = ['JS', 'SQL', 'HTML & CSS', 'C & C++', 'C#', 'Aptitude'];
  levels = ["1", "2", "3"];
  answers = ['A', 'B', 'C', 'D'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateQuestionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.questionform = this.fb.group({
      question: ['', Validators.required],
      category: ['', Validators.required],
      level: ['', [Validators.required]],
      a: ['', Validators.required],
      b: ['', Validators.required],
      c: ['', Validators.required],
      d: ['', Validators.required],
      answer: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.questionform.patchValue({
      question: this.data.element?.question,
      category: this.data.element?.category,
      level: this.data.element?.level,
      a: this.data.element?.a,
      b: this.data.element?.b,
      c: this.data.element?.c,
      d: this.data.element?.d,
      answer: this.data.element?.answer
    })
  }

  onSubmit() {
    this.questionform.value.questionId = this.data.element?._id
    this.dialogRef.close(this.questionform.value);
  }
}
