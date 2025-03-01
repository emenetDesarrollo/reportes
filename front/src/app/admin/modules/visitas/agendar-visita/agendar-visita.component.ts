import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { ReportesService } from 'src/app/admin/services/api/reportes/reportes.service';
import { VisitasService } from 'src/app/admin/services/api/visitas/visitas.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-agendar-visita',
	templateUrl: './agendar-visita.component.html',
	styleUrls: ['./agendar-visita.component.css']
})
export class AgendarVisitaComponent extends FGenerico implements OnInit{
	@Input() pkVisita: number = 0;

	@ViewChild('modalFooter', { static: false }) modalFooter!: ElementRef;
	@ViewChild('infoSeguimiento') infoSeguimiento: any;

	protected formClienteDomicilio!: FormGroup;
	protected formVisita!: FormGroup;

	protected listaClientesMyBussines: any = [];

	protected telefonos: any[] = [{telefono: ''}];

	protected listaPoblaciones: any[] = [];
	protected listaRazones: any[] = [];

	protected fecha = new Date();
	protected disponibilidad: any;
	protected detalleVisita: any = {};

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
		private visitas: VisitasService,
		protected guard: AdminGuard,
		private usuarios: UsuariosService,
		private reportes: ReportesService
	) {
		super();
	}

	async ngOnInit (): Promise<void> {
		this.mensajes.mensajeEsperar();

		this.crearformClienteDomicilio();
		this.crearFormVisita();

		await Promise.all([
			this.obtenerListaClientesMyBussines(),
			this.obtenerPoblacionesSelect(),
			this.obtenerRazonesVisitaSelect()
		]);

		if (this.pkVisita == 0) {
			this.obtenerFechaHora(this.fecha.toISOString().split('T')[0]+'T00:00');
			this.mensajes.cerrarMensajes();
		} else {
			await this.obtenerDetallePerfilPorToken();
			await this.obtenerDetalleVisita();
		}
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerSeguimiento();
		}, 5000);
	}

	private crearformClienteDomicilio (): void {
		this.formClienteDomicilio = this.fb.group({
			nombreCliente            : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			coordenadas      	     : [null, [Validators.pattern('[0-9 .,-]*')]],
			codigoPostal             : [null, [Validators.pattern('[0-9]*')]],
			direccionDomicilio       : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			caracteristicasDomicilio : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			referenciasDomicilio     : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
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
				this.listaPoblaciones = respuesta.data.listaPoblaciones;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private crearFormVisita (): void {
		this.formVisita = this.fb.group({
			fkCatRazonVisita : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			otraRazon        : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			solucion         : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			descripcion      : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			observaciones    : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
		this.formVisita.get('otraRazon')?.disable();
		this.formVisita.get('solucion')?.disable();
	}

	private obtenerRazonesVisitaSelect (): Promise<any> {
		return this.catalogos.obtenerRazonesVisitaSelect().toPromise().then(
			respuesta => {
				this.listaRazones = respuesta.data.razonesVisita;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
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

	private obtenerDetalleVisita (): Promise<void> {
		return this.visitas.obtenerDetalleVisita(this.pkVisita).toPromise().then(
			respuesta => {
				this.detalleVisita = respuesta.data.detalleVisita;

				this.formClienteDomicilio.enable();
				this.formVisita.enable();
				this.formVisita.get('otraRazon')?.disable();
				this.cargarFormularioVisita(respuesta.data.detalleVisita, respuesta.mensaje);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private cargarFormularioVisita (data: any, mensaje: string): void {
		// form cliente domicilio
		if (!this.visitaPendienteValid()) this.formClienteDomicilio.disable();

		this.formClienteDomicilio.get('nombreCliente')?.setValue(data.nombreCliente);
		this.telefonos = [...data.telefonos];
		this.formClienteDomicilio.get('coordenadas')?.setValue(data.coordenadas);
		this.formClienteDomicilio.get('codigoPostal')?.setValue(data.codigoPostal);
		this.formClienteDomicilio.get('direccionDomicilio')?.setValue(data.direccionDomicilio);
		this.formClienteDomicilio.get('caracteristicasDomicilio')?.setValue(data.caracteristicasDomicilio);
		this.formClienteDomicilio.get('referenciasDomicilio')?.setValue(data.referenciasDomicilio);
		this.listaPoblaciones.forEach(item => (item.checked = (item.value == data.fkCatPoblacion)));

		// form visita
		this.formVisita.get('solucion')?.enable();
		if (!this.visitaPendienteValid()) this.formVisita.disable();

		this.formVisita.get('fkCatRazonVisita')?.setValue(data.fkCatRazonVisita);
		this.formVisita.get('otraRazon')?.setValue(data.otraRazon);
		this.formVisita.get('solucion')?.setValue(data.solucion);
		this.disponibilidad = data.disponibilidadHorario;
		this.formVisita.get('descripcion')?.setValue(data.descripcion);
		this.formVisita.get('observaciones')?.setValue(data.observaciones);

		this.seguimiento = data.seguimiento;

		this.mensajes.mensajeGenericoToast(mensaje, 'success');
	}

	protected validarDataForm (type: string): void {
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

		if (type == 'insert' && this.formVisita.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Visita</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (!this.is_empty(this.formVisita.value.solucion) && this.textoValido(this.formVisita.value.solucion)) {
			this.mensajes.mensajeGenerico('Se debe colocar una solución válida', 'warning', 'Solución no válida');
			return;
		}

		if (!this.is_empty(this.formVisita.value.descripcion) && this.textoValido(this.formVisita.value.descripcion)) {
			this.mensajes.mensajeGenerico('Se debe colocar una descripción válida', 'warning', 'Descripción no válida');
			return;
		}

		if (!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '')) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar la información completa y de forma correcta en el apartado de <b>Disponibilidad de horario</b>', 'warning', 'Información incompleta');
			return;
		}

		if (!this.changesVisita()) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', type == 'insert' ? 'Agendar visita' : 'Actualizar visita').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				let data = {
					...this.formClienteDomicilio.value,
					...this.formVisita.value,
					telefonos : this.telefonos,
					fkCatPoblacion : this.listaPoblaciones.filter(item => item.checked)[0]?.value,
					disponibilidadHorario : this.disponibilidad,
					token: localStorage.getItem('token_emenet')
				};

				if (type == 'insert') {
					this.agendarVisita(data);
				} else if (type == 'update') {
					data.pkTblVisita = this.pkVisita;
					this.actualizarVisita(data);
				}
			}
		);
	}

	private agendarVisita (data: any): void {
		this.visitas.agendarVisita(data).subscribe(
			respuesta => {
				this.modal.cerrarModal();
				this.mensajes.mensajeGenerico(respuesta.mensaje, 'success');
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private actualizarVisita (data: any): void {
		this.visitas.actualizarVisita(data).subscribe(
			respuesta => {
				this.obtenerDetalleVisita().then(() => {
					this.formClienteDomicilio.markAsPristine();
					this.formVisita.markAsPristine();
					this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
				});
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected atnederVisita (): void {
		if (this.changesVisita()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de comenzar la visita', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			`<b>IMPORTANTE:</b><br><br>
			- Una vez confirme atender la visita no se podrá dejar de atender<br><br>
			<b>¿Está seguro de continuar con esta acción?</b>`,
			'question',
			'Comenzar atender visita'
		).then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblVisita : this.pkVisita,
					token: localStorage.getItem('token_emenet')
				};

				this.visitas.atnederVisita(data).subscribe(
					respuesta => {
						this.obtenerDetalleVisita().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected finalizarVisita (): void {
		if (
			this.formClienteDomicilio.invalid ||
			this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) ||
			this.formVisita.invalid ||
			!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '')
		) {
			this.mensajes.mensajeGenerico(`
					Para poder finalizar la visita debe estar completa la información de los apartados:<br><br>
					<b>- Cliente & Domicilio ${this.formClienteDomicilio.invalid || this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) ? '<b style="color:red;">*</b>' : ''}<br>
					- Visita ${this.formVisita.invalid || !this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '') ? '<b style="color:red;">*</b>' : ''}<br>`,
				'info',
				'Información incompleta');
			return;
		}

		if (!this.is_empty(this.formVisita.value.solucion) && this.textoValido(this.formVisita.value.solucion)) {
			this.mensajes.mensajeGenerico('Se debe colocar una solución válida', 'warning', 'Solución no válida');
			return;
		}

		if (!this.is_empty(this.formVisita.value.descripcion) && this.textoValido(this.formVisita.value.descripcion)) {
			this.mensajes.mensajeGenerico('Se debe colocar una descripción válida', 'warning', 'Descripción no válida');
			return;
		}

		if (this.changesVisita()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de finalizar la visita', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de finalizar la instalación?', 'question', 'Finalizar instlación').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblVisita : this.pkVisita,
					token: localStorage.getItem('token_emenet')
				};

				this.visitas.finalizarVisita(data).subscribe(
					respuesta => {
						this.obtenerDetalleVisita().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected visitaNoExitosa (): void {
		if (this.changesVisita()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de cancelar la visita', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de cambiar la visita a status <b>no exitosa</b>?', 'question', 'Visita no exitosa').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblVisita : this.pkVisita,
					token: localStorage.getItem('token_emenet')
				};

				this.visitas.visitaNoExitosa(data).subscribe(
					respuesta => {
						this.obtenerDetalleVisita().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'warning');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected retomarVisita (): void {
		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de retomar la visita?<br><br>Se econtrará una vez más como visita pendiente', 'question', 'Retomar visita').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblVisita : this.pkVisita,
					token: localStorage.getItem('token_emenet')
				};

				this.visitas.retomarVisita(data).subscribe(
					respuesta => {
						this.obtenerDetalleVisita().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	public actualizarTamañoTextarea(): void {
		const textarea = this.infoSeguimiento.nativeElement;
		textarea.style.height = 'auto';
		textarea.style.height = (textarea.scrollHeight + 2) + 'px';
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
							pkTblVisita: this.pkVisita,
							seguimiento: resizedBase64,
							type_message: 'image',
							token: localStorage.getItem('token_emenet')
						};

						this.mensajes.mensajeMediaConfirmacionCustom(
							'¿Está seguro de agregar el anexo al seguimiento de la visita?',
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
				
								this.visitas.agregarSeguimiento(data).subscribe(
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
			pkTblVisita: this.pkVisita,
			seguimiento: this.inputSeguimiento.value,
			type_message,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de agregar información al seguimiento de la visita?', 'question', 'Agregar seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.inputSeguimiento.value = '';

				this.visitas.agregarSeguimiento(data).subscribe(
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
			pkTblVisita: this.pkVisita,
			token: localStorage.getItem('token_emenet')
		};

		return this.visitas.obtenerSeguimiento(data).toPromise().then(
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
			pkTblVisita: this.pkVisita,
			seguimiento: this.inputSeguimiento.value,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de actualizar información del seguimiento de la visita?', 'question', 'Actualizar seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.cancelarActualizacionSeguimiento();

				this.visitas.actualizarSeguimiento(data).subscribe(
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
			pkTblVisita: this.pkVisita,
			token: localStorage.getItem('token_emenet')
		};

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de eliminar el anexo del seguimiento de la visita?', 'question', 'Eliminar anexo seguimiento').then(
			res => {
				if (!res.isConfirmed) return;
				clearInterval(this.intervalo);

				this.mensajes.mensajeEsperarToast();
				this.cancelarActualizacionSeguimiento();

				this.visitas.eliminarAnexoSeguimiento(data).subscribe(
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
			this.pkVisita != 0 && (
				JSON.stringify(this.telefonos) != JSON.stringify(this.detalleVisita.telefonos) ||
				this.listaPoblaciones.filter(item => item.checked)[0]?.value != this.detalleVisita.fkCatPoblacion
			)
		);
	}

	get cambiosFormVisita () {
		return (
			this.formVisita.dirty ||
			this.pkVisita == 0 && (
				this.telefonos.some(item => !this.is_empty(item.telefono)) ||
				this.telefonos.length > 1
			) ||
			this.pkVisita != 0 && (
				JSON.stringify(this.disponibilidad) != JSON.stringify(this.detalleVisita.disponibilidadHorario)
			)
		);
	}

	protected changesVisita (): boolean {
		if (
			this.cambiosFormClienteDomicilio ||
			this.cambiosFormVisita
		) return true;

		return false;
	}

	public visitaPendienteValid (): boolean {
		if (this.pkVisita == 0) return true;

		return this.detalleVisita.fkCatStatus <= 2;
	}

	protected cerrarModal (): void {
		if (!this.changesVisita()) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de cerrar el modal<br><br><b>¿Desea salir sin guardar cambios?</b>',
			'question',
			(this.pkVisita != 0 ? 'Cambios pendientes' : 'Registro pendiente')
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