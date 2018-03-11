import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipPoliciesComponent } from './membership-policies.component';

describe('MembershipPoliciesComponent', () => {
  let component: MembershipPoliciesComponent;
  let fixture: ComponentFixture<MembershipPoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembershipPoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
