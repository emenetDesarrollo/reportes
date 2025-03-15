import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HomeComponent } from '../../home/home.component';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import { LoginService } from 'src/app/auth/services/login/login.service';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { ModalService } from '../../services/modal/modal.service';
import { RegistrarUsuarioComponent } from '../../modules/usuarios/registrar-usuario/registrar-usuario.component';
import { AvisosService } from '../../services/api/avisos/avisos.service';
import { InstalacionesService } from '../../services/api/instalaciones/instalaciones.service';
import { AgendarInstalacionComponent } from '../../modules/instalaciones/agendar-instalacion/agendar-instalacion.component';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy{
	protected informacionUsuario: any = undefined;
	protected nombre: any = undefined;

	protected listaAvisos: any = [];
	protected instalacionesRetardo: any = [];

	private intervalo: any;
	
	constructor (
		public home: HomeComponent,
		private mensajes: MensajesService,
		private apiLogin: LoginService,
		private router: Router,
		private ref: ChangeDetectorRef,
		private apiUsuarios: UsuariosService,
		private modal: ModalService,
		private avisos: AvisosService,
		private instalaciones: InstalacionesService
	) {}

	async ngOnInit(): Promise<void> {
		this.obtenerDatosUsuarios();
		this.obtenerInstalacionesRetardoUsuario();
		this.repetitiveInstruction();
	}

	private async repetitiveInstruction(): Promise<void> {
        this.intervalo = setInterval(async () => {
            await this.obtenerAvisos();
            await this.obtenerInstalacionesRetardoUsuario();
        }, 7000);
    }

	private obtenerDatosUsuarios(): void {
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

	private obtenerAvisos(): void {
		this.avisos.obtenerAvisos('=').subscribe(
			respuesta => {
				this.listaAvisos = respuesta.avisos;
			}, error => {
				if (!navigator.onLine) this.mensajes.mensajeGenerico('No hay conexión a internet', 'warning', 'Upss...!');
			}
		);
	}

	protected abrirAlerta(aviso: any): void {
		let tipo = '';

		switch (aviso.tipoAviso) {
			case 'Informativo':
				tipo = 'info';
			break;
			case 'Advertencia':
				tipo = 'warning';
			break;
			case 'Urgente':
				tipo = 'error';
			break;
		}

		this.mensajes.mensajeGenerico(aviso.descripcion, tipo, aviso.tituloAviso);
	}

	private async obtenerInstalacionesRetardoUsuario(): Promise<void> {
		return this.instalaciones.obtenerInstalacionesRetardoUsuario(0).toPromise().then(
			respuesta => {
				this.instalacionesRetardo = respuesta.instalaciones;
			}, error => {
			}
		);
	}

	protected abrirDetalleInstalacionRetardo(pkInstalacion: number): void {
		const dataModal = {
			pkInstalacion
		};

		this.modal.abrirModalConComponente(AgendarInstalacionComponent, dataModal);
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

	ngOnDestroy(): void {
        clearInterval(this.intervalo);
    }
}