import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class SectoresService {
	constructor(
		private http: HttpClient
	) { }

	public obtenerPoblacionesDisponibles(pkSector: number = 0): Observable<any> {
		return this.http.get<any>(`${api}/sectores/obtenerPoblacionesDisponibles/${pkSector}`);
	}
	
	public registrarSector(sector: any): Observable<any> {
		return this.http.post<any>(`${api}/sectores/registrarSector`, sector);
	}

	public actualizarSector(sector: any): Observable<any> {
		return this.http.post<any>(`${api}/sectores/actualizarSector`, sector);
	}

	public obtenerListaSectores(): Observable<any> {
		return this.http.get<any>(`${api}/sectores/obtenerListaSectores`);
	}

	public obtenerPoblacionesSector(pkSector: number): Observable<any> {
		return this.http.get<any>(`${api}/sectores/obtenerPoblacionesSector/${pkSector}`);
	}

	public obtenerDetalleSector(pkSector: number): Observable<any> {
		return this.http.get<any>(`${api}/sectores/obtenerDetalleSector/${pkSector}`);
	}

	public obtenerListaSectoresSelect(): Observable<any> {
		return this.http.get<any>(`${api}/sectores/obtenerListaSectoresSelect`);
	}
}