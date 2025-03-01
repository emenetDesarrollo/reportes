import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { RegistrarPoblacionComponent } from '../registrar-poblacion/registrar-poblacion.component';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { ExcelService } from 'src/app/shared/util/excel.service';

@Component({
  selector: 'app-consulta-poblaciones',
  templateUrl: './consulta-poblaciones.component.html',
  styleUrls: ['./consulta-poblaciones.component.css']
})
export class ConsultaPoblacionesComponent extends FGenerico implements OnInit, OnDestroy{
  	protected columnasTabla: any = {
		'pkCatPoblacion'  : '#',
		'nombrePoblacion' : 'Población',
		'siglas'  		  : 'Siglas',
		'status' 		  : 'Status'
	};

	protected tableConfig: any = {
		'pkCatPoblacion' : {
			'center' : true,
			'emitId': true,
			'value': 'pkCatPoblacion'
		},
		'siglas' : {
			'center' : true
		},
		'status' : {
			'center' : true,
			'selectColumn' : true,
			'dadges': true,
			'dadgesCases': [
				{
					'text': 'Activa',
					'color': 'primary'
				}, {
					'text': 'Inactiva',
					'color': 'warning'
				}
			]
		},
	}

	protected datosTabla: any = [];
	private intervalo: any;

	constructor (
		private modal: ModalService,
		private mensajes: MensajesService,
		private catalogos: CatalogosService,
		protected guard: AdminGuard,
		private excel: ExcelService
	) {
		super();
	}

	ngOnInit(): void {
		this.clearValues();
		this.mensajes.mensajeEsperar();
		this.obtenerPoblaciones().then(() => {
			this.mensajes.mensajeGenericoToast('Se obtuvieron las poblaciones con éxito', 'success');
			this.repetitiveInstruction();
		});
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerPoblaciones();
		}, 7000);
	}

	protected obtenerPoblaciones (): Promise<any> {
		return this.catalogos.obtenerPoblaciones().toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.data.poblaciones;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected abrirModalRegistrarPoblacion (): void {
		this.cerrarModal();
		this.mensajes.mensajeEsperar();
		setTimeout(() => {
			this.modal.abrirModalConComponente(RegistrarPoblacionComponent, {}, 'lg-modal');
		}, 500);
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkPoblacion: data.action
		};

		this.cerrarModal();
		this.mensajes.mensajeEsperar();
		setTimeout(() => {
			this.modal.abrirModalConComponente(RegistrarPoblacionComponent, dataModal, 'lg-modal');
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