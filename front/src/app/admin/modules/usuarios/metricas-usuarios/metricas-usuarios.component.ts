import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { GenericService } from 'src/app/admin/services/api/generic/generic.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import { UsuariosService } from 'src/app/admin/services/usuarios/usuarios.service';

@Component({
	selector: 'app-metricas-usuarios',
	templateUrl: './metricas-usuarios.component.html',
	styleUrls: ['./metricas-usuarios.component.css']
})
export class MetricasUsuariosComponent implements OnInit, OnDestroy{
	protected listaTiempo: any[] = [
		{
			value: 'week',
			label: 'Semana',
			checked: false
		}, {
			value: 'month',
			label: 'Mes',
			checked: true
		}, {
			value: 'year',
			label: 'Año',
			checked: false
		}, {
			value: 'todo',
			label: 'Todo',
			checked: false
		}
	];

	private actualTiempo = 'month';

	protected columnasTabla: any = {
		'pkTblUsuario' : '#',
		'nombre' : 'Usuario',
		'instalacionesRetardo'  : 'Instalaciones'
	};

	protected tableConfig: any = {
		'pkTblUsuario' : {
			'center': true
		},
		'nombre' : {
			'center': true,
			'emitId': true,
			'value': 'pkTblUsuario'
		},
		'instalacionesRetardo' : {
			'center': true
		}
	};

	protected datosTabla: any[] = [];
	
	private myChartMetricasReportes: any;
	private myChartMetricasInstalaciones: any;

	protected metricas: any = {};
	private informacionPerfil: any;

	private intervalo: any;

	constructor (
		private generic: GenericService,
		private mensajes: MensajesService,
		private router: Router,
		private apiAuth: UsuariosService
	) {}

	async ngOnInit(): Promise<void> {
		this.mensajes.mensajeEsperar();
		
		await this.obtenerDetallePerfilPorToken();
		await this.obtenerMetricasUsuarios();

		this.mensajes.mensajeGenericoToast('Se obtuvieron las métricas de los usuarios con éxito', 'success');
		this.repetitiveInstruction();
	}

	private repetitiveInstruction(): void {
        this.intervalo = setInterval(async () => {
            await this.obtenerMetricasUsuarios();
        }, 7000);
    }

	private async obtenerDetallePerfilPorToken(): Promise<any> {
		return this.apiAuth.obtenerInformacionUsuarioPorToken(localStorage.getItem('token_emenet')).toPromise().then(
			respuesta => {
				this.informacionPerfil = respuesta[0];
			},
			error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		)
	}

	private async obtenerMetricasUsuarios(): Promise<any> {
		const visualizacion: string = this.listaTiempo.filter(item => item.checked)[0].value ?? '';

		return this.generic.obtenerMetricasUsuarios(visualizacion).toPromise().then(
			respuesta => {
				this.datosTabla = respuesta.metricas.usuariosRetardoInstalacion;
				this.metricas = respuesta.metricas;

				this.actualizarGraficaMetricasReportes();
				this.actualizarGraficaMetricasInstalaciones();
			}, error => {
				this.mensajes.mensajeGenerico('error', 'error');
			}
		);
	}

	protected actionSelected(data: any): void {
		if (this.informacionPerfil.pkTblUsuario == data.action) {
			this.mensajes.mensajeGenericoToast('Sesión actual', 'info');
			return;
		}
		
		this.router.navigate(['/detalle-usuario', data.action]);
	}
	
	protected cambioVisualizacion(): void {
		if (this.actualTiempo == this.listaTiempo.find(item => item.checked).value) return;

		this.mensajes.mensajeEsperar();
		this.actualTiempo = this.listaTiempo.find(item => item.checked).value;

		this.obtenerMetricasUsuarios().then(() => {
			this.mensajes.mensajeGenericoToast('Se obtuvieron las métricas de los usuarios con éxito', 'success');
		});
	}

	private actualizarGraficaMetricasReportes(): void {
		if (this.myChartMetricasReportes) {
			this.myChartMetricasReportes.destroy();
		}

		const config: any = {
			type: 'polarArea',
			data: {
				labels: this.metricas.usuariosReportesSolucionados.map((item: any) => item.usuario) ?? [],
				datasets: [{
					label: 'Reportes atendidos',
					data: this.metricas.usuariosReportesSolucionados.map((item: any) => item.reportes),
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(75, 192, 192)',
						'rgb(255, 205, 86)',
						'rgb(201, 203, 207)',
						'rgb(54, 162, 235)'
					]
				}]
			},
			options: {
				responsive: true,
				animation: {
					duration: 0
				},
				plugins: {
					title: {
						display: true,
						text: 'Atención de reportes',
						font: {
							size: 20,
							weight: 'bold',
							family: 'Nunito'
						}
					}
				}
			}
		};

		this.myChartMetricasReportes = new Chart("metricasReportes", config);
	}

	get masReportes(): string {
		return this.metricas.usuariosReportesSolucionados.reduce((max: any, item: any) => {
			return (item.reportes > max.reportes) ? item : max;
		}).usuario ?? '';
	}

	private actualizarGraficaMetricasInstalaciones(): void {
		if (this.myChartMetricasInstalaciones) {
			this.myChartMetricasInstalaciones.destroy();
		}

		const config: any = {
			type: 'polarArea',
			data: {
				labels: this.metricas.usuariosInstalacionesRealizadas.map((item: any) => item.usuario) ?? [],
				datasets: [{
					label: 'Instalaciones realizadas',
					data: this.metricas.usuariosInstalacionesRealizadas.map((item: any) => item.instalaciones) ?? [],
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(75, 192, 192)',
						'rgb(255, 205, 86)',
						'rgb(201, 203, 207)',
						'rgb(54, 162, 235)'
					]
				}]
			},
			options: {
				responsive: true,
				animation: {
					duration: 0
				},
				plugins: {
					title: {
						display: true,
						text: 'Atención de instalaciones',
						font: {
							size: 20,
							weight: 'bold',
							family: 'Nunito'
						}
					}
				}
			}
		};

		this.myChartMetricasInstalaciones = new Chart("metricasInstalaciones", config);
	}

	get masInstalaciones(): string {
		return this.metricas.usuariosInstalacionesRealizadas.reduce((max: any, item: any) => {
			return (item.instalaciones > max.instalaciones) ? item : max;
		}).usuario ?? '';
	}

	ngOnDestroy(): void {
        clearInterval(this.intervalo);
    }
}