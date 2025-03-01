import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { LoginService } from '../services/login/login.service';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent extends FGenerico {
	public formLogin!: FormGroup;
	public hide: boolean = true;

	constructor(
		private fb: FormBuilder,
		private mensajes: MensajesService,
		private apiLogin: LoginService,
		private router: Router,
		protected guard: AdminGuard
	) {
		super();
	}

	ngOnInit(): void {
		this.crearFormLogin();

		let token = localStorage.getItem('token_emenet');
		if (token != undefined) {
			this.mensajes.mensajeEsperar();
			this.apiLogin.auth(token).toPromise().then(
				status => {
					if (status) {
						this.router.navigate(['/']);
						this.mensajes.mensajeGenerico('Al parecer ya tienes una sesión activa, si desea ingresar con otra cuenta, es necesario cerrar la sesión actual', 'info');
					} else {
						this.mensajes.cerrarMensajes();
					}
				}, error => {
					this.mensajes.mensajeGenerico('error', 'error');
				}
			)
		}
	}

	private crearFormLogin(): void {
		this.formLogin = this.fb.group({
			correo: ['', [Validators.email, Validators.required]],
			password: ['', [Validators.required]]
		})
	}

	protected login(): void {
		this.mensajes.mensajeEsperar();

		if (this.formLogin.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta', 'info');
			return;
		}

		this.apiLogin.login(this.formLogin.value).subscribe(
			respuesta => {
				if (respuesta.status != 200) {
					this.mensajes.mensajeGenerico(respuesta.mensaje, 'warning', respuesta.title ?? '');
					return;
				}

				localStorage.setItem('token_emenet', respuesta.data.token);
				localStorage.setItem('permisos_emenet', respuesta.data.permisos);

				const permisos:any = localStorage.getItem('permisos_emenet');
				this.guard.permisos = JSON.parse(permisos).reduce((acc: Record<string, boolean>, modulo: any) => {
									  	  acc[modulo.modulo.toLowerCase()] = modulo.valor;
									  	  return acc;
									  }, {});
				this.guard.permisosModulos = JSON.parse(permisos).reduce((acc: Record<string, any>, modulo: any) => {
										             acc[modulo.modulo.toLowerCase()] = modulo.acciones.reduce((accionesAcc: Record<string, boolean>, accion: any) => {
											             const accionKey = accion.accion
													             .replace(/-./g, (match: string) => match[1].toUpperCase())
													             .toLowerCase();
											             accionesAcc[accionKey] = accion.valor;
											             return accionesAcc;
										             }, {});
										             return acc;
								             }, {});

				this.router.navigate(['/']);
				this.mensajes.cerrarMensajes();
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}
}