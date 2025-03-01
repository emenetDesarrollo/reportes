import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api } from 'src/environments/environments';

@Injectable({
	providedIn: 'root'
})
export class UsuariosService {
	constructor(
		private http: HttpClient
	) { }

	public obtenerInformacionUsuarioPorToken(token: any): Observable<any> {
		return this.http.post<any>(api + '/usuarios/obtenerInformacionUsuarioPorToken', { token });
	}

	public obtenerInformacionUsuarioPorPk(pkUsuario: number): Observable<any> {
		return this.http.get<any>(api + `/usuarios/obtenerInformacionUsuarioPorPk/${pkUsuario}`);
	}

	public registrarUsuario(datosNuevoUsuario: any): Observable<any> {
		return this.http.post<any>(api + '/usuarios/registrarUsuario', datosNuevoUsuario);
	}

	public actualizarInformacionUsuario(datosUsuarioModificacion: any): Observable<any> {
		return this.http.post<any>(api + '/usuarios/actualizarInformacionUsuario', datosUsuarioModificacion);
	}

	public actualizarPasswordUsuario(datosUsuarioModificacion: any): Observable<any> {
		return this.http.post<any>(api + '/usuarios/actualizarPasswordUsuario', datosUsuarioModificacion);
	}

	public validarContraseniaActual(credenciales: any): Observable<any> {
		return this.http.post<any>(api + '/usuarios/validarContraseniaActual', credenciales);
	}

	public obtenerListaUsuarios(): Observable<any> {
		return this.http.get<any>(api + '/usuarios/obtenerListaUsuarios');
	}
}