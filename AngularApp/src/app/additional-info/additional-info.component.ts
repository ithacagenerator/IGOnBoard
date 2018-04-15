import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css']
})
export class AdditionalInfoComponent {

  constructor(
    private _router: Router) { }

  handleNext() {
    this._router.navigate(['/payment']);
  }
}
