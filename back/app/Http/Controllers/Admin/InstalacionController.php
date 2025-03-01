<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\InstalacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InstalacionController extends Controller
{
    protected $instalacionService;

    public function __construct(
        InstalacionService $InstalacionService
    )
    {
        $this->instalacionService = $InstalacionService;
    }
    
    public function agendarInstalacion (Request $request) {
        try{
            return $this->instalacionService->agendarInstalacion($request->all());
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

    public function obtenerListaInstalacionesStatus ($status) {
        try{
            return $this->instalacionService->obtenerListaInstalacionesStatus($status);
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

    public function obtenerDetalleInstalcion ($pkInstalacion) {
        try{
            return $this->instalacionService->obtenerDetalleInstalcion($pkInstalacion);
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

    public function actualizarInstalacion (Request $request) {
        try{
            return $this->instalacionService->actualizarInstalacion($request->all());
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

    public function atnederInstalacion (Request $request) {
        try{
            return $this->instalacionService->atnederInstalacion($request->all());
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

    public function finalizarInstalacion (Request $request) {
        try{
            return $this->instalacionService->finalizarInstalacion($request->all());
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

    public function instalacionNoExitosa (Request $request) {
        try{
            return $this->instalacionService->instalacionNoExitosa($request->all());
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

    public function retomarInstalacion (Request $request) {
        try{
            return $this->instalacionService->retomarInstalacion($request->all());
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