import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEvidenciasComponent } from './form-evidencias.component';

describe('FormEvidenciasComponent', () => {
  let component: FormEvidenciasComponent;
  let fixture: ComponentFixture<FormEvidenciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormEvidenciasComponent]
    });
    fixture = TestBed.createComponent(FormEvidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
