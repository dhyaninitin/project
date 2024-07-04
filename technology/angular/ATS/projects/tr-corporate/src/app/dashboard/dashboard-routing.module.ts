import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashabordComponent } from "./dashabord.component";
import { StatsComponent } from "./stats/stats.component";

const routes: Routes = [
  {
    path: "",
    component: DashabordComponent,
    children: [
      {
        path: "",
        component: StatsComponent,
      },
      {
        path: "settings",
        loadChildren: () =>
          import("../settings/settings.module").then((m) => m.SettingsModule),
      },
      {
        path: "account",
        loadChildren: () =>
          import("../account/account.module").then((m) => m.AccountModule),
      },
      {
        path: "candidate",
        loadChildren: () =>
          import("../candidate/candidate.module").then(
            (m) => m.CandidateModule
          ),
      },
      {
        path: "jobs",
        loadChildren: () =>
          import("../offer/offer.module").then((m) => m.JobOfferModule),
      },

      {
        path: "",
        pathMatch: "full",
        redirectTo: "",
      },
      {
        path: "**",
        redirectTo: "",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
