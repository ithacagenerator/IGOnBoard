import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDataService } from '../services/member-data.service';

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css']
})
export class AdditionalInfoComponent {

  constructor(
    private _router: Router,
    private _memberData: MemberDataService) { }

  handleNext() {
    this._memberData.updateFields({additional_info_complete: true});
    this._memberData.setAdditionalInfoComplete(true);

    // api stuff and fallback

    this._router.navigate(['/payment']);
  }
}
