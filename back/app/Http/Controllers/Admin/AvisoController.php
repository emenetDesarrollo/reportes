<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AvisoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AvisoController extends Controller
{
    protected $avisoService;

    public function __construct(
        AvisoService $AvisoService
    )
    {
        $this->avisoService = $AvisoService;
    }

    public function registrarAviso (Request $request) {
        try{
            return $this->avisoService->registrarAviso($request->all());
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

    public function obtenerAvisos ($busqueda) {
        try{
            return $this->avisoService->obtenerAvisos($busqueda);
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

    public function obtenerDetalleAviso ($pkAviso) {
        try{
            return $this->avisoService->obtenerDetalleAviso($pkAviso);
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

    public function actualizarAviso (Request $request) {
        try{
            return $this->avisoService->actualizarAviso($request->all());
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

    public function eliminarAviso ($pkAviso) {
        try{
            return $this->avisoService->eliminarAviso($pkAviso);
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