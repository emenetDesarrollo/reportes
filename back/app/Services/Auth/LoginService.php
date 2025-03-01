<?php

namespace App\Services\Auth;

use App\Repositories\Admin\UsuarioRepository;
use App\Repositories\Auth\LoginRepository;
use App\Services\Admin\UsuarioService;
use Illuminate\Support\Facades\DB;

class LoginService
{
    protected $loginRepository;
    protected $usuarioService;
    protected $usuarioRepository;

    public function __construct(
        LoginRepository $LoginRepository,
        UsuarioService $UsuarioService,
        UsuarioRepository $UsuarioRepository
    ) {
        $this->loginRepository = $LoginRepository;
        $this->usuarioService = $UsuarioService;
        $this->usuarioRepository = $UsuarioRepository;
    }

    public function login( $credenciales ){
        $pkUsuario = $this->loginRepository->validarExistenciaUsuario( $credenciales['correo'], $credenciales['password'] );
        if(is_null($pkUsuario)){
            return response()->json(
                [
                    'mensaje' => 'Upss! Al parecer las credenciales no son correctas para poder ingresar',
                    'title' => 'Credenciales incorrectas',
                    'status' => 204
                ],
                200
            );
        }
        
        $usuarioActivo = $this->loginRepository->validarUsuarioActivo( $pkUsuario );

        if(is_null($usuarioActivo)){
            return response()->json(
                [
                    'mensaje' => 'Upss! Al parecer tu cuenta esta actualmente supendida, favor de comunicarse con el DTIC de Emenet Comunicaciones',
                    'title' => 'Cuenta suspendida',
                    'status' => 409
                ],
                200
            );
        }

        DB::beginTransaction();
            $token = $this->loginRepository->crearSesionYAsignarToken( $pkUsuario );
        DB::commit();

        return response()->json(
            [
                'data' => [
                    'token'     => $token,
                    'permisos'  => $usuarioActivo->permisos
                ],
                'mensaje' => 'Bienvenido a SCOSM',
                'status' => 200
            ],
            200
        );
    }

    public function auth( $token ){
        $dataUsuario = $this->usuarioRepository->obtenerInformacionUsuarioPorToken( $token['token'] )[0];

        return [
            'status' => $this->loginRepository->auth($token['token']),
            'data' => $this->usuarioService->obtenerPoblacionesSectorPorToken($token['token']),
            'permisos'  => $dataUsuario->permisos
        ];
    }

    public function logout( $token ){
        $this->loginRepository->logout($token['token']);
        
        return response()->json(
            [
                'mensaje' => 'Hasta pronto...!'
            ],
            200
        );
    }
}