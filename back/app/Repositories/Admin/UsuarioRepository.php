<?php

namespace App\Repositories\Admin;

use App\Models\TblInstalaciones;
use App\Models\TblReportes;
use App\Models\TblSesiones;
use App\Models\TblUsuarios;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class UsuarioRepository
{
    public function obtenerInformacionUsuarioPorToken ( $token ) {
        $usuario = TblSesiones::select(
                                  'tblUsuarios.pkTblUsuario',
                                  'tblUsuarios.nombre',
                                  'tblUsuarios.aPaterno',
                                  'tblUsuarios.aMaterno',
                                  'tblUsuarios.correo',
                                  'tblUsuarios.password',
                                  'tblUsuarios.fechaAlta',
                                  'tblUsuarios.activo',
                                  'tblUsuarios.sectores',
                                  'tblUsuarios.fkCatPerfil',
                                  'catPerfiles.nombre as perfil',
                                  'tblUsuarios.permisos',
                              )
                              ->join('tblUsuarios', 'tblUsuarios.pkTblUsuario', 'tblSesiones.fkTblUsuario')
                              ->join('catPerfiles', 'catPerfiles.pkCatPerfil', 'tblUsuarios.fkCatPerfil')
							  ->where('tblSesiones.token', $token);

        return $usuario->get();
    }

    public function obtenerInformacionUsuarioPorPk ( $pkUsuario ) {
        $usuario = TblUsuarios::select(
                                  'tblUsuarios.pkTblUsuario',
                                  'tblUsuarios.nombre',
                                  'tblUsuarios.aPaterno',
                                  'tblUsuarios.aMaterno',
                                  'tblUsuarios.correo',
                                  'tblUsuarios.password',
                                  'tblUsuarios.fechaAlta',
                                  'tblUsuarios.activo',
                                  'tblUsuarios.sectores',
                                  'tblUsuarios.fkCatPerfil',
                                  'catPerfiles.nombre as perfil',
                                  'tblUsuarios.permisos',
                              )
                              ->join('catPerfiles', 'catPerfiles.pkCatPerfil', 'tblUsuarios.fkCatPerfil')
                              ->where('tblUsuarios.pkTblUsuario', $pkUsuario);

        return $usuario->get();
    }

    public function obtenerReportesSolucionadosUsuario ($pkUsuario) {
        $query = TblReportes::where('fkUsuarioSoluciono', $pkUsuario);

        return $query->count();
    }

    public function obtenerInstalacionesAgendadasUsuario ($pkUsuario) {
        $query = TblInstalaciones::where('fkUsuarioRegistro', $pkUsuario);

        return $query->count();
    }

    public function obtenerInstalacionesInstaladasUsuario ($pkUsuario) {
        $query = TblInstalaciones::where('fkUsuarioInstalacion', $pkUsuario);

        return $query->count();
    }

    public function obtenerListaUsuarios () {
        $query = TblUsuarios::select(
                                'tblUsuarios.pkTblUsuario',
                                'tblUsuarios.nombre',
                                'tblUsuarios.aPaterno',
                                'tblUsuarios.aMaterno',
                                'tblUsuarios.correo',
                                'tblUsuarios.password',
                                'tblUsuarios.fechaAlta'
                            )
                            ->selectRaw('CONCAT(tblUsuarios.nombre, " ",tblUsuarios.aPaterno) as nombreCompleto')
                            ->selectRaw('
                                CASE
                                    WHEN activo = 1 THEN "Activo"
                                    WHEN activo = 0 THEN "Inactivo"
                                END as status
                            ')
                            ->selectRaw('
                                CASE
                                    WHEN (select count(tblSesiones.fkTblUsuario) from tblSesiones where tblSesiones.fkTblUsuario = tblUsuarios.pkTblUsuario) > 0 THEN true
                                    ELSE false
                                END as linea
                            ')
                            ->distinct();

        return $query->get();
    }

    public function validarCorreoExiste ($correo, $idUsuario = 0) {
        $validarCorreo = TblUsuarios::where([
                                            ['correo',$correo],
                                            ['pkTblUsuario','!=', $idUsuario]
                                        ]);
        return $validarCorreo->count();
    }

    public function registrarUsuario ($datosUsuario) {
        $registro = new TblUsuarios();
        $registro->nombre      = $datosUsuario['nombre'];
        $registro->aPaterno    = $datosUsuario['aPaterno'];
        $registro->aMaterno    = $datosUsuario['aMaterno'];
        $registro->correo      = $datosUsuario['correo'];
        $registro->password    = bcrypt('Emenet:'.(Carbon::now()->format('Y')));
        $registro->fkCatPerfil = $datosUsuario['pkPerfil'];
        $registro->sectores    = $datosUsuario['sectores'];
        $registro->permisos    = $datosUsuario['permisos'];
        $registro->fechaAlta   = Carbon::now();
        $registro->activo      = 1;
        $registro->save();
    }

    public function actualizarInformacionUsuario ($datosUsuario, $idUsuario) {
        $update = [
            'nombre'      => $this->trimValidator($datosUsuario['nombre']),
            'aPaterno'    => $this->trimValidator($datosUsuario['aPaterno']),
            'aMaterno'    => $this->trimValidator($datosUsuario['aMaterno']),
            'correo'      => $this->trimValidator($datosUsuario['correo']),
            'fkCatPerfil' => $datosUsuario['pkPerfil'],
        ];

        if (isset($datosUsuario['sectores'])) $update['sectores'] = $datosUsuario['sectores'];
        if (isset($datosUsuario['permisos'])) $update['permisos'] = $datosUsuario['permisos'];
        
        TblUsuarios::where('pkTblUsuario', $idUsuario)
                   ->update($update);
    }

    public function actualizarPasswordUsuario ($idUsuario, $nuevaContrasenia) {
        TblUsuarios::where('pkTblUsuario', $idUsuario)
                   ->update([
                       'password' => bcrypt($nuevaContrasenia)
                   ]);
    }

    public function validarContraseniaActual ($idUsuario, $password) {
        $temporal = TblUsuarios::select(
                                    'password'
                                )
                                ->where('pkTblUsuario', $idUsuario)
                                ->first();

        return password_verify($password, $temporal->password);
    }

    public function cerrarSesionesActivas ($pkUsuario) {
        TblSesiones::where('fkTblUsuario', $pkUsuario)
                   ->delete();
    }

    public function cambiarStatusSesion ($pkUsuario, $activo) {
        TblUsuarios::where('pkTblUsuario', $pkUsuario)
                   ->update([
                      'activo' => $activo
                   ]);
    }

    public function trimValidator ( $value ) {
		return $value != null && trim($value) != '' ? trim($value) : null;
	}
}