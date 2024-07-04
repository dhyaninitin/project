import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { FormControlService } from 'app/shared/services/form-control.service';
import { MailchimpService } from 'app/shared/services/mailchimp.service';

import { MARKET_URL, PREQUALIFY_URL } from 'app/core/constant';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public subscriptionForm: FormGroup;

  public market_url: string;
  public prequalify_url: string;
  currentYear: number = new Date().getFullYear();

  constructor(
    private mailchimpService$: MailchimpService,
    private formControlService: FormControlService,
    private formBuilder: FormBuilder,
    private notificationService$: NotificationService
  ) {
    this.market_url = MARKET_URL;
    this.prequalify_url = PREQUALIFY_URL;
  }

  ngOnInit() {
    this.subscriptionForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
  }

  onSubscribe() {
    if (this.subscriptionForm.valid) {
      const params = {
        email: this.subscriptionForm.value.email,
      };

      this.mailchimpService$.sendSubscriptionRequest(params).subscribe(data => {
        if (data['result'] === 'success') {
          this.notificationService$.success(data['msg']);
        } else {
          this.notificationService$.warning('You are already subscribed');
        }
      });
    } else {
      // show messages
      this.formControlService.validateAllFormFields(this.subscriptionForm);
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
