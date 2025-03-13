import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class InstalacionesService {
	constructor(
		private http: HttpClient
	) { }

	public agendarInstalacion(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/agendarInstalacion`, instalacion);
	}

	public obtenerListaInstalacionesStatus(status: number): Observable<any> {
		return this.http.get<any>(`${api}/instalaciones/obtenerListaInstalacionesStatus/${status}`);
	}

	public obtenerInstalacionesRetardoUsuario(pkUsuario: number): Observable<any> {
		return this.http.get<any>(`${api}/instalaciones/obtenerInstalacionesRetardoUsuario/${pkUsuario}`);
	}

	public obtenerDetalleInstalcion(pkInstalacion: number): Observable<any> {
		return this.http.get<any>(`${api}/instalaciones/obtenerDetalleInstalcion/${pkInstalacion}`);
	}

	public actualizarInstalacion(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/actualizarInstalacion`, instalacion);
	}

	public atnederInstalacion(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/atnederInstalacion`, instalacion);
	}

	public finalizarInstalacion(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/finalizarInstalacion`, instalacion);
	}

	public instalacionNoExitosa(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/instalacionNoExitosa`, instalacion);
	}

	public retomarInstalacion(instalacion: any): Observable<any> {
		return this.http.post<any>(`${api}/instalaciones/retomarInstalacion`, instalacion);
	}
}