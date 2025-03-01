import { Component } from '@angular/core';
import { ReportesService } from 'src/app/admin/services/api/reportes/reportes.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { GenerarReporteComponent } from '../generar-reporte/generar-reporte.component';
import { CambioDomicilioComponent } from '../cambio-domicilio/cambio-domicilio.component';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { ExcelService } from 'src/app/shared/util/excel.service';

@Component({
  selector: 'app-consultar-reportes',
  templateUrl: './consultar-reportes.component.html',
  styleUrls: ['./consultar-reportes.component.css']
})
export class ConsultarReportesComponent extends FGenerico{
  	protected statusConsulta: number = 1;

	protected columnasTabla: any = {
		'identificador'    : '#',
		'nombreCliente'    : 'Cliente',
		'problema' 		   : 'Problema',
		'telefono'         : 'Teléfono',
		'nombrePoblacion'  : 'Población',
		'coordenadas'      : 'Ubicación',
		'fecha'	           : 'Fecha',
		'nombreStatus'	   : 'Status'
	};

	protected tableConfig: any = {
		'identificador' : {
			'center' : true,
			'emitId': true,
			'value': 'pkTblReporte'
		},
		'problema' : {
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
					'text': 'Atendido',
					'color': 'info'
				}
			]
		},
	}

	protected datosTabla: any = [];
	private intervalo: any;

	constructor (
		private reportes: ReportesService,
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
			await this.obtenerListaReportesStatus();
		}, 7000);
	}

	protected enviarBusqueda () {
		this.mensajes.mensajeEsperar();
		this.clearValues();
		this.obtenerListaReportesStatus().then(() => {
			this.mensajes.mensajeGenericoToast(
				this.datosTabla.length > 0 ? 'Se obtuvo la lista de reportes con éxito' : 'No se encontraron registros de reportes en este status',
				this.datosTabla.length > 0 ? 'success' : 'warning'
			);
			this.repetitiveInstruction();
		});
	}

	protected obtenerListaReportesStatus (): Promise<any> {
		return this.reportes.obtenerListaReportesStatus(this.statusConsulta).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.data.listaReportes;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkReporte: data.action
		};

		const detalle = this.datosTabla.find((reporte: any) => reporte.pkTblReporte == data.action);

		if (detalle.problema == 'Cambio de domicilio') {
			this.modal.abrirModalConComponente(CambioDomicilioComponent, dataModal);
			return;
		}

		this.modal.abrirModalConComponente(GenerarReporteComponent, dataModal);
	}

	protected exportarExcel () : void {
		this.mensajes.mensajeEsperar();

		const nombreExcel = 'Lista de reportes '+ (this.statusConsulta == 1 ? 'pendientes' : 'atendidos') + ' - ' + this.getCurrentDateFormatted();

		this.excel.exportarExcel(
			this.datosTabla,
			this.columnasTabla,
			nombreExcel
		);
	}

	private clearValues () {
		clearInterval(this.intervalo);
		this.datosTabla = []
	}

	ngOnDestroy(): void {
		this.clearValues();
	}
}