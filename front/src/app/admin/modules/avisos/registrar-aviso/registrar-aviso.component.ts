import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGuard } from 'src/app/admin/guards/admin.guard';
import { AvisosService } from 'src/app/admin/services/api/avisos/avisos.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { ModalService } from 'src/app/admin/services/modal/modal.service';
import FGenerico from 'src/app/shared/util/funciones-genericas';

@Component({
	selector: 'app-registrar-aviso',
	templateUrl: './registrar-aviso.component.html',
	styleUrls: ['./registrar-aviso.component.css']
})
export class RegistrarAvisoComponent extends FGenerico implements OnInit{
	@Input() pkAviso: number = 0;

	protected detalleAviso: any = {};

	protected formAviso!: FormGroup;

	constructor(
		protected guard: AdminGuard,
		private mensajes: MensajesService,
		private modal: ModalService,
		private fb: FormBuilder,
		private avisos: AvisosService
	) {
		super();
	}

	ngOnInit(): void {
		this.crearFormAviso();

		if (this.pkAviso != 0) {
			this.obtenerDetalleAviso().then(() => {
				this.mensajes.mensajeGenericoToast('Se obtuvo el detalle de la población con éxito', 'success');
			});
		}
	}

	private crearFormAviso(): void {
		this.formAviso = this.fb.group({
			tipoAviso   : [''],
			tituloAviso : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			descripcion : [null, [Validators.required, Validators.pattern('[a-zA-Zá-úÁ-Ú0-9 .,-_:@#$%&+{}()?¿!¡\n]*')]],
			fechaInicio : [null, [Validators.required]],
			fechaFin    : [null, [Validators.required]]
		});
	}

	private obtenerDetalleAviso(): Promise<void> {
		return this.avisos.obtenerDetalleAviso(this.pkAviso).toPromise().then(
			respuesta => {
				this.detalleAviso = respuesta.detalleAviso[0];
				this.cargarFormAviso(respuesta.detalleAviso[0]);
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	};

	private cargarFormAviso(aviso: any): void {
		this.formAviso.get('tipoAviso')?.setValue(aviso.tipoAviso);
		this.formAviso.get('tituloAviso')?.setValue(aviso.tituloAviso);
		this.formAviso.get('descripcion')?.setValue(aviso.descripcion);
		this.formAviso.get('fechaInicio')?.setValue(aviso.fechaInicio.split(' ')[0]);
		this.formAviso.get('fechaFin')?.setValue(aviso.fechaFin.split(' ')[0]);
	}

	get fInicio () {
		const hoy = new Date();
		hoy.setDate(hoy.getDate());

		return hoy.toISOString().split('T')[0];
	}

	get fFin () {
		const fin = this.formAviso.value.fechaInicio ? new Date(this.formAviso.value.fechaInicio) : new Date();
		fin.setDate(fin.getDate());

		return fin.toISOString().split('T')[0];
	}

	protected cambioFechaInicio (): void {
		if (
			this.formAviso.value.fechaFin < this.formAviso.value.fechaInicio
		) this.formAviso.get('fechaFin')?.setValue(this.formAviso.value.fechaInicio);
	}

	protected registrarAviso (): void {
		if (this.formAviso.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', 'Registrar aviso').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();
				this.formAviso.value.token = localStorage.getItem('token_emenet');

				this.avisos.registrarAviso(this.formAviso.value).subscribe(
					respuesta => {
						this.formAviso.reset();
						this.formAviso.get('tipoAviso')?.setValue('');
						this.mensajes.mensajeConfirmacionCustom(respuesta.mensaje + '<br><br><b>¿Deseas agregar un aviso más?</b>', 'success', 'Registro exitoso', 'Sí', 'No').then(
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

	protected actualizarAviso(): void {
		if (!this.formAviso.dirty) {
			this.mensajes.mensajeGenerico('Al parecer aún no has realizado cambios para guardar', 'info', 'Sin cambios pendientes');
			return;
		}

		if (this.formAviso.invalid) {
			this.mensajes.mensajeGenerico('Aún hay campos vacíos o que no cumplen con la estructura correcta.', 'warning', 'Los campos requeridos están marcados con un *');
			return;
		}

		this.mensajes.mensajeConfirmacionCustom('Favor de validar los datos antes de continuar', 'info', 'Actualizar aviso').then(
			res => {
				if (!res.isConfirmed) return;

				this.mensajes.mensajeEsperar();

				this.formAviso.value.pkTblAviso = this.pkAviso;
				this.formAviso.value.token = localStorage.getItem('token_emenet');

				this.avisos.actualizarAviso(this.formAviso.value).subscribe(
					respuesta => {
						this.obtenerDetalleAviso().then(() => {
							this.formAviso.markAsPristine();
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
		if (!this.formAviso.dirty) {
			this.modal.cerrarModal();
			return;
		}

		this.mensajes.mensajeConfirmacionCustom(
			'Al parecer tiene cambios pendientes por guardar, se recomienda guardar los cambios antes de salir el modal<br><br><b>¿Desea cerrar sin guardar cambios?</b>',
			'question',
			(this.pkAviso != 0 ? 'Cambios pendientes' : 'Registro pendiente')
		).then(res => {
			if (res.isConfirmed) {
				this.modal.cerrarModal();
			}
		});
	}
}