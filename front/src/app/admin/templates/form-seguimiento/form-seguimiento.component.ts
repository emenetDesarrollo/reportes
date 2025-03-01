import { Component, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GenerarReporteComponent } from '../../modules/reportes/generar-reporte/generar-reporte.component';
import { CambioDomicilioComponent } from '../../modules/reportes/cambio-domicilio/cambio-domicilio.component';
import { AgendarVisitaComponent } from '../../modules/visitas/agendar-visita/agendar-visita.component';

@Component({
	selector: 'app-form-seguimiento',
	templateUrl: './form-seguimiento.component.html',
	styleUrls: ['./form-seguimiento.component.css']
})
export class FormSeguimientoComponent {
	@Input() seguimiento: any = [];
	@Input() inputSeguimiento: any;
	@Input() infoSeguimiento: any;
	@Input() edit: any;
	@Input() detalleReporte: any;
	@Input() from: string = '';

	protected imagenCompletaVisible: any;
	protected indiceImagenActual: any;
	protected imagenCompleta: any;

	constructor (
		private sanitizer: DomSanitizer,
		private parent1: GenerarReporteComponent,
		private parent2: CambioDomicilioComponent,
		private parent3: AgendarVisitaComponent
	) {}

	protected editarUltimoSeguimiento (info: string): void {
		this.inputSeguimiento.value = info;
		this.infoSeguimiento.nativeElement.focus();
		this.edit.value = true;
	}

	protected urlImagen(img64: any = null): any {
		return img64 != null ? this.sanitizer.bypassSecurityTrustUrl(img64) : null;
	}

	protected abrirImagenCompleta(imagenBase64: string) {
		this.imagenCompleta = this.urlImagen(imagenBase64);
		this.imagenCompletaVisible = true;
	}

	protected cerrarImagenCompleta() {
		this.imagenCompletaVisible = false;
	}

	protected eliminarAnexoSeguimiento () {
		switch (this.from) {
			case 'reporte':
				this.parent1.eliminarAnexoSeguimiento();
			break;
			case 'cambio_domicilio':
				this.parent2.eliminarAnexoSeguimiento();
			break;
			case 'visita':
				this.parent3.eliminarAnexoSeguimiento();
			break;
		}
	}
}