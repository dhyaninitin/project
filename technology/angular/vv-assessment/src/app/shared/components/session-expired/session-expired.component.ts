import { Component } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-session-expired',
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.scss']
})
export class SessionExpiredComponent {

  constructor(private commonService: CommonService) {
    this.commonService.logout();
  }
}
