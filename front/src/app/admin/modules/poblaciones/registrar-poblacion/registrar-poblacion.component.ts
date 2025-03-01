import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/admin/services/api/catalogos/catalogos.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { ConsultaPoblacionesComponent } from '../consulta-poblaciones/consulta-poblaciones.component';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';

@Component({
	selector: 'app-registrar-poblacion',
	templateUrl: './registrar-poblacion.component.html',
	styleUrls: ['./registrar-poblacion.component.css']
})
export class RegistrarPoblacionComponent extends FGenerico implements OnInit {
	@Input() pkPoblacion: number = 0;

	protected formPoblacion!: FormGroup;

	constructor(
		private modal: ModalService,
		private fb: FormBuilder,
		private mensajes: MensajesService,
		private catalogos: CatalogosService,
		protected guard: AdminGuard
	) {
		super();
	}

	ngOnInit(): void {
		this.crearFormPoblacion();

		if (this.pkPoblacion == 0) {
			this.mensajes.cerrarMensajes();
		} else {
			this.obtenerDetallePoblacion().then(() => {
				this.mensajes.mensajeGenericoToast('Se obtuvo el detalle de la población con éxito', 'success');
			});
		}

		if (!this.guard.permisosModulos.poblaciones.actualizar) this.formPoblacion.disable();
	}

	private crearFormPoblacion(): void {
		this.formPoblacion = this.fb.group({
			nombrePoblacion : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			siglas          : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			status          : ['1', [Validators.required]],
			descripcion     : [null, [Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]]
		});
	}

	protected generarSiglas(): void {
		if (this.pkPoblacion != 0) return;

		const nombrePoblacion = this.formPoblacion.value.nombrePoblacion;
		const palabrasConectoras = ['del', 'la', 'el', 'y', 'o', 'de', 'a', 'en', 'con'];
	
		let siglas = '';
	
		if (nombrePoblacion.trim().includes(' ')) {
			siglas = nombrePoblacion
				.split(' ')
				.filter((word: string) => !palabrasConectoras.includes(word.toLowerCase()))
				.map((word: string) => word.charAt(0).toUpperCase())
				.join('');
		} else {
			siglas = nombrePoblacion.slice(0, 3).toUpperCase();
		}
	
		this.formPoblacion.get('siglas')?.setValue(siglas);
	}

	protected registrarPoblacion(): void {
		if (this.formPoblacion.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', 'Registrar población').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				this.catalogos.registrarPoblacion(this.formPoblacion.value).subscribe(
					respuesta => {
						this.formPoblacion.reset();
						this.formPoblacion.get('status')?.setValue('1');
						this.mensajes.mensajeConfirmacionCustom(respuesta.mensaje + '<br><br><b>¿Deseas agregar una población más?</b>', 'success', 'Registro exitoso', 'Sí', 'No').then(
							res => {
								if (res.isConfirmed) return;

								this.cerrarModal();
							}
						);
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	private obtenerDetallePoblacion(): Promise<void> {
		return this.catalogos.obtenerDetallePoblacion(this.pkPoblacion).toPromise().then(
			respuesta => {
				this.cargarFormPoblacion(respuesta.data.detallePoblacion);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	};

	private cargarFormPoblacion(poblacion: any): void {
		this.formPoblacion.get('nombrePoblacion')?.setValue(poblacion.nombrePoblacion);
		this.formPoblacion.get('siglas')?.setValue(poblacion.siglas);
		this.formPoblacion.get('status')?.setValue(poblacion.activo);
		this.formPoblacion.get('descripcion')?.setValue(poblacion.descripcion);
	}

	protected actualizarPoblacion(): void {
		if (!this.formPoblacion.dirty) {
			this.mensajes.mensajeGenerico('Al parecer aún no has realizado cambios para guardar', 'info', 'Sin cambios pendientes');
			return;
		}

		if (this.formPoblacion.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', 'Actualizar población').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				this.formPoblacion.value.pkPoblacion = this.pkPoblacion;
				this.catalogos.actualizarPoblacion(this.formPoblacion.value).subscribe(
					respuesta => {
						this.obtenerDetallePoblacion().then(() => {
							this.formPoblacion.markAsPristine();
							this.mensajes.mensajeGenericoToast(respuesta.mensaje, 'success');
						});
					}, error => {
						this.mensajes.mensajeGenerico('error', 'error');
					}
				);
			}
		);
	}

	protected cerrarModal(): void {
		const abrirConsultaModal = () => {
			this.mensajes.mensajeEsperar();
			this.modal.cerrarModal();
			setTimeout(() => {
				this.modal.abrirModalConComponente(ConsultaPoblacionesComponent, {}, 'lg-modal');
			}, 500);
		};
	
		if (!this.formPoblacion.dirty) {
			abrirConsultaModal();
			return;
		}
	
		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de salir el modal<br><br><b>¿Desea cerrar sin guardar cambios?</b>', 
			'question', 
			(this.pkPoblacion != 0 ? 'Cambios pendientes' : 'Registro pendiente')
		).then(res => {
			if (res.isConfirmed) {
				abrirConsultaModal();
			}
		});
	}
}