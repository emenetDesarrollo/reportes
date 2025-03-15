import { Component } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { AgendarInstalacionComponent } from '../../modules/instalaciones/agendar-instalacion/agendar-instalacion.component';
import { ConsultaPoblacionesComponent } from '../../modules/poblaciones/consulta-poblaciones/consulta-poblaciones.component';
import { AgendarVisitaComponent } from '../../modules/visitas/agendar-visita/agendar-visita.component';
import { GenerarReporteComponent } from '../../modules/reportes/generar-reporte/generar-reporte.component';
import { CambioDomicilioComponent } from '../../modules/reportes/cambio-domicilio/cambio-domicilio.component';
import { ConsultaUsuariosComponent } from '../../modules/usuarios/consulta-usuarios/consulta-usuarios.component';
import { Router } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';
import { RegistrarUsuarioComponent } from '../../modules/usuarios/registrar-usuario/registrar-usuario.component';
import { RegistrarAvisoComponent } from '../../modules/avisos/registrar-aviso/registrar-aviso.component';

@Component({
	selector: 'app-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
	constructor (
		private modal: ModalService,
		private router: Router,
		protected guard: AdminGuard
	) { }

	protected abrirModal(modal: string): void {
		switch (modal) {
			case 'generar-reporte':
				this.modal.abrirModalConComponente(GenerarReporteComponent);
			break;
			case 'cambio-domicilio':
				this.modal.abrirModalConComponente(CambioDomicilioComponent);
			break;
			case 'agendar-instalacion':
				this.modal.abrirModalConComponente(AgendarInstalacionComponent);
			break;
			case 'agendar-visita':
				this.modal.abrirModalConComponente(AgendarVisitaComponent);
			break;
			case 'consultar-poblacion':
				this.modal.abrirModalConComponente(ConsultaPoblacionesComponent, {}, 'lg-modal');
			break;
			case 'registrar-aviso':
				this.modal.abrirModalConComponente(RegistrarAvisoComponent, {}, 'lg-modal');
			break;
			case 'registrar-usuario':
				this.router.navigate(['/']);
				this.modal.abrirModalConComponente(RegistrarUsuarioComponent);
			break;
			case 'consulta-usuarios':
				this.router.navigate(['/']);
				this.modal.abrirModalConComponente(ConsultaUsuariosComponent);
			break;
		}
	}
}