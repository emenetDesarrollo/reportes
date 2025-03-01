<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\LoginService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    protected $loginService;

    public function __construct(
        LoginService $LoginService
    ) {
        $this->loginService = $LoginService;
    }

    public function login( Request $request ) {
        try {
            return $this->loginService->login( $request->all() );
        } catch ( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Ocurrió un error interno'
                ],
                500
            );
        }
    }

    public function auth( Request $request ){
        try{
            return $this->loginService->auth( $request->all());
        } catch ( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Ocurrió un error al consultar' 
                ],
                500                
            );
        }
    }

    public function logout( Request $request ){
        try{
            return $this->loginService->logout( $request->all());
        } catch ( \Throwable $error ) {
            Log::alert($error);
            return response()->json(
                [
                    'error' => $error,
                    'mensaje' => 'Ocurrió un error al consultar'
                ],
                500
            );
        }
    }
}