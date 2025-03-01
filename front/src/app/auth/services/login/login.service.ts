import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';
@Injectable({
	providedIn: 'root'
})
export class LoginService {
	constructor(
		private http: HttpClient
	) { }

	public login(credenciales: any): Observable<any> {
		return this.http.post<any>(api + '/auth/login', credenciales);
	}

	public auth(token: any): Observable<any> {
		return this.http.post<any>(api + '/auth', { token });
	}

	public logout(token: any): Observable<any> {
		return this.http.post<any>(api + '/logout', { token });
	}
}