import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SectoresService } from 'src/app/admin/services/api/sectores/sectores.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-registrar-sector',
	templateUrl: './registrar-sector.component.html',
	styleUrls: ['./registrar-sector.component.css']
})
export class RegistrarSectorComponent extends FGenerico implements OnInit, OnDestroy{
	@Input() pkSector: number = 0;

	protected formSector!: FormGroup;

	protected listaPoblaciones: any = [];
	protected poblacionesSeleccionadas: any = [];

	protected detalleSector: any = {};

	private intervalo: any;

	protected poblacionesAgrupadas: any = [];

	constructor (
		private modal: ModalService,
		private fb: FormBuilder,
		private mensajes: MensajesService,
		private sectores: SectoresService
	) {
		super();
	}

	ngOnInit(): void {
		this.mensajes.mensajeEsperar();
		this.crearFormSector();
		this.obtenerPoblacionesDisponibles().then(() => {
			this.repetitiveInstruction();
			if (this.pkSector != 0) {
				this.obtenerDetalleSector();
			} else {
				this.mensajes.mensajeGenericoToast('Se obtuvieron las poblaciones disponibles', 'success');
			}
		});
	}

	private repetitiveInstruction(): void {
		this.intervalo = setInterval(async () => {
			await this.obtenerPoblacionesDisponibles();
		}, 5000);
	}

	private crearFormSector(): void {
		this.formSector = this.fb.group({
			nombre 		: [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			descripcion : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			activo      : ['1', [Validators.required]],
		});
	}

	private obtenerDetalleSector (): Promise<any> {
		return this.sectores.obtenerDetalleSector(this.pkSector).toPromise().then(
			respuesta => {
				this.detalleSector = respuesta.detalleSector;
				this.cargarFormularioSector(respuesta.detalleSector, respuesta.mensaje);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private cargarFormularioSector (data: any, mensaje: string): void {
		this.formSector.get('nombre')?.setValue(data.nombre);
		this.formSector.get('descripcion')?.setValue(data.descripcion);
		this.formSector.get('activo')?.setValue(data.activo);

		this.listaPoblaciones.forEach((poblacion: any) => {
			poblacion.checked = data.poblaciones.includes(poblacion.value);
		});
		this.poblacionesSeleccionadas = this.listaPoblaciones.filter((objeto: any) => objeto.checked === true);
		this.organizarPoblacionesPorLetra(this.poblacionesSeleccionadas);

		this.mensajes.mensajeGenericoToast(mensaje, 'success');
	}

	private obtenerPoblacionesDisponibles (): Promise<void> {
		return this.sectores.obtenerPoblacionesDisponibles(this.pkSector).toPromise().then(
			respuesta => {
				this.listaPoblaciones = respuesta.poblaciones;
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected seleccionPoblacion (data: any): void {
		this.poblacionesSeleccionadas = data.selectedOptions.map((objeto: any) => objeto);
		this.organizarPoblacionesPorLetra(this.poblacionesSeleccionadas);
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

	protected validarDataForm (type: string): void {
		if (this.formSector.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		if (this.poblacionesSeleccionadas.length == 0) {
			this.mensajes.mensajeGenerico('Para continuar con el registro se debe colocar al menos una población disponible.', 'warning', 'Población(es) faltante(s)');
			return;
		}

		if (!this.changesSector) {
			this.mensajes.mensajeGenericoToast('No hay cambios pendientes por guardar', 'info');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', type == 'insert' ? 'Registrar sector' : 'Actualizar sector').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				let data: any = {
					...this.formSector.value,
					poblaciones: this.poblacionesSeleccionadas.map((objeto: any) => objeto.value)
				};

				if (type == 'insert') {
					this.registrarSector(data);
				} else if (type == 'update') {
					data.pkCatSector = this.pkSector;
					this.actualizarSector(data);
				}
			}
		);
	}

	private registrarSector (data: any): void {
		this.sectores.registrarSector(data).subscribe(
			respuesta => {
				this.modal.cerrarModal();
				this.mensajes.mensajeGenerico(respuesta.mensaje, 'success');
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	private actualizarSector (data: any): void {
		this.sectores.actualizarSector(data).subscribe(
			respuesta => {
				this.obtenerDetalleSector().then(() => {
					this.formSector.markAsPristine();
					this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
				});
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	get cambiosPoblaciones() {
		const arrayEquals = (a: number[], b: number[]): boolean => {
			if (a.length !== b.length) return false;
			return a.every((value, index) => value === b[index]);
		};
	
		return this.pkSector == 0 ? (
			this.poblacionesSeleccionadas.length != 0
		) : (
			!arrayEquals(
				this.detalleSector.poblaciones?.sort((x: any, y: any) => x - y) ?? [],
				this.poblacionesSeleccionadas.map((objeto: any) => objeto.value).sort((x: any, y: any) => x - y)
			)
		);
	}	

	get changesSector () {
		if (
			this.formSector.dirty ||
			this.cambiosPoblaciones
		) return true;

		return false;
	}

	protected cerrarModal(): void {
		if (
			!this.changesSector
		) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de salir el modal<br><br><b>¿Desea cerrar sin guardar cambios?</b>', 
			'question', 
			(this.pkSector != 0 ? 'Cambios pendientes' : 'Registro pendiente')
		).then(res => {
			if (res.isConfirmed) {
				this.modal.cerrarModal();
			}
		});
	}

	ngOnDestroy(): void {
		clearInterval(this.intervalo);
	}
}