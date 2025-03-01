import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api, apiMyBussines, xpvkey_header } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class ReportesService {
	constructor(
		private http: HttpClient
	) { }

	public obtenerListaClientesMyBussines(): Observable<any> {
		const headers = new HttpHeaders({
			'X-PV-Key': xpvkey_header
		});
	
		const data = {
			array_poblaciones: localStorage.getItem('reportes_array_poblaciones')?.split(',') || []
		};
	
		return this.http.post<any>(`${apiMyBussines}/buscar-cliente`, data, { headers });
	}	

	public obtenerDetalleClienteMyBussines(idCliente: any): Observable<any> {
		const headers = new HttpHeaders({
			'X-PV-Key': xpvkey_header
		});
	
		return this.http.get<any>(`${apiMyBussines}/clientes-reportes/${idCliente}`, { headers });
	}

	public validarReportePendiente(pkReporte: any, validarReportePendiente: any): Observable<any> {
		return this.http.get<any>(`${api}/reportes/validarReportePendiente/${pkReporte}/${validarReportePendiente}`);
	}

	public generarReporte(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/generarReporte`, reporte);
	}

	public obtenerListaReportesStatus(status: number): Observable<any> {
		return this.http.get<any>(`${api}/reportes/obtenerListaReportesStatus/${status}`);
	}

	public obtenerDetalleReporte(pkReporte: number): Observable<any> {
		const data = {
			pkReporte,
			token: localStorage.getItem('token_emenet')
		};
		return this.http.post<any>(`${api}/reportes/obtenerDetalleReporte`, data);
	}

	public actualizarReporte(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/actualizarReporte`, reporte);
	}

	public atnederReporte(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/atnederReporte`, reporte);
	}

	public finalizarReporte(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/finalizarReporte`, reporte);
	}

	public retomarReporte(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/retomarReporte`, reporte);
	}

	public agregarSeguimiento(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/agregarSeguimiento`, reporte);
	}

	public obtenerSeguimiento(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/obtenerSeguimiento`, reporte);
	}

	public actualizarSeguimiento(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/actualizarSeguimiento`, reporte);
	}

	public eliminarAnexoSeguimiento(reporte: any): Observable<any> {
		return this.http.post<any>(`${api}/reportes/eliminarAnexoSeguimiento`, reporte);
	}
}