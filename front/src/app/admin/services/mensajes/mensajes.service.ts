import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
	providedIn: 'root'
})
export class MensajesService {

	private mensajeError500: string = 'Al parecer ocurrió un error interno, por favor contactarse con el DTIC de Emenet Comunicaciones';

	mensajeEsperar(): void {
		Swal.fire({
			allowOutsideClick: false,
			text: 'Espere un momento...',
			icon: 'info',
			confirmButtonText: 'Cool',
			keyboard: false,
			allowEscapeKey: false
		} as any);
		Swal.showLoading();

		document.body.style.paddingRight = '';
	}


	mensajeEsperarToast(): void {
		Swal.fire({
			toast: true,
			position: 'top-end',
			icon: 'info',
			title: 'Espere un momento...',
			showConfirmButton: false,
			didOpen: () => {
				Swal.showLoading();
			}
		});
		document.body.style.paddingRight = '';
	}	

	cerrarMensajes(): void {
		Swal.close();
		document.body.style.paddingRight = '';
	}

	mensajeGenerico(mensaje: string, tipo: string, title: string = '', html = null): void {
		mensaje = mensaje == 'error' ? this.mensajeError500 : mensaje;
		let data: any = {
			title,
			allowOutsideClick: false,
			icon: tipo,
			html: mensaje,
			confirmButtonText: 'Continuar',
			buttonsStyling: false,
			customClass: {
				confirmButton: 'btn btn-sm btn-primary'
			},
			keyboard: false,
			allowEscapeKey: false
		};
		if (html) {
			data['html'] = html;
		}
		Swal.fire(data);

		document.body.style.paddingRight = '';
	}

	mensajeGenericoToast(mensaje: string, tipo: string, tiempo: number = 3000, position: any = 'bottom-end') {
		let Toast: any = Swal.mixin({
			toast: true,
			position,
			showConfirmButton: false,
			timer: tiempo,
			timerProgressBar: true,
			willOpen: (toast) => {
				toast.addEventListener('mouseenter', Swal.stopTimer)
				toast.addEventListener('mouseleave', Swal.resumeTimer)
				toast.addEventListener('click', Swal.stopTimer);
			}
		});

		Toast.fire({
			icon: tipo,
			title: mensaje
		});

		document.body.style.paddingRight = '';
	}

	mensajeConfirmacionCustom(mensaje: string, tipo: any, titulo: string = '', btnConfirmar = 'Continuar', btnCancelar = 'Cancelar', btnDenegado = 'Denegar', showDeny = false) {
		return Swal.fire({
			title: titulo,
			html: mensaje,
			icon: tipo,
			showDenyButton: showDeny,
			showCancelButton: true,
			confirmButtonText: btnConfirmar,
			cancelButtonText: btnCancelar,
			denyButtonText: btnDenegado,
			buttonsStyling: false,
			allowOutsideClick: false,
			customClass: {
				confirmButton: 'order-1 btn btn-sm btn-primary me-2',
				cancelButton: 'order-2 btn btn-sm btn-danger',
				denyButton: 'order-3'
			},
			allowEscapeKey: false
		});
	}

	mensajeMediaConfirmacionCustom(
		mensaje: string, 
		tipo: any, 
		titulo: string = '', 
		btnConfirmar = 'Continuar', 
		btnCancelar = 'Cancelar', 
		btnDenegado = 'Denegar', 
		showDeny = false, 
		imagen: string = ''
	) {
		return Swal.fire({
			title: titulo,
			html: `${mensaje} ${imagen ? `<br><img src="${imagen}" alt="Imagen" style="max-width: 100%; margin-top: 10px; border-radius: 5px;">` : ''}`,
			icon: tipo,
			showDenyButton: showDeny,
			showCancelButton: true,
			confirmButtonText: btnConfirmar,
			cancelButtonText: btnCancelar,
			denyButtonText: btnDenegado,
			buttonsStyling: false,
			allowOutsideClick: false,
			customClass: {
				confirmButton: 'order-1 btn btn-sm btn-primary me-2',
				cancelButton: 'order-2 btn btn-sm btn-danger',
				denyButton: 'order-3'
			},
			allowEscapeKey: false
		});
	}
	
}