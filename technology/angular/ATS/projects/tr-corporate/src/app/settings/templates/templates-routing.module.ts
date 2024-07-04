import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'email'
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'email'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
