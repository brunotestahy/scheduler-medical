import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LoginService } from '../../services/login.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService,
              private router: Router) {
  }

  // Return if the to-do page may be accessed or not
  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean | Promise<boolean> | Observable<boolean> {
    return this.loginService.fetchLoginState$
      .map((isLogged: boolean) => {
        console.log('Login State => ', isLogged);
        if (!isLogged) {
          this.router.navigate(['/login']);
        }
        return isLogged;
      });
  }

}
