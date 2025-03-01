<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\ReporteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReporteController extends Controller
{
    protected $reporteService;

    public function __construct(
        ReporteService $ReporteService
    )
    {
        $this->reporteService = $ReporteService;
    }

    public function validarReportePendiente ($pkReporte, $identificadorMybussines) {
        try{
            return $this->reporteService->validarReportePendiente($pkReporte, $identificadorMybussines);
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

    public function generarReporte (Request $request) {
        try{
            return $this->reporteService->generarReporte($request->all());
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

    public function obtenerListaReportesStatus ($status) {
        try{
            return $this->reporteService->obtenerListaReportesStatus($status);
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

    public function obtenerDetalleReporte (Request $request) {
        try{
            return $this->reporteService->obtenerDetalleReporte($request->all());
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

    public function actualizarReporte (Request $request) {
        try{
            return $this->reporteService->actualizarReporte($request->all());
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

    public function atnederReporte (Request $request) {
        try{
            return $this->reporteService->atnederReporte($request->all());
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

    public function finalizarReporte (Request $request) {
        try{
            return $this->reporteService->finalizarReporte($request->all());
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

    public function retomarReporte (Request $request) {
        try{
            return $this->reporteService->retomarReporte($request->all());
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

    public function agregarSeguimiento (Request $request) {
        try{
            return $this->reporteService->agregarSeguimiento($request->all());
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

    public function obtenerSeguimiento (Request $request) {
        try{
            return $this->reporteService->obtenerSeguimiento($request->all());
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

    public function actualizarSeguimiento (Request $request) {
        try{
            return $this->reporteService->actualizarSeguimiento($request->all());
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

    public function eliminarAnexoSeguimiento (Request $request) {
        try{
            return $this->reporteService->eliminarAnexoSeguimiento($request->all());
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