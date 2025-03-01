import { Component, Input } from '@angular/core';
import { AgendarInstalacionComponent } from '../../modules/instalaciones/agendar-instalacion/agendar-instalacion.component';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-form-servicio',
	templateUrl: './form-servicio.component.html',
	styleUrls: ['./form-servicio.component.css']
})
export class FormServicioComponent extends FGenerico{
	@Input() formServicio: any;
	@Input() formInstalacion: any;
	@Input() detalleInstalacion: any;

	constructor(
		protected parent: AgendarInstalacionComponent
	) {
		super();
	}
}