import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SkillTypeComponent } from './skill-type.component';


const routes: Routes = [
  { path: '', component: SkillTypeComponent , data: { title: 'Skill Type' }, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkillTypeRoutingModule { }
