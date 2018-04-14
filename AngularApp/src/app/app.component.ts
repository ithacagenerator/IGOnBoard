import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  showLoader: boolean;
  sub;
  constructor(private loaderService: LoaderService) { }
  ngOnInit() {
    this.sub = this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
