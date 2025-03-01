import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import { RegistrarSectorComponent } from '../registrar-sector/registrar-sector.component';
import { SectoresService } from 'src/app/admin/services/api/sectores/sectores.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';

@Component({
	selector: 'app-consulta-sectores',
	templateUrl: './consulta-sectores.component.html',
	styleUrls: ['./consulta-sectores.component.css']
})
export class ConsultaSectoresComponent implements OnInit, OnDestroy{
	protected listaSectores: any = [];
	protected sectorSelected: any = '';
	
	protected detalleSector: any = {};

	protected poblacionesSector: any = [];

	private intervalo: any;
	private intervaloDetalle: any;

	protected poblacionesAgrupadas: any = [];

	constructor (
		private modal: ModalService,
		private sectores: SectoresService,
		private mensajes: MensajesService,
		protected guard: AdminGuard
	) {}

	ngOnInit(): void {
		this.mensajes.mensajeEsperar();
		this.obtenerListaSectores().then(() => {
			this.repetitiveInstruction();
			this.mensajes.mensajeGenericoToast('Se obtuvo la lista de sectores con éxito', 'success');
		});
	}

	protected agregarSector () {
		this.modal.abrirModalConComponente(RegistrarSectorComponent);
	}

	protected modificarSector () {
		const data = {
			pkSector: this.sectorSelected
		};
		this.modal.abrirModalConComponente(RegistrarSectorComponent, data);
	}

	private repetitiveInstruction (): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerListaSectores();
		}, 7000);
	}
	
	private repetitiveInstructionDetalle (): void {
		this.intervaloDetalle = setInterval(async () => {
			await this.obtenerDetalleSectorFunction();
		}, 7000);
	}

	private obtenerListaSectores (): Promise<void> {
		return this.sectores.obtenerListaSectores().toPromise().then(
			respuesta => {
				this.listaSectores = respuesta.listaSectores;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected obtenerDetalleSector (): void {
		clearInterval(this.intervaloDetalle);
		this.mensajes.mensajeEsperar();
		this.obtenerDetalleSectorFunction().then(() => {
			this.mensajes.cerrarMensajes();
			this.repetitiveInstructionDetalle();
		});
	}

	private obtenerDetalleSectorFunction (): Promise<void> {
		return this.sectores.obtenerPoblacionesSector(this.sectorSelected).toPromise().then(
			respuesta => {
				this.detalleSector = this.listaSectores.find((sector: any) => sector.pkCatSector == this.sectorSelected);
				this.poblacionesSector = respuesta.poblacionesSector;
				this.organizarPoblacionesPorLetra(this.poblacionesSector);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected organizarPoblacionesPorLetra(poblaciones: { value: number; label: string; checked: boolean }[]) {
		if (poblaciones.length == 0) {
			this.poblacionesAgrupadas = [];
			return;
		}

		poblaciones.sort((a, b) => a.label.localeCompare(b.label));
	
		const agrupadas: Record<string, { value: number; label: string; checked: boolean }[]> = {};
	
		for (const poblacion of poblaciones) {
			const primeraLetra = poblacion.label[0].toUpperCase();
	
			if (!agrupadas[primeraLetra]) {
				agrupadas[primeraLetra] = [];
			}
	
			agrupadas[primeraLetra].push(poblacion);
		}
	
		const resultado = Object.keys(agrupadas)
			.sort()
			.map(letra => ({
				orden: letra,
				poblaciones: agrupadas[letra]
			}));
	
		this.poblacionesAgrupadas = resultado;
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalo);
		clearInterval(this.intervaloDetalle);
	}
}