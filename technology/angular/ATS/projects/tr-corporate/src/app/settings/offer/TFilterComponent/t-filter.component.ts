import { getRoles } from '../../../utility/store/selectors/roles.selector';
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { fadeAnimation } from '../../../animations';
import { State } from '../../../utility/store/reducers';
import { MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { FilterService } from '../shared/services/filter.service';
import { SETTINGS_LN } from '../../shared/settings.lang';

@Component({
  selector: 'app-t-filter',
  templateUrl: './t-filter.component.html',
  styleUrls: ['./t-filter.component.scss'],
  animations: [fadeAnimation]
})
export class TFilterComponent implements OnInit {

  ln = SETTINGS_LN;

  forRoles = false;

  // Filter data
  sortTypes: any[] = [];
  status = [
    { value: '', viewValue: this.ln.TXT_ALL },
    { value: '0', viewValue: this.ln.TXT_DEACTIVE },
    { value: '1', viewValue: this.ln.TXT_ACTIVE },
    { value: '2', viewValue: this.ln.TXT_PENDING }
  ];
  role: any[] = [];


  // Applied filter data
  selectedStatus!: number;
  selectedRole!: number;
  selectedSort !: string;


  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public bottomsheetRef: MatBottomSheetRef<TFilterComponent>,
    public filterserv: FilterService) {
  }

  ngOnInit(): void {

  }

  dismiss(fallbckData: any = null) {
  }

  onfilter() {
    
  }

  onReset() {

  }

}
