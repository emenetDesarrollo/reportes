import { Component, Input } from '@angular/core';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { AgendarInstalacionComponent } from '../../modules/instalaciones/agendar-instalacion/agendar-instalacion.component';

@Component({
	selector: 'app-form-instalacion',
	templateUrl: './form-instalacion.component.html',
	styleUrls: ['./form-instalacion.component.css']
})
export class FormInstalacionComponent extends FGenerico{
	@Input() formInstalacion: any;
	@Input() planes: any;
	@Input() disponibilidad: any;
	@Input() fecha: any;

	constructor (
		protected parent: AgendarInstalacionComponent
	) {
		super();
	}

	public obtenerFechaHora(inputFecha: string): any {
		this.formInstalacion.markAsDirty();

		const fecha = new Date(inputFecha.split('T')[0]);
		let restante = inputFecha.split('T')[1];

		fecha.setDate(fecha.getDate() + 1);

		const fechas: { [key: string]: any }[] = [];

		const hoy = new Date();
		hoy.setDate(hoy.getDate() + 1);

		let contador = 0;
		let i = (
			hoy.toISOString().split('T')[0] == fecha.toISOString().split('T')[0] &&
			hoy.getHours() < 13
		) ||
			hoy.toISOString().split('T')[0] != fecha.toISOString().split('T')[0] ? 0 : 1;

		while (contador < 3) {
			const futuraFecha = new Date(fecha);
			futuraFecha.setDate(fecha.getDate() + i);

			if (this.esHabil(futuraFecha) && !this.esFeriado(futuraFecha)) {
				futuraFecha.setDate(futuraFecha.getDate() - 1);
				const complemento = restante != '00:00' && '09:00' ? 'T' + restante : (
					hoy.toISOString().split('T')[0] == fecha.toISOString().split('T')[0] &&
						hoy.getHours() < 13 ? 'T15:00' : 'T09:00'
				);
				const fechaStr = futuraFecha.toISOString().split('T')[0] + complemento;
				const objetoFecha = {
					fecha: fechaStr
				};
				fechas.push(objetoFecha);
				restante = '00:00';
				contador++;
			}
			i++;
		}

		this.disponibilidad = fechas;
	}

	protected obtenerNombreDia (fechaStr: string): string {
		const fecha = new Date(fechaStr);
		fecha.setDate(fecha.getDate() + 1);
	
		const hoy = new Date();
		hoy.setDate(hoy.getDate() + 1);

		const ayer = new Date(hoy);
    	ayer.setDate(hoy.getDate() - 1);

		const manana = new Date(hoy);
		manana.setDate(hoy.getDate() + 1);
		
		const pasadoManana = new Date(hoy);
		pasadoManana.setDate(hoy.getDate() + 2);

		const antier = new Date(hoy);
    	antier.setDate(hoy.getDate() - 2);
	
		const opciones: Intl.DateTimeFormatOptions = { weekday: 'long' };
		const nombreDia = fecha.toLocaleDateString('es-ES', opciones);
	
		if (fecha.toISOString().split('T')[0] === hoy.toISOString().split('T')[0]) {
			return `Hoy, ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
		} else if (fecha.toISOString().split('T')[0] === ayer.toISOString().split('T')[0]) {
			return `Ayer, ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
		} else if (fecha.toISOString().split('T')[0] === manana.toISOString().split('T')[0]) {
			return `Mañana, ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
		} else if (fecha.toISOString().split('T')[0] === antier.toISOString().split('T')[0]) {
			return `Antier, ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
		} else if (fecha.toISOString().split('T')[0] === pasadoManana.toISOString().split('T')[0]) {
			return `Pasado mañana, ${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)}`;
		} else {
			return nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
		}
	}

	protected getMinDate (fecha: string): string {
		const hoy = new Date();
		hoy.setDate(hoy.getDate() + 1);

		const tempFecha = new Date(fecha);
		tempFecha.setDate(tempFecha.getDate() + 1);
		
		const minDate = new Date(fecha);
		minDate.setDate(minDate.getDate() + 2);

		while (!this.esHabil(minDate) || this.esFeriado(minDate)) {
			minDate.setDate(minDate.getDate() + 1);
		}

		minDate.setDate(minDate.getDate() - (
			hoy.toISOString().split('T')[0] == tempFecha.toISOString().split('T')[0] &&
			hoy.getHours() < 13 ? 2 : 1
		));

		return minDate.toISOString().split('T')[0] + 'T00:01';
	}

	protected aumentoFechaHija (indice: number): void {
		this.formInstalacion.markAsDirty();
		
		if (indice >= (this.disponibilidad.length-1)) return;

		const fechaActual = new Date(this.disponibilidad[indice].fecha.split('T')[0]);
		const proximaFecha = new Date(fechaActual);

		fechaActual.setDate(fechaActual.getDate() + 1);
		proximaFecha.setDate(proximaFecha.getDate() + 2);

		while (!this.esHabil(fechaActual) || this.esFeriado(fechaActual)) {
			fechaActual.setDate(fechaActual.getDate() + 1);
		}

		while (!this.esHabil(proximaFecha) || this.esFeriado(proximaFecha) || fechaActual.getDate() == proximaFecha.getDate()) {
			proximaFecha.setDate(proximaFecha.getDate() + 1);
		}

		fechaActual.setDate(fechaActual.getDate() - 1);
		proximaFecha.setDate(proximaFecha.getDate() - 1);

		this.disponibilidad[indice].fecha = fechaActual.toISOString().split('T')[0] + 'T' + this.disponibilidad[indice].fecha.split('T')[1];
		this.disponibilidad[indice + 1].fecha = proximaFecha.toISOString().split('T')[0] + 'T' + this.disponibilidad[indice + 1].fecha.split('T')[1];
	}
}