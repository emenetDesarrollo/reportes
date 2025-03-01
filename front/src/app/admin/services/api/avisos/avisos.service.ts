import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class AvisosService {
	constructor(
		private http: HttpClient
	) { }

	public registrarAviso(aviso: any): Observable<any> {
		return this.http.post<any>(`${api}/avisos/registrarAviso`, aviso);
	}

	public obtenerAvisos(busqueda: string): Observable<any> {
		return this.http.get<any>(`${api}/avisos/obtenerAvisos/${busqueda}`);
	}

	public obtenerDetalleAviso(pkAviso: number): Observable<any> {
		return this.http.get<any>(`${api}/avisos/obtenerDetalleAviso/${pkAviso}`);
	}

	public actualizarAviso(aviso: any): Observable<any> {
		return this.http.post<any>(`${api}/avisos/actualizarAviso`, aviso);
	}

	public eliminarAviso(pkAviso: number): Observable<any> {
		return this.http.get<any>(`${api}/avisos/eliminarAviso/${pkAviso}`);
	}
}