import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberCardComponent } from './components/member-card/member-card.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { SharedMaterialModule } from '../../shared/material.module';
import {DashboardComponent} from "./components/Dashboard/dashboard.component";

@NgModule({
  declarations: [],
    imports: [CommonModule, SharedMaterialModule, MemberCardComponent, MemberListComponent, DashboardComponent],
  exports: [MemberCardComponent, MemberListComponent]
})
export class MembersModule {}
