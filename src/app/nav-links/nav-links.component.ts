import { Component, OnInit } from '@angular/core';
import { MemberDataService } from '../services/member-data.service';
@Component({
  selector: 'app-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.css']
})
export class NavLinksComponent implements OnInit {

  constructor(private _memberdata: MemberDataService) { }

  ngOnInit() {
  }

}
