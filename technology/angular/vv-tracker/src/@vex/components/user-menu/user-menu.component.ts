import { Component, OnInit } from "@angular/core";
import { PopoverRef } from "../popover/popover-ref";
import { Router } from "@angular/router";

@Component({
  selector: "vex-user-menu",
  templateUrl: "./user-menu.component.html",
  styleUrls: ["./user-menu.component.scss"],
})
export class UserMenuComponent implements OnInit {
  constructor(
    private readonly popoverRef: PopoverRef,
    private router: Router
  ) {}

  ngOnInit(): void {}

  signout() {
    localStorage.clear();
    this.router.navigateByUrl("/login");
    setTimeout(() => this.popoverRef.close(), 250);
  }
}
