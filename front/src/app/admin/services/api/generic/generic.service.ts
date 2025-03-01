import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class GenericService {
	constructor(
		private http: HttpClient
	) { }

	public obtenerInfoCoordenadas(lat: string, lon: string): Observable<any> {
		return this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
	}

	public obtenerEstadisticas(data: any): Observable<any> {
		return this.http.post<any>(`${api}/estadisticas/obtenerEstadisticas`, data);
	}
}