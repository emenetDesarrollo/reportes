<?php

namespace App\Services\Admin;

use App\Repositories\Admin\InstalacionRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InstalacionService
{
    protected $instalacionRepository;

    public function __construct(
        InstalacionRepository $InstalacionRepository
    )
    {
        $this->instalacionRepository = $InstalacionRepository;
    }

    public function agendarInstalacion ($instalcion) {
        DB::beginTransaction();
            $instalcion['pkTblInstalacion'] = $this->instalacionRepository->registrarInstalacion($instalcion);
            $this->instalacionRepository->registrarDetalleInstalacion($instalcion);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se agendó la instalación con éxito, puede validar la acción en la ventana de instalaciones pendientes'
            ],
            200
        );
    }

    public function obtenerListaInstalacionesStatus ($status) {
        $listaInstalaciones = $this->instalacionRepository->obtenerListaInstalacionesStatus($status);

        foreach ($listaInstalaciones as $instalacion) {            
            $instalacion->telefono = json_decode($instalacion->telefonos)[0]->telefono;
        }

        return response()->json(
            [
                'data' => [
                    'listaInstalaciones' => $listaInstalaciones
                ],
                'mensaje' => 'Se obtuvo la lista de instalaciones con éxito'
            ],
            200
        );
    }

    public function obtenerDetalleInstalcion ($pkInstalacion) {
        $datalleInstalacion = $this->instalacionRepository->obtenerDetalleInstalcion($pkInstalacion)[0];

        $datalleInstalacion->telefonos             = json_decode($datalleInstalacion->telefonos);
        $datalleInstalacion->correos               = json_decode($datalleInstalacion->correos);
        $datalleInstalacion->disponibilidadHorario = json_decode($datalleInstalacion->disponibilidadHorario);
        $datalleInstalacion->evidencias            = json_decode($datalleInstalacion->evidencias);

        $datalleInstalacion->fechaRegistro        = $this->formatearFecha($datalleInstalacion->fechaRegistroOr);
        $datalleInstalacion->fechaRegistroOr      = str_replace(' ', 'T', $datalleInstalacion->fechaRegistroOr);
        $datalleInstalacion->fechaActualizacion   = $this->formatearFecha($datalleInstalacion->fechaActualizacionOr);
        $datalleInstalacion->fechaActualizacionOr = str_replace(' ', 'T', $datalleInstalacion->fechaActualizacionOr);
        $datalleInstalacion->fechaAtencion        = $this->formatearFecha($datalleInstalacion->fechaAtencionOr);
        $datalleInstalacion->fechaAtencionOr      = str_replace(' ', 'T', $datalleInstalacion->fechaAtencionOr);
        $datalleInstalacion->fechaInstalacion     = $this->formatearFecha($datalleInstalacion->fechaInstalacionOr);
        $datalleInstalacion->fechaInstalacionOr   = str_replace(' ', 'T', $datalleInstalacion->fechaInstalacionOr);
        $datalleInstalacion->fechaCancelacion     = $this->formatearFecha($datalleInstalacion->fechaCancelacionOr);
        $datalleInstalacion->fechaCancelacionOr   = str_replace(' ', 'T', $datalleInstalacion->fechaCancelacionOr);
        $datalleInstalacion->fechaRetoma          = $this->formatearFecha($datalleInstalacion->fechaRetomaOr);
        $datalleInstalacion->fechaRetomaOr        = str_replace(' ', 'T', $datalleInstalacion->fechaRetomaOr);

        $datalleInstalacion->estadoRetraso = $datalleInstalacion->estadoRetraso != null ? $this->formatearRetraso($datalleInstalacion->estadoRetraso) : null;

        return response()->json(
            [
                'data' => [
                    'datalleInstalacion' => $datalleInstalacion
                ],
                'mensaje' => 'Se obtuvo el detalle de la instalación con éxito'
            ],
            200
        );
    }

    public function actualizarInstalacion ($instalacion) {
        DB::beginTransaction();
            $this->instalacionRepository->actualizarInstalacion($instalacion);
            $this->instalacionRepository->actualizarDetalleInstalacion($instalacion);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información de la instalación con éxito'
            ],
            200
        );
    }

    public function atnederInstalacion ($instalacion) {
        $this->instalacionRepository->atnederInstalacion($instalacion);

        return response()->json(
            [
                'mensaje' => 'Se cambió el status a "atendiendo" con éxito'
            ],
            200
        );
    }

    public function finalizarInstalacion ($instalacion) {
        $this->instalacionRepository->finalizarInstalacion($instalacion);

        return response()->json(
            [
                'mensaje' => 'Se finalizó la instalación con éxito'
            ],
            200
        );
    }

    public function instalacionNoExitosa ($instalacion) {
        $this->instalacionRepository->instalacionNoExitosa($instalacion);

        return response()->json(
            [
                'mensaje' => 'Se canceló la instalación con éxito'
            ],
            200
        );
    }

    public function retomarInstalacion ($instalacion) {
        $this->instalacionRepository->retomarInstalacion($instalacion);

        return response()->json(
            [
                'mensaje' => 'Se retomó la instalación con éxito'
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

    private function formatearRetraso ($minutos) {
        $dias = floor($minutos / 1440);
        $horas = floor(($minutos % 1440) / 60);
        $minutos = $minutos % 60;
    
        $resultado = [];
    
        if ($dias > 0) $resultado[] = $dias . ' ' . ($dias === 1 ? 'día,' : 'días,');
        if ($horas > 0) $resultado[] = $horas . ' ' . ($horas === 1 ? 'hora y' : 'horas y');
        if ($minutos > 0) $resultado[] = $minutos . ' ' . ($minutos === 1 ? 'minuto' : 'minutos');
    
        return implode(' ', $resultado);
    }
}