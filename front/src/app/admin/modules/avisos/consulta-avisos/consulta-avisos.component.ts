import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { RegistrarAvisoComponent } from '../registrar-aviso/registrar-aviso.component';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { AvisosService } from 'src/app/admin/services/api/avisos/avisos.service';

@Component({
	selector: 'app-consulta-avisos',
	templateUrl: './consulta-avisos.component.html',
	styleUrls: ['./consulta-avisos.component.css']
})
export class ConsultaAvisosComponent implements OnInit{
	protected valueStatus: string = '=';

	protected columnasTabla: any = {
		pkTblAviso: '#',
		tipoAviso: 'Tipo aviso',
		tituloAviso: 'Aviso',
		fechaInicio: 'Inicio',
		fechaFin: 'Fin',
		status: 'Status'
	};

	protected tableConfig: any = {
		'pkTblAviso': {
			'center': true,
			'emitId': true,
			'value': 'pkTblAviso'
		},
		'tipoAviso': {
			'center': true,
			'selectColumn': true
		},
		'tituloAviso': {
			'center': true
		},
		'fechaInicio': {
			'center': true,
			'singleDate': true,
			'date': true,
			'time': false
		},
		'fechaFin': {
			'center': true,
			'singleDate': true,
			'date': true,
			'time': false
		},
		'status': {
			'center': true,
			'selectColumn': true,
			'dadges': true,
			'dadgesCases': [
				{
					'text': 'Por mostrar',
					'color': 'warning'
				}, {
					'text': 'Mostrando',
					'color': 'primary'
				}, {
					'text': 'Mostrado',
					'color': 'danger'
				}
			]
		}
	};

	protected datosTabla: any = [];
	private intervalo: any;

	constructor(
		private mensajes: MensajesService,
		private modal: ModalService,
		protected guard: AdminGuard,
		private avisos: AvisosService
	) { }

	ngOnInit(): void {
		this.mensajes.mensajeEsperar();
		this.obtenerAvisos().then(() => {
			this.mensajes.mensajeGenericoToast(
				this.datosTabla.length > 0 ? 'Se obtuvieron los avisos con éxito' : 'No se encontraron avisos para mostrar en el status seleccionado',
				this.datosTabla.length > 0 ? 'success' : 'warning'
			);
			this.repetitiveInstruction();
		});
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerAvisos();
		}, 7000);
	}

	protected obtenerAvisos (): Promise<any> {
		return this.avisos.obtenerAvisos(this.valueStatus).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.avisos;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected enviarBusqueda() {
		this.mensajes.mensajeEsperar();
		this.clearValues();
		this.obtenerAvisos().then(() => {
			this.mensajes.mensajeGenericoToast(
				this.datosTabla.length > 0 ? 'Se obtuvieron los avisos con éxito' : 'No se encontraron avisos para mostrar en el status seleccionado',
				this.datosTabla.length > 0 ? 'success' : 'warning'
			);
			this.repetitiveInstruction();
		});
	}

	protected actionSelected(data: any): void {
		const dataModal = {
			pkAviso: data.action
		};

		this.mensajes.mensajeEsperar();
		setTimeout(() => {
			this.modal.abrirModalConComponente(RegistrarAvisoComponent, dataModal, 'lg-modal');
		}, 500);
	}

	private clearValues () {
		clearInterval(this.intervalo);
		this.datosTabla = []
	}
}