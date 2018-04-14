import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MemberDataService } from '../services/member-data.service';
@Component({
  selector: 'app-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavLinksComponent implements OnInit {

  showHamburger = false;

  constructor(public _memberdata: MemberDataService) { }

  toggleHamburger() {
    this.showHamburger = !this.showHamburger;
  }

  ngOnInit() {
  }

}
