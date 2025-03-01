<?php

namespace App\Services\Admin;

use App\Repositories\Admin\AvisoRepository;
use App\Repositories\Admin\GenericRepository;
use Illuminate\Support\Facades\Log;

class GenericService
{
    protected $genericRepository;
    protected $avisosRepository;

    public function __construct(
        GenericRepository $GenericRepository,
        AvisoRepository $AvisoRepository
    )
    {
        $this->genericRepository = $GenericRepository;
        $this->avisosRepository = $AvisoRepository;
    }

    public function obtenerEstadisticasGenerales ($data) {
        $visitasPendientes = $this->genericRepository->obtenerVisitasPendientes();
        $instalacionesPendientes = $this->genericRepository->obtenerInstalacionesPendientes();
        $instalacionesPendientesConRetardo = $this->genericRepository->obtenerInstalacionesPendientesConRetardo();
        $reportesPendientes = $this->genericRepository->obtenerReportesPendientes();

        $reportesPorAgrupacion = $this->genericRepository->obtenerReportesAgrupacion($data['visualizacion'], $data['poblaciones']);
        $instalacionesPorAgrupacion = $this->genericRepository->obtenerInstalacionesAgrupacion($data['visualizacion'], $data['poblaciones']);

        $avisosMostrandose = $this->avisosRepository->obtenerAvisos('=');

        return response()->json(
            [
                'estadisticas' => [
                    'visitasPendientes' => $visitasPendientes,
                    'instalacionesPendientes' => $instalacionesPendientes,
                    'instalacionesPendientesConRetardo' => $instalacionesPendientesConRetardo,
                    'reportesPendientes' => $reportesPendientes,
                    'reportesPorAgrupacion' => $reportesPorAgrupacion,
                    'instalacionesPorAgrupacion' => $instalacionesPorAgrupacion,
                    'avisosMostrandose' => $avisosMostrandose
                ],
                'mensaje' => 'Se obtuvieron las estadísticas generales con éxito'
            ],
            200
        );
    }
}