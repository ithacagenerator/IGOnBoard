import { Component, OnInit } from '@angular/core';
import { MemberDataService } from '../services/member-data.service';
@Component({
  selector: 'app-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss']
})
export class NavLinksComponent implements OnInit {

  constructor(public _memberdata: MemberDataService) { }

  ngOnInit() {
  }

}
