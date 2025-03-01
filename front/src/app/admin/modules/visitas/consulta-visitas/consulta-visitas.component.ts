import { Component, OnInit } from '@angular/core';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { AgendarVisitaComponent } from '../agendar-visita/agendar-visita.component';
import { VisitasService } from 'src/app/admin/services/api/visitas/visitas.service';
import { ExcelService } from 'src/app/shared/util/excel.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-consulta-visitas',
	templateUrl: './consulta-visitas.component.html',
	styleUrls: ['./consulta-visitas.component.css']
})
export class ConsultaVisitasComponent extends FGenerico implements OnInit{
	protected statusConsulta: number = 1;

	protected columnasTabla: any = {
		'identificador'    : '#',
		'nombreCliente'    : 'Cliente',
		'razon' 		   : 'Razón',
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
			'value': 'pkTblVisita'
		},
		'razon' : {
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
					'text': 'Finalizada',
					'color': 'info'
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
		private visitas: VisitasService,
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
			await this.obtenerListaVisitasStatus();
		}, 7000);
	}

	protected enviarBusqueda () {
		this.mensajes.mensajeEsperar();
		this.clearValues();
		this.obtenerListaVisitasStatus().then(() => {
			this.mensajes.mensajeGenericoToast(
				this.datosTabla.length > 0 ? 'Se obtuvo la lista de visitas con éxito' : 'No se encontraron registros de visitas en este status',
				this.datosTabla.length > 0 ? 'success' : 'warning'
			);
			this.repetitiveInstruction();
		});
	}

	protected obtenerListaVisitasStatus (): Promise<any> {
		return this.visitas.obtenerListaVisitasStatus(this.statusConsulta).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.data.listaVisitas;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkVisita: data.action
		};

		this.modal.abrirModalConComponente(AgendarVisitaComponent, dataModal);
	}

	protected exportarExcel () : void {
		this.mensajes.mensajeEsperar();

		const nombreExcel = 'Lista de visitas '+ (this.statusConsulta == 1 ? 'pendientes' : (this.statusConsulta == 2 ? 'realizadas' : 'no exitosas')) + ' - ' + this.getCurrentDateFormatted();

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