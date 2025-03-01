import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarSectorComponent } from './registrar-sector.component';

describe('RegistrarSectorComponent', () => {
  let component: RegistrarSectorComponent;
  let fixture: ComponentFixture<RegistrarSectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarSectorComponent]
    });
    fixture = TestBed.createComponent(RegistrarSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
