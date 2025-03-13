<?php

namespace App\Repositories\Admin;

use App\Models\TblInstalaciones;
use App\Models\TblReportes;
use App\Models\TblUsuarios;
use App\Models\TblVisitas;
use Carbon\Carbon;
use DateInterval;
use DatePeriod;
use DateTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenericRepository
{
    public function obtenerVisitasPendientes () {
        $query = TblVisitas::where('fkCatStatus', 1);

        return $query->count();
    }

    public function obtenerInstalacionesPendientes () {
        $query = TblInstalaciones::where('fkCatStatus', 1);

        return $query->count();
    }

    public function obtenerInstalacionesPendientesConRetardo () {
        $query = TblInstalaciones::leftJoin('tblDetalleInstalacion', 'tblDetalleInstalacion.fkTblInstalacion', 'tblInstalaciones.pkTblInstalacion')
                                 ->where('fkCatStatus', 2)
                                 ->whereRaw('NOW() > DATE_ADD(tblInstalaciones.fechaAtencion, INTERVAL tblDetalleInstalacion.duracionEstimada HOUR)');

        return $query->count();
    }

    public function obtenerReportesPendientes () {
        $query = TblReportes::where('fkCatStatus', 1);

        return $query->count();
    }

    private function obtenerFechaMinima () {
        $fechaReportes = TblReportes::select('fechaRegistro')
                                    ->orderBy('fechaRegistro', 'asc')
                                    ->first();

        $fechaInstalaciones = TblInstalaciones::select('fechaRegistro')
                                              ->orderBy('fechaRegistro', 'asc')
                                              ->first();
        
        $fechaRegistroReportes = $fechaReportes->fechaRegistro ?? Carbon::now();
        $fechaRegistroInstalaciones = $fechaInstalaciones->fechaRegistro ?? Carbon::now();

        return Carbon::parse($fechaRegistroReportes) < Carbon::parse($fechaRegistroInstalaciones) ? Carbon::parse($fechaRegistroReportes) : Carbon::parse($fechaRegistroInstalaciones);
    }

    public function obtenerReportesAgrupacion($visualizacion, $poblaciones) {
        $fechaInicio = $this->obtenerFechaMinima();
        $fechaFin = now()->format('Y-m-d');
    
        if (!$fechaInicio) {
            return collect();
        }
    
        $fechas = collect();
    
        switch ($visualizacion) {
            case 'day':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1D'), new DateTime($fechaFin . ' +1 day'));
                foreach ($intervalo as $fecha) {
                    $fechas->push($fecha->format('d-m-Y'));
                }
                $formato = "DATE_FORMAT(fechaRegistro, '%d-%m-%Y')";
                break;
    
            case 'week':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1W'), new DateTime($fechaFin . ' +1 week'));
            
                foreach ($intervalo as $fecha) {
                    $semana = $fecha->format('W');
                    $anio = $fecha->format('Y');
                    $fechas->push("Semana $semana - $anio");
                }
            
                $formato = "CONCAT('Semana ', LPAD(WEEK(fechaRegistro, 3), 2, '0'), ' - ', YEAR(fechaRegistro))";
                break;
    
            case 'month':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1M'), new DateTime($fechaFin . ' +1 month'));
                foreach ($intervalo as $fecha) {
                    $fechas->push($fecha->format('m-Y'));
                }
                $formato = "DATE_FORMAT(fechaRegistro, '%m-%Y')";
                break;
        }
    
        $reportes = TblReportes::selectRaw("COUNT(pkTblReporte) as reportes, $formato as agrupacion")
            ->leftJoin('tblDetalleReporte', 'tblDetalleReporte.fkTblReporte', 'tblReportes.pkTblReporte')
            ->whereIn('tblDetalleReporte.fkCatPoblacion', $poblaciones)
            ->groupBy('agrupacion')
            ->pluck('reportes', 'agrupacion');
    
        $resultado = $fechas->map(function ($fecha) use ($reportes) {
            return [
                'agrupacion' => $fecha,
                'reportes' => $reportes[$fecha] ?? 0
            ];
        });
    
        return $resultado;
    }

    public function obtenerInstalacionesAgrupacion($visualizacion, $poblaciones) {
        $fechaInicio = $this->obtenerFechaMinima();
        $fechaFin = now()->format('Y-m-d');
    
        if (!$fechaInicio) {
            return collect();
        }
    
        $fechas = collect();
    
        switch ($visualizacion) {
            case 'day':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1D'), new DateTime($fechaFin . ' +1 day'));
                foreach ($intervalo as $fecha) {
                    $fechas->push($fecha->format('d-m-Y'));
                }
                $formato = "DATE_FORMAT(fechaRegistro, '%d-%m-%Y')";
                break;
    
            case 'week':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1W'), new DateTime($fechaFin . ' +1 week'));
            
                foreach ($intervalo as $fecha) {
                    $semana = $fecha->format('W');
                    $anio = $fecha->format('Y');
                    $fechas->push("Semana $semana - $anio");
                }
            
                $formato = "CONCAT('Semana ', LPAD(WEEK(fechaRegistro, 3), 2, '0'), ' - ', YEAR(fechaRegistro))";
                break;
                
    
            case 'month':
                $intervalo = new DatePeriod(new DateTime($fechaInicio), new DateInterval('P1M'), new DateTime($fechaFin . ' +1 month'));
                foreach ($intervalo as $fecha) {
                    $fechas->push($fecha->format('m-Y'));
                }
                $formato = "DATE_FORMAT(fechaRegistro, '%m-%Y')";
                break;
        }
    
        $instalaciones = TblInstalaciones::where('fkCatStatus', '!=', 4)
            ->selectRaw("COUNT(pkTblInstalacion) as instalaciones, $formato as agrupacion")
            ->leftJoin('tblDetalleInstalacion', 'tblDetalleInstalacion.fkTblInstalacion', 'tblInstalaciones.pkTblInstalacion')
            ->whereIn('tblDetalleInstalacion.fkCatPoblacion', $poblaciones)
            ->groupBy('agrupacion')
            ->pluck('instalaciones', 'agrupacion');
    
        $resultado = $fechas->map(function ($fecha) use ($instalaciones) {
            return [
                'agrupacion' => $fecha,
                'instalaciones' => $instalaciones[$fecha] ?? 0
            ];
        });
    
        return $resultado;
    }

    public function obtenerUsuariosRetardoInstalacion ($visualizar) {
        $query = TblUsuarios::select(
                                'tblUsuarios.pkTblUsuario',
                                DB::raw('CONCAT(tblUsuarios.nombre, " ", tblUsuarios.aPaterno) AS nombre'),
                                DB::raw('COUNT(tblInstalaciones.pkTblInstalacion) AS instalacionesRetardo')
                            )
                            ->join('tblInstalaciones', function ($join) {
                                $join->on('tblUsuarios.pkTblUsuario', '=', 'tblInstalaciones.fkUsuarioAtencion')
                                     ->where('tblInstalaciones.fkCatStatus', '=', 2);
                                $join->orOn('tblUsuarios.pkTblUsuario', '=', 'tblInstalaciones.fkUsuarioInstalacion')
                                     ->where('tblInstalaciones.fkCatStatus', '=', 3);
                            })
                            ->join('tblDetalleInstalacion', 'tblDetalleInstalacion.fkTblInstalacion', '=', 'tblInstalaciones.pkTblInstalacion')
                            ->whereRaw('NOW() > DATE_ADD(tblInstalaciones.fechaAtencion, INTERVAL tblDetalleInstalacion.duracionEstimada HOUR)')
                            ->whereIn('tblInstalaciones.fkCatStatus', [2, 3])
                            ->groupBy('tblUsuarios.pkTblUsuario', 'tblUsuarios.nombre', 'tblUsuarios.aPaterno');
    
        switch ($visualizar) {
            case 'week':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereRaw('WEEK(tblInstalaciones.fechaAtencion) = WEEK(now())');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereRaw('WEEK(tblInstalaciones.fechaInstalacion) = WEEK(now())');
                        });
                });
                break;
    
            case 'month':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereRaw('DATE_FORMAT(tblInstalaciones.fechaAtencion, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereRaw('DATE_FORMAT(tblInstalaciones.fechaInstalacion, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        });
                });
                break;
    
            case 'year':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereYear('tblInstalaciones.fechaAtencion', '=', date('Y'));
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereYear('tblInstalaciones.fechaInstalacion', '=', date('Y'));
                        });
                });
                break;
        }
    
        return $query->get();
    }

    public function obtenerUsuariosReportesSolucionados ($visualizar) {
        $query = TblUsuarios::select(
                                DB::raw('concat(tblUsuarios.nombre, " ", tblUsuarios.aPaterno) as usuario'),
                                DB::raw('count(tblReportes.pkTblReporte) as reportes')
                            )
                            ->join('tblReportes', function ($join) {
                                $join->on('tblReportes.fkUsuarioSoluciono', 'tblUsuarios.pkTblUsuario')
                                     ->where('tblReportes.fkCatStatus', '=', 5);
                            })
                            ->groupBy('tblUsuarios.nombre', 'tblUsuarios.aPaterno');
        
        switch ($visualizar) {
            case 'week':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 2)
                                    ->whereRaw('WEEK(tblReportes.fechaAtencion) = WEEK(now())');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 5)
                                    ->whereRaw('WEEK(tblReportes.fechaSoluciono) = WEEK(now())');
                        });
                });
                break;
    
            case 'month':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 2)
                                    ->whereRaw('DATE_FORMAT(tblReportes.fechaAtencion, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 5)
                                    ->whereRaw('DATE_FORMAT(tblReportes.fechaSoluciono, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        });
                });
                break;
    
            case 'year':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 2)
                                    ->whereYear('tblReportes.fechaAtencion', '=', date('Y'));
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblReportes.fkCatStatus', 5)
                                    ->whereYear('tblReportes.fechaSoluciono', '=', date('Y'));
                        });
                });
                break;
        }

        return $query->get();
    }

    public function obtenerUsuariosInstalacionesRealizadas ($visualizar) {
        $query = TblUsuarios::select(
                                DB::raw('concat(tblUsuarios.nombre, " ", tblUsuarios.aPaterno) as usuario'),
                                DB::raw('count(tblInstalaciones.pkTblInstalacion) as instalaciones')
                            )
                            ->join('tblInstalaciones', function ($join) {
                                $join->on('tblInstalaciones.fkUsuarioInstalacion', 'tblUsuarios.pkTblUsuario')
                                     ->where('tblInstalaciones.fkCatStatus', '=', 3);
                            })
                            ->groupBy('tblUsuarios.nombre', 'tblUsuarios.aPaterno');

        switch ($visualizar) {
            case 'week':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereRaw('WEEK(tblInstalaciones.fechaAtencion) = WEEK(now())');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereRaw('WEEK(tblInstalaciones.fechaInstalacion) = WEEK(now())');
                        });
                });
                break;
    
            case 'month':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereRaw('DATE_FORMAT(tblInstalaciones.fechaAtencion, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereRaw('DATE_FORMAT(tblInstalaciones.fechaInstalacion, "%m %Y") = DATE_FORMAT(now(), "%m %Y")');
                        });
                });
                break;
    
            case 'year':
                $query->where(function ($where) {
                    $where->where(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 2)
                                    ->whereYear('tblInstalaciones.fechaAtencion', '=', date('Y'));
                        })
                        ->orWhere(function ($orWhere) {
                            $orWhere->where('tblInstalaciones.fkCatStatus', 3)
                                    ->whereYear('tblInstalaciones.fechaInstalacion', '=', date('Y'));
                        });
                });
                break;
        }

        return $query->get();
    }
}