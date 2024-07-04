import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { ExaminationService } from '../../services/examination.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlatformLocation } from '@angular/common';
import * as CryptoJS from 'crypto-js';


@Component({
  selector: 'app-test-questions',
  templateUrl: './test-questions.component.html',
  styleUrls: ['./test-questions.component.scss']
})
export class TestQuestionsComponent implements OnInit, OnDestroy {
  testQuestion: any = [];
  questionsForm !: FormGroup;
  counter = 2700;
  timer: any;
  autoSubmit: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    event.preventDefault();
    event.returnValue = '';
    return 'Are you sure you want to leave this page?';
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService,
    private examinationService: ExaminationService,
    private snackbar: MatSnackBar,
    private platformLocation: PlatformLocation
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    })
  }

  ngOnInit() {
    document.documentElement.requestFullscreen();
    this.getQuestions();
    this.timer = setInterval(() => {
      this.counter--;
      if (this.counter === 0) {
        this.autoSubmit = true;
        this.onSubmit();
        clearInterval(this.timer);
      }
    }, 1000);

    if (localStorage.getItem('currentPage') == 'description') {
      localStorage.setItem('currentPage', 'questions')
    } else {
      this.commonService.logout();
      this.router.navigateByUrl('/session-expired')
    }

    // const isLeaving = sessionStorage.getItem('isLeaving');
    // if (isLeaving && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
    //   sessionStorage.removeItem('isLeaving'); // Remove the flag
    //   this.router.navigateByUrl('/sign-up');
    // }

    // window.onbeforeunload = () => {
    //   sessionStorage.setItem('isLeaving', 'true');
    // };

  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  getQuestions() {
    this.examinationService.startTest().subscribe((res: any) => {
      if (res.status == 200) {
        const bytes = CryptoJS.AES.decrypt(res.data, 'hereisthesecretkeyforencryption');
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText)
        this.testQuestion = JSON.parse(originalText);
        this.createForm();
      } else {
        this.router.navigateByUrl('/session-expired')
      }
    })
  }

  createForm(): void {
    const group: any = {};
    this.testQuestion.forEach((category: any) => {
      category.data.forEach((question: any) => {
        group[question._id] = new FormControl('', Validators.required);
      });
    });
    this.questionsForm = this.fb.group(group);
  }



  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  onSubmit() {
    if (!this.autoSubmit) {
      if (this.questionsForm.invalid) {
        this.snackbar.open('All Questions Are Compulsory', 'Cancel', { duration: 3000 });
        return;
      }
    }
    const userAnswers = this.questionsForm.value;
    const result: { userId: any; questionId: any; answer: any; userAnswer: any; }[] = [];
    this.testQuestion.forEach((category: any) => {
      category.data.forEach((question: any) => {
        const answer = {
          userId: this.commonService.getUserDetails().userId,
          questionId: question._id,
          answer: question.answer,
          userAnswer: (userAnswers[question._id]).toUpperCase() || 'No answer provided'
        };
        result.push(answer);
      });
    });
    this.examinationService.submitTest({ answers: result }).subscribe((res: any) => {
      if (res.status == 200) {
        this.router.navigateByUrl('/test/test-complete')
      }
    });
  }

}
