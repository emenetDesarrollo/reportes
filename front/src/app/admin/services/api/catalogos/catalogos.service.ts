import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class CatalogosService {
	constructor(
		private http: HttpClient
	) { }

	public registrarPoblacion(poblacion: any): Observable<any> {
		return this.http.post<any>(`${api}/catalogos/registrarPoblacion`, poblacion);
	}

	public obtenerPoblacionesSelect(): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerPoblacionesSelect`);
	}

	public obtenerPoblaciones(): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerPoblaciones`);
	}

	public obtenerDetallePoblacion(pkPoblacion: number): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerDetallePoblacion/${pkPoblacion}`);
	}

	public actualizarPoblacion(poblacion: any): Observable<any> {
		return this.http.post<any>(`${api}/catalogos/actualizarPoblacion`, poblacion);
	}

	public obtenerRazonesVisitaSelect(): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerRazonesVisitaSelect`);
	}

	public obtenerProblemasReporteSelect(): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerProblemasReporteSelect`);
	}

	public obtenerPoblacionesSectoresUsuario(): Observable<any> {
		const token = localStorage.getItem('token_emenet');
		return this.http.post<any>(`${api}/catalogos/obtenerPoblacionesSectoresUsuario`, { token });
	}

	public obtenerListaPerfiles(): Observable<any> {
		return this.http.get<any>(`${api}/catalogos/obtenerListaPerfiles`);
	}
}