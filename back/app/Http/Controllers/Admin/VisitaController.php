<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\VisitaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VisitaController extends Controller
{
    protected $visitaService;

    public function __construct(
        VisitaService $VisitaService
    )
    {
        $this->visitaService = $VisitaService;
    }

    public function agendarVisita (Request $request) {
        try{
            return $this->visitaService->agendarVisita($request->all());
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

    public function obtenerListaVisitasStatus ($status) {
        try{
            return $this->visitaService->obtenerListaVisitasStatus($status);
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

    public function obtenerDetalleVisita (Request $request) {
        try{
            return $this->visitaService->obtenerDetalleVisita($request->all());
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

    public function actualizarVisita (Request $request) {
        try{
            return $this->visitaService->actualizarVisita($request->all());
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

    public function atnederVisita (Request $request) {
        try{
            return $this->visitaService->atnederVisita($request->all());
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

    public function finalizarVisita (Request $request) {
        try{
            return $this->visitaService->finalizarVisita($request->all());
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

    public function visitaNoExitosa (Request $request) {
        try{
            return $this->visitaService->visitaNoExitosa($request->all());
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

    public function retomarVisita (Request $request) {
        try{
            return $this->visitaService->retomarVisita($request->all());
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
            return $this->visitaService->agregarSeguimiento($request->all());
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
            return $this->visitaService->obtenerSeguimiento($request->all());
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
            return $this->visitaService->actualizarSeguimiento($request->all());
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
            return $this->visitaService->eliminarAnexoSeguimiento($request->all());
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