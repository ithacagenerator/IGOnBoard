import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-membership-policies',
  templateUrl: './membership-policies.component.html',
  styleUrls: ['./membership-policies.component.css']
})
export class MembershipPoliciesComponent implements OnInit {

  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
  }

  handleNext() {
    this._router.navigate(['/waiver']);
  }
}
