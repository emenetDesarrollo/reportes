import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class VisitasService {
	constructor(
		private http: HttpClient
	) { }

	public agendarVisita(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/agendarVisita`, visita);
	}
	
	public obtenerListaVisitasStatus(status: number): Observable<any> {
		return this.http.get<any>(`${api}/visitas/obtenerListaVisitasStatus/${status}`);
	}

	public obtenerDetalleVisita(pkVisita: number): Observable<any> {
		const data = {
			pkVisita,
			token: localStorage.getItem('token_emenet')
		};
		return this.http.post<any>(`${api}/visitas/obtenerDetalleVisita`, data);
	}

	public actualizarVisita(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/actualizarVisita`, visita);
	}

	public atnederVisita(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/atnederVisita`, visita);
	}

	public finalizarVisita(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/finalizarVisita`, visita);
	}

	public visitaNoExitosa(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/visitaNoExitosa`, visita);
	}

	public retomarVisita(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/retomarVisita`, visita);
	}

	public agregarSeguimiento(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/agregarSeguimiento`, visita);
	}

	public obtenerSeguimiento(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/obtenerSeguimiento`, visita);
	}

	public actualizarSeguimiento(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/actualizarSeguimiento`, visita);
	}

	public eliminarAnexoSeguimiento(visita: any): Observable<any> {
		return this.http.post<any>(`${api}/visitas/eliminarAnexoSeguimiento`, visita);
	}
}