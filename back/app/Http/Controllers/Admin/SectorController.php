<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\SectorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SectorController extends Controller
{
    protected $sectorService;

    public function __construct(
        SectorService $SectorService
    )
    {
        $this->sectorService = $SectorService;
    }

    public function obtenerPoblacionesDisponibles ($pkSector) {
        try{
            return $this->sectorService->obtenerPoblacionesDisponibles($pkSector);
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function registrarSector (Request $request) {
        try{
            return $this->sectorService->registrarSector($request->all());
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function actualizarSector (Request $request) {
        try{
            return $this->sectorService->actualizarSector($request->all());
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function obtenerListaSectores () {
        try{
            return $this->sectorService->obtenerListaSectores();
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function obtenerPoblacionesSector ($pkSector) {
        try{
            return $this->sectorService->obtenerPoblacionesSector($pkSector);
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function obtenerDetalleSector ($pkSector) {
        try{
            return $this->sectorService->obtenerDetalleSector($pkSector);
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }

    public function obtenerListaSectoresSelect () {
        try{
            return $this->sectorService->obtenerListaSectoresSelect();
        } catch( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Upss! Ocurrió un error interno'
                ], 
                500
            );
        }
    }
}