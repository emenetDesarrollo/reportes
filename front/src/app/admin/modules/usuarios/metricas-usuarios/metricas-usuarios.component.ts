import { Component, OnDestroy, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { GenericService } from 'src/app/admin/services/api/generic/generic.service';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';

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

	protected columnasTabla: any = {
		'pkTblUsuario'   : '#',
		'nombre' : 'Usuario',
		'instalacionesRetardo'  : 'Instalaciones'
	};

	protected tableConfig: any = {
		'pkTblUsuario' : {
			'center': true
		},
		'nombre' : {
			'center': true
		},
		'instalacionesRetardo' : {
			'center': true
		}
	};

	protected datosTabla: any[] = [];
	
	private myChartMetricasReportes: any;
	private myChartMetricasInstalaciones: any;

	protected metricas: any = {};

	private intervalo: any;

	constructor (
		private generic: GenericService,
		private mensajes: MensajesService
	) {}

	async ngOnInit(): Promise<void> {
		this.cambioVisualizacion();
		this.repetitiveInstruction();
	}

	private repetitiveInstruction(): void {
        this.intervalo = setInterval(async () => {
            await this.obtenerMetricasUsuarios();
        }, 7000);
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
	
	protected cambioVisualizacion(): void {
		this.mensajes.mensajeEsperar();

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
					label: 'My First Dataset',
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