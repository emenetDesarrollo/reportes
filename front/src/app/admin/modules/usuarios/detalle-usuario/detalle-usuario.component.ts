import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { InstalacionesService } from 'src/app/admin/services/api/instalaciones/instalaciones.service';
import { SectoresService } from 'src/app/admin/services/api/sectores/sectores.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { permisos_generales } from 'src/environments/objetos-permisos/obj-permisos-generales';
import { AgendarInstalacionComponent } from '../../instalaciones/agendar-instalacion/agendar-instalacion.component';
import { ModalService } from 'src/app/admin/services/modal/modal.service';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.component.html',
  styleUrls: ['./detalle-usuario.component.css']
})
export class DetalleUsuarioComponent extends FGenerico implements OnInit{
	protected listaTiempo: any[] = [
		{
			value: 'week',
			label: 'Semana',
			checked: false
		}, {
			value: 'month',
			label: 'Mes',
			checked: true
		}, {
			value: 'year',
			label: 'Año',
			checked: false
		}, {
			value: 'todo',
			label: 'Todo',
			checked: false
		}
	];
	
  	protected pkUsuario: any = 0;

	protected formDetalleUsuario!: FormGroup;
	protected formCambioContrasenia!: FormGroup;

	protected opcionesSectores: any = [];
	protected poblacionesSectoresSelect: any = [];

	protected listaPerfiles: any = [];

	protected informacionSesion: any = {};
	protected informacionPerfil: any = {};

	protected showOldPassword = false;
  	protected showNewPassword = false;
  	protected showConfirmPassword = false;

	protected objPermisos = permisos_generales;

	protected poblacionesAgrupadas: any = [];

	protected columnasTabla: any = {
		'identificador'       : '#',
		'nombreCliente'       : 'Cliente',
		'nombreClasificacion' : 'Clasificiación',
		'telefono'            : 'Teléfono',
		'nombrePoblacion'     : 'Población',
		'coordenadas'         : 'Ubicación',
		'fecha'	              : 'Fecha',
		'nombreStatus'	      : 'Status'
	};

	protected tableConfig: any = {
		'identificador' : {
			'center' : true,
			'emitId': true,
			'value': 'pkTblInstalacion'
		},
		'nombreClasificacion' : {
			'center' : true,
			'selectColumn' : true
		},
		'telefono' : {
			'center' : true,
			'telefono': true
		},
		'nombrePoblacion' : {
			'selectColumn' : true,
			'preSelects': localStorage.getItem('reportes_poblacionesSector'),
			'center' : true
		},
		'coordenadas' : {
			'center' : true,
			'location': true,
			'noFilter': true
		},
		'fecha' : {
			'dateSpForm' : true,
			'center' : true
		},
		'nombreStatus' : {
			'center' : true,
			'selectColumn' : true,
			'dadges': true,
			'dadgesCases': [
				{
					'text': 'Pendiente',
					'color': 'warning'
				}, {
					'text': 'Atendiendo',
					'color': 'primary'
				}, {
					'text': 'Atendiendo con retardo',
					'color': 'danger'
				}, {
					'text': 'Instalada',
					'color': 'info'
				}, {
					'text': 'Instalada con retardo',
					'color': 'danger'
				}, {
					'text': 'No exitosa',
					'color': 'danger'
				}
			]
		},
	}

	protected datosTabla: any = [];
	private intervalo: any;

	constructor(
		private mensajes: MensajesService,
		private fb: FormBuilder,
		private apiUsuarios: UsuariosService,
		private apiAuth: UsuariosService,
		private route: ActivatedRoute,
		private catalogos: CatalogosService,
		private sectores: SectoresService,
		protected guard: AdminGuard,
		private instalaciones: InstalacionesService,
		private modal: ModalService,
		private router: Router
	) {
		super();
	}

	async ngOnInit(): Promise<void> {
		this.mensajes.mensajeEsperar();

		this.pkUsuario = this.route.snapshot.paramMap.get('pkUsuario') || '';

		this.crearformDetalleUsuario();
		this.crearFormCambioContrasenia();
		
		await this.obtenerDetallePerfilPorToken().then(() => {
			if (
				this.pkUsuario == this.informacionSesion.pkTblUsuario ||
				(this.informacionSesion.pkTblUsuario != 1 && this.informacionSesion.perfil == 'Administrador')
			) {
				this.router.navigate(['**']);
				return;
			}
		});

		await this.obtenerListaPerfiles();
		await this.obtenerListaSectoresSelect();
		await this.obtenerInstalacionesRetardoUsuario().then(() => {
			this.repetitiveInstruction();
		});

		await this.obtenerInformacionUsuarioPorPk().then(() => {
			this.mensajes.mensajeGenericoToast('Se obtuvó la información con éxito', 'success');
		});

		if (this.pkUsuario != 0 && !this.guard.permisosModulos.usuarios.actualizar) this.formDetalleUsuario.disable();
	}

	private async obtenerDetallePerfilPorToken(): Promise<any> {
		return this.apiAuth.obtenerInformacionUsuarioPorToken(localStorage.getItem('token_emenet')).toPromise().then(
			respuesta => {
				this.informacionSesion = respuesta[0];
			},
			error => {
			}
		)
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerInstalacionesRetardoUsuario();
		}, 7000);
	}

	private crearformDetalleUsuario(): void {
		this.formDetalleUsuario = this.fb.group({
			nombre                    : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			aPaterno                  : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			aMaterno                  : ['', [Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			correo                    : ['', [Validators.required, Validators.email, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_@#$%&+{}()?¿!¡\n\r\t]*')]],
			pkPerfil				  : ['']
		})
	}

	private async obtenerListaSectoresSelect(): Promise<void> {
		return this.sectores.obtenerListaSectoresSelect().toPromise().then(
			respuesta => {
				this.opcionesSectores = respuesta.sectoresSelect;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private async obtenerListaPerfiles(): Promise<void> {
		return this.catalogos.obtenerListaPerfiles().toPromise().then(
			respuesta => {
				this.listaPerfiles = respuesta.listaPerfiles;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private crearFormCambioContrasenia(): void {
		this.formCambioContrasenia = this.fb.group({
			contraseniaAntigua        : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_@#$%&+{}()?¿!¡\n\r\t]*')]],
			contraseniaNueva          : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_@#$%&+{}()?¿!¡\n\r\t]*')]],
			confContraseniaNueva      : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_@#$%&+{}()?¿!¡\n\r\t]*')]]
		})
	}

	private async obtenerInformacionUsuarioPorPk(): Promise<any> {
		return this.apiAuth.obtenerInformacionUsuarioPorPk(this.pkUsuario).toPromise().then(
			respuesta => {
				this.informacionPerfil = respuesta[0];
				this.cargarFormModificacionPerfil();
			},
			error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		)
	}

	private cargarFormModificacionPerfil(): void {
		this.formDetalleUsuario.get('nombre')?.setValue(this.informacionPerfil.nombre);
		this.formDetalleUsuario.get('aPaterno')?.setValue(this.informacionPerfil.aPaterno);
		this.formDetalleUsuario.get('aMaterno')?.setValue(this.informacionPerfil.aMaterno);
		this.formDetalleUsuario.get('correo')?.setValue(this.informacionPerfil.correo);
		this.opcionesSectores.forEach((sector: any) => {
			if (this.informacionPerfil.sectores.split(',').includes(String(sector.value))) {
				sector.checked = true;
			}
		});

		this.poblacionesSectoresSelect = this.opcionesSectores.flatMap((option: any) => option.checked ? option.poblaciones : []) ?? [];
		this.organizarPoblacionesPorLetra(this.poblacionesSectoresSelect);

		this.formDetalleUsuario.get('pkPerfil')?.setValue(this.informacionPerfil.fkCatPerfil);
		if (this.informacionPerfil.permisos) this.objPermisos = [...JSON.parse(this.informacionPerfil.permisos)];
	}

	protected cambioSectores (data: any): void {
		this.poblacionesSectoresSelect = data.selectedOptions.flatMap((option: any) => option.poblaciones) ?? [];
		this.organizarPoblacionesPorLetra(this.poblacionesSectoresSelect);
	}

	protected organizarPoblacionesPorLetra(poblaciones: { value: number; label: string; checked: boolean }[]): void{
		if (poblaciones.length == 0) {
			this.poblacionesAgrupadas = [];
			return;
		}
		poblaciones.sort((a, b) => a.label.localeCompare(b.label));
	
		const agrupadas: Record<string, { value: number; label: string; checked: boolean }[]> = {};
	
		for (const poblacion of poblaciones) {
			const primeraLetra = poblacion.label[0].toUpperCase();
	
			if (!agrupadas[primeraLetra]) {
				agrupadas[primeraLetra] = [];
			}
	
			agrupadas[primeraLetra].push(poblacion);
		}
	
		const resultado = Object.keys(agrupadas)
			.sort()
			.map(letra => ({
				orden: letra,
				poblaciones: agrupadas[letra]
			}));
	
		this.poblacionesAgrupadas = resultado;
	}

	protected cambioPerfil(pkPerfil: number): void {
		this.formDetalleUsuario.get('pkPerfil')?.setValue(pkPerfil);
		const objPermisosPerfil = this.listaPerfiles.find((perfil: any) => perfil.pkCatPerfil == pkPerfil).objPermisos;

		this.objPermisos = [...JSON.parse(objPermisosPerfil)];
	}

	protected cambioPermiso(from: string, data: any): void {
		switch (from) {
			case 'child':
				if (data.acciones.some((accion: any) => accion.valor === true)) {
					data.valor = true;
					if (data.acciones[0]) {
						data.acciones[0].valor = true;
					}
				}
			break;
			case 'parent':
				if (data.valor === true) {
					data.acciones[0].valor = true;
				} else {
					data.acciones.forEach((accion: any) => {
						accion.valor = false;
					});
				}
			break;
		}
	}

	protected actualizarInformacionUsuario(): void {
		if (
			!this.formDetalleUsuario.dirty &&
			!this.cambiosSectores &&
			!this.cambiosPermisos
		) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		if (this.formDetalleUsuario.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (
			this.pkUsuario != 0 &&
			this.opcionesSectores.filter((sector: any) => sector.checked).length == 0
		) {
			this.mensajes.mensajeGenerico('Para continuar se debe seleccionar al menos un sector para el ususario en cuestión', 'warning', 'Sector(es) faltante(s)');
			return;
		}

		if (
			this.pkUsuario != 0 &&
			this.is_empty(this.formDetalleUsuario.value.pkPerfil)
		) {
			this.mensajes.mensajeGenerico('Para continuar se debe seleccionar un perfil para el ususario en cuestión', 'warning', 'Perfil faltante');
			return;
		}

		if (
			this.pkUsuario != 0 &&
			this.objPermisos.filter((permiso: any) => permiso.valor).length == 0
		) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar al menos los permisos en un módulo para poder continuar', 'warning', 'Permisos faltantes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de continuar con la actualización?', 'question', 'Actualizar información').then(
			respuestaMensaje => {
				if (respuestaMensaje.isConfirmed) {
					this.mensajes.mensajeEsperar();

					const datosUsuario: any = {
						perfilInformacion: this.formDetalleUsuario.value,
						token: localStorage.getItem('token_emenet')
					};

					if (this.pkUsuario != 0) {
						datosUsuario.pkUsuario = this.pkUsuario;
						datosUsuario.perfilInformacion.sectores = this.opcionesSectores.filter((sector: any) => sector.checked).map((sector: any) => sector.value).join(',');
						datosUsuario.perfilInformacion.permisos = JSON.stringify(this.objPermisos);
					};

					this.apiUsuarios.actualizarInformacionUsuario(datosUsuario).subscribe(
						respuesta => {
							if (respuesta.status == 409) {
								this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
								return;
							}

							this.obtenerInformacionUsuarioPorPk().then(() => {
								this.formDetalleUsuario.markAsPristine();
								this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
							});
							return;
						},

						error => {
							this.mensajes.mensajeGenerico('error', 'error');
						}
					);
				}
			}
		)
	}

	get cambiosSectores() {
		return this.informacionPerfil.sectores != this.opcionesSectores.filter((sector: any) => sector.checked).map((sector: any) => sector.value).join(',');
	}

	get cambiosPermisos() {
		return this.informacionPerfil.permisos != JSON.stringify(this.objPermisos);
	}

	protected async actualizarPasswordUsuario(): Promise<any> {
		if (!this.formCambioContrasenia.dirty) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		if (this.lengthPassword) {
			this.mensajes.mensajeGenerico('La contraseña debe contener al menos 8 caracteres', 'warning', 'Contraseña inválida');
			return;
		}

		if (this.mayusPassword) {
			this.mensajes.mensajeGenerico('La contraseña debe contener al menos una mayuscula', 'warning', 'Contraseña inválida');
			return;
		}

		if (this.numberPassword) {
			this.mensajes.mensajeGenerico('La contraseña debe contener al menos un número', 'warning', 'Contraseña inválida');
			return;
		}

		if (this.secuenPassword) {
			this.mensajes.mensajeGenerico('La contraseña no debe contener secuencias de 3 caracteres o más. Ej. (abc, 123, etc)', 'warning', 'Contraseña inválida');
			return;
		}

		this.mensajes.mensajeEsperar();

		const credenciales: any = {
			contraseniaActual: this.formCambioContrasenia.get('contraseniaAntigua')?.value,
			token: localStorage.getItem('token_emenet')
		};

		if (this.pkUsuario != 0) credenciales.pkUsuario = this.pkUsuario;

		await this.apiUsuarios.validarContraseniaActual(credenciales).toPromise().then(
			respuesta => {
				if (respuesta.status == 204) {
					this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
					return;
				}

				this.mensajes.mensajeConfirmacionCustom('¿Está seguro de continuar con la actualización?', 'question', 'Actualizar contraseña').then(
					respuestaMensaje => {
						if (respuestaMensaje.isConfirmed) {
							this.mensajes.mensajeEsperar();
		
							const datosUsuario: any = {
								confContraseniaNueva: this.formCambioContrasenia.value.confContraseniaNueva,
								token: localStorage.getItem('token_emenet')
							};
		
							if (this.pkUsuario != 0) datosUsuario.pkUsuario = this.pkUsuario;
		
							this.apiUsuarios.actualizarPasswordUsuario(datosUsuario).subscribe(
								respuesta => {
									if (respuesta.status == 409) {
										this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
										return;
									}

									this.formCambioContrasenia.reset();
		
									this.obtenerInformacionUsuarioPorPk().then(() => {
										this.formDetalleUsuario.markAsPristine();
										this.formCambioContrasenia.markAsPristine();
										this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
									});
									return;
								},
		
								error => {
									this.mensajes.mensajeGenerico('error', 'error');
								}
							);
						}
					}
				)
			},
			error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		)
	}

	get invalidSamePassword () {
		return (
			!this.is_empty(this.formCambioContrasenia.value.contraseniaNueva) &&
			!this.is_empty(this.formCambioContrasenia.value.confContraseniaNueva) &&
			(this.formCambioContrasenia.value.contraseniaNueva != this.formCambioContrasenia.value.confContraseniaNueva)
		);
	}

	get lengthPassword () {
		return (
				this.is_empty(this.formCambioContrasenia.value.contraseniaNueva) ||
				this.formCambioContrasenia.value.contraseniaNueva.length < 8
			);
	}

	get mayusPassword () {
		return (
			!/[A-Z]/.test(this.formCambioContrasenia.value.contraseniaNueva)
		);
	}

	get numberPassword () {
		return (
			!/\d/.test(this.formCambioContrasenia.value.contraseniaNueva)
		);
	}

	get secuenPassword () {
		return (
			/(123|abc|xyz|987|zyx|cba)/i.test(this.formCambioContrasenia.value.contraseniaNueva)
		);
	}

	get invalidPassword () {
		return (
			this.lengthPassword ||
			this.mayusPassword ||
			this.numberPassword ||
			this.secuenPassword
		);
	}

	protected togglePassword(type: string): void {
		if (type === 'old') {
		  this.showOldPassword = !this.showOldPassword;
		} else if (type === 'new') {
		  this.showNewPassword = !this.showNewPassword;
		} else if (type === 'confirm') {
		  this.showConfirmPassword = !this.showConfirmPassword;
		}
	}

	private async obtenerInstalacionesRetardoUsuario(): Promise<void> {
		return this.instalaciones.obtenerInstalacionesRetardoUsuario(this.pkUsuario).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.instalaciones;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkInstalacion: data.action
		};

		this.modal.abrirModalConComponente(AgendarInstalacionComponent, dataModal);
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalo);
		this.formDetalleUsuario.reset();
	}
}