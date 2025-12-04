import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { MembersModule } from './features/members/members.module';
import { SharedMaterialModule } from './shared/material.module';

@NgModule({
  declarations: [],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SharedMaterialModule,
        CoreModule,
        MembersModule,
        AppComponent
    ],
  providers: []
})
export class AppModule {}
