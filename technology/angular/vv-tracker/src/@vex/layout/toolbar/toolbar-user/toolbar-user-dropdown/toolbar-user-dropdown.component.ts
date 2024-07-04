import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { MenuItem } from "../interfaces/menu-item.interface";
import { trackById } from "../../../../utils/track-by";
import { PopoverRef } from "../../../../components/popover/popover-ref";
import { Router } from "@angular/router";
import { LogoutDialogComponent } from "src/app/pages/shared/logout-dialog/logout-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "src/app/pages/shared/services/auth.service";
import { NavigationService } from "src/@vex/services/navigation.service";

export interface OnlineStatus {
  id: "online" | "away" | "dnd" | "offline";
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: "vex-toolbar-user-dropdown",
  templateUrl: "./toolbar-user-dropdown.component.html",
  styleUrls: ["./toolbar-user-dropdown.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarUserDropdownComponent implements OnInit {
  userName: string = null;
  email: string = null;
  items: MenuItem[] = [
    {
      id: "1",
      icon: "mat:account_circle",
      label: "My Profile",
      description: "Personal Information",
      colorClass: "text-teal",
      route: "/apps/social",
    },
    {
      id: "2",
      icon: "mat:move_to_inbox",
      label: "My Inbox",
      description: "Messages & Latest News",
      colorClass: "text-primary",
      route: "/apps/chat",
    },
    {
      id: "3",
      icon: "mat:list_alt",
      label: "My Projects",
      description: "Tasks & Active Projects",
      colorClass: "text-amber",
      route: "/apps/scrumboard",
    },
    {
      id: "4",
      icon: "mat:table_chart",
      label: "Billing Information",
      description: "Pricing & Current Plan",
      colorClass: "text-purple",
      route: "/pages/pricing",
    },
  ];

  statuses: OnlineStatus[] = [
    {
      id: "online",
      label: "Online",
      icon: "mat:check_circle",
      colorClass: "text-green",
    },
    {
      id: "away",
      label: "Away",
      icon: "mat:access_time",
      colorClass: "text-orange",
    },
    {
      id: "dnd",
      label: "Do not disturb",
      icon: "mat:do_not_disturb",
      colorClass: "text-red",
    },
    {
      id: "offline",
      label: "Offline",
      icon: "mat:offline_bolt",
      colorClass: "text-gray",
    },
  ];

  activeStatus: OnlineStatus = this.statuses[0];

  trackById = trackById;
  role: any;

  constructor(
    private cd: ChangeDetectorRef,
    private popoverRef: PopoverRef<ToolbarUserDropdownComponent>,
    private router: Router,
    private dialog: MatDialog,
    private _authSer: AuthService,
    private navigationService: NavigationService,
  ) {}

  ngOnInit() {
    this.getAdminDetails();
  }

  setStatus(status: OnlineStatus) {
    this.activeStatus = status;
    this.cd.markForCheck();
  }

  close() {
    this.popoverRef.close();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    this.userName = this._authSer.firstName;
    this.email = this._authSer.email;
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

  logout() {
    this.dialog
      .open(LogoutDialogComponent, {
        width: "350px",
        height: "auto",
        disableClose: true,
        panelClass: "confirm-dialog-container",
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this.popoverRef.close();
          localStorage.clear();
          this.router.navigateByUrl("/login");
        }else {
          this.popoverRef.close();
        }
      });
  }

}
