import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { InstalacionesService } from 'src/app/admin/services/api/instalaciones/instalaciones.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-agendar-instalacion',
	templateUrl: './agendar-instalacion.component.html',
	styleUrls: ['./agendar-instalacion.component.css']
})
export class AgendarInstalacionComponent extends FGenerico implements OnInit{
	@Input() pkInstalacion: number = 0;

	protected formClienteDomicilio!: FormGroup;
	protected formInstalacion!: FormGroup;
	protected formServicio!: FormGroup;

	protected telefonos: any[] = [{telefono: ''}];
	protected correos: any[] = [{correo: ''}];

	protected listaPoblaciones: any[] = [];

	protected planes: any = [
		{
			pkPlan: 1,
			plan: '50 mb x $300 / mes'
		}, {
			pkPlan: 2,
			plan: '75 mb x $400 / mes'
		}, {
			pkPlan: 3,
			plan: '100 mb x $500 / mes'
		}, {
			pkPlan: 4,
			plan: '200 mb x $600 / mes'
		}
	];

	protected fecha = new Date();
	protected disponibilidad: any;

	protected detalleInstalacion: any = {};

	protected tiempoRestanteInstalacion: string = '';
	private intervalo: any;

	private templateEvidenciasFibra: any = [
		{
			titulo: 'Foto delantera de la orden',
			imagenBase64 : null
		}, {
			titulo: 'Foto trasera de la orden',
			imagenBase64 : null
		}, {
			titulo: 'Foto delantera INE',
			imagenBase64 : null
		}, {
			titulo: 'Foto trasera INE',
			imagenBase64 : null
		}, {
			titulo: 'Foto potencia del puerto a conectar',
			imagenBase64 : null
		}, {
			titulo: 'Foto placa (etiqueta)',
			imagenBase64 : null
		}, {
			titulo: 'Foto caja cerrada',
			imagenBase64 : null
		}, {
			titulo: 'Foto domicilio',
			imagenBase64 : null
		}, {
			titulo: 'Foto trasera ONT',
			imagenBase64 : null
		}, {
			titulo: 'Foto tensado azotea cliente',
			imagenBase64 : null
		}, {
			titulo: 'Foto ONT instalada',
			imagenBase64 : null
		}
	];

	private templateEvidenciasInalambrico: any = [
		{
			titulo: 'Foto delantera de la orden',
			imagenBase64 : null
		}, {
			titulo: 'Foto trasera de la orden',
			imagenBase64 : null
		}, {
			titulo: 'Foto delantera INE',
			imagenBase64 : null
		}, {
			titulo: 'Foto trasera INE',
			imagenBase64 : null
		}
	];

	protected evidencias: any = this.templateEvidenciasFibra;

	protected imagenCompleta: any;
    protected imagenCompletaVisible: boolean = false;
	protected indiceImagenActual: any;

	private camposFormServicioFibra: any = this.fb.group({
		ont                : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		noSerieOnt         : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		etiquetaSpliter    : [null, [Validators.pattern('[0-9]*')]],
		puertoSpliter      : [null, [Validators.pattern('[0-9]*')]],
		potencia           : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		coordenadasSpliter : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		fibraInicio        : [null, [Validators.pattern('[0-9]*')]],
		fibraFin           : [null, [Validators.pattern('[0-9]*')]],
		nombreRed          : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		passwordRed        : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
	});

	private camposFormServicioInalambrico: any = this.fb.group({
		cpe           : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		noSerieCpe    : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		router        : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		noSerieRouter : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		nombreRed     : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
		passwordRed   : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
	});

	protected informacionPerfil: any = {};

	constructor(
		private modal: ModalService,
		private fb: FormBuilder,
		private mensajes: MensajesService,
		private catalogos: CatalogosService,
		private instalaciones: InstalacionesService,
		protected guard: AdminGuard,
		private usuarios: UsuariosService
	) {
		super();
	}

	async ngOnInit (): Promise<void> {
		this.mensajes.mensajeEsperar();

		this.crearformClienteDomicilio();
		this.crearFormInstalacion();
		this.crearFormServicio();

		await Promise.all([
			this.obtenerPoblacionesSelect()
		]);

		if (this.pkInstalacion == 0) {
			this.obtenerFechaHora(this.fecha.toISOString().split('T')[0]+'T00:00');
			this.mensajes.cerrarMensajes();
		} else {
			await this.obtenerDetallePerfilPorToken();
			await this.obtenerDetalleInstalcion();
		}
	}

	private crearformClienteDomicilio (): void {
		this.formClienteDomicilio = this.fb.group({
			nombreCliente            : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			coordenadas      	     : [null, [Validators.required, Validators.pattern('[0-9 .,-]*')]],
			codigoPostal             : [null, [Validators.pattern('[0-9]*')]],
			direccionDomicilio       : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			caracteristicasDomicilio : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			referenciasDomicilio     : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
	}

	private crearFormInstalacion (): void {
		this.formInstalacion = this.fb.group({
			pkPlanInternet     : [''],
			costoInstalacion   : [null, [Validators.pattern('[0-9 .]*')]],
			fkCatClasificacion : ['', [Validators.required]],
			duracionEstimada   : ['2', [Validators.required]],
			observaciones      : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
	}

	private crearFormServicio (): void {
		this.formServicio = this.camposFormServicioFibra;
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

	private obtenerDetalleInstalcion (): Promise<void> {
		return this.instalaciones.obtenerDetalleInstalcion(this.pkInstalacion).toPromise().then(
			respuesta => {
				this.detalleInstalacion = respuesta.data.datalleInstalacion;

				this.formClienteDomicilio.enable();
				this.formInstalacion.enable();
				this.formServicio.enable();
				this.cargarFormularioInstalacion(respuesta.data.datalleInstalacion, respuesta.mensaje);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private cargarFormularioInstalacion (data: any, mensaje: string): void {
		// form cliente domicilio
		if (!this.instalacionPendienteValid()) this.formClienteDomicilio.disable();

		this.formClienteDomicilio.get('nombreCliente')?.setValue(data.nombreCliente);
		this.telefonos = [...data.telefonos];
		this.correos = [...data.correos];
		this.formClienteDomicilio.get('coordenadas')?.setValue(data.coordenadas);
		this.formClienteDomicilio.get('codigoPostal')?.setValue(data.codigoPostal);
		this.formClienteDomicilio.get('direccionDomicilio')?.setValue(data.direccionDomicilio);
		this.formClienteDomicilio.get('caracteristicasDomicilio')?.setValue(data.caracteristicasDomicilio);
		this.formClienteDomicilio.get('referenciasDomicilio')?.setValue(data.referenciasDomicilio);
		this.listaPoblaciones.forEach(item => (item.checked = (item.value == data.fkCatPoblacion)));

		// form instalación
		if (!this.instalacionPendienteValid()) this.formInstalacion.disable();

		this.formInstalacion.get('pkPlanInternet')?.setValue(data.pkPlanInternet);
		this.formInstalacion.get('costoInstalacion')?.setValue(data.costoInstalacion);
		this.formInstalacion.get('fkCatClasificacion')?.setValue(data.fkCatClasificacion);
		this.formInstalacion.get('duracionEstimada')?.setValue(data.duracionEstimada);
		this.formInstalacion.get('duracionEstimada')?.disable();
		this.disponibilidad = [...data.disponibilidadHorario];
		this.formInstalacion.get('observaciones')?.setValue(data.observaciones);
		
		// form servicio fibra
		if (this.formInstalacion.value.fkCatClasificacion == 1) {
			this.formServicio = this.camposFormServicioFibra;

			this.formServicio.get('ont')?.setValue(data.ont);
			this.formServicio.get('noSerieOnt')?.setValue(data.noSerieOnt);
			this.formServicio.get('etiquetaSpliter')?.setValue(data.etiquetaSpliter);
			this.formServicio.get('puertoSpliter')?.setValue(data.puertoSpliter);
			this.formServicio.get('potencia')?.setValue(data.potencia);
			this.formServicio.get('coordenadasSpliter')?.setValue(data.coordenadasSpliter);
			this.formServicio.get('fibraInicio')?.setValue(data.fibraInicio);
			this.formServicio.get('fibraFin')?.setValue(data.fibraFin);
		}

		// form servicio inalambrico
		if (this.formInstalacion.value.fkCatClasificacion == 2) {
			this.formServicio = this.camposFormServicioInalambrico;

			this.formServicio.get('cpe')?.setValue(data.cpe);
			this.formServicio.get('noSerieCpe')?.setValue(data.noSerieCpe);
			this.formServicio.get('router')?.setValue(data.router);
			this.formServicio.get('noSerieRouter')?.setValue(data.noSerieRouter);
		}

		this.formServicio.get('nombreRed')?.setValue(data.nombreRed);
			this.formServicio.get('passwordRed')?.setValue(data.passwordRed);

		if (!this.enableFormService() || !this.instalacionPendienteValid()) this.formServicio.disable();

		if (this.is_empty(data.nombreRed)) this.obtenerNombreRed(data.nombreCliente);
		if (this.is_empty(data.passwordRed)) this.generarPassword();

		// form evidencias
		if (this.formInstalacion.value.fkCatClasificacion == 1) this.evidencias = this.templateEvidenciasFibra;
		if (this.formInstalacion.value.fkCatClasificacion == 2) this.evidencias = this.templateEvidenciasInalambrico;
		if (data.evidencias) this.evidencias = [...data.evidencias];

		if (this.detalleInstalacion.usuarioAtencion && this.detalleInstalacion.fechaAtencion) {
			this.actualizarContador();
			this.intervalo = setInterval(() => this.actualizarContador(), 1000);
		}

		this.mensajes.mensajeGenericoToast(mensaje, 'success');
	}

	public cambioClasificacion (): void {
		if (this.formInstalacion.value.fkCatClasificacion == 1) this.formServicio = this.camposFormServicioFibra;
		if (this.formInstalacion.value.fkCatClasificacion == 2) this.formServicio = this.camposFormServicioInalambrico;
		if (this.formInstalacion.value.fkCatClasificacion == 1) this.evidencias = this.templateEvidenciasFibra;
		if (this.formInstalacion.value.fkCatClasificacion == 2) this.evidencias = this.templateEvidenciasInalambrico;

		if (this.detalleInstalacion.evidencias && this.detalleInstalacion.evidencias.length == this.evidencias.length) this.evidencias = [...this.detalleInstalacion.evidencias];
		if (!this.enableFormService() || !this.instalacionPendienteValid()) this.formServicio.disable();
	}

	private actualizarContador() {
		const ahora = new Date();
		const fFinalizado = new Date(this.detalleInstalacion.fechaAtencionOr);
		
		fFinalizado.setHours(fFinalizado.getHours() + this.detalleInstalacion.duracionEstimada);
	  
		const diferencia = fFinalizado.getTime() - ahora.getTime();
		
		if (diferencia > 0) {
			const horas = Math.floor(diferencia / (1000 * 60 * 60));
			const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
			const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
	
			const partes = [];
			
			if (horas > 0) partes.push(`${horas}h`);
			if (minutos > 0) partes.push(`${minutos < 10 ? '0' : ''}${minutos}m`);
	
			partes.push(`${segundos < 10 ? '0' : ''}${segundos}s`);
	
			this.tiempoRestanteInstalacion = partes.join(' ');
		} else {
			this.tiempoRestanteInstalacion = '';
			clearInterval(this.intervalo);
		}
	}

	private obtenerNombreRed(cliente: string): void {
		const palabras = cliente.trim().split(' ');
		const iniciales = palabras.map(palabra => palabra.charAt(0).toUpperCase()).join('');
		
		this.formServicio.get('nombreRed')?.setValue('emenet_'+iniciales);
	}

	public generarPassword(longitud: number = 8): void {
		const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let contrasena = '';
	  
		for (let i = 0; i < longitud; i++) {
		  	const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
		  	contrasena += caracteres.charAt(indiceAleatorio);
		}

		this.formServicio.get('passwordRed')?.setValue(contrasena);
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

	protected validarDataForm (type: string): void {
		if (this.formClienteDomicilio.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Cliente & Domicilio</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (this.telefonos.some(item => (item.telefono == '' || item.telefono.length < 10))) {
			this.mensajes.mensajeGenerico('Para continuar debe estar completa la información de telefono de contacto', 'warning', 'Números de telefono incompletos');
			return;
		}

		if (this.correos.some(item => (item.correo == '' || !item.correo.includes('@') || !item.correo.includes('.')))) {
			this.mensajes.mensajeGenerico('Para continuar debe estar completa la información de correos de contacto', 'warning', 'Correos de contacto incompletos');
			return;
		}

		if (this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value)) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar una población', 'warning', 'Población faltante');
			return;
		}

		if (this.formInstalacion.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Instalación</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '')) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar la información completa y de forma correcta en el apartado de <b>Disponibilidad de horario</b>', 'warning', 'Información incompleta');
			return;
		}

		if (this.showServicePage() && this.enableFormService() && this.formServicio.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta del apartado <b>Servicio</b>.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (!this.changesInstalation()) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', type == 'insert' ? 'Agendar instalación' : 'Actualizar instalación').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				let data = {
					...this.formClienteDomicilio.value,
					...this.formInstalacion.value,
					telefonos : this.telefonos,
					correos : this.correos,
					fkCatPoblacion : this.listaPoblaciones.filter(item => item.checked)[0]?.value,
					disponibilidadHorario : this.disponibilidad,
					token: localStorage.getItem('token_emenet')
				};

				if (this.showServicePage() && this.enableFormService()) {
					data = {
						...data,
						...this.formServicio.value,
						evidencias: this.evidencias
					};
				}

				if (type == 'insert') {
					this.agendarInstalacion(data);
				} else if (type == 'update') {
					data.pkTblInstalacion = this.pkInstalacion;
					this.actualizarInstalacion(data);
				}
			}
		);
	}

	public validaEvidenciasSome(): boolean {
		return this.evidencias.some((item: any) => item.imagenBase64 == null);
	}

	public validaEvidenciasEvery(): boolean {
		return this.evidencias.every((item: any) => item.imagenBase64 == null);
	}

	private agendarInstalacion (data: any): void {
		this.instalaciones.agendarInstalacion(data).subscribe(
			respuesta => {
				this.modal.cerrarModal();
				this.mensajes.mensajeGenerico(respuesta.mensaje, 'success');
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private actualizarInstalacion (data: any): void {
		this.instalaciones.actualizarInstalacion(data).subscribe(
			respuesta => {
				this.obtenerDetalleInstalcion().then(() => {
					this.formClienteDomicilio.markAsPristine();
					this.formInstalacion.markAsPristine();
					this.formServicio.markAsPristine();
					this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
				});
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}
	
	protected atnederInstalacion (): void {
		if (this.changesInstalation()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de comenzar la instalación', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			`<b>IMPORTANTE:</b><br><br>
			- Una vez se comience la instalación no se podrá dejar de atender<br>
			- Se tendrán `+this.detalleInstalacion.duracionEstimada+` horas posterior a la acción para concluir la instalación, de lo contrario será notificado<br><br>
			<b>¿Está seguro de continuar con esta acción?</b>`,
			'question',
			'Comenzar atender instalación'
		).then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblInstalacion : this.pkInstalacion,
					token: localStorage.getItem('token_emenet')
				};

				this.instalaciones.atnederInstalacion(data).subscribe(
					respuesta => {
						this.obtenerDetalleInstalcion().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected finalizarInstalacion (): void {
		if (
			this.formClienteDomicilio.invalid ||
			this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) ||
			this.formInstalacion.invalid ||
			!this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '') ||
			(this.showServicePage() && this.enableFormService() && this.formServicio.invalid) ||
			(this.showServicePage() && this.enableFormService() && this.validaEvidenciasSome())
		) {
			this.mensajes.mensajeGenerico(`
					Para poder finalizar la instalación debe estar completa la información de los apartados:<br><br>
					<b>- Cliente & Domicilio ${this.formClienteDomicilio.invalid || this.is_empty(this.listaPoblaciones.filter(item => item.checked)[0]?.value) ? '<b style="color:red;">*</b>' : ''}<br>
					- Instalación ${this.formInstalacion.invalid || !this.disponibilidad.every((item: any) => item.fecha && item.fecha.trim() !== '') ? '<b style="color:red;">*</b>' : ''}<br>
					- Servicio ${(this.showServicePage() && this.enableFormService() && this.formServicio.invalid) ? '<b style="color:red;">*</b>' : ''}<br>
					- Evidencias ${(this.showServicePage() && this.enableFormService() && this.validaEvidenciasSome()) ? '<b style="color:red;">*</b>' : ''}</b>`,
				'info',
				'Información incompleta');
			return;
		}

		if (this.changesInstalation()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de finalizar la instalación', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de finalizar la instalación?', 'question', 'Finalizar instlación').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblInstalacion : this.pkInstalacion,
					token: localStorage.getItem('token_emenet')
				};

				this.instalaciones.finalizarInstalacion(data).subscribe(
					respuesta => {
						this.obtenerDetalleInstalcion().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected instalacionNoExitosa (): void {
		if (this.changesInstalation()) {
			this.mensajes.mensajeGenerico('Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de cancelar la instalación', 'warning', 'Cambios pendientes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de cambiar la instalación a status <b>no exitosa</b>?', 'question', 'Instalación no exitosa').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblInstalacion : this.pkInstalacion,
					token: localStorage.getItem('token_emenet')
				};

				this.instalaciones.instalacionNoExitosa(data).subscribe(
					respuesta => {
						this.obtenerDetalleInstalcion().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'warning');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected retomarInstalacion (): void {
		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de retomar la instalación?<br><br>Se econtrará una vez más como instalación pendiente', 'question', 'Retomar instalación').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				const data = {
					pkTblInstalacion : this.pkInstalacion,
					token: localStorage.getItem('token_emenet')
				};

				this.instalaciones.retomarInstalacion(data).subscribe(
					respuesta => {
						this.obtenerDetalleInstalcion().then(() => {
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	get cambiosFormClienteDomicilio() {
		return (
			this.formClienteDomicilio.dirty ||
			this.pkInstalacion == 0 && (
				this.telefonos.some(item => !this.is_empty(item.telefono)) ||
				this.telefonos.length > 1 ||
				this.correos.some(item => !this.is_empty(item.correo)) ||
				this.correos.length > 1
			) ||
			this.pkInstalacion != 0 && (
				JSON.stringify(this.telefonos) != JSON.stringify(this.detalleInstalacion.telefonos) ||
				JSON.stringify(this.correos) != JSON.stringify(this.detalleInstalacion.correos) ||
				this.listaPoblaciones.filter(item => item.checked)[0]?.value != this.detalleInstalacion.fkCatPoblacion
			)
		);
	}

	get cambiosFormInstalacion () {
		return (
			this.formInstalacion.dirty ||
			this.pkInstalacion != 0 && (
				JSON.stringify(this.disponibilidad) != JSON.stringify(this.detalleInstalacion.disponibilidadHorario)
			)
		);
	}

	get cambiosFormServicio () {
		return this.formServicio.dirty;
	}

	get cambiosFormEvidencias () {
		return (
			this.enableFormService() &&
			(
				(
					this.detalleInstalacion.evidencias == null ||
					this.detalleInstalacion.evidencias == undefined
				) ? !this.validaEvidenciasEvery() : JSON.stringify(this.evidencias) != JSON.stringify(this.detalleInstalacion.evidencias)
			)
		);
	}

	protected changesInstalation (): boolean {
		if (
			this.cambiosFormClienteDomicilio ||
			this.cambiosFormInstalacion ||
			this.cambiosFormServicio ||
			this.cambiosFormEvidencias
		) return true;

		return false;
	}

	protected showServicePage (): boolean {
		return this.pkInstalacion != 0;
	}

	public enableFormService (): boolean {
		return !this.is_empty(this.detalleInstalacion.usuarioAtencion) && !this.is_empty(this.detalleInstalacion.fechaAtencion);
	}

	public instalacionPendienteValid (): boolean {
		if (this.pkInstalacion == 0) return true;

		return this.detalleInstalacion.fkCatStatus <= 2;
	}

	protected cerrarModal (): void {
		if (!this.changesInstalation()) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de cerrar el modal<br><br><b>¿Desea salir sin guardar cambios?</b>',
			'question',
			(this.pkInstalacion != 0 ? 'Cambios pendientes' : 'Registro pendiente')
		).then(
			res => {
				if (!res.isConfirmed) return;
				
				this.modal.cerrarModal();
			}
		);
	}
}