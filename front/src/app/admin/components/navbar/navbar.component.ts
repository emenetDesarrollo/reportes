import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HomeComponent } from '../../home/home.component';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import { LoginService } from 'src/app/auth/services/login/login.service';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { ModalService } from '../../services/modal/modal.service';
import { DetalleUsuarioComponent } from '../../modules/usuarios/detalle-usuario/detalle-usuario.component';
import { RegistrarUsuarioComponent } from '../../modules/usuarios/registrar-usuario/registrar-usuario.component';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
	protected informacionUsuario: any = undefined;
	protected nombre: any = undefined;
	
	constructor (
		public home: HomeComponent,
		private mensajes: MensajesService,
		private apiLogin: LoginService,
		private router: Router,
		private ref: ChangeDetectorRef,
		private apiUsuarios: UsuariosService,
		private modal: ModalService
	) {}

	async ngOnInit(): Promise<void> {
		this.obtenerDatosUsuarios();
	}

	public obtenerDatosUsuarios(): void {
		this.informacionUsuario = undefined;
		this.nombre = '';

		this.ref.markForCheck();

		let token = localStorage.getItem('token_emenet');
		if (token != undefined) {
			this.apiUsuarios.obtenerInformacionUsuarioPorToken(token).subscribe(
				respuesta => {
					this.informacionUsuario = respuesta[0];

					this.nombre = this.informacionUsuario.nombre+' '+this.informacionUsuario.aPaterno;
				}, error => {
					localStorage.removeItem('token_emenet');
					localStorage.removeItem('permisos_emenet');
					localStorage.removeItem('reportes_poblacionesSector');
					localStorage.removeItem('reportes_array_poblaciones');
					this.router.navigate(['/login']);
					this.mensajes.mensajeGenerico('Al parecer su sesión expiró, necesita volver a iniciar sesión', 'warning');
				}
			)
		}
	}

	protected abrirDetallePerfil(): void {
		const data = {
			token: localStorage.getItem('token_emenet')
		};
		this.router.navigate(['/']);
		this.modal.abrirModalConComponente(RegistrarUsuarioComponent, data);
	}

	protected logout(): void {
		this.mensajes.mensajeConfirmacionCustom('¿Estás seguro de cerrar sesión?', 'question', 'Cerrar sesión').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();
				let token = localStorage.getItem('token_emenet');
				this.apiLogin.logout(token).subscribe(
					respuesta => {
						localStorage.removeItem('token_emenet');
						localStorage.removeItem('permisos_emenet');
						localStorage.removeItem('reportes_poblacionesSector');
						localStorage.removeItem('reportes_array_poblaciones');
						this.router.navigate(['/login']);
						this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'info');
					}, error => {
						localStorage.removeItem('token_emenet');
						localStorage.removeItem('permisos_emenet');
						localStorage.removeItem('reportes_poblacionesSector');
						localStorage.removeItem('reportes_array_poblaciones');
						this.router.navigate(['/login']);
						this.mensajes.mensajeGenerico('Al parecer su sesión expiró, necesita volver a iniciar sesión', 'warning');
					}
				);
			}
		);
	}
}