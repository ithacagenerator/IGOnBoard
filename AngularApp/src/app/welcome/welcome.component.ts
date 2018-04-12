import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ErrorStateMatcher } from '@angular/material/core';
import { MemberDataService } from '../services/member-data.service';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  firstnameFormControl = new FormControl('', [Validators.required]);
  lastnameFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/)
  ]);
  // addressFormControl = new FormControl('', [Validators.required]);

  biodataForm: FormGroup = new FormGroup({
    email: this.emailFormControl,
    firstname: this.firstnameFormControl,
    lastname: this.lastnameFormControl,
    phone: this.phoneFormControl
    // address: this.addressFormControl
  });

  getEmailErrorMessage() {
    return this.emailFormControl.hasError('required') ? 'You must enter a value' :
      this.emailFormControl.hasError('email') ? 'Not a valid email' : '';
  }
  getPhoneErrorMessage() {
    return this.phoneFormControl.hasError('required') ? 'You must enter a value' :
      this.phoneFormControl.hasError('pattern') ? 'Format must be (xxx) xxx-xxxx' : '';
  }
  getRequiredErrorMessage(field) {
    return this.biodataForm.get(field).hasError('required') ? 'You must enter a value' : '';
  }

  constructor(private _memberdata: MemberDataService) { }

  ngOnInit() {
  }

  handleNext() {
    const fields = {};
    Object.keys(this.biodataForm.controls).forEach(k => {
      fields[k] = `${this.biodataForm.controls[k].value}`.trim();
    });
    this._memberdata.updateFields(fields);
  }

}
