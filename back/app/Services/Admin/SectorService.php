<?php

namespace App\Services\Admin;

use App\Repositories\Admin\SectorRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SectorService
{
    protected $sectorRepository;

    public function __construct(
        SectorRepository $SectorRepository
    )
    {
        $this->sectorRepository = $SectorRepository;
    }

    public function obtenerPoblacionesDisponibles ($pkSector) {
        $poblaciones = $this->sectorRepository->obtenerPoblacionesDisponibles($pkSector);

        $poblacionesSelect = [];

        foreach( $poblaciones as $item ){
            $temp = [
                'value' => $item->pkCatPoblacion,
                'label' => $item->nombrePoblacion,
                'checked' => false
            ];

            array_push($poblacionesSelect, $temp);
        }

        return response()->json(
            [
                'poblaciones' => $poblacionesSelect,
                'mensaje' => 'Se obtuvieron las poblaciones disponibles'
            ]
        );
    }

    public function registrarSector ($sector) {
        DB::beginTransaction();
            $pkSector = $this->sectorRepository->registrarSector($sector);
            foreach ($sector['poblaciones'] as $pkPoblacion) {
                $this->sectorRepository->registrarPoblacionSector($pkSector, $pkPoblacion);
            }
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se registro el sector con éxito'
            ]
        );
    }

    public function actualizarSector ($sector) {
        DB::beginTransaction();
            $this->sectorRepository->actualizarSector($sector);
            $this->sectorRepository->depurarPoblacionesSector($sector['pkCatSector']);
            foreach ($sector['poblaciones'] as $pkPoblacion) {
                $this->sectorRepository->registrarPoblacionSector($sector['pkCatSector'], $pkPoblacion);
            }
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó el sector con éxito'
            ]
        );
    }

    public function obtenerListaSectores () {
        $listaSectores = $this->sectorRepository->obtenerListaSectores();

        return response()->json(
            [
                'listaSectores' => $listaSectores,
                'mensaje' => 'Se obtuvo la lista de sectores con éxito'
            ]
        );
    }

    public function obtenerPoblacionesSector ($pkSector) {
        $poblacionesSector = $this->sectorRepository->obtenerPoblacionesSector($pkSector);

        $poblacionesSelect = [];

        foreach( $poblacionesSector as $item ){
            $temp = [
                'value' => $item->pkCatPoblacion,
                'label' => $item->nombrePoblacion,
                'checked' => true
            ];

            array_push($poblacionesSelect, $temp);
        }

        return response()->json(
            [
                'poblacionesSector' => $poblacionesSelect,
                'mensaje' => 'Se consultaron las poblaciones del sector en cuestión con éxito'
            ]
        );
    }

    public function obtenerDetalleSector ($pkSector) {
        $detalleSector = $this->sectorRepository->obtenerDetalleSector($pkSector)[0];
        $poblacionesSector = $this->sectorRepository->obtenerPoblacionesSector($pkSector);

        $data = json_decode($poblacionesSector, true);

        $arrPob = array_map(function ($item) {
            return $item['pkCatPoblacion'];
        }, $data);

        $detalleSector->poblaciones = $arrPob;

        return response()->json(
            [
                'detalleSector' => $detalleSector,
                'mensaje' => 'Se obtuvo el detalle del sector con éxito'
            ]
        );
    }

    public function obtenerListaSectoresSelect () {
        $listaSectores = $this->sectorRepository->obtenerListaSectores();

        $sectoresSelect = [];

        foreach( $listaSectores as $item ){
            $poblacionesSector = $this->sectorRepository->obtenerPoblacionesSector($item->pkCatSector);

            $poblacionesSelect = [];

            foreach( $poblacionesSector as $item2 ){
                $temp2 = [
                    'value' => $item2->pkCatPoblacion,
                    'label' => $item2->nombrePoblacion,
                    'checked' => true
                ];

                array_push($poblacionesSelect, $temp2);
            }

            $temp = [
                'value' => $item->pkCatSector,
                'label' => $item->nombre,
                'poblaciones' => $poblacionesSelect,
                'checked' => false
            ];

            array_push($sectoresSelect, $temp);
        }

        return response()->json(
            [
                'sectoresSelect' => $sectoresSelect,
                'mensaje' => 'Se consultaron los sectores con éxito'
            ]
        );
    }
}