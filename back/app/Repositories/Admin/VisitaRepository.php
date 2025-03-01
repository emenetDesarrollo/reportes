<?php

namespace App\Repositories\Admin;

use App\Models\TblDetalleVisita;
use App\Models\TblVisitas;
use App\Services\Admin\UsuarioService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VisitaRepository
{
    protected $usuarioService;

    public function __construct(
        UsuarioService $UsuarioService
    ) {
        $this->usuarioService = $UsuarioService;
    }

    public function registrarVisita ($visita) {
        $registro                         = new TblVisitas();
        $registro->fkUsuarioRegistro      = $this->usuarioService->obtenerPkPorToken($visita['token']);
        $registro->fechaRegistro          = Carbon::now();
        $registro->fkCatStatus            = 1;
        $registro->save();

        return $registro->pkTblVisita;
    }

    public function registrarDetalleVisita ($visita) {
        $registro                           = new TblDetalleVisita();
        $registro->fkTblVisita              = $visita['pkTblVisita'];
        $registro->nombreCliente            = $this->formatString($visita, 'nombreCliente');
        $registro->telefonos                = json_encode($visita['telefonos']);
        $registro->codigoPostal             = $this->formatString($visita, 'codigoPostal');
        $registro->fkCatPoblacion           = $visita['fkCatPoblacion'];
        $registro->coordenadas              = $this->formatString($visita, 'coordenadas');
        $registro->direccionDomicilio       = $this->formatString($visita, 'direccionDomicilio');
        $registro->caracteristicasDomicilio = $this->formatString($visita, 'caracteristicasDomicilio');
        $registro->referenciasDomicilio     = $this->formatString($visita, 'referenciasDomicilio');
        $registro->fkCatRazonVisita         = $visita['fkCatRazonVisita'];
        $registro->otraRazon                = $this->formatString($visita, 'otraRazon');
        $registro->disponibilidadHorario    = json_encode($visita['disponibilidadHorario']);
        $registro->descripcion              = $this->formatString($visita, 'descripcion');
        $registro->observaciones            = $this->formatString($visita, 'observaciones');
        $registro->save();
    }

    public function obtenerListaVisitasStatus ($status) {
        $query = TblVisitas::select(
                               'tblVisitas.pkTblVisita',
                               DB::raw('CONCAT("#", tblVisitas.pkTblVisita) as identificador'),
                               'tblDetalleVisita.nombreCliente',
                               'catPoblaciones.nombrePoblacion',
                               'tblDetalleVisita.telefonos',
                               'tblDetalleVisita.coordenadas',
                               'catStatus.nombreStatus'
                           )
                           ->selectRaw("
                               case
                                   when catRazonesVisita.razon is null then 'Otra razón'
                                   else catRazonesVisita.razon
                               end razon
                           ")
                           ->selectRaw('
                              (case
                                  when tblVisitas.fkCatStatus = 1 then tblVisitas.fechaRegistro
                                  when tblVisitas.fkCatStatus = 2 then tblVisitas.fechaRegistro
                                  when tblVisitas.fkCatStatus = 3 then tblVisitas.fechaFinalizacion
                                  when tblVisitas.fkCatStatus = 4 then tblVisitas.fechaCancelacion
                              end) as fecha
                           ')
                           ->leftJoin('tblDetalleVisita', 'tblDetalleVisita.fkTblVisita', 'tblVisitas.pkTblVisita')
                           ->leftJoin('catPoblaciones', 'catPoblaciones.pkCatPoblacion', 'tblDetalleVisita.fkCatPoblacion')
                           ->leftJoin('catRazonesVisita', 'catRazonesVisita.pkCatRazonVisita', 'tblDetalleVisita.fkCatRazonVisita')
                           ->leftJoin('catStatus', 'catStatus.pkCatStatus', 'tblVisitas.fkCatStatus')
                           ->whereBetween('tblVisitas.fkCatStatus', [$status, $status == 1 ? 2 : $status])
                           ->orderBy('tblVisitas.pkTblVisita', 'asc');

        return $query->get();
    }

    public function obtenerDetalleVisita ($pkVisita) {
        $query = TblVisitas::select(
                               'tblVisitas.pkTblVisita',
                               DB::raw('CONCAT("#", tblVisitas.pkTblVisita) as identificador'),
                               'tblDetalleVisita.nombreCliente',
                               'tblDetalleVisita.telefonos',
                               'tblDetalleVisita.codigoPostal',
                               'tblDetalleVisita.fkCatPoblacion',
                               'tblDetalleVisita.coordenadas',
                               'tblDetalleVisita.direccionDomicilio',
                               'tblDetalleVisita.caracteristicasDomicilio',
                               'tblDetalleVisita.referenciasDomicilio',
                               'tblDetalleVisita.fkCatRazonVisita',
                               'tblDetalleVisita.otraRazon',
                               'tblDetalleVisita.solucion',
                               'tblDetalleVisita.disponibilidadHorario',
                               'tblDetalleVisita.descripcion',
                               'tblDetalleVisita.observaciones',
                               'tblDetalleVisita.seguimiento',
                               'usuarioRegistro.pkTblUsuario as pkTblUsuarioRegistro',
                               'tblVisitas.fechaRegistro as fechaRegistroOr',
                               'usuarioActualizacion.pkTblUsuario as pkTblUsuarioActualizacion',
                               'tblVisitas.fechaActualizacion as fechaActualizacionOr',
                               'usuarioAtencion.pkTblUsuario as pkTblUsuarioAtencion',
                               'tblVisitas.fechaAtencion as fechaAtencionOr',
                               'usuarioFinalizacion.pkTblUsuario as pkTblUsuarioFinalizacion',
                               'tblVisitas.fechaFinalizacion as fechaFinalizacionOr',
                               'usuarioCancelacion.pkTblUsuario as pkTblUsuarioCancelacion',
                               'tblVisitas.fechaCancelacion as fechaCancelacionOr',
                               'usuarioRetoma.pkTblUsuario as pkTblusuarioRetoma',
                               'tblVisitas.fechaRetoma as fechaRetomaOr',
                               'tblVisitas.fkCatStatus'
                           )
                           ->selectRaw('concat(usuarioRegistro.nombre, " ", usuarioRegistro.aPaterno) as usuarioRegistro')
                           ->selectRaw('concat(usuarioActualizacion.nombre, " ", usuarioActualizacion.aPaterno) as usuarioActualizacion')
                           ->selectRaw('concat(usuarioAtencion.nombre, " ", usuarioAtencion.aPaterno) as usuarioAtencion')
                           ->selectRaw('concat(usuarioFinalizacion.nombre, " ", usuarioFinalizacion.aPaterno) as usuarioFinalizacion')
                           ->selectRaw('concat(usuarioCancelacion.nombre, " ", usuarioCancelacion.aPaterno) as usuarioCancelacion')
                           ->selectRaw('concat(usuarioRetoma.nombre, " ", usuarioRetoma.aPaterno) as usuarioRetoma')
                           ->leftJoin('tblDetalleVisita', 'tblDetalleVisita.fkTblVisita', 'tblVisitas.pkTblVisita')
                           ->leftJoin('tblUsuarios as usuarioRegistro', 'usuarioRegistro.pkTblUsuario', 'tblVisitas.fkUsuarioRegistro')
                           ->leftJoin('tblUsuarios as usuarioActualizacion', 'usuarioActualizacion.pkTblUsuario', 'tblVisitas.fkUsuarioActualizacion')
                           ->leftJoin('tblUsuarios as usuarioAtencion', 'usuarioAtencion.pkTblUsuario', 'tblVisitas.fkUsuarioAtencion')
                           ->leftJoin('tblUsuarios as usuarioFinalizacion', 'usuarioFinalizacion.pkTblUsuario', 'tblVisitas.fkUsuarioFinalizacion')
                           ->leftJoin('tblUsuarios as usuarioCancelacion', 'usuarioCancelacion.pkTblUsuario', 'tblVisitas.fkUsuarioCancelacion')
                           ->leftJoin('tblUsuarios as usuarioRetoma', 'usuarioRetoma.pkTblUsuario', 'tblVisitas.fkUsuarioRetoma')
                           ->where('tblVisitas.pkTblVisita', $pkVisita);
 
         return $query->get();
    }

    public function actualizarVisita ($visita) {
        TblVisitas::where('pkTblVisita', $visita['pkTblVisita'])
                  ->update([
                      'fkUsuarioActualizacion' => $this->usuarioService->obtenerPkPorToken($visita['token']),
                      'fechaActualizacion' => Carbon::now()
                  ]);
    }

    public function actualizarDetalleVisita ($visita) {
        TblDetalleVisita::where('fkTblVisita', $visita['pkTblVisita'])
                             ->update([
                                 'nombreCliente'            => $this->formatString($visita, 'nombreCliente'),
                                 'telefonos'                => json_encode($visita['telefonos']),
                                 'codigoPostal'             => $this->formatString($visita, 'codigoPostal'),
                                 'fkCatPoblacion'           => $visita['fkCatPoblacion'],
                                 'coordenadas'              => $this->formatString($visita, 'coordenadas'),
                                 'direccionDomicilio'       => $this->formatString($visita, 'direccionDomicilio'),
                                 'caracteristicasDomicilio' => $this->formatString($visita, 'caracteristicasDomicilio'),
                                 'referenciasDomicilio'     => $this->formatString($visita, 'referenciasDomicilio'),
                                 'fkCatRazonVisita'         => $visita['fkCatRazonVisita'],
                                 'otraRazon'                => $this->formatString($visita, 'otraRazon'),
                                 'solucion'                 => $this->formatString($visita, 'solucion'),
                                 'disponibilidadHorario'    => json_encode($visita['disponibilidadHorario']),
                                 'descripcion'              => $this->formatString($visita, 'descripcion'),
                                 'observaciones'            => $this->formatString($visita, 'observaciones')
                             ]);
    }

    public function atnederVisita ($visita) {
        TblVisitas::where('pkTblVisita', $visita['pkTblVisita'])
                        ->update([
                            'fkUsuarioAtencion' => $this->usuarioService->obtenerPkPorToken($visita['token']),
                            'fechaAtencion' => Carbon::now(),
                            'fkCatStatus' => 2
                        ]);
    }
    
    public function finalizarVisita ($visita) {
        TblVisitas::where('pkTblVisita', $visita['pkTblVisita'])
                        ->update([
                            'fkUsuarioFinalizacion' => $this->usuarioService->obtenerPkPorToken($visita['token']),
                            'fechaFinalizacion' => Carbon::now(),
                            'fkCatStatus' => 3
                        ]);
    }

    public function visitaNoExitosa ($visita) {
        TblVisitas::where('pkTblVisita', $visita['pkTblVisita'])
                        ->update([
                            'fkUsuarioCancelacion' => $this->usuarioService->obtenerPkPorToken($visita['token']),
                            'fechaCancelacion' => Carbon::now(),
                            'fkUsuarioAtencion' => null,
                            'fechaAtencion' => null,
                            'fkCatStatus' => 4
                        ]);
    }

    public function retomarVisita ($visita) {
        TblVisitas::where('pkTblVisita', $visita['pkTblVisita'])
                        ->update([
                            'fkUsuarioRetoma' => $this->usuarioService->obtenerPkPorToken($visita['token']),
                            'fechaRetoma' => Carbon::now(),
                            'fkUsuarioCancelacion' => null,
                            'fechaCancelacion' => null,
                            'fkCatStatus' => 1
                        ]);
    }

    public function agregarSeguimiento ($visita) {
        TblDetalleVisita::where('fkTblVisita', $visita['pkTblVisita'])
                        ->update([
                            'seguimiento' => json_encode($visita['seguimiento']),
                        ]);
    }

    private function formatString ($arr, $index) {
        return isset($arr[$index]) && trim($arr[$index]) != '' ? trim($arr[$index]) : null;
    }
}