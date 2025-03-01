<?php

namespace App\Repositories\Admin;

use App\Models\TblDetalleInstalacion;
use App\Models\TblInstalaciones;
use App\Services\Admin\UsuarioService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InstalacionRepository
{
    protected $usuarioService;

    public function __construct(
        UsuarioService $UsuarioService
    ) {
        $this->usuarioService = $UsuarioService;
    }

    public function registrarInstalacion ($instalacion) {
        $registro                         = new TblInstalaciones();
        $registro->fkUsuarioRegistro      = $this->usuarioService->obtenerPkPorToken($instalacion['token']);
        $registro->fechaRegistro          = Carbon::now();
        $registro->fkCatStatus            = 1;
        $registro->save();

        return $registro->pkTblInstalacion;
    }

    public function registrarDetalleInstalacion ($instalacion) {
        $registro                           = new TblDetalleInstalacion();
        $registro->fkTblInstalacion         = $instalacion['pkTblInstalacion'];
        $registro->nombreCliente            = $this->formatString($instalacion, 'nombreCliente');
        $registro->telefonos                = json_encode($instalacion['telefonos']);
        $registro->correos                  = json_encode($instalacion['correos']);
        $registro->codigoPostal             = $this->formatString($instalacion, 'codigoPostal');
        $registro->fkCatPoblacion           = $instalacion['fkCatPoblacion'];
        $registro->coordenadas              = $this->formatString($instalacion, 'coordenadas');
        $registro->direccionDomicilio       = $this->formatString($instalacion, 'direccionDomicilio');
        $registro->caracteristicasDomicilio = $this->formatString($instalacion, 'caracteristicasDomicilio');
        $registro->referenciasDomicilio     = $this->formatString($instalacion, 'referenciasDomicilio');
        $registro->pkPlanInternet           = $instalacion['pkPlanInternet'];
        $registro->costoInstalacion         = $this->formatString($instalacion, 'costoInstalacion');
        $registro->disponibilidadHorario    = json_encode($instalacion['disponibilidadHorario']);
        $registro->fkCatClasificacion       = $instalacion['fkCatClasificacion'];
        $registro->duracionEstimada         = $instalacion['duracionEstimada'];
        $registro->observaciones            = $this->formatString($instalacion, 'observaciones');
        $registro->save();
    }

    public function obtenerListaInstalacionesStatus ($status) {
        $query = TblInstalaciones::select(
                                     'tblInstalaciones.pkTblInstalacion',
                                     DB::raw('CONCAT("#", tblInstalaciones.pkTblInstalacion) as identificador'),
                                     'tblDetalleInstalacion.nombreCliente',
                                     'catPoblaciones.nombrePoblacion',
                                     'tblDetalleInstalacion.telefonos',
                                     'catClasificaciones.nombreClasificacion',
                                     'tblDetalleInstalacion.coordenadas',
                                     'catStatus.nombreStatus'
                                 )
                                 ->selectRaw('
                                    (case
                                        when tblInstalaciones.fkCatStatus = 1 then tblInstalaciones.fechaRegistro
                                        when tblInstalaciones.fkCatStatus = 2 then tblInstalaciones.fechaRegistro
                                        when tblInstalaciones.fkCatStatus = 3 then tblInstalaciones.fechaInstalacion
                                        when tblInstalaciones.fkCatStatus = 4 then tblInstalaciones.fechaCancelacion
                                    end) as fecha
                                 ')
                                 ->leftJoin('tblDetalleInstalacion', 'tblDetalleInstalacion.fkTblInstalacion', 'tblInstalaciones.pkTblInstalacion')
                                 ->leftJoin('catPoblaciones', 'catPoblaciones.pkCatPoblacion', 'tblDetalleInstalacion.fkCatPoblacion')
                                 ->leftJoin('catClasificaciones', 'catClasificaciones.pkCatClasificacion', 'tblDetalleInstalacion.fkCatClasificacion')
                                 ->leftJoin('catStatus', 'catStatus.pkCatStatus', 'tblInstalaciones.fkCatStatus')
                                 ->whereBetween('tblInstalaciones.fkCatStatus', [$status, $status == 1 ? 2 : $status])
                                 ->orderBy('tblInstalaciones.pkTblInstalacion', 'asc');

        return $query->get();
    }

    public function obtenerDetalleInstalcion ($pkInstalacion) {
       $query = TblInstalaciones::select(
                                    'tblInstalaciones.pkTblInstalacion',
                                    DB::raw('CONCAT("#", tblInstalaciones.pkTblInstalacion) as identificador'),
                                    'tblDetalleInstalacion.nombreCliente',
                                    'tblDetalleInstalacion.telefonos',
                                    'tblDetalleInstalacion.correos',
                                    'tblDetalleInstalacion.codigoPostal',
                                    'tblDetalleInstalacion.fkCatPoblacion',
                                    'tblDetalleInstalacion.coordenadas',
                                    'tblDetalleInstalacion.direccionDomicilio',
                                    'tblDetalleInstalacion.caracteristicasDomicilio',
                                    'tblDetalleInstalacion.referenciasDomicilio',
                                    'tblDetalleInstalacion.pkPlanInternet',
                                    'tblDetalleInstalacion.costoInstalacion',
                                    'tblDetalleInstalacion.disponibilidadHorario',
                                    'tblDetalleInstalacion.fkCatClasificacion',
                                    'tblDetalleInstalacion.duracionEstimada',
                                    'tblDetalleInstalacion.observaciones',
                                    'tblDetalleInstalacion.ont',
                                    'tblDetalleInstalacion.noSerieOnt',
                                    'tblDetalleInstalacion.etiquetaSpliter',
                                    'tblDetalleInstalacion.puertoSpliter',
                                    'tblDetalleInstalacion.potencia',
                                    'tblDetalleInstalacion.coordenadasSpliter',
                                    'tblDetalleInstalacion.fibraInicio',
                                    'tblDetalleInstalacion.fibraFin',
                                    'tblDetalleInstalacion.nombreRed',
                                    'tblDetalleInstalacion.passwordRed',
                                    'tblDetalleInstalacion.evidencias',
                                    'tblDetalleInstalacion.cpe',
                                    'tblDetalleInstalacion.noSerieCpe',
                                    'tblDetalleInstalacion.router',
                                    'tblDetalleInstalacion.noSerieRouter',
                                    'usuarioRegistro.pkTblUsuario as pkTblUsuarioRegistro',
                                    'tblInstalaciones.fechaRegistro as fechaRegistroOr',
                                    'usuarioActualizacion.pkTblUsuario as pkTblUsuarioActualizacion',
                                    'tblInstalaciones.fechaActualizacion as fechaActualizacionOr',
                                    'usuarioAtencion.pkTblUsuario as pkTblUsuarioAtencion',
                                    'tblInstalaciones.fechaAtencion as fechaAtencionOr',
                                    'usuarioInstalacion.pkTblUsuario as pkTblUsuarioInstalacion',
                                    'tblInstalaciones.fechaInstalacion as fechaInstalacionOr',
                                    'usuarioCancelacion.pkTblUsuario as pkTblUsuarioCancelacion',
                                    'tblInstalaciones.fechaCancelacion as fechaCancelacionOr',
                                    'usuarioRetoma.pkTblUsuario as pkTblusuarioRetoma',
                                    'tblInstalaciones.fechaRetoma as fechaRetomaOr',
                                    'tblInstalaciones.fkCatStatus'
                                )
                                ->selectRaw('concat(usuarioRegistro.nombre, " ", usuarioRegistro.aPaterno) as usuarioRegistro')
                                ->selectRaw('concat(usuarioActualizacion.nombre, " ", usuarioActualizacion.aPaterno) as usuarioActualizacion')
                                ->selectRaw('concat(usuarioAtencion.nombre, " ", usuarioAtencion.aPaterno) as usuarioAtencion')
                                ->selectRaw('concat(usuarioInstalacion.nombre, " ", usuarioInstalacion.aPaterno) as usuarioInstalacion')
                                ->selectRaw('concat(usuarioCancelacion.nombre, " ", usuarioCancelacion.aPaterno) as usuarioCancelacion')
                                ->selectRaw('concat(usuarioRetoma.nombre, " ", usuarioRetoma.aPaterno) as usuarioRetoma')
                                ->selectRaw('CASE
                                                WHEN tblInstalaciones.fechaInstalacion > DATE_ADD(tblInstalaciones.fechaAtencion, INTERVAL tblDetalleInstalacion.duracionEstimada HOUR)
                                                THEN TIMESTAMPDIFF(MINUTE, DATE_ADD(tblInstalaciones.fechaAtencion, INTERVAL tblDetalleInstalacion.duracionEstimada HOUR), tblInstalaciones.fechaInstalacion)
                                                ELSE null
                                            END as estadoRetraso')
                                ->leftJoin('tblDetalleInstalacion', 'tblDetalleInstalacion.fkTblInstalacion', 'tblInstalaciones.pkTblInstalacion')
                                ->leftJoin('tblUsuarios as usuarioRegistro', 'usuarioRegistro.pkTblUsuario', 'tblInstalaciones.fkUsuarioRegistro')
                                ->leftJoin('tblUsuarios as usuarioActualizacion', 'usuarioActualizacion.pkTblUsuario', 'tblInstalaciones.fkUsuarioActualizacion')
                                ->leftJoin('tblUsuarios as usuarioAtencion', 'usuarioAtencion.pkTblUsuario', 'tblInstalaciones.fkUsuarioAtencion')
                                ->leftJoin('tblUsuarios as usuarioInstalacion', 'usuarioInstalacion.pkTblUsuario', 'tblInstalaciones.fkUsuarioInstalacion')
                                ->leftJoin('tblUsuarios as usuarioCancelacion', 'usuarioCancelacion.pkTblUsuario', 'tblInstalaciones.fkUsuarioCancelacion')
                                ->leftJoin('tblUsuarios as usuarioRetoma', 'usuarioRetoma.pkTblUsuario', 'tblInstalaciones.fkUsuarioRetoma')
                                ->where('tblInstalaciones.pkTblInstalacion', $pkInstalacion);

        return $query->get();
    }

    public function actualizarInstalacion ($instalacion) {
        TblInstalaciones::where('pkTblInstalacion', $instalacion['pkTblInstalacion'])
                        ->update([
                            'fkUsuarioActualizacion' => $this->usuarioService->obtenerPkPorToken($instalacion['token']),
                            'fechaActualizacion' => Carbon::now()
                        ]);
    }

    public function actualizarDetalleInstalacion ($instalacion) {
        TblDetalleInstalacion::where('fkTblInstalacion', $instalacion['pkTblInstalacion'])
                             ->update([
                                 'nombreCliente'            => $this->formatString($instalacion, 'nombreCliente'),
                                 'telefonos'                => json_encode($instalacion['telefonos']),
                                 'correos'                  => json_encode($instalacion['correos']),
                                 'codigoPostal'             => $this->formatString($instalacion, 'codigoPostal'),
                                 'fkCatPoblacion'           => $instalacion['fkCatPoblacion'],
                                 'coordenadas'              => $this->formatString($instalacion, 'coordenadas'),
                                 'direccionDomicilio'       => $this->formatString($instalacion, 'direccionDomicilio'),
                                 'caracteristicasDomicilio' => $this->formatString($instalacion, 'caracteristicasDomicilio'),
                                 'referenciasDomicilio'     => $this->formatString($instalacion, 'referenciasDomicilio'),
                                 'pkPlanInternet'           => $instalacion['pkPlanInternet'],
                                 'costoInstalacion'         => $this->formatString($instalacion, 'costoInstalacion'),
                                 'disponibilidadHorario'    => json_encode($instalacion['disponibilidadHorario']),
                                 'fkCatClasificacion'       => $instalacion['fkCatClasificacion'],
                                 'ont'                      => $this->formatString($instalacion, 'ont'),
                                 'noSerieOnt'               => $this->formatString($instalacion, 'noSerieOnt'),
                                 'etiquetaSpliter'          => $this->formatString($instalacion, 'etiquetaSpliter'),
                                 'puertoSpliter'            => $this->formatString($instalacion, 'puertoSpliter'),
                                 'potencia'                 => $this->formatString($instalacion, 'potencia'),
                                 'coordenadasSpliter'       => $this->formatString($instalacion, 'coordenadasSpliter'),
                                 'fibraInicio'              => $this->formatString($instalacion, 'fibraInicio'),
                                 'fibraFin'                 => $this->formatString($instalacion, 'fibraFin'),
                                 'nombreRed'                => $this->formatString($instalacion, 'nombreRed'),
                                 'passwordRed'              => $this->formatString($instalacion, 'passwordRed'),
                                 'evidencias'               => isset($instalacion['evidencias']) ? json_encode($instalacion['evidencias']) : null,
                                 'observaciones'            => $this->formatString($instalacion, 'observaciones'),
                                 'cpe'                      => $this->formatString($instalacion, 'cpe'),
                                 'noSerieCpe'               => $this->formatString($instalacion, 'noSerieCpe'),
                                 'router'                   => $this->formatString($instalacion, 'router'),
                                 'noSerieRouter'            => $this->formatString($instalacion, 'noSerieRouter')
                             ]);
    }

    public function atnederInstalacion ($instalacion) {
        TblInstalaciones::where('pkTblInstalacion', $instalacion['pkTblInstalacion'])
                        ->update([
                            'fkUsuarioAtencion' => $this->usuarioService->obtenerPkPorToken($instalacion['token']),
                            'fechaAtencion' => Carbon::now(),
                            'fkCatStatus' => 2
                        ]);
    }
    
    public function finalizarInstalacion ($instalacion) {
        TblInstalaciones::where('pkTblInstalacion', $instalacion['pkTblInstalacion'])
                        ->update([
                            'fkUsuarioInstalacion' => $this->usuarioService->obtenerPkPorToken($instalacion['token']),
                            'fechaInstalacion' => Carbon::now(),
                            'fkCatStatus' => 3
                        ]);
    }

    public function instalacionNoExitosa ($instalacion) {
        TblInstalaciones::where('pkTblInstalacion', $instalacion['pkTblInstalacion'])
                        ->update([
                            'fkUsuarioCancelacion' => $this->usuarioService->obtenerPkPorToken($instalacion['token']),
                            'fechaCancelacion' => Carbon::now(),
                            'fkUsuarioAtencion' => null,
                            'fechaAtencion' => null,
                            'fkCatStatus' => 4
                        ]);
    }

    public function retomarInstalacion ($instalacion) {
        TblInstalaciones::where('pkTblInstalacion', $instalacion['pkTblInstalacion'])
                        ->update([
                            'fkUsuarioRetoma' => $this->usuarioService->obtenerPkPorToken($instalacion['token']),
                            'fechaRetoma' => Carbon::now(),
                            'fkUsuarioCancelacion' => null,
                            'fechaCancelacion' => null,
                            'fkCatStatus' => 1
                        ]);
    }

    private function formatString ($arr, $index) {
        return isset($arr[$index]) && trim($arr[$index]) != '' ? trim($arr[$index]) : null;
    }
}