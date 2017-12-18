import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoginService, UserLoader } from 'front-end-common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends UserLoader implements OnInit {

  currentLanguage: string = 'pt';
  browserLanguage: string;

  practitionerReadPermission: boolean;

  constructor(private translate: TranslateService,
              loginService: LoginService,
              router: Router) {
    super(loginService, router);

    this.checkPermission();

    translate.addLangs(['en', 'pt']);

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(this.currentLanguage);

    this.browserLanguage = translate.getBrowserLang();
    translate.use(this.currentLanguage);
  }

  ngOnInit() {
    super.ngOnInit();
    this.fontSizeInitialState();
    this.scrollToTopOnRouteChange();
  }

  // Set the initial stat of the font size
  fontSizeInitialState() {
    const fontSize = sessionStorage.getItem('fontSize');
    if (fontSize === null || fontSize === undefined) {
      sessionStorage.setItem('fontSize', '0');
    }
  }

  // Check practitioner's permissions to access some pages
  checkPermission() {
    this.loginService.getMeSubject().subscribe(me => {
      if (me != null && !this.loginService.isPatient()) {
        // this.practitionerReadPermission = this.loginService.hasPermission('IDENTIFICATION_PRACTITIONER', 'READ');
        this.practitionerReadPermission = true;
      }
    });
  }

  protected handleAccess() {
    console.log('USER TYPE => ', this.type);

    if (this.type === 'patient') {
      console.log('Patient login detected, redirecting to login page');
      this.router.navigate(['/patient']);
    }

    if (this.type === 'employee' && this.practitionerReadPermission) {
      this.router.navigate(['/practitioner/patients']);
    }
  }

  // Scroll the page to top by default on route change
  scrollToTopOnRouteChange() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
