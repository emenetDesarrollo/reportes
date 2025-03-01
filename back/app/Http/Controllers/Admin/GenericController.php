<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\GenericService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GenericController extends Controller
{
    protected $genericService;

    public function __construct(
        GenericService $GenericService
    )
    {
        $this->genericService = $GenericService;
    }

    public function obtenerEstadisticasGenerales (Request $request) {
        try{
            return $this->genericService->obtenerEstadisticasGenerales($request->all());
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