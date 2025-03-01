import { Component, Input } from '@angular/core';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import { GenericService } from '../../services/api/generic/generic.service';
import { Validators } from '@angular/forms';
import { ReportesService } from '../../services/api/reportes/reportes.service';

@Component({
  selector: 'app-form-cliente-cambio-domicilio',
  templateUrl: './form-cliente-cambio-domicilio.component.html',
  styleUrls: ['./form-cliente-cambio-domicilio.component.css']
})
export class FormClienteCambioDomicilioComponent extends FGenerico{
  	@Input() formClienteDomicilio: any;
	@Input() listaClientesMyBussines: any = [];
	@Input() listaPoblaciones: any;
	@Input() newListaPoblaciones: any;
	@Input() detalleInstalacion: any;
	@Input() telefonos: any;
	@Input() pkInstalacion: any;

	constructor(
		private mensajes: MensajesService,
		private generic: GenericService,
		private reportes: ReportesService
	) {
		super();
	}

	protected cambioNombreCliente(): void {
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

	public rellenarInformacionCoordenadas (op: number) {
		const coordenadas = (op == 1 ? this.formClienteDomicilio.value.coordenadas : this.formClienteDomicilio.value.newCoordenadas);

		if (this.is_empty(coordenadas)) {
			this.mensajes.mensajeGenerico('Es necesario colocar coordenadas para continuar con la búsqueda de la información', 'info');
			return;
		}

		if (!/^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/.test(coordenadas)) {
			this.mensajes.mensajeGenerico('Se deben colocar coordenadas válidas para poder continuar', 'warning');
			return;
		}

		const pobVaci = (op == 1 ? this.listaPoblaciones.filter((item: any) => item.checked)[0]?.value : this.newListaPoblaciones.filter((item: any) => item.checked)[0]?.value);
		const dirDom = (op == 1 ? this.formClienteDomicilio.value.direccionDomicilio : this.formClienteDomicilio.value.newDireccionDomicilio);

		if (
			this.is_empty(pobVaci) &&
			this.is_empty(dirDom)
		) {
			this.getIngoCoor(op);
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Al parecer ya hay información en los campos correspondientes a la dirección del domicilio<br><br><b>¿Desea continuar con la búsqueda y que la información se sobreescriba?</b>', 'question', 'Sobreescribir información dirección').then(
			res => {
				if (!res.isConfirmed) return;

				this.getIngoCoor(op);
			}
		);
	}

	private getIngoCoor (op: number) {
		this.mensajes.mensajeEsperar();

		const coor = (op == 1 ? this.formClienteDomicilio.value.coordenadas : this.formClienteDomicilio.value.newCoordenadas);

		const latitud = coor.split(',')[0];
		const longitud = coor.split(',')[1];

		this.generic.obtenerInfoCoordenadas(latitud, longitud).subscribe(
			respuesta => {
				if (!respuesta.address) {
					this.mensajes.mensajeGenerico('No se encontró información sobre las coordenadas en cuestión', 'warning');
				}
				
				this.completarCamposUbicacion(respuesta.address, op);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private completarCamposUbicacion (direccion: any, op: number): void {
		this.formClienteDomicilio.get(op == 1 ? 'direccionDomicilio' : 'newDireccionDomicilio')?.setValue(direccion.road);

		if (op == 1) this.listaPoblaciones.forEach((item: any) => (item.checked = (item.label == direccion.town)));
		if (op == 2) this.newListaPoblaciones.forEach((item: any) => (item.checked = (item.label == direccion.town)));

		this.mensajes.mensajeGenericoToast('Se cargó la información encontrada con éxito', 'success');
	}

	get validPhoneNumbers () {
		return this.telefonos.every((item: any) => (item.telefono != '' && item.telefono.length == 10));
	}

	get validPob () {
		return this.is_empty(this.listaPoblaciones.filter((item: any) => item.checked)[0]?.value) || this.is_empty(this.newListaPoblaciones.filter((item: any) => item.checked)[0]?.value);
	}
}