import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class FormService {
  forms: FormGroup[] = [];

  constructor() {}

  addForm(form: FormGroup) {
    this.forms.push(form);
  }

  removeForm(form: FormGroup) {
    this.forms.splice(this.forms.findIndex(fm => fm === form), 1);
  }

  enable() {
    this.forms.forEach(form => form.enable());
  }
  disable() {
    this.forms.forEach(form => form.disable());
  }
}
