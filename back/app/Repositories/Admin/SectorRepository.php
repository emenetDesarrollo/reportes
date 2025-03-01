<?php

namespace App\Repositories\Admin;

use App\Models\CatPoblaciones;
use App\Models\CatSectores;
use App\Models\PoblacionesSector;

class SectorRepository
{
    public function obtenerPoblacionesDisponibles($pkSector = 0) {
        $query = CatPoblaciones::select(
                                   'catPoblaciones.pkCatPoblacion',
                                   'catPoblaciones.nombrePoblacion'
                               )
                               ->leftJoin('poblacionesSector', 'catPoblaciones.pkCatPoblacion', '=', 'poblacionesSector.fkCatPoblacion')
                               ->where('catPoblaciones.activo', '1')
                               ->orderBy('catPoblaciones.nombrePoblacion', 'asc');

        if ($pkSector != 0) {
            $query->where(function ($subQuery) use ($pkSector) {
                $subQuery->where('poblacionesSector.fkCatSector', $pkSector)
                        ->orWhereNull('poblacionesSector.fkCatSector');
            });
        } else {
            $query->whereNull('poblacionesSector.fkCatSector');
        }

        return $query->get();
    }

    public function registrarSector ($sector) {
        $registro = new CatSectores();
        $registro->nombre      = $sector['nombre'];
        $registro->descripcion = $sector['descripcion'];
        $registro->activo      = $sector['activo'];
        $registro->save();

        return $registro->pkCatSector;
    }

    public function registrarPoblacionSector ($pkSector, $pkPoblacion) {
        $registro = new PoblacionesSector();
        $registro->fkCatSector = $pkSector;
        $registro->fkCatPoblacion = $pkPoblacion;
        $registro->save();
    }

    public function actualizarSector ($sector) {
        CatSectores::where('pkCatSector', $sector['pkCatSector'])
                   ->update([
                       'nombre'      => $sector['nombre'],
                       'descripcion' => $sector['descripcion'],
                       'activo'      => $sector['activo']
                   ]);
    }

    public function depurarPoblacionesSector ($pkSector) {
        PoblacionesSector::where('fkCatSector', $pkSector)
                         ->delete();
    }

    public function obtenerListaSectores () {
        $query = CatSectores::where('activo', 1);
        
        return $query->get();
    }

    public function obtenerPoblacionesSector ($pkSector) {
        $query = PoblacionesSector::select('catPoblaciones.*')
                                  ->join('catPoblaciones', 'catPoblaciones.pkCatPoblacion', 'poblacionesSector.fkCatPoblacion')
                                  ->where('poblacionesSector.fkCatSector', $pkSector);

        return $query->get();
    }

    public function obtenerDetalleSector ($pkSector) {
        $query = CatSectores::where('pkCatSector', $pkSector);

        return $query->get();
    }
}