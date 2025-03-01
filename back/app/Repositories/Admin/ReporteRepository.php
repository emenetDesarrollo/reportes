<?php

namespace App\Repositories\Admin;

use App\Models\TblDetalleReporte;
use App\Models\TblReportes;
use App\Services\Admin\UsuarioService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReporteRepository
{
    protected $usuarioService;

    public function __construct(
        UsuarioService $UsuarioService
    ) {
        $this->usuarioService = $UsuarioService;
    }

    public function validarReportePendiente ($pkReporte, $identificadorMybussines) {
        $query = TblDetalleReporte::select(
                                      'tblReportes.fkCatStatus'
                                  )
                                  ->join('tblReportes', function ($join) use ($pkReporte) {
                                      $join->on('tblReportes.pkTblReporte', 'tblDetalleReporte.fkTblReporte')
                                           ->where('tblReportes.pkTblReporte', '!=', $pkReporte)
                                           ->where('tblReportes.fkCatStatus', '<=', 2);
                                  })
                                  ->where('tblDetalleReporte.identificadorMybussines', $identificadorMybussines);

        return $query->get()[0]->fkCatStatus ?? null;
    }

    public function registrarReporte ($reporte) {
        $registro                         = new TblReportes();
        $registro->fkUsuarioRegistro      = $this->usuarioService->obtenerPkPorToken($reporte['token']);
        $registro->fechaRegistro          = Carbon::now();
        $registro->fkCatStatus            = 1;
        $registro->save();

        return $registro->pkTblReporte;
    }

    public function registrarDetalleReporte ($reporte) {
        $registro                           = new TblDetalleReporte();
        $registro->fkTblReporte             = $reporte['pkTblReporte'];
        $registro->identificadorMybussines  = $reporte['identificadorMybussines'];
        $registro->nombreCliente            = $this->formatString($reporte, 'nombreCliente');
        $registro->telefonos                = json_encode($reporte['telefonos']);
        $registro->codigoPostal             = $this->formatString($reporte, 'codigoPostal');
        $registro->fkCatPoblacion           = $this->formatString($reporte, 'fkCatPoblacion');
        $registro->newFkCatPoblacion        = $this->formatString($reporte, 'newFkCatPoblacion');
        $registro->coordenadas              = $this->formatString($reporte, 'coordenadas');
        $registro->newCoordenadas           = $this->formatString($reporte, 'newCoordenadas');
        $registro->direccionDomicilio       = $this->formatString($reporte, 'direccionDomicilio');
        $registro->newDireccionDomicilio    = $this->formatString($reporte, 'newDireccionDomicilio');
        $registro->caracteristicasDomicilio = $this->formatString($reporte, 'caracteristicasDomicilio');
        $registro->referenciasDomicilio     = $this->formatString($reporte, 'referenciasDomicilio');
        $registro->newReferenciasDomicilio  = $this->formatString($reporte, 'newReferenciasDomicilio');
        $registro->fkCatProblemaReporte     = $this->formatString($reporte, 'fkCatProblemaReporte');
        $registro->otroProblema             = $this->formatString($reporte, 'otroProblema');
        $registro->disponibilidadHorario    = json_encode($reporte['disponibilidadHorario']);
        $registro->descripcion              = $this->formatString($reporte, 'descripcion');
        $registro->observaciones            = $this->formatString($reporte, 'observaciones');
        $registro->save();
    }

    public function obtenerListaReportesStatus ($status) {
        $query = TblReportes::select(
                                'tblReportes.pkTblReporte',
                                DB::raw('CONCAT("#", tblReportes.pkTblReporte) as identificador'),
                                'tblDetalleReporte.nombreCliente',
                                'catPoblaciones.nombrePoblacion',
                                'tblDetalleReporte.telefonos',
                                'tblDetalleReporte.coordenadas',
                                'catStatus.nombreStatus',
                                DB::raw('IFNULL(catProblemasReporte.problema, "Cambio de domicilio") as problema')
                            )
                            ->selectRaw('
                               (case
                                   when tblReportes.fkCatStatus = 1 then tblReportes.fechaRegistro
                                   when tblReportes.fkCatStatus = 2 then tblReportes.fechaRegistro
                                   when tblReportes.fkCatStatus = 3 then tblReportes.fechaSoluciono
                               end) as fecha
                            ')
                            ->leftJoin('tblDetalleReporte', 'tblDetalleReporte.fkTblReporte', 'tblReportes.pkTblReporte')
                            ->leftJoin('catPoblaciones', 'catPoblaciones.pkCatPoblacion', 'tblDetalleReporte.fkCatPoblacion')
                            ->leftJoin('catProblemasReporte', 'catProblemasReporte.pkCatProblemaReporte', 'tblDetalleReporte.fkCatProblemaReporte')
                            ->leftJoin('catStatus', 'catStatus.pkCatStatus', 'tblReportes.fkCatStatus')
                            ->whereBetween('tblReportes.fkCatStatus', [$status, $status == 1 ? 2 : $status])
                            ->orderBy('tblReportes.pkTblReporte', 'asc');

        return $query->get();
    }

    public function obtenerDetalleReporte ($pkReporte) {
        $query = TblReportes::select(
                                'tblReportes.pkTblReporte',
                                DB::raw('CONCAT("#", tblReportes.pkTblReporte) as identificador'),
                                'tblDetalleReporte.identificadorMybussines',
                                'tblDetalleReporte.nombreCliente',
                                'tblDetalleReporte.telefonos',
                                'tblDetalleReporte.codigoPostal',
                                'tblDetalleReporte.fkCatPoblacion',
                                'tblDetalleReporte.newFkCatPoblacion',
                                'tblDetalleReporte.coordenadas',
                                'tblDetalleReporte.newCoordenadas',
                                'tblDetalleReporte.direccionDomicilio',
                                'tblDetalleReporte.newDireccionDomicilio',
                                'tblDetalleReporte.caracteristicasDomicilio',
                                'tblDetalleReporte.referenciasDomicilio',
                                'tblDetalleReporte.newReferenciasDomicilio',
                                'tblDetalleReporte.fkCatProblemaReporte',
                                'tblDetalleReporte.otroProblema',
                                'tblDetalleReporte.diagnostico',
                                'tblDetalleReporte.solucion',
                                'tblDetalleReporte.disponibilidadHorario',
                                'tblDetalleReporte.descripcion',
                                'tblDetalleReporte.observaciones',
                                'tblDetalleReporte.seguimiento',
                                'usuarioRegistro.pkTblUsuario as pkTblUsuarioRegistro',
                                'tblReportes.fechaRegistro as fechaRegistroOr',
                                'usuarioActualizacion.pkTblUsuario as pkTblUsuarioActualizacion',
                                'tblReportes.fechaActualizacion as fechaActualizacionOr',
                                'usuarioAtencion.pkTblUsuario as pkTblUsuarioAtencion',
                                'tblReportes.fechaAtencion as fechaAtencionOr',
                                'usuarioSoluciono.pkTblUsuario as pkTblUsuarioSoluciono',
                                'tblReportes.fechaSoluciono as fechaSolucionoOr',
                                'usuarioRetoma.pkTblUsuario as pkTblusuarioRetoma',
                                'tblReportes.fechaRetoma as fechaRetomaOr',
                                'tblReportes.fkCatStatus'
                            )
                            ->selectRaw('concat(usuarioRegistro.nombre, " ", usuarioRegistro.aPaterno) as usuarioRegistro')
                            ->selectRaw('concat(usuarioActualizacion.nombre, " ", usuarioActualizacion.aPaterno) as usuarioActualizacion')
                            ->selectRaw('concat(usuarioAtencion.nombre, " ", usuarioAtencion.aPaterno) as usuarioAtencion')
                            ->selectRaw('concat(usuarioSoluciono.nombre, " ", usuarioSoluciono.aPaterno) as usuarioSoluciono')
                            ->selectRaw('concat(usuarioRetoma.nombre, " ", usuarioRetoma.aPaterno) as usuarioRetoma')
                            ->leftJoin('tblDetalleReporte', 'tblDetalleReporte.fkTblReporte', 'tblReportes.pkTblReporte')
                            ->leftJoin('tblUsuarios as usuarioRegistro', 'usuarioRegistro.pkTblUsuario', 'tblReportes.fkUsuarioRegistro')
                            ->leftJoin('tblUsuarios as usuarioActualizacion', 'usuarioActualizacion.pkTblUsuario', 'tblReportes.fkUsuarioActualizacion')
                            ->leftJoin('tblUsuarios as usuarioAtencion', 'usuarioAtencion.pkTblUsuario', 'tblReportes.fkUsuarioAtencion')
                            ->leftJoin('tblUsuarios as usuarioSoluciono', 'usuarioSoluciono.pkTblUsuario', 'tblReportes.fkUsuarioSoluciono')
                            ->leftJoin('tblUsuarios as usuarioRetoma', 'usuarioRetoma.pkTblUsuario', 'tblReportes.fkUsuarioRetoma')
                            ->where('tblReportes.pkTblReporte', $pkReporte);
 
         return $query->get();
    }

    public function actualizarReporte ($reporte) {
        TblReportes::where('pkTblReporte', $reporte['pkTblReporte'])
                   ->update([
                       'fkUsuarioActualizacion' => $this->usuarioService->obtenerPkPorToken($reporte['token']),
                       'fechaActualizacion' => Carbon::now()
                   ]);
    }

    public function actualizarDetalleReporte ($reporte) {
        TblDetalleReporte::where('fkTblReporte', $reporte['pkTblReporte'])
                         ->update([
                             'identificadorMybussines'  => $reporte['identificadorMybussines'],
                             'nombreCliente'            => $this->formatString($reporte, 'nombreCliente'),
                             'telefonos'                => json_encode($reporte['telefonos']),
                             'codigoPostal'             => $this->formatString($reporte, 'codigoPostal'),
                             'fkCatPoblacion'           => $this->formatString($reporte, 'fkCatPoblacion'),
                             'newFkCatPoblacion'        => $this->formatString($reporte, 'newFkCatPoblacion'),
                             'coordenadas'              => $this->formatString($reporte, 'coordenadas'),
                             'newCoordenadas'           => $this->formatString($reporte, 'newCoordenadas'),
                             'direccionDomicilio'       => $this->formatString($reporte, 'direccionDomicilio'),
                             'newDireccionDomicilio'    => $this->formatString($reporte, 'newDireccionDomicilio'),
                             'caracteristicasDomicilio' => $this->formatString($reporte, 'caracteristicasDomicilio'),
                             'referenciasDomicilio'     => $this->formatString($reporte, 'referenciasDomicilio'),
                             'newReferenciasDomicilio'  => $this->formatString($reporte, 'newReferenciasDomicilio'),
                             'fkCatProblemaReporte'     => $this->formatString($reporte, 'fkCatProblemaReporte'),
                             'otroProblema'             => $this->formatString($reporte, 'otroProblema'),
                             'diagnostico'              => $this->formatString($reporte, 'diagnostico'),
                             'solucion'                 => $this->formatString($reporte, 'solucion'),
                             'disponibilidadHorario'    => json_encode($reporte['disponibilidadHorario']),
                             'descripcion'              => $this->formatString($reporte, 'descripcion'),
                             'observaciones'            => $this->formatString($reporte, 'observaciones')
                         ]);
    }

    public function atnederReporte ($reporte) {
        TblReportes::where('pkTblReporte', $reporte['pkTblReporte'])
                   ->update([
                       'fkUsuarioAtencion' => $this->usuarioService->obtenerPkPorToken($reporte['token']),
                       'fechaAtencion' => Carbon::now(),
                       'fkCatStatus' => 2
                   ]);
    }
    
    public function finalizarReporte ($reporte) {
        TblReportes::where('pkTblReporte', $reporte['pkTblReporte'])
                   ->update([
                       'fkUsuarioSoluciono' => $this->usuarioService->obtenerPkPorToken($reporte['token']),
                       'fechaSoluciono' => Carbon::now(),
                       'fkCatStatus' => 5
                   ]);
    }

    public function retomarReporte ($reporte) {
        TblReportes::where('pkTblReporte', $reporte['pkTblReporte'])
                   ->update([
                       'fkUsuarioRetoma' => $this->usuarioService->obtenerPkPorToken($reporte['token']),
                       'fechaRetoma' => Carbon::now(),
                       'fkUsuarioAtencion' => null,
                       'fechaAtencion' => null,
                       'fkUsuarioSoluciono' => null,
                       'fechaSoluciono' => null,
                       'fkCatStatus' => 1
                   ]);
    }

    public function agregarSeguimiento ($reporte) {
        TblDetalleReporte::where('fkTblReporte', $reporte['pkTblReporte'])
                        ->update([
                            'seguimiento' => json_encode($reporte['seguimiento']),
                        ]);
    }

    private function formatString ($arr, $index) {
        return isset($arr[$index]) && trim($arr[$index]) != '' ? trim($arr[$index]) : null;
    }
}