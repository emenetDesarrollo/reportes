import { Component, OnDestroy, OnInit } from '@angular/core';
import { GenericService } from '../../services/api/generic/generic.service';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import Chart from 'chart.js/auto';
import { CatalogosService } from '../../services/api/catalogos/catalogos.service';
import { AdminGuard } from '../../guards/admin.guard';
import { ModalService } from '../../services/modal/modal.service';
import { ConsultaInstalacionesRetardoComponent } from '../instalaciones/consulta-instalaciones-retardo/consulta-instalaciones-retardo.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    private intervalo: any;
    protected estadisticas: any = {};

    protected visualizacion: string = 'day';
    protected listaPoblaciones: any = [];
    private poblacionesSeleccionadas: any = [];

    private myChartEstadisticasAgrupadas: any;

    constructor(
        private apiGenerica: GenericService,
        private mensajes: MensajesService,
        private catalogos: CatalogosService,
        protected guard: AdminGuard,
        private modal: ModalService
    ) { }

    async ngOnInit(): Promise<void> {
        await this.obtenerPoblacionesSectoresUsuario();
    }

    private repetitiveInstruction(): void {
        this.intervalo = setInterval(async () => {
            await this.obtenerEstadisticas();
        }, 7000);
    }

    private obtenerPoblacionesSectoresUsuario(): Promise<any> {
        return this.catalogos.obtenerPoblacionesSectoresUsuario().toPromise().then(
            respuesta => {
                this.listaPoblaciones = respuesta.data.listaPoblaciones;
            }, error => {
            }
        );
    }

    protected cambioAgrupacion(): void {
        delete this.estadisticas.reportesPorAgrupacion;
        delete this.estadisticas.instalacionesPorAgrupacion;
        clearInterval(this.intervalo);
        this.obtenerEstadisticas().then(() => {
            this.repetitiveInstruction();
        });
    }

    protected cambioPoblaciones(data: any): void {
        if (this.listaPoblaciones.length == 0) return;

        delete this.estadisticas.reportesPorAgrupacion;
        delete this.estadisticas.instalacionesPorAgrupacion;
        this.poblacionesSeleccionadas = data.selectedOptions;
        clearInterval(this.intervalo);
        this.obtenerEstadisticas().then(() => {
            this.repetitiveInstruction();
        });
    }

    private obtenerEstadisticas(): Promise<any> {
        const data = {
            visualizacion: this.visualizacion,
            poblaciones: this.poblacionesSeleccionadas.filter((item: any) => item.checked).map((item: any) => item.value)
        };

        return this.apiGenerica.obtenerEstadisticas(data).toPromise().then(
            respuesta => {
                this.estadisticas = respuesta.estadisticas;
                this.actualizarGraficaEstadisticasAgrupadas();
            }, error => {
            }
        );
    }

    protected obtenerClaseAviso(tipoAviso: string): any {
        switch (tipoAviso.toLowerCase()) {
            case 'informativo':
                return 'info';
            case 'advertencia':
                return 'warning';
            case 'urgente':
                return 'danger';
        }
    }


    get totalReportes() {
        return this.estadisticas.reportesPorAgrupacion?.reduce((total: any, item: any) => total + item.reportes, 0) ?? 0;
    }

    get totalInstalaciones() {
        return this.estadisticas.instalacionesPorAgrupacion?.reduce((total: any, item: any) => total + item.instalaciones, 0) ?? 0;
    }

    private actualizarGraficaEstadisticasAgrupadas(): void {
        if (this.myChartEstadisticasAgrupadas) {
            this.myChartEstadisticasAgrupadas.destroy();
        }
    
        const config: any = {
            type: 'line',
            data: {
                labels: this.estadisticas.reportesPorAgrupacion?.map(({ agrupacion }: any) => agrupacion),
                datasets: [
                    {
                        label: 'Instalaciones',
                        data: this.estadisticas.reportesPorAgrupacion?.map(({ reportes }: any) => reportes),
                        pointStyle: 'circle',
                        pointRadius: 10,
                        pointHoverRadius: 15,
                        tension: 0.2
                    }, {
                        label: 'Reportes',
                        data: this.estadisticas.instalacionesPorAgrupacion?.map(({ instalaciones }: any) => instalaciones),
                        pointStyle: 'circle',
                        pointRadius: 10,
                        pointHoverRadius: 15,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 0
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
        };
    
        this.myChartEstadisticasAgrupadas = new Chart("estadisticasAgrupadas", config);
    }

    protected abrirModalInstalacionesRetardo(): void {
        this.modal.abrirModalConComponente(ConsultaInstalacionesRetardoComponent);
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalo);
    }
}