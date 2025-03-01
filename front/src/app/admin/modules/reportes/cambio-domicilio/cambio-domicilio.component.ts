import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { ReportesService } from 'src/app/admin/services/api/reportes/reportes.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
  selector: 'app-cambio-domicilio',
  templateUrl: './cambio-domicilio.component.html',
  styleUrls: ['./cambio-domicilio.component.css']
})
export class CambioDomicilioComponent extends FGenerico implements OnInit, OnDestroy{
	@Input() pkReporte: number = 0;

	@ViewChild('modalFooter', { static: false }) modalFooter!: ElementRef;
	@ViewChild('infoSeguimiento') infoSeguimiento: any;

	protected formClienteDomicilio!: FormGroup;
	protected formReporte!: FormGroup;

	protected listaClientesMyBussines: any = [];

	protected telefonos: any[] = [{telefono: ''}];

	protected listaPoblaciones: any[] = [];
	protected newListaPoblaciones: any[] = [];

	protected fecha = new Date();
	protected disponibilidad: any;
	protected detalleReporte: any = {};

	protected seguimientoPage: boolean = false;
	protected inputSeguimiento: any = {
		value: ''
	};
	protected seguimiento: any = [];
	protected edit: any = {
		value: false
	};

	private intervalo: any;
	private intervalId: any;

	protected informacionPerfil: any = {};

	constructor (
		private fb: FormBuilder,
		private modal: ModalService,
		private mensajes: MensajesService,
		private catalogos: CatalogosService,
		private reportes: ReportesService,
		protected guard: AdminGuard,
		private usuarios: UsuariosService
	) {
		super();
	}

	async ngOnInit (): Promise<void> {
		this.mensajes.mensajeEsperar();

		this.crearformClienteDomicilio();
		this.crearFormReporte();

		await Promise.all([
			this.obtenerListaClientesMyBussines(),
			this.obtenerPoblacionesSelect(),
			this.obtenerPoblacionesNewSelect()
		]);

		if (this.pkReporte == 0) {
			this.obtenerFechaHora(this.fecha.toISOString().split('T')[0]+'T00:00');
			this.mensajes.cerrarMensajes();
		} else {
			await this.obtenerDetallePerfilPorToken();
			await this.obtenerDetalleReporte();
		}
	}

	private crearformClienteDomicilio (): void {
		this.formClienteDomicilio = this.fb.group({
			identificadorMybussines : [null, [Validators.required]],
			nombreCliente           : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			coordenadas      	    : [null, [Validators.required, Validators.pattern('[0-9 .,-]*')]],
			direccionDomicilio      : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			referenciasDomicilio    : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			newCoordenadas      	: [null, [Validators.required, Validators.pattern('[0-9 .,-]*')]],
			newDireccionDomicilio   : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			newReferenciasDomicilio : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
	}

	private obtenerListaClientesMyBussines (): Promise<any> {
		return this.reportes.obtenerListaClientesMyBussines().toPromise().then(
			respuesta => {
				this.listaClientesMyBussines = respuesta;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private obtenerPoblacionesSelect (): Promise<any> {
		return this.catalogos.obtenerPoblacionesSelect().toPromise().then(
			respuesta => {
				this.listaPoblaciones.push(...respuesta.data.listaPoblaciones);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private obtenerPoblacionesNewSelect (): Promise<any> {
		return this.catalogos.obtenerPoblacionesSelect().toPromise().then(
			respuesta => {
				this.newListaPoblaciones.push(...respuesta.data.listaPoblaciones);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private crearFormReporte (): void {
		this.formReporte = this.fb.group({
			observaciones : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
	}

	protected cambioPage (value: boolean): void {
		this.seguimientoPage = value;
		if (value) {
			this.intervalId = setInterval(() => {
				this.actualizarTamañoTextarea();
			}, 100);
			this.repetitiveInstruction();
		} else {
			clearInterval(this.intervalo);
			clearInterval(this.intervalId);
		}
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerSeguimiento();
		}, 5000);
	}

	private obtenerDetallePerfilPorToken(): Promise<any> {
		return this.usuarios.obtenerInformacionUsuarioPorToken(localStorage.getItem('token_emenet')).toPromise().then(
			respuesta => {
				this.informacionPerfil = respuesta[0];
			},
			error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		)
	}

	public actualizarTamañoTextarea(): void {
		const textarea = this.infoSeguimiento.nativeElement;
		textarea.style.height = 'auto';
		textarea.style.height = (textarea.scrollHeight + 2) + 'px';
	}

	public obtenerFechaHora (inputFecha: string): any {
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
				const complemento = restante != '00:00' && '09:00' ? 'T'+restante : (
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

	private obtenerDetalleReporte (): Promise<void> {
		return this.reportes.obtenerDetalleReporte(this.pkReporte).toPromise().then(
			respuesta => {
				this.detalleReporte = respuesta.data.detalleReporte;

				this.formClienteDomicilio.enable();
				this.formReporte.enable();
				this.cargarFormularioReporte(respuesta.data.detalleReporte, respuesta.mensaje);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}
	private cargarFormularioReporte (data: any, mensaje: string): void {
		// form cliente domicilio
		if (!this.reportePendienteValid()) this.formClienteDomicilio.disable();

		this.formClienteDomicilio.get('identificadorMybussines')?.setValue(data.identificadorMybussines);
		this.formClienteDomicilio.get('nombreCliente')?.setValue(data.nombreCliente);
		this.telefonos = [...data.telefonos];
		this.formClienteDomicilio.get('coordenadas')?.setValue(data.coordenadas);
		this.formClienteDomicilio.get('newCoordenadas')?.setValue(data.newCoordenadas);
		this.formClienteDomicilio.get('direccionDomicilio')?.setValue(data.direccionDomicilio);
		this.formClienteDomicilio.get('newDireccionDomicilio')?.setValue(data.newDireccionDomicilio);
		this.formClienteDomicilio.get('referenciasDomicilio')?.setValue(data.referenciasDomicilio);
		this.formClienteDomicilio.get('newReferenciasDomicilio')?.setValue(data.newReferenciasDomicilio);
		this.listaPoblaciones.forEach(item => (item.checked = (item.value == data.fkCatPoblacion)));
		this.newListaPoblaciones.forEach(item => (item.checked = (item.value == data.newFkCatPoblacion)));

		// form cambio de domicilio
		if (!this.reportePendienteValid()) this.formReporte.disable();

		this.disponibilidad = [...data.disponibilidadHorario];
		this.formReporte.get('observaciones')?.setValue(data.observaciones);

		this.seguimiento = data.seguimiento;

		this.mensajes.mensajeGenericoToast(mensaje, 'success');
	}

	protected async validarDataForm (type: string): Promise<any> {
		if (this.formClienteDomicilio.value.identificadorMybussines == null) {
			this.mensajes.mensajeGenerico('Para continuar es necesario colocar un cliente válido en el campo <b>"Nombre cliente"</b>', 'warning', 'Cliente no válido');
			return;
		}

		if (this.formClienteDomicilio.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Cliente & Domicilio</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (this.telefonos.some(item => (item.telefono == '' || item.telefono.length < 10))) {
			this.mensajes.mensajeGenerico('Para continuar debe estar completa la información de telefono de contacto', 'warning', 'Números de telefono incompletos');
			return;
		}

		if (this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value)) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar una población', 'warning', 'Población faltante');
			return;
		}

		if (this.is_empty(this.newListaPoblaciones.filter(item => item.checked)[0]?.value)) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar una población', 'warning', 'Población faltante');
			return;
		}

		if (type == 'insert' && this.formReporte.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Reporte</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '')) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar la información completa y de forma correcta en el apartado de <b>Disponibilidad de horario</b>', 'warning', 'Información incompleta');
			return;
		}

		if (!this.changesReporte()) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		this.mensajes.mensajeEsperar();

		let statusValidacionReporte = null;

		await this.reportes.validarReportePendiente(this.pkReporte, this.formClienteDomicilio.value.identificadorMybussines).toPromise().then(
			respuesta => {
				statusValidacionReporte = respuesta.status;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);

		if (statusValidacionReporte == null) {
			this.mensajeValidacionDatosCambioDomicilio(type);
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Se encuentra un cambio de domicilio pendiente del mismo cliente, ¿Está seguro de continuar con el registro actual?<br><br>NOTA: se recomienda revisar la información del cambio de domicilio existente en caso de continuar con el registro', 'info', 'Posible cambio de domicilio duplicado').then(
			res => {
				if (!res.isConfirmed) return;
				this.mensajeValidacionDatosCambioDomicilio(type);
			}
		);
	}

	private mensajeValidacionDatosCambioDomicilio (type: string) {
		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', type == 'insert' ? 'Solicitar cambio de domicilio' : 'Actualizar cambio de domicilio').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				let data = {
					...this.formClienteDomicilio.value,
					...this.formReporte.value,
					telefonos : this.telefonos,
					fkCatPoblacion : this.listaPoblaciones.filter(item => item.checked)[0]?.value,
					newFkCatPoblacion : this.newListaPoblaciones.filter(item => item.checked)[0]?.value,
					disponibilidadHorario : this.disponibilidad,
					token: localStorage.getItem('token_emenet')
				};

				if (type == 'insert') {
					this.generarReporte(data);
				} else if (type == 'update') {
					data.pkTblReporte = this.pkReporte;
					this.actualizarReporte(data);
				}
			}
		);
	}

	private generarReporte (data: any): void {
		this.reportes.generarReporte(data).subscribe(
			respuesta => {
				this.modal.cerrarModal();
				this.mensajes.mensajeGenerico(respuesta.mensaje, 'success');
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private actualizarReporte (data: any): void {
		this.reportes.actualizarReporte(data).subscribe(
			respuesta => {
				this.obtenerDetalleReporte().then(() => {
					this.formClienteDomicilio.markAsPristine();
					this.formReporte.markAsPristine();
					this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
				});
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected atnederReporte (): void {
		if (this.changesReporte()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de comenzar el cambio de domicilio', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			`<b>IMPORTANTE:</b><br><br>
			- Una vez confirme atender el cambio de domicilio no se podrá dejar de atender<br><br>
			<b>¿Está seguro de continuar con esta acción?</b>`,
			'question',
			'Comenzar atender cambio de domicilio'
		).then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblReporte : this.pkReporte,
					token: localStorage.getItem('token_emenet')
				};

				this.reportes.atnederReporte(data).subscribe(
					respuesta => {
						this.obtenerDetalleReporte().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected finalizarReporte (): void {
		if (
			this.formClienteDomicilio.invalid ||
			this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) ||
			this.is_empty(this.newListaPoblaciones.filter(item => item.checked)[0]?.value) ||
			this.formReporte.invalid ||
			!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '')
		) {
			this.mensajes.mensajeGenerico(`
					Para poder finalizar el cambio de domicilio debe estar completa la información de los apartados:<br><br>
					<b>- Cliente & Domicilio ${this.formClienteDomicilio.invalid || this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) || this.is_empty(this.newListaPoblaciones.filter(item => item.checked)[0]?.value) ? '<b style="color:red;">*</b>' : ''}<br>
					- Reporte ${this.formReporte.invalid || !this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '') ? '<b style="color:red;">*</b>' : ''}<br>`,
				'info',
				'Información incompleta');
			return;
		}

		if (this.changesReporte()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de finalizar el cambio de domicilio', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de finalizar el cambio de domicilio?', 'question', 'Finalizar cambio de domicilio').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblReporte : this.pkReporte,
					token: localStorage.getItem('token_emenet')
				};

				this.reportes.finalizarReporte(data).subscribe(
					respuesta => {
						this.obtenerDetalleReporte().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected retomarReporte (): void {
		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de retomar el cambio de domicilio?<br><br>Se econtrará una vez más como reporte pendiente', 'question', 'Retomar cambio de domicilio').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblReporte : this.pkReporte,
					token: localStorage.getItem('token_emenet')
				};

				this.reportes.retomarReporte(data).subscribe(
					respuesta => {
						this.obtenerDetalleReporte().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected agregarAnexoSeguimiento (event: Event): void {
		const inputElement = event.target as HTMLInputElement;
		const file: File | null = (inputElement.files && inputElement.files.length > 0) ? inputElement.files[0] : null;

		if (file) {
			const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			if (!validImageTypes.includes(file.type)) {
				this.mensajes.mensajeGenerico('Se debe colocar una imagen válida', 'warning', 'Tipo de imagen inválida');
				inputElement.value = '';
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				const img = new Image();
				img.src = reader.result as string;

				img.onload = () => {
					const maxWidth = 1000;
					const maxHeight = 1000;
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > maxWidth) {
							height *= maxWidth / width;
							width = maxWidth;
						}
					} else {
						if (height > maxHeight) {
							width *= maxHeight / height;
							height = maxHeight;
						}
					}

					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					if (ctx) {
						canvas.width = width;
						canvas.height = height;
						ctx.drawImage(img, 0, 0, width, height);

						const resizedBase64 = canvas.toDataURL(file.type);

						const data = {
							pkTblReporte: this.pkReporte,
							seguimiento: resizedBase64,
							type_message: 'image',
							token: localStorage.getItem('token_emenet')
						};

						this.mensajes.mensajeMediaConfirmacionCustom(
							'¿Está seguro de agregar el anexo al seguimiento del reporte?',
							'question',
							'Agregar anexo al seguimiento',
							'Continuar',
    						'Cancelar',
    						'Denegar',
    						false,
    						resizedBase64
						).then(
							res => {
								if (!res.isConfirmed) return;
								clearInterval(this.intervalo);
				
								this.mensajes.mensajeEsperarToast();
								this.inputSeguimiento.value = '';
				
								this.reportes.agregarSeguimiento(data).subscribe(
									respuesta => {
										this.obtenerSeguimiento().then(() => {
											this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success', 3000, 'top-end');
											this.repetitiveInstruction();
											if (this.modalFooter) {
												this.modalFooter.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
											}
										});
									}, error => {
										this.mensajes.mensajeGenerico('error', 'error');
									}
								);
							}
						);
					}
				};
			};

			reader.readAsDataURL(file);
		} else {
			this.mensajes.mensajeGenericoToast('No se seleccionó ninguna imagen', 'info');
			inputElement.value = '';
			return;
		}
	}

	protected agregarSeguimiento (type_message: string): void {
		if (this.is_empty(this.inputSeguimiento.value)) {
			this.mensajes.mensajeGenericoToast('Para agregar información de seguimiento se debe colocar texto antes', 'info');
			return;
		}

		const data = {
			pkTblReporte: this.pkReporte,
			seguimiento: this.inputSeguimiento.value,
			type_message,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de agregar información al seguimiento del cambio de domicilio?', 'question', 'Agregar seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.inputSeguimiento.value = '';

				this.reportes.agregarSeguimiento(data).subscribe(
					respuesta => {
						this.obtenerSeguimiento().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success', 3000, 'top-end');
							this.repetitiveInstruction();
							if (this.modalFooter) {
								this.modalFooter.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
							}
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected obtenerSeguimiento (): Promise<any> {
		const data = {
			pkTblReporte: this.pkReporte,
			token: localStorage.getItem('token_emenet')
		};

		return this.reportes.obtenerSeguimiento(data).toPromise().then(
			respuesta => {
				this.seguimiento = respuesta.seguimiento;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected actualizarSeguimiento (): void {
		if (this.is_empty(this.inputSeguimiento.value)) {
			this.mensajes.mensajeGenericoToast('Para agregar información de seguimiento se debe colocar texto antes', 'info');
			return;
		}

		const data = {
			pkTblReporte: this.pkReporte,
			seguimiento: this.inputSeguimiento.value,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de actualizar información del seguimiento del cambio de domicilio?', 'question', 'Actualizar seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.cancelarActualizacionSeguimiento();

				this.reportes.actualizarSeguimiento(data).subscribe(
					respuesta => {
						this.obtenerSeguimiento().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success', 3000, 'top-end');
							this.repetitiveInstruction();
							if (this.modalFooter) {
								this.modalFooter.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
							}
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	public eliminarAnexoSeguimiento (): void {
		const data = {
			pkTblReporte: this.pkReporte,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de eliminar el anexo del seguimiento del reporte?', 'question', 'Eliminar anexo seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.cancelarActualizacionSeguimiento();

				this.reportes.eliminarAnexoSeguimiento(data).subscribe(
					respuesta => {
						this.obtenerSeguimiento().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success', 3000, 'top-end');
							this.repetitiveInstruction();
							if (this.modalFooter) {
								this.modalFooter.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
							}
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}
	
	protected cancelarActualizacionSeguimiento (): void {
		this.inputSeguimiento.value = '';
		this.edit.value = false;
	}

	get cambiosFormClienteDomicilio() {
		return (
			this.formClienteDomicilio.dirty ||
			this.pkReporte == 0 && (
				this.telefonos.some(item => !this.is_empty(item.telefono)) ||
				this.telefonos.length > 1
			) ||
			this.pkReporte != 0 && (
				JSON.stringify(this.telefonos) != JSON.stringify(this.detalleReporte.telefonos) ||
				this.listaPoblaciones.filter(item => item.checked)[0]?.value != this.detalleReporte.fkCatPoblacion ||
				this.newListaPoblaciones.filter(item => item.checked)[0]?.value != this.detalleReporte.newFkCatPoblacion
			)
		);
	}

	get cambiosFormReporte () {
		return (
			this.formReporte.dirty ||
			this.pkReporte != 0 && (
				JSON.stringify(this.disponibilidad) != JSON.stringify(this.detalleReporte.disponibilidadHorario)
			)
		);
	}

	protected changesReporte (): boolean {
		if (
			this.cambiosFormClienteDomicilio ||
			this.cambiosFormReporte
		) return true;

		return false;
	}

	public reportePendienteValid (): boolean {
		if (this.pkReporte == 0) return true;

		return this.detalleReporte.fkCatStatus <= 2;
	}

	protected cerrarModal (): void {
		if (!this.changesReporte()) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de cerrar el modal<br><br><b>¿Desea salir sin guardar cambios?</b>',
			'question',
			(this.pkReporte != 0 ? 'Cambios pendientes' : 'Solicitud pendiente')
		).then(
			res => {
				if (!res.isConfirmed) return;
				
				this.modal.cerrarModal();
			}
		);
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalo);
		clearInterval(this.intervalId);
	}
}