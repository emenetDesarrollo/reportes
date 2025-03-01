import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInstalacionComponent } from './form-instalacion.component';

describe('FormInstalacionComponent', () => {
  let component: FormInstalacionComponent;
  let fixture: ComponentFixture<FormInstalacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormInstalacionComponent]
    });
    fixture = TestBed.createComponent(FormInstalacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
