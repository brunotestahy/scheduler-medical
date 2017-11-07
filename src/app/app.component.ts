import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  currentLanguage: string = 'pt';
  browserLanguage: string;

  constructor(private translate: TranslateService,
              private loginService: LoginService,
              private router: Router) {
    translate.addLangs(['en', 'pt']);

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(this.currentLanguage);

    this.browserLanguage = translate.getBrowserLang();
    translate.use(this.currentLanguage);
  }

  ngOnInit() {
    this.savePatientCredentials();
  }

  // Save information about the logged patient
  savePatientCredentials() {
    sessionStorage.clear();

    this.loginService.me()
      .subscribe(response => {
        this.loginService.setLoginState(true);
        if (this.loginService.isPatient()) {
          sessionStorage.setItem('patient', JSON.stringify(response));
          // this.router.navigate(['/scheduler-patient']);
        } else {
          sessionStorage.setItem('practitioner', JSON.stringify(response));
          // this.router.navigate(['/scheduler-practitioner/patients']);
        }

      }, error => {
        console.error('Error during login => ', error);
        this.loginService.setPatient(false);
        this.router.navigate(['/login']);
      });
  }

}
