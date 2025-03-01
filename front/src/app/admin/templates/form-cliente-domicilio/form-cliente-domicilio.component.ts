import { Component, Input } from '@angular/core';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import { GenericService } from '../../services/api/generic/generic.service';
import { Validators } from '@angular/forms';
import { ReportesService } from '../../services/api/reportes/reportes.service';

@Component({
	selector: 'app-form-cliente-domicilio',
	templateUrl: './form-cliente-domicilio.component.html',
	styleUrls: ['./form-cliente-domicilio.component.css']
})
export class FormClienteDomicilioComponent extends FGenerico {
	@Input() formClienteDomicilio: any;
	@Input() listaClientesMyBussines: any = [];
	@Input() listaPoblaciones: any;
	@Input() detalleInstalacion: any;
	@Input() telefonos: any;
	@Input() correos: any;
	@Input() pkInstalacion: any;
	@Input() mails: boolean = true;

	constructor(
		private mensajes: MensajesService,
		private generic: GenericService,
		private reportes: ReportesService
	) {
		super();
	}

	protected cambioNombreCliente(): void {
		if (this.listaClientesMyBussines.length == 0) return;
		
		const nombreCliente: string = this.formClienteDomicilio.value.nombreCliente?.trim();
	
		const idCliente = this.obtenerIdClienteMyBussines(nombreCliente);
	
		if (idCliente == undefined) {
			this.formClienteDomicilio.get('identificadorMybussines')?.setValue(null);
			this.telefonos.splice(0, this.telefonos.length, { telefono: '' });
			this.formClienteDomicilio.get('coordenadas')?.setValue(null);
			this.formClienteDomicilio.get('codigoPostal')?.setValue(null);
			this.listaPoblaciones.forEach((poblacion: any) => {
				poblacion.checked = false;
			});
			this.formClienteDomicilio.get('direccionDomicilio')?.setValue(null);
			return;
		};

		this.mensajes.mensajeEsperar();
		this.reportes.obtenerDetalleClienteMyBussines(idCliente).subscribe(
			respuesta => {
				this.formClienteDomicilio.get('identificadorMybussines')?.setValue(respuesta.cliente.CLIENTE);
				this.formClienteDomicilio.get('nombreCliente')?.setValue(this.formatearNombre(respuesta.cliente.NOMBRE));

				this.telefonos.splice(0, this.telefonos.length);
				const telefonos = respuesta.cliente.TELEFONO.split('-');
				telefonos.forEach((telefono: any, index: number) => {
					this.telefonos[index] = { telefono: telefono.trim().substring(0, 10) };
				});

				this.formClienteDomicilio.get('coordenadas')?.setValue(respuesta.cliente.coordenadas?.trim() || '');
				this.formClienteDomicilio.get('codigoPostal')?.setValue(respuesta.cliente.CP?.trim() || '');
				this.listaPoblaciones.forEach((poblacion: any) => {
					poblacion.checked = poblacion.siglas == respuesta.cliente.clave_zona;
				});
				this.formClienteDomicilio.get('direccionDomicilio')?.setValue(respuesta.cliente.CALLE?.trim() || '');
				
				this.mensajes.cerrarMensajes();
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}
	
	private obtenerIdClienteMyBussines(nombre: string): string | null {
		const cliente = this.listaClientesMyBussines.find((socio: { nombre: string; id: string }) => 
			socio.nombre.trim() === nombre.trim()
		);
	
		return cliente?.id || undefined;
	}
	
	protected llamarCliente (telefono: number): void {
		window.location.href = `tel:${telefono}`;
	}

	protected mensajeCliente (telefono: number): void {
		window.location.href = `whatsapp://send?phone=+152${telefono}`;
	}

	protected required (input: string): string {
		return this.formClienteDomicilio.get(input)?.hasValidator(Validators.required) ? ' required' : '';
	}

	public instalacionPendienteValid (): boolean {
		if (this.pkInstalacion == 0) return true;

		return this.detalleInstalacion.fkCatStatus <= 2;
	}

	public rellenarInformacionCoordenadas () {
		if (this.is_empty(this.formClienteDomicilio.value.coordenadas)) {
			this.mensajes.mensajeGenerico('Es necesario colocar coordenadas para continuar con la búsqueda de la información', 'info');
			return;
		}

		if (!/^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/.test(this.formClienteDomicilio.value.coordenadas)) {
			this.mensajes.mensajeGenerico('Se deben colocar coordenadas válidas para poder continuar', 'warning');
			return;
		}

		if (
			this.is_empty(this.formClienteDomicilio.value.codigoPostal) &&
			this.is_empty(this.listaPoblaciones.filter((item: any) => item.checked)[0]?.value) &&
			this.is_empty(this.formClienteDomicilio.value.direccionDomicilio)
		) {
			this.getIngoCoor();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Al parecer ya hay información en los campos correspondientes a la dirección del domicilio<br><br><b>¿Desea continuar con la búsqueda y que la información se sobreescriba?</b>', 'question', 'Sobreescribir información dirección').then(
			res => {
				if (!res.isConfirmed) return;

				this.getIngoCoor();
			}
		);
	}

	private getIngoCoor () {
		this.mensajes.mensajeEsperar();

		const latitud = this.formClienteDomicilio.value.coordenadas.split(',')[0];
		const longitud = this.formClienteDomicilio.value.coordenadas.split(',')[1];

		this.generic.obtenerInfoCoordenadas(latitud, longitud).subscribe(
			respuesta => {
				if (!respuesta.address) {
					this.mensajes.mensajeGenerico('No se encontró información sobre las coordenadas en cuestión', 'warning');
				}
				
				this.completarCamposUbicacion(respuesta.address);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private completarCamposUbicacion (direccion: any): void {
		this.formClienteDomicilio.get('direccionDomicilio')?.setValue(direccion.road);
		this.formClienteDomicilio.get('codigoPostal')?.setValue(direccion.postcode);

		this.listaPoblaciones.forEach((item: any) => (item.checked = (item.label == direccion.town)));

		this.mensajes.mensajeGenericoToast('Se cargó la información encontrada con éxito', 'success');
	}

	get showClientsList () {
		return this.formClienteDomicilio.value.nombreCliente != undefined && this.formClienteDomicilio.value.nombreCliente != null && this.formClienteDomicilio.value.nombreCliente != ''
	}

	get validPhoneNumbers () {
		return this.telefonos.every((item: any) => (item.telefono != '' && item.telefono.length == 10));
	}

	get validMails () {
		return !this.mails || this.correos.every((item: any) => (item.correo != '' && item.correo.includes('@') && item.correo.includes('.')));
	}

	get validPob () {
		return this.is_empty(this.listaPoblaciones.filter((item: any) => item.checked)[0]?.value);
	}
}