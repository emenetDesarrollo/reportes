<?php

namespace App\Repositories\Admin;

use App\Models\CatPerfiles;
use App\Models\CatPoblaciones;
use App\Models\CatProblemasReporte;
use App\Models\CatRazonesVisita;
use App\Models\PoblacionesSector;

class CatalogoRepository
{
    public function registrarPoblacion ($poblacion) {
        $registro = new CatPoblaciones();
        $registro->nombrePoblacion = $poblacion['nombrePoblacion'];
        $registro->siglas          = $poblacion['siglas'];
        $registro->descripcion     = $poblacion['descripcion'];
        $registro->activo          = $poblacion['status'];
        $registro->save();
    }

    public function obtenerPoblacionesSelect () {
        $query = CatPoblaciones::orderBy('nombrePoblacion', 'asc');
        
        return $query->get();
    }

    public function obtenerPoblaciones () {
        $query = CatPoblaciones::select(
                                   'pkCatPoblacion',
                                   'nombrePoblacion',
                                   'siglas'
                               )
                               ->selectRaw('
                                    (case
                                        when activo = 1 then "Activa"
                                        when activo = 0 then "Inactiva"
                                    end) as status
                               ')
                               ->orderBy('pkCatPoblacion', 'asc');

        return $query->get();
    }

    public function obtenerDetallePoblacion ($pkPoblacion) {
        $query = CatPoblaciones::where('pkCatPoblacion', $pkPoblacion);

        return $query->get()[0];
    }

    public function actualizarPoblacion ($poblacion) {
        CatPoblaciones::where('pkCatPoblacion', $poblacion['pkPoblacion'])
                      ->update([
                         'nombrePoblacion' => $poblacion['nombrePoblacion'],
                         'siglas'          => $poblacion['siglas'],
                         'descripcion'     => $poblacion['descripcion'],
                         'activo'          => $poblacion['status']
                      ]);
    }

    public function obtenerRazonesVisitaSelect () {
        $query = CatRazonesVisita::where('activo', 1);

        return $query->get();
    }

    public function obtenerProblemasReporteSelect () {
        $query = CatProblemasReporte::where('activo', 1);

        return $query->get();
    }

    public function obtenerPoblacionesSectores ($sectores) {
        $query = PoblacionesSector::select(
                                      'catPoblaciones.pkCatPoblacion',
                                      'catPoblaciones.nombrePoblacion',
                                      'catPoblaciones.siglas'
                                  )
                                  ->join('catPoblaciones', 'catPoblaciones.pkCatPoblacion', 'poblacionesSector.fkCatPoblacion')
                                  ->whereIn('poblacionesSector.fkCatSector', $sectores);

        return $query->get()->toArray();
    }

    public function obtenerListaPerfiles () {
        $query = CatPerfiles::where('activo', 1)
                            ->orderBy('pkCatPerfil', 'desc');

        return $query->get();
    }
}