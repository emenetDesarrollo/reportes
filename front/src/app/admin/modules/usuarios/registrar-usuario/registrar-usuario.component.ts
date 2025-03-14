import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { SectoresService } from 'src/app/admin/services/api/sectores/sectores.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { permisos_generales } from 'src/environments/objetos-permisos/obj-permisos-generales';
import { ConsultaUsuariosComponent } from '../consulta-usuarios/consulta-usuarios.component';

@Component({
    selector: 'app-registrar-usuario',
    templateUrl: './registrar-usuario.component.html',
    styleUrls: ['./registrar-usuario.component.css']
})
export class RegistrarUsuarioComponent extends FGenerico implements OnInit{
    @Input() token: any = undefined;

    protected formDetalleUsuario!: FormGroup;
    protected formCambioContrasenia!: FormGroup;

	protected opcionesSectores: any = [];
	protected poblacionesSectoresSelect: any = [];

	protected listaPerfiles: any = [];

    protected informacionPerfil: any = {};

    protected showOldPassword = false;
  	protected showNewPassword = false;
  	protected showConfirmPassword = false;

	protected page = 1;

	protected objPermisos = permisos_generales;
	
	protected poblacionesAgrupadas: any = [];

	protected year = new Date().getFullYear();

    constructor (
        private mensajes: MensajesService,
        private fb: FormBuilder,
        private modal: ModalService,
        private apiUsuarios: UsuariosService,
		private sectores: SectoresService,
		private catalogos: CatalogosService,
		protected guard: AdminGuard
    ) {
        super();
    }

    async ngOnInit(): Promise<void> {
        this.mensajes.mensajeEsperar();

        this.crearformDetalleUsuario();
        this.crearFormCambioContrasenia();

		if (this.token != undefined) {
			await this.obtenerDetallePerfilPorToken().then(() => {
				this.mensajes.mensajeGenericoToast('Se obtuvó la información con éxito', 'success');
			});
		} else {
			this.obtenerListaSectoresSelect();
			this.obtenerListaPerfiles();
		}

		this.mensajes.cerrarMensajes();
    }

    private crearformDetalleUsuario(): void {
		this.formDetalleUsuario = this.fb.group({
			nombre                    : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			aPaterno                  : ['', [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			aMaterno                  : ['', [Validators.pattern('[a-zA-Zá-úÁ-Ú ]*')]],
			correo                    : ['', [Validators.required, Validators.email, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_@#$%&+{}()?¿!¡\n\r\t]*')]],
			pkPerfil				  : ['']
		});
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
		});
	}

    private async obtenerDetallePerfilPorToken(): Promise<any> {
        return this.apiUsuarios.obtenerInformacionUsuarioPorToken(localStorage.getItem('token_emenet')).toPromise().then(
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

		this.formDetalleUsuario.get('pkPerfil')?.setValue(this.informacionPerfil.fkCatPerfil);
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

	protected registrarUsuario(): void {
		if (
			!this.formDetalleUsuario.dirty
		) {
			this.mensajes.mensajeGenericoToast('No se ha realizado ningun cambio para guardar', 'info');
			return;
		}

		if (this.formDetalleUsuario.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (this.opcionesSectores.filter((sector: any) => sector.checked).length == 0) {
			this.mensajes.mensajeGenerico('Para continuar se debe seleccionar al menos un sector para el ususario en cuestión', 'warning', 'Sector(es) faltante(s)');
			return;
		}

		if (this.is_empty(this.formDetalleUsuario.value.pkPerfil)) {
			this.mensajes.mensajeGenerico('Para continuar se debe seleccionar un perfil para el ususario en cuestión', 'warning', 'Perfil faltante');
			return;
		}

		if (this.objPermisos.filter((permiso: any) => permiso.valor).length == 0) {
			this.mensajes.mensajeGenerico('Para continuar se debe colocar al menos los permisos en un módulo para poder continuar', 'warning', 'Permisos faltantes');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('¿Está seguro de continuar con el registro?', 'question', 'Registrar usuario').then(
			respuestaMensaje => {
				if (respuestaMensaje.isConfirmed) {
					this.mensajes.mensajeEsperar();

					const datosUsuario: any = {
						perfilInformacion: {
							...this.formDetalleUsuario.value,
							sectores: this.opcionesSectores.filter((sector: any) => sector.checked).map((sector: any) => sector.value).join(','),
							permisos: JSON.stringify(this.objPermisos)
						},
						token: localStorage.getItem('token_emenet')
					};

					this.apiUsuarios.registrarUsuario(datosUsuario).subscribe(
						respuesta => {
							if (respuesta.status == 409) {
								this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
								return;
							}
							
							this.modal.cerrarModal();
							setTimeout(() => {
								this.modal.abrirModalConComponente(ConsultaUsuariosComponent);
							}, 500);

							this.mensajes.mensajeGenerico(respuesta.mensaje, 'success');
						},

						error => {
							this.mensajes.mensajeGenerico('error', 'error');
						}
					);
				}
			}
		)
	}

    protected actualizarInformacionUsuario(): void {
		if (
			!this.formDetalleUsuario.dirty
		) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		if (this.formDetalleUsuario.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
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

					this.apiUsuarios.actualizarInformacionUsuario(datosUsuario).subscribe(
						respuesta => {
							if (respuesta.status == 409) {
								this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
								return;
							}

							this.obtenerDetallePerfilPorToken().then(() => {
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
		
							this.apiUsuarios.actualizarPasswordUsuario(datosUsuario).subscribe(
								respuesta => {
									if (respuesta.status == 409) {
										this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning');
										return;
									}

									this.formCambioContrasenia.reset();
		
									this.obtenerDetallePerfilPorToken().then(() => {
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

    protected cerrarModal(): void {
		if (!this.formDetalleUsuario.dirty) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de salir el modal<br><br><b>¿Desea cerrar sin guardar cambios?</b>', 
			'question', 
			'Cambios pendientes'
		).then(res => {
			if (res.isConfirmed) {
				this.modal.cerrarModal();
				return;
			}
		});
	}
}