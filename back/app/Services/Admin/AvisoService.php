<?php

namespace App\Services\Admin;

use App\Repositories\Admin\AvisoRepository;

class AvisoService
{
    protected $avisoRepository;

    public function __construct(
        AvisoRepository $AvisoRepository
    )
    {
        $this->avisoRepository = $AvisoRepository;
    }

    public function registrarAviso ($aviso) {
        $this->avisoRepository->registrarAviso($aviso);

        return response()->json(
            [
                'mensaje' => 'Se agregó el aviso con éxito'
            ],
            200
        );
    }

    public function obtenerAvisos ($busqueda) {
        $avisos = $this->avisoRepository->obtenerAvisos($busqueda);

        return response()->json(
            [
                'avisos' => $avisos,
                'mensaje' => 'Se obtuvieron los avisos con éxito'
            ],
            200
        );
    }

    public function obtenerDetalleAviso ($pkAviso) {
        $detalleAviso = $this->avisoRepository->obtenerDetalleAviso($pkAviso);

        return response()->json(
            [
                'detalleAviso' => $detalleAviso,
                'mensaje' => 'Se obtuvó el detalle del aviso con éxito'
            ],
            200
        );
    }

    public function actualizarAviso ($aviso) {
        $this->avisoRepository->actualizarAviso($aviso);

        return response()->json(
            [
                'mensaje' => 'Se actualizó el aviso con éxito'
            ],
            200
        );
    }

    public function eliminarAviso ($pkAviso) {
        $this->avisoRepository->eliminarAviso($pkAviso);

        return response()->json(
            [
                'mensaje' => 'Se eliminó el aviso con éxito'
            ],
            200
        );
    }
}