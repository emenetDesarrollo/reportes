import { Component, OnInit } from '@angular/core';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { ExcelService } from 'src/app/shared/util/excel.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { AgendarInstalacionComponent } from '../agendar-instalacion/agendar-instalacion.component';
import { InstalacionesService } from 'src/app/admin/services/api/instalaciones/instalaciones.service';

@Component({
	selector: 'app-consulta-instalaciones-retardo',
	templateUrl: './consulta-instalaciones-retardo.component.html',
	styleUrls: ['./consulta-instalaciones-retardo.component.css']
})
export class ConsultaInstalacionesRetardoComponent extends FGenerico implements OnInit{
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
	};

	protected datosTabla: any = [];
	private intervalo: any;

	constructor(
		private mensajes: MensajesService,
		private excel: ExcelService,
		private modal: ModalService,
		private instalaciones: InstalacionesService
	) {
		super();
	}

	async ngOnInit(): Promise<void> {
		this.mensajes.mensajeEsperar();
		await this.obtenerInstalacionesRetardoUsuario().then(() => {
			this.mensajes.cerrarMensajes();
			this.repetitiveInstruction();
		});
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerInstalacionesRetardoUsuario();
		}, 7000);
	}

	private async obtenerInstalacionesRetardoUsuario(): Promise<void> {
		return this.instalaciones.obtenerInstalacionesRetardoUsuario(0).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.instalaciones;
			}, error => {
			}
		);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkInstalacion: data.action
		};

		this.cerrarModal();
		this.mensajes.mensajeEsperar();
		setTimeout(() => {
			this.modal.abrirModalConComponente(AgendarInstalacionComponent, dataModal);
		}, 500);
	}

	protected exportarExcel () : void {
		this.mensajes.mensajeEsperar();

		const nombreExcel = 'Lista de poblaciones - ' + this.getCurrentDateFormatted();

		this.excel.exportarExcel(
			this.datosTabla,
			this.columnasTabla,
			nombreExcel
		);
	}

	private clearValues (): void {
		clearInterval(this.intervalo);
		this.datosTabla = [];
	}

	protected cerrarModal(): void {
		this.clearValues();
		this.modal.cerrarModal();
	}

	ngOnDestroy(): void {
		this.clearValues();
	}
}