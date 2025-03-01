<?php

namespace App\Services\Admin;

use App\Repositories\Admin\ReporteRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReporteService
{
    protected $reporteRepository;
    protected $usuarioService;

    public function __construct(
        ReporteRepository $ReporteRepository,
        UsuarioService $UsuarioService
    )
    {
        $this->reporteRepository = $ReporteRepository;
        $this->usuarioService = $UsuarioService;
    }

    public function validarReportePendiente ($pkReporte, $identificadorMybussines) {
        $pkStatus = $this->reporteRepository->validarReportePendiente($pkReporte, $identificadorMybussines);

        if (is_null($pkStatus)) return response()->json(
            [
                'mensaje' => 'No se encuentra ningún reporte pendiente'
            ],
            200
        );

        return response()->json(
            [
                'mensaje' => 'Se encuentra un reporte pendiente del mismo cliente, ¿Está seguro de continuar con el registro actual?<br><br>NOTA: se recomienda revisar la información del reporte existente en caso de continuar con el registro',
                'status' => 409
            ],
            200
        );
    }

    public function generarReporte ($reporte) {
        DB::beginTransaction();
            $reporte['pkTblReporte'] = $this->reporteRepository->registrarReporte($reporte);
            $this->reporteRepository->registrarDetalleReporte($reporte);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se registró el reporte con éxito, puede validar la acción en la ventana de reportes pendientes'
            ],
            200
        );
    }

    public function obtenerListaReportesStatus ($status) {
        $listaReportes = $this->reporteRepository->obtenerListaReportesStatus($status);

        foreach ($listaReportes as $reporte) {            
            $reporte->telefono = json_decode($reporte->telefonos)[0]->telefono;
        }

        return response()->json(
            [
                'data' => [
                    'listaReportes' => $listaReportes
                ],
                'mensaje' => 'Se obtuvo la lista de visitas con éxito'
            ],
            200
        );
    }

    public function obtenerDetalleReporte ($reporte) {
        $detalleReporte = $this->reporteRepository->obtenerDetalleReporte($reporte['pkReporte'])[0];

        $detalleReporte->telefonos             = json_decode($detalleReporte->telefonos);
        $detalleReporte->disponibilidadHorario = json_decode($detalleReporte->disponibilidadHorario);

        $detalleReporte->seguimiento           = json_decode($detalleReporte->seguimiento);

        if (is_array($detalleReporte->seguimiento)) {
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($reporte)[0];

            foreach ($detalleReporte->seguimiento as $item) {
                $item->type = $item->pkUsuario == $detalleUsuario->pkTblUsuario ? 'sent' : 'received';
                $item->time = $this->formatearFecha($item->time);
            }
        }

        $detalleReporte->seguimiento = is_array($detalleReporte->seguimiento) ? $detalleReporte->seguimiento : [];

        $detalleReporte->fechaRegistro        = $this->formatearFecha($detalleReporte->fechaRegistroOr);
        $detalleReporte->fechaRegistroOr      = str_replace(' ', 'T', $detalleReporte->fechaRegistroOr);
        $detalleReporte->fechaActualizacion   = $this->formatearFecha($detalleReporte->fechaActualizacionOr);
        $detalleReporte->fechaActualizacionOr = str_replace(' ', 'T', $detalleReporte->fechaActualizacionOr);
        $detalleReporte->fechaAtencion        = $this->formatearFecha($detalleReporte->fechaAtencionOr);
        $detalleReporte->fechaAtencionOr      = str_replace(' ', 'T', $detalleReporte->fechaAtencionOr);
        $detalleReporte->fechaSoluciono       = $this->formatearFecha($detalleReporte->fechaSolucionoOr);
        $detalleReporte->fechaSolucionoOr     = str_replace(' ', 'T', $detalleReporte->fechaSolucionoOr);
        $detalleReporte->fechaRetoma          = $this->formatearFecha($detalleReporte->fechaRetomaOr);
        $detalleReporte->fechaRetomaOr        = str_replace(' ', 'T', $detalleReporte->fechaRetomaOr);

        return response()->json(
            [
                'data' => [
                    'detalleReporte' => $detalleReporte
                ],
                'mensaje' => 'Se obtuvo el detalle del reporte con éxito'
            ],
            200
        );
    }

    public function actualizarReporte ($reporte) {
        DB::beginTransaction();
            $this->reporteRepository->actualizarReporte($reporte);
            $this->reporteRepository->actualizarDetalleReporte($reporte);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información del reporte con éxito'
            ],
            200
        );
    }

    public function atnederReporte ($reporte) {
        $this->reporteRepository->atnederReporte($reporte);

        return response()->json(
            [
                'mensaje' => 'Se cambió el status a "atendiendo" con éxito'
            ],
            200
        );
    }

    public function finalizarReporte ($reporte) {
        $this->reporteRepository->finalizarReporte($reporte);

        return response()->json(
            [
                'mensaje' => 'Se finalizó el reporte con éxito'
            ],
            200
        );
    }

    public function retomarReporte ($reporte) {
        $this->reporteRepository->retomarReporte($reporte);

        return response()->json(
            [
                'mensaje' => 'Se retomó el reporte con éxito'
            ],
            200
        );
    }

    public function agregarSeguimiento ($detalleSeguimiento) {
        DB::beginTransaction();
            $detalleReporte = $this->reporteRepository->obtenerDetalleReporte($detalleSeguimiento['pkTblReporte'])[0];

            $seguimiento = json_decode($detalleReporte->seguimiento);
            $seguimiento = is_array($seguimiento) ? $seguimiento : [];

            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($detalleSeguimiento)[0];

            $attrSeguimiento = [
                'pkUsuario' => $detalleUsuario->pkTblUsuario,
                'usuario' => $detalleUsuario->nombre.' '.$detalleUsuario->aPaterno,
                'info' => trim($detalleSeguimiento['seguimiento']),
                'type_message' => $detalleSeguimiento['type_message'],
                'time' => Carbon::now()->format('Y-m-d H:i:s')
            ];

            array_push($seguimiento, $attrSeguimiento);
            $detalleSeguimiento['seguimiento'] = $seguimiento;

            $this->reporteRepository->agregarSeguimiento($detalleSeguimiento);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se agregó la información al seguimiento del reporte con éxito'
            ],
            200
        );
    }

    public function obtenerSeguimiento ($seguimiento) {
        $detalleReporte = $this->reporteRepository->obtenerDetalleReporte($seguimiento['pkTblReporte'])[0];
        $detalleReporte->seguimiento = json_decode($detalleReporte->seguimiento);
        $detalleReporte->seguimiento = is_array($detalleReporte->seguimiento) ? $detalleReporte->seguimiento : [];
        $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($seguimiento)[0];

        foreach ($detalleReporte->seguimiento as $item) {
            $item->type = $item->pkUsuario == $detalleUsuario->pkTblUsuario ? 'sent' : 'received';
            $item->time = $this->formatearFecha($item->time);
        }

        return response()->json(
            [
                'seguimiento' => $detalleReporte->seguimiento,
                'mensaje' => 'Se obtuvó el seguimiento con éxito'
            ],
            200
        );
    }

    public function actualizarSeguimiento ($reporte) {
        DB::beginTransaction();
            $count = 1;
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($reporte)[0];
            
            $detalleReporte = $this->reporteRepository->obtenerDetalleReporte($reporte['pkTblReporte'])[0];
            $seguimiento = json_decode($detalleReporte->seguimiento);

            while (
                $seguimiento[count($seguimiento)-$count]->pkUsuario != $detalleUsuario->pkTblUsuario &&
                $seguimiento[count($seguimiento)-$count]->type == 'text'
            ) {
                $count++;
            }

            $seguimiento[count($seguimiento)-$count]->info = trim($reporte['seguimiento']);
            $reporte['seguimiento'] = $seguimiento;

            $this->reporteRepository->agregarSeguimiento($reporte);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información del seguimiento con éxito'
            ],
            200
        );
    }

    public function eliminarAnexoSeguimiento ($reporte) {
        DB::beginTransaction();
            $count = 1;
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($reporte)[0];
            
            $detalleReporte = $this->reporteRepository->obtenerDetalleReporte($reporte['pkTblReporte'])[0];
            $seguimiento = json_decode($detalleReporte->seguimiento);

            while (
                $seguimiento[count($seguimiento)-$count]->pkUsuario != $detalleUsuario->pkTblUsuario &&
                $seguimiento[count($seguimiento)-$count]->type == 'image'
            ) {
                $count++;
            }

            unset($seguimiento[count($seguimiento)-$count]);
            $reporte['seguimiento'] = $seguimiento;

            $this->reporteRepository->agregarSeguimiento($reporte);
        DB::commit();
        
        return response()->json(
            [
                'mensaje' => 'Se eliminó el anexo del seguimiento con éxito'
            ],
            200
        );
    }

    private function formatearFecha($fecha) {
        if ($fecha == null || trim($fecha) == '' || trim($fecha) == '0000-00-00 00:00:00') {
            return null;
        }
    
        $carbon = Carbon::parse($fecha)->locale('es');
        $ayer = Carbon::yesterday()->locale('es');
        $antier = Carbon::today()->subDays(2)->locale('es');
    
        if ($carbon->isToday()) {
            return 'Hoy ' . $carbon->format('h:i a');
        } elseif ($carbon->isSameDay($ayer)) {
            return 'Ayer ' . $carbon->format('h:i a');
        } elseif ($carbon->isSameDay($antier)) {
            return 'Antier ' . $carbon->format('h:i a');
        } else {
            $dia = $carbon->translatedFormat('d');
            $mes = ucfirst(trim(str_replace('.', '', $carbon->translatedFormat('M'))));
            return $dia.' '.$mes.' '.$carbon->translatedFormat('Y | h:i a');
        }
    }
}