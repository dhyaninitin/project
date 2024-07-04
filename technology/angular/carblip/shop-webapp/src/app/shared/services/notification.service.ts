import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable()

/*
 * Genernal Notifcation Service
 */
export class NotificationService {
  defaultOption = {
    timeOut: 3000,
  };
  title = 'CarBlip';
  constructor(private toastrService: ToastrService) {}

  /*
   * Show success notification with details
   * @param content string - message content of notification box
   * @param title string - title of notifcaiton box
   * @param options object - setting for notification box
   * @return
   */
  success(content = '', title = this.title, options = {}) {
    const newOption = Object.assign(this.defaultOption, options);
    this.toastrService.clear();
    this.toastrService.success(content, title, newOption);
  }

  /*
   * Show warning notification with details
   * @param content string - message content of notification box
   * @param title string - title of notifcaiton box
   * @param options object - setting for notification box
   * @return
   */
  // Show warning notification with details
  warning(content = '', title = this.title, options = {}) {
    const newOption = Object.assign(this.defaultOption, options);
    this.toastrService.clear();
    this.toastrService.warning(content, title, newOption);
  }

  /*
   * Show error notification with details
   * @param content string - message content of notification box
   * @param title string - title of notifcaiton box
   * @param options object - setting for notification box
   * @return
   */

  error(content = '', title = this.title, options = {}) {
    const newOption = Object.assign(this.defaultOption, options);
    this.toastrService.clear();
    this.toastrService.error(content, title, newOption);
  }
}
