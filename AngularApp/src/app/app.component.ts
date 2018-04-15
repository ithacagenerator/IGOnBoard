import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  showLoader: boolean;
  subs = [];
  constructor(
    private loaderService: LoaderService,
    private _router: Router) { }
  ngOnInit() {
    this.subs.push(this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    }));

    this.subs.push(this._router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    }));
  }
  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
