<?php

namespace App\Repositories\Admin;

use App\Models\TblAvisos;
use App\Services\Admin\UsuarioService;
use Carbon\Carbon;

class AvisoRepository
{
    protected $usuarioService;

    public function __construct(
        UsuarioService $UsuarioService
    ) {
        $this->usuarioService = $UsuarioService;
    }

    public function registrarAviso ($aviso) {
        $registro = new TblAvisos();
        $registro->tipoAviso   = $aviso['tipoAviso'];
        $registro->tituloAviso = $this->formatString($aviso, 'tituloAviso');
        $registro->descripcion = $this->formatString($aviso, 'descripcion');
        $registro->fechaInicio = $aviso['fechaInicio'];
        $registro->fechaFin = $aviso['fechaFin'];
        $registro->fkTblUsuarioAlta = $this->usuarioService->obtenerPkPorToken($aviso['token']);
        $registro->fechaAlta = Carbon::now();
        $registro->save();
    }

    public function obtenerAvisos ($busqueda) {
        $query = TblAvisos::select(
                              'pkTblAviso',
                              'tipoAviso',
                              'tituloAviso',
                              'descripcion',
                              'fechaInicio',
                              'fechaFin',
                              'fkTblUsuarioAlta',
                              'fechaAlta'
                          );

        switch ($busqueda) {
            case '<':
                $query->selectRaw('"Mostrado" as status')
                      ->whereRaw('DATE_FORMAT(fechaFin, "%d-%m-%Y") < DATE_FORMAT(NOW(), "%d-%m-%Y")');
            break;
            case '=':
                $query->selectRaw('"Mostrando" as status')
                      ->whereRaw('DATE_FORMAT(fechaInicio, "%d-%m-%Y") <= DATE_FORMAT(NOW(), "%d-%m-%Y") AND DATE_FORMAT(fechaFin, "%d-%m-%Y") >= DATE_FORMAT(NOW(), "%d-%m-%Y")');
            break;
            case '>':
                $query->selectRaw('"Por mostrar" as status')
                      ->whereRaw('DATE_FORMAT(fechaInicio, "%d-%m-%Y") > DATE_FORMAT(NOW(), "%d-%m-%Y")');
            break;
        }
        
        return $query->get();
    }

    public function obtenerDetalleAviso ($pkAviso) {
        $query = TblAvisos::select(
                              'tblAvisos.pkTblAviso',
                              'tblAvisos.tipoAviso',
                              'tblAvisos.tituloAviso',
                              'tblAvisos.descripcion',
                              'tblAvisos.fechaInicio',
                              'tblAvisos.fechaFin',
                              'tblAvisos.fechaAlta',
                              'tblAvisos.fechaActualizacion'
                          )
                          ->selectRaw('concat(usuarioRegistro.nombre, " ", usuarioRegistro.aPaterno) as usuarioRegistro')
                          ->selectRaw('concat(usuarioActualizacion.nombre, " ", usuarioActualizacion.aPaterno) as usuarioActualizacion')
                          ->leftJoin('tblUsuarios as usuarioRegistro', 'usuarioRegistro.pkTblUsuario', 'tblAvisos.fkTblUsuarioAlta')
                          ->leftJoin('tblUsuarios as usuarioActualizacion', 'usuarioActualizacion.pkTblUsuario', 'tblAvisos.fkTblUsuarioActualizacion')
                          ->where('pkTblAviso', $pkAviso);

        return $query->get();
    }

    public function actualizarAviso ($aviso) {
        TblAvisos::where('pkTblAviso', $aviso['pkTblAviso'])
                 ->update([
                     'tipoAviso'                 => $aviso['tipoAviso'],
                     'tituloAviso'               => $this->formatString($aviso, 'tituloAviso'),
                     'descripcion'               => $this->formatString($aviso, 'descripcion'),
                     'fechaInicio'               => $aviso['fechaInicio'],
                     'fechaFin'                  => $aviso['fechaFin'],
                     'fkTblUsuarioActualizacion' => $this->usuarioService->obtenerPkPorToken($aviso['token']),
                     'fechaActualizacion'        => Carbon::now(),
                 ]);
    }

    public function eliminarAviso ($pkAviso) {
        TblAvisos::where('pkTblAviso', $pkAviso)
                 ->delete();
    }

    private function formatString ($arr, $index) {
        return isset($arr[$index]) && trim($arr[$index]) != '' ? trim($arr[$index]) : null;
    }
}