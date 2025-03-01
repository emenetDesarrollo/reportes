<?php

namespace App\Services\Admin;

use App\Repositories\Admin\VisitaRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisitaService
{
    protected $visitaRepository;
    protected $usuarioService;

    public function __construct(
        VisitaRepository $VisitaRepository,
        UsuarioService $UsuarioService
    )
    {
        $this->visitaRepository = $VisitaRepository;
        $this->usuarioService = $UsuarioService;
    }

    public function agendarVisita ($visita) {
        DB::beginTransaction();
            $visita['pkTblVisita'] = $this->visitaRepository->registrarVisita($visita);
            $this->visitaRepository->registrarDetalleVisita($visita);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se agendó la visita con éxito, puede validar la acción en la ventana de visitas pendientes'
            ],
            200
        );
    }

    public function obtenerListaVisitasStatus ($status) {
        $listaVisitas = $this->visitaRepository->obtenerListaVisitasStatus($status);

        foreach ($listaVisitas as $visita) {  
            $visita->nombreStatus = $visita->nombreStatus == 'Instalada' ? 'Finalizada' : $visita->nombreStatus;
            $visita->telefono = json_decode($visita->telefonos)[0]->telefono;
        }

        return response()->json(
            [
                'data' => [
                    'listaVisitas' => $listaVisitas
                ],
                'mensaje' => 'Se obtuvo la lista de visitas con éxito'
            ],
            200
        );
    }

    public function obtenerDetalleVisita ($visita) {
        $detalleVisita = $this->visitaRepository->obtenerDetalleVisita($visita['pkVisita'])[0];

        $detalleVisita->telefonos             = json_decode($detalleVisita->telefonos);
        $detalleVisita->disponibilidadHorario = json_decode($detalleVisita->disponibilidadHorario);
        $detalleVisita->seguimiento           = json_decode($detalleVisita->seguimiento);

        if (is_array($detalleVisita->seguimiento)) {
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($visita)[0];

            foreach ($detalleVisita->seguimiento as $item) {
                $item->type = $item->pkUsuario == $detalleUsuario->pkTblUsuario ? 'sent' : 'received';
                $item->time = $this->formatearFecha($item->time);
            }
        }

        $detalleVisita->seguimiento = is_array($detalleVisita->seguimiento) ? $detalleVisita->seguimiento : [];

        $detalleVisita->fechaRegistro        = $this->formatearFecha($detalleVisita->fechaRegistroOr);
        $detalleVisita->fechaRegistroOr      = str_replace(' ', 'T', $detalleVisita->fechaRegistroOr);
        $detalleVisita->fechaActualizacion   = $this->formatearFecha($detalleVisita->fechaActualizacionOr);
        $detalleVisita->fechaActualizacionOr = str_replace(' ', 'T', $detalleVisita->fechaActualizacionOr);
        $detalleVisita->fechaAtencion        = $this->formatearFecha($detalleVisita->fechaAtencionOr);
        $detalleVisita->fechaAtencionOr      = str_replace(' ', 'T', $detalleVisita->fechaAtencionOr);
        $detalleVisita->fechaFinalizacion    = $this->formatearFecha($detalleVisita->fechaFinalizacionOr);
        $detalleVisita->fechaFinalizacionOr  = str_replace(' ', 'T', $detalleVisita->fechaFinalizacionOr);
        $detalleVisita->fechaCancelacion     = $this->formatearFecha($detalleVisita->fechaCancelacionOr);
        $detalleVisita->fechaCancelacionOr   = str_replace(' ', 'T', $detalleVisita->fechaCancelacionOr);
        $detalleVisita->fechaRetoma          = $this->formatearFecha($detalleVisita->fechaRetomaOr);
        $detalleVisita->fechaRetomaOr        = str_replace(' ', 'T', $detalleVisita->fechaRetomaOr);

        return response()->json(
            [
                'data' => [
                    'detalleVisita' => $detalleVisita
                ],
                'mensaje' => 'Se obtuvo el detalle de la visita con éxito'
            ],
            200
        );
    }

    public function actualizarVisita ($visita) {
        DB::beginTransaction();
            $this->visitaRepository->actualizarVisita($visita);
            $this->visitaRepository->actualizarDetalleVisita($visita);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información de la visita con éxito'
            ],
            200
        );
    }

    public function atnederVisita ($visita) {
        $this->visitaRepository->atnederVisita($visita);

        return response()->json(
            [
                'mensaje' => 'Se cambió el status a "atendiendo" con éxito'
            ],
            200
        );
    }

    public function finalizarVisita ($visita) {
        $this->visitaRepository->finalizarVisita($visita);

        return response()->json(
            [
                'mensaje' => 'Se finalizó la visita con éxito'
            ],
            200
        );
    }

    public function visitaNoExitosa ($visita) {
        $this->visitaRepository->visitaNoExitosa($visita);

        return response()->json(
            [
                'mensaje' => 'Se canceló la visita con éxito'
            ],
            200
        );
    }

    public function retomarVisita ($visita) {
        $this->visitaRepository->retomarVisita($visita);

        return response()->json(
            [
                'mensaje' => 'Se retomó la visita con éxito'
            ],
            200
        );
    }

    public function agregarSeguimiento ($detalleSeguimiento) {
        DB::beginTransaction();
            $detalleVisita = $this->visitaRepository->obtenerDetalleVisita($detalleSeguimiento['pkTblVisita'])[0];

            $seguimiento = json_decode($detalleVisita->seguimiento);
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

            $this->visitaRepository->agregarSeguimiento($detalleSeguimiento);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se agregó la información al seguimiento de la visita con éxito'
            ],
            200
        );
    }

    public function obtenerSeguimiento ($visita) {
        $detalleVisita = $this->visitaRepository->obtenerDetalleVisita($visita['pkTblVisita'])[0];
        $detalleVisita->seguimiento = json_decode($detalleVisita->seguimiento);
        $detalleVisita->seguimiento = is_array($detalleVisita->seguimiento) ? $detalleVisita->seguimiento : [];
        $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($visita)[0];

        foreach ($detalleVisita->seguimiento as $item) {
            $item->type = $item->pkUsuario == $detalleUsuario->pkTblUsuario ? 'sent' : 'received';
            $item->time = $this->formatearFecha($item->time);
        }

        return response()->json(
            [
                'seguimiento' => $detalleVisita->seguimiento,
                'mensaje' => 'Se obtuvó el seguimiento con éxito'
            ],
            200
        );
    }

    public function actualizarSeguimiento ($visita) {
        DB::beginTransaction();
            $count = 1;
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($visita)[0];

            $detalleVisita = $this->visitaRepository->obtenerDetalleVisita($visita['pkTblVisita'])[0];
            $seguimiento = json_decode($detalleVisita->seguimiento);

            while (
                $seguimiento[count($seguimiento)-$count]->pkUsuario != $detalleUsuario->pkTblUsuario &&
                $seguimiento[count($seguimiento)-$count]->type == 'text'
            ) {
                $count++;
            }

            $seguimiento[count($seguimiento)-1]->info = trim($visita['seguimiento']);
            $visita['seguimiento'] = $seguimiento;

            $this->visitaRepository->agregarSeguimiento($visita);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información del seguimiento con éxito'
            ],
            200
        );
    }

    public function eliminarAnexoSeguimiento ($visita) {
        DB::beginTransaction();
            $count = 1;
            $detalleUsuario = $this->usuarioService->obtenerInformacionUsuarioPorToken($visita)[0];
            
            $detalleVisita = $this->visitaRepository->obtenerDetalleVisita($visita['pkTblVisita'])[0];
            $seguimiento = json_decode($detalleVisita->seguimiento);

            while (
                $seguimiento[count($seguimiento)-$count]->pkUsuario != $detalleUsuario->pkTblUsuario &&
                $seguimiento[count($seguimiento)-$count]->type == 'image'
            ) {
                $count++;
            }

            unset($seguimiento[count($seguimiento)-$count]);
            $visita['seguimiento'] = $seguimiento;

            $this->visitaRepository->agregarSeguimiento($visita);
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