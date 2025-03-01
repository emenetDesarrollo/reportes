import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Injectable({
	providedIn: 'root'
})
export class ModalService {
	modalStack: BsModalRef[] = [];

	constructor(
		private modalService: BsModalService
	) { }

	abrirModalConComponente(component: any, dataModal: any = null, typeModal: string = ' custom-modal') {
		const modalConfig = {
			ignoreBackdropClick: true,
			keyboard: false,
			animated: true,
			initialState: dataModal,
			class: 'modal-xl modal-dialog-centered' + typeModal,
			style: {
				'background-color': 'transparent',
				'overflow-y': 'auto'
			}
		};

		if (typeModal == 'lg-modal') {
			modalConfig.class = 'modal-lg modal-dialog-centered';
		}

		if (typeModal == 'md-modal') {
			modalConfig.class = 'modal-md modal-dialog-centered';
		}

		const modalRef = this.modalService.show(component, modalConfig);
		this.modalStack.push(modalRef);
	}

	cerrarModal() {
		if (this.modalStack.length > 0) {
			const modalRef = this.modalStack[this.modalStack.length - 1];
			modalRef?.hide();
			this.modalStack.pop();
		}
	}
}