import { Component, Input } from '@angular/core';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import { AgendarInstalacionComponent } from '../../modules/instalaciones/agendar-instalacion/agendar-instalacion.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MensajesService } from '../../services/mensajes/mensajes.service';

@Component({
	selector: 'app-form-evidencias',
	templateUrl: './form-evidencias.component.html',
	styleUrls: ['./form-evidencias.component.css']
})
export class FormEvidenciasComponent extends FGenerico {
	@Input() detalleInstalacion: any;
	@Input() evidencias: any;
	@Input() imagenCompletaVisible: any;
	@Input() indiceImagenActual: any;
	@Input() imagenCompleta: any;

	constructor(
		protected parent: AgendarInstalacionComponent,
		private sanitizer: DomSanitizer,
		private mensajes: MensajesService
	) {
		super();
	}

	protected onFileChange(event: Event, item: any): void {
		const inputElement = event.target as HTMLInputElement;
		const file: File | null = (inputElement.files && inputElement.files.length > 0) ? inputElement.files[0] : null;

		if (file) {
			const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			if (!validImageTypes.includes(file.type)) {
				this.mensajes.mensajeGenerico('Se debe colocar una imagen válida', 'warning', 'Tipo de imagen inválida');
				inputElement.value = '';
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				const img = new Image();
				img.src = reader.result as string;

				img.onload = () => {
					const maxWidth = 1000;
					const maxHeight = 1000;
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > maxWidth) {
							height *= maxWidth / width;
							width = maxWidth;
						}
					} else {
						if (height > maxHeight) {
							width *= maxHeight / height;
							height = maxHeight;
						}
					}

					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					if (ctx) {
						canvas.width = width;
						canvas.height = height;
						ctx.drawImage(img, 0, 0, width, height);

						const resizedBase64 = canvas.toDataURL(file.type);

						item.imagenBase64 = resizedBase64;

						this.mensajes.mensajeGenericoToast('Imagen cargada y redimensionada', 'info');
					}
				};
			};

			reader.readAsDataURL(file);
		} else {
			this.mensajes.mensajeGenerico('Se debe colocar una imagen', 'warning', 'Evidencia faltante');
			inputElement.value = '';
			item.imagenBase64 = null;
			return;
		}
	}

	protected urlImagen(img64: any = null): any {
		return img64 != null ? this.sanitizer.bypassSecurityTrustUrl(img64) : null;
	}

	protected irAImagenAnterior() {
		do {
			this.indiceImagenActual = this.indiceImagenActual > 0 ? this.indiceImagenActual - 1 : this.evidencias.length - 1;
		} while (this.evidencias[this.indiceImagenActual].imagenBase64 == null);

		this.imagenCompleta = this.urlImagen(this.evidencias[this.indiceImagenActual].imagenBase64);
	}

	protected irAImagenSiguiente() {
		do {
			this.indiceImagenActual = this.indiceImagenActual < this.evidencias.length - 1 ? this.indiceImagenActual + 1 : this.indiceImagenActual = 0;
		} while (this.evidencias[this.indiceImagenActual].imagenBase64 == null);

		this.imagenCompleta = this.urlImagen(this.evidencias[this.indiceImagenActual].imagenBase64);
	}

	protected cerrarImagenCompleta() {
		this.imagenCompletaVisible = false;
	}

	protected abrirImagenCompleta(imagenBase64: string, index: number) {
		this.imagenCompleta = this.urlImagen(imagenBase64);
		this.imagenCompletaVisible = true;
		this.indiceImagenActual = index;
	}
}