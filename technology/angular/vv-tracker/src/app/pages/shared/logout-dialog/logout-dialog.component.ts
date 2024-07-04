import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-logout-dialog",
  templateUrl: "./logout-dialog.component.html",
  styleUrls: ["./logout-dialog.component.scss"],
})
export class LogoutDialogComponent implements OnInit {
  userName: string = "";
  logoutIcon = "../../../../assets/icons/logouticon-min (1).png";

  constructor(private _authSer: AuthService) {}

  ngOnInit(): void {
    this.getAdminDetails();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.userName = this._authSer.firstName;
  }
}
