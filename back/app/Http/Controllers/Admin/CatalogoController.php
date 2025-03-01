<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\CatalogoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CatalogoController extends Controller
{
    protected $catalogoService;

    public function __construct(
        CatalogoService $CatalogoService
    )
    {
        $this->catalogoService = $CatalogoService;
    }

    public function registrarPoblacion (Request $request) {
        try{
            return $this->catalogoService->registrarPoblacion($request->all());
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

    public function obtenerPoblacionesSelect () {
        try{
            return $this->catalogoService->obtenerPoblacionesSelect();
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

    public function obtenerPoblaciones () {
        try{
            return $this->catalogoService->obtenerPoblaciones();
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

    public function obtenerDetallePoblacion ($pkPoblacion) {
        try{
            return $this->catalogoService->obtenerDetallePoblacion($pkPoblacion);
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

    public function actualizarPoblacion (Request $request) {
        try{
            return $this->catalogoService->actualizarPoblacion($request->all());
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

    public function obtenerRazonesVisitaSelect () {
        try{
            return $this->catalogoService->obtenerRazonesVisitaSelect();
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

    public function obtenerProblemasReporteSelect () {
        try{
            return $this->catalogoService->obtenerProblemasReporteSelect();
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

    public function obtenerPoblacionesSectoresUsuario (Request $request) {
        try{
            return $this->catalogoService->obtenerPoblacionesSectoresUsuario($request->all());
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

    public function obtenerListaPerfiles () {
        try{
            return $this->catalogoService->obtenerListaPerfiles();
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