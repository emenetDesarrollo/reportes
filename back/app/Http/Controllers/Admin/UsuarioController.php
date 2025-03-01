<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\UsuarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UsuarioController extends Controller
{
    protected $usuarioService;

    public function __construct(
        UsuarioService $UsuarioService
    )
    {
        $this->usuarioService = $UsuarioService;    
    }

    public function obtenerInformacionUsuarioPorToken( Request $request ){
        try{
            return $this->usuarioService->obtenerInformacionUsuarioPorToken( $request->all() );
        } catch( \Throwable $error ) {
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

    public function obtenerInformacionUsuarioPorPk( $pkUsuario ){
        try{
            return $this->usuarioService->obtenerInformacionUsuarioPorPk( $pkUsuario );
        } catch( \Throwable $error ) {
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

    public function obtenerListaUsuarios(){
        try{
            return $this->usuarioService->obtenerListaUsuarios();
        } catch( \Throwable $error ) {
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

    public function validarContraseniaActual(Request $request){
        try{
            return $this->usuarioService->validarContraseniaActual( $request->all() );
        }catch( \Throwable $error ) {
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

    public function registrarUsuario(Request $request){
        try{
            return $this->usuarioService->registrarUsuario( $request->all() );
        }catch( \Throwable $error ) {
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

    public function actualizarInformacionUsuario(Request $request){
        try{
            return $this->usuarioService->actualizarInformacionUsuario( $request->all() );
        }catch( \Throwable $error ) {
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

    public function actualizarPasswordUsuario(Request $request){
        try{
            return $this->usuarioService->actualizarPasswordUsuario( $request->all() );
        }catch( \Throwable $error ) {
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

    public function cambiarStatusSesion ($pkUsuario) {
        try{
            return $this->usuarioService->cambiarStatusSesion($pkUsuario);
        }catch( \Throwable $error ) {
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
}