import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule, UrlSegment, UrlMatchResult } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export function excludeApiMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  const path = segments.map(s => s.path).join('/');
  return path.startsWith('api') ? null : ({ consumed: segments });
}

const routes: Routes =[
  {
    path: '',
    matcher: excludeApiMatcher,
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }, {
    path: '',
    matcher: excludeApiMatcher,
    component: AdminLayoutComponent,
    children: [
        {
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
  }]},
  // {
  //   path: '**',
  //   redirectTo: 'dashboard'
  // }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
       useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
