import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { PopoverService } from "../../../components/popover/popover.service";
import { ToolbarUserDropdownComponent } from "./toolbar-user-dropdown/toolbar-user-dropdown.component";
import { AuthService } from "src/app/pages/shared/services/auth.service";

@Component({
  selector: "vex-toolbar-user",
  templateUrl: "./toolbar-user.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarUserComponent implements OnInit {
  userName: any;
  dropdownOpen: boolean;
  role: any;

  constructor(
    private popover: PopoverService,
    private cd: ChangeDetectorRef,
    private _authSer: AuthService
  ) {}

  ngOnInit() {
    this.getAdminDetails();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    this.userName = this._authSer.firstName;
  }
  
  getRoleName(role: number): string {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Manager';
      default:
        return 'Unknown';
    }
  }

  showPopover(originRef: HTMLElement) {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarUserDropdownComponent,
      origin: originRef,
      offsetY: 12,
      position: [
        {
          originX: "center",
          originY: "top",
          overlayX: "center",
          overlayY: "bottom",
        },
        {
          originX: "end",
          originY: "bottom",
          overlayX: "end",
          overlayY: "top",
        },
      ],
    });

    popoverRef.afterClosed$.subscribe(() => {
      this.dropdownOpen = false;
      this.cd.markForCheck();
    });
  }
}
