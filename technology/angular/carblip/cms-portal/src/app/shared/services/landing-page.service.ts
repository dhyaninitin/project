/*
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class LandingPageService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  public addFix() {
    this.document.documentElement.classList.add('landing');
    this.document.body.classList.add('landing');
  }
  public removeFix() {
    this.document.documentElement.classList.remove('landing');
    this.document.body.classList.remove('landing');
  }
}
