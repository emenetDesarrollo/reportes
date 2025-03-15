import { Component, OnDestroy, OnInit } from '@angular/core';
import { InstalacionesService } from 'src/app/admin/services/api/instalaciones/instalaciones.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { AgendarInstalacionComponent } from '../agendar-instalacion/agendar-instalacion.component';
import { ExcelService } from 'src/app/shared/util/excel.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-consulta-instalaciones',
	templateUrl: './consulta-instalaciones.component.html',
	styleUrls: ['./consulta-instalaciones.component.css']
})
export class ConsultaInstalacionesComponent extends FGenerico implements OnInit, OnDestroy{
	protected statusConsulta: number = 1;

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

	constructor (
		private instalaciones: InstalacionesService,
		private mensajes: MensajesService,
		private modal: ModalService,
		private excel: ExcelService
	) {
		super();
	}

	ngOnInit(): void {
		this.enviarBusqueda();
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerListaInstalacionesStatus();
		}, 7000);
	}

	protected enviarBusqueda () {
		this.mensajes.mensajeEsperar();
		this.clearValues();
		this.obtenerListaInstalacionesStatus().then(() => {
			this.mensajes.mensajeGenericoToast(
				this.datosTabla.length > 0 ? 'Se obtuvo la lista de instalaciones con éxito' : 'No se encontraron registros de instalaciones en este status',
				this.datosTabla.length > 0 ? 'success' : 'warning'
			);
			this.repetitiveInstruction();
		});
	}

	protected obtenerListaInstalacionesStatus (): Promise<any> {
		return this.instalaciones.obtenerListaInstalacionesStatus(this.statusConsulta).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.data.listaInstalaciones;
			}, error => {
			}
		);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkInstalacion: data.action
		};

		this.modal.abrirModalConComponente(AgendarInstalacionComponent, dataModal);
	}

	protected exportarExcel () : void {
		this.mensajes.mensajeEsperar();

		const nombreExcel = 'Lista de instalaciones '+ (this.statusConsulta == 1 ? 'pendientes' : (this.statusConsulta == 2 ? 'realizadas' : 'no exitosas')) + ' - ' + this.getCurrentDateFormatted();

		this.excel.exportarExcel(
			this.datosTabla,
			this.columnasTabla,
			nombreExcel
		);
	}

	private clearValues () {
		clearInterval(this.intervalo);
		this.datosTabla = [];
	}

	ngOnDestroy(): void {
		this.clearValues();
	}
}