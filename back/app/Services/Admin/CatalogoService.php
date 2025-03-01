<?php

namespace App\Services\Admin;

use App\Repositories\Admin\CatalogoRepository;
use App\Repositories\Admin\UsuarioRepository;
use Illuminate\Support\Facades\Log;

class CatalogoService
{
    protected $catalogoRepository;
    protected $usuarioRepository;

    public function __construct(
        CatalogoRepository $CatalogoRepository,
        UsuarioRepository $UsuarioRepository
    )
    {
        $this->catalogoRepository = $CatalogoRepository;
        $this->usuarioRepository = $UsuarioRepository;
    }

    public function registrarPoblacion ($poblacione) {
        $this->catalogoRepository->registrarPoblacion($poblacione);

        return response()->json(
            [
                'mensaje' => 'Se regitró la población con éxito'
            ]
        );
    }

    public function obtenerPoblacionesSelect () {
        $poblaciones = $this->catalogoRepository->obtenerPoblacionesSelect();
        $opcionesSelect = [];

        foreach( $poblaciones as $item ){
            $temp = [
                'value' => $item->pkCatPoblacion,
                'label' => $item->nombrePoblacion,
                'siglas' => $item->siglas,
                'disabled' => $item->activo == 0,
                'checked' => false
            ];

            array_push($opcionesSelect, $temp);
        }
        
        return response()->json(
            [
                'data' => [
                    'listaPoblaciones' => $opcionesSelect
                ],
                'mensaje' => 'Se obtuvieron las poblaciones con éxito'
            ]
        );
    }

    public function obtenerPoblaciones () {
        $poblaciones = $this->catalogoRepository->obtenerPoblaciones();

        return response()->json(
            [
                'data' => [
                    'poblaciones' => $poblaciones
                ],
                'mensaje' => 'Se obtuvieron las poblaciones con éxito'
            ]
        );
    }

    public function obtenerDetallePoblacion ($pkPoblacion) {
        $detallePoblacion = $this->catalogoRepository->obtenerDetallePoblacion($pkPoblacion);

        return response()->json(
            [
                'data' => [
                    'detallePoblacion' => $detallePoblacion
                ],
                'mensaje' => 'Se obtuvo el detalle de la población con éxito'
            ]
        );
    }

    public function actualizarPoblacion ($poblacion) {
        $this->catalogoRepository->actualizarPoblacion($poblacion);

        return response()->json(
            [
                'mensaje' => 'Se actualizó la población con éxito'
            ]
        );
    }

    public function obtenerRazonesVisitaSelect () {
        $razonesVisita = $this->catalogoRepository->obtenerRazonesVisitaSelect();

        return response()->json(
            [
                'data' => [
                    'razonesVisita' => $razonesVisita
                ],
                'mensaje' => 'Se obtuvieron las razones con éxito'
            ]
        );
    }

    public function obtenerProblemasReporteSelect () {
        $problemasReporte = $this->catalogoRepository->obtenerProblemasReporteSelect();

        return response()->json(
            [
                'data' => [
                    'problemasReporte' => $problemasReporte
                ],
                'mensaje' => 'Se obtuvieron los problemas con éxito'
            ]
        );
    }

    public function obtenerPoblacionesSectoresUsuario ($token) {
        $sectores = $this->usuarioRepository->obtenerInformacionUsuarioPorToken( $token['token'] )[0]->sectores;
        $sectores = explode(",", $sectores);

        $poblaciones = $this->catalogoRepository->obtenerPoblacionesSectores($sectores);
        $opcionesSelect = [];

        foreach( $poblaciones as $item ){
            $temp = [
                'value' => $item['pkCatPoblacion'],
                'label' => $item['nombrePoblacion'],
                'checked' => true
            ];

            array_push($opcionesSelect, $temp);
        }
        
        return response()->json(
            [
                'data' => [
                    'listaPoblaciones' => $opcionesSelect
                ],
                'mensaje' => 'Se obtuvieron las poblaciones con éxito'
            ]
        );
    }

    public function obtenerListaPerfiles () {
        $listaPerfiles = $this->catalogoRepository->obtenerListaPerfiles();

        return response()->json(
            [
                'listaPerfiles' => $listaPerfiles,
                'mensaje' => 'Se obtuvieron los problemas con éxito'
            ]
        );
    }
}