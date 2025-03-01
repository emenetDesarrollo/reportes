import { Component, OnDestroy, OnInit } from '@angular/core';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';
import { Router } from '@angular/router';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { ExcelService } from 'src/app/shared/util/excel.service';

@Component({
  selector: 'app-consulta-usuarios',
  templateUrl: './consulta-usuarios.component.html',
  styleUrls: ['./consulta-usuarios.component.css']
})
export class ConsultaUsuariosComponent extends FGenerico implements OnInit, OnDestroy{
	protected columnasTabla: any = {
		'pkTblUsuario'   : '#',
		'nombreCompleto' : 'Usuario',
		'correo'         : 'Correo',
		'fechaAlta'      : 'Registro',
		'status'         : 'Status',
		'linea'          : 'Línea'
	}

	protected tableConfig: any = {
		'pkTblUsuario' : {
			'center': true,
			'emitId': true,
			'value': 'pkTblUsuario'
		},
		'nombreCompleto' : {
			'center': true
		},
		'correo' : {
			'center': true
		},
		'fechaAlta' : {
			'dateSpForm' : true,
			'center': true
		},
		'status': {
			'center': true,
			'dadges': true,
			'selectColumn': true,
			'dadgesCases': [
				{
					'text': 'Activo',
					'color': 'primary'
				}, {
					'text': 'Inactivo',
					'color': 'warning'
				}
			]
		},
		'linea': {
			'center': true,
			'linea': true,
			'noFilter': true
		}
	};

	protected datosTabla: any = [];

	private intervalo: any;

	private informacionPerfil: any;

	constructor (
		private apiUsuarios: UsuariosService,
		private mensajes: MensajesService,
		private modal: ModalService,
		private apiAuth: UsuariosService,
		private router: Router,
		private excel: ExcelService
	) {
		super();
	}
	
	async ngOnInit(): Promise<void> {
		this.mensajes.mensajeEsperar();

		await this.obtenerListaUsuarios().then(() => {
			this.repetitiveInstruction();
		});

		await this.obtenerDetallePerfilPorToken();

		this.mensajes.cerrarMensajes();
	}

	protected async obtenerListaUsuarios(): Promise<any> {
		return this.apiUsuarios.obtenerListaUsuarios().toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.data.listaUsuarios;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerListaUsuarios();
		}, 7000);
	}

	private obtenerDetallePerfilPorToken(): Promise<any> {
		return this.apiAuth.obtenerInformacionUsuarioPorToken(localStorage.getItem('token_emenet')).toPromise().then(
			respuesta => {
				this.informacionPerfil = respuesta[0];
			},
			error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		)
	}

	protected actionSelected(data: any): void {
		if (this.informacionPerfil.pkTblUsuario == data.action) {
			this.mensajes.mensajeGenericoToast('Sesión actual', 'info');
			return;
		}

		this.cerrarModal();
		this.router.navigate(['/detalle-usuario', data.action]);
	}

	protected exportarExcel () : void {
		this.mensajes.mensajeEsperar();

		const nombreExcel = 'Lista de usuarios - ' + this.getCurrentDateFormatted();

		this.excel.exportarExcel(
			this.datosTabla,
			this.columnasTabla,
			nombreExcel
		);
	}

	protected cerrarModal(): void {
		clearInterval(this.intervalo);
		this.datosTabla = [];
		this.modal.cerrarModal();
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalo);
	}
}