import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiver',
  templateUrl: './waiver.component.html',
  styleUrls: ['./waiver.component.css']
})
export class WaiverComponent implements OnInit {

  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
  }

  handleNext() {
    this._router.navigate(['/additional-info']);
  }
}
