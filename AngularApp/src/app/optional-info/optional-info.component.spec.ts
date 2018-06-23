import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalInfoComponent } from './optional-info.component';

describe('OptionalInfoComponent', () => {
  let component: OptionalInfoComponent;
  let fixture: ComponentFixture<OptionalInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionalInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
