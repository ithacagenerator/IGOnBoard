import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MemberDataService } from './member-data.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public memberData: MemberDataService,
    public router: Router) { }

  canActivate() {
    if (!this.memberData.email) {
      this.router.navigate(['/welcome']);
      return false;
    }
    return true;
  }
}
