import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModule as FrontEndLoginModule } from 'front-end-common';

import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FrontEndLoginModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
