import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidRouteComponent } from './invalid-route.component';

describe('InvalidRouteComponent', () => {
  let component: InvalidRouteComponent;
  let fixture: ComponentFixture<InvalidRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvalidRouteComponent]
    });
    fixture = TestBed.createComponent(InvalidRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
