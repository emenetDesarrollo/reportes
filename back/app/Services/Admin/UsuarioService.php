<?php

namespace App\Services\Admin;

use App\Repositories\Admin\CatalogoRepository;
use App\Repositories\Admin\UsuarioRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UsuarioService
{
    protected $usuarioRepository;
    protected $catalogoRepository;

    public function __construct(
        UsuarioRepository $UsuarioRepository,
        CatalogoRepository $CatalogoRepository
    )
    {
        $this->usuarioRepository = $UsuarioRepository;
        $this->catalogoRepository = $CatalogoRepository;
    }

    public function obtenerInformacionUsuarioPorToken ( $token ) {
        return $this->usuarioRepository->obtenerInformacionUsuarioPorToken( $token['token'] );
    }

    public function obtenerInformacionUsuarioPorPk ( $pkUsuario ) {
        $detalleUsuario = $this->usuarioRepository->obtenerInformacionUsuarioPorPk( $pkUsuario );

        $detalleUsuario[0]->reportesSolucionados = $this->usuarioRepository->obtenerReportesSolucionadosUsuario($pkUsuario);
        $detalleUsuario[0]->instalacionesAgendadas = $this->usuarioRepository->obtenerInstalacionesAgendadasUsuario($pkUsuario);
        $detalleUsuario[0]->instalacionesInstaladas = $this->usuarioRepository->obtenerInstalacionesInstaladasUsuario($pkUsuario);

        return $detalleUsuario;
    }

    public function obtenerPkPorToken ( $token ) {
        return $this->usuarioRepository->obtenerInformacionUsuarioPorToken( $token )[0]->pkTblUsuario;
    }

    public function obtenerPoblacionesSectorPorToken ( $token ) {
        $sectores = $this->usuarioRepository->obtenerInformacionUsuarioPorToken( $token )[0]->sectores;

        if (!is_string($sectores)) return [];

        $sectores = explode(",", $sectores);

        $poblaciones = $this->catalogoRepository->obtenerPoblacionesSectores($sectores);

        $nombresPoblaciones = array_map(function($item) {
            return $item['nombrePoblacion'];
        }, $poblaciones);

        $siglasPoblaciones = array_map(function($item) {
            return $item['siglas'];
        }, $poblaciones);

        return [
            'poblacionesSector' => $nombresPoblaciones,
            'siglasSector' => $siglasPoblaciones,
        ];
    }

    public function obtenerListaUsuarios () {
        $listaUsuarios = $this->usuarioRepository->obtenerListaUsuarios();

        return response()->json(
            [
                'data' => [
                    'listaUsuarios' => $listaUsuarios
                ],
                'mensaje' => 'Se obtuvó la lista de usuarios en el status seleccionado con éxito'
            ],
            200
        );
    }

    public function validarContraseniaActual($datosCredenciales){
        $pkUsuario = isset($datosCredenciales['pkUsuario']) ? $datosCredenciales['pkUsuario'] : $this->usuarioRepository->obtenerInformacionUsuarioPorToken($datosCredenciales['token'])[0]->pkTblUsuario;
        
        $validarContrasenia = $this->usuarioRepository->validarContraseniaActual($pkUsuario, $datosCredenciales['contraseniaActual']);
        
        if($validarContrasenia == false){
            return response()->json(
                [
                    'mensaje' => 'Para continuar con la actualización se debe colocar correctamente la contraseña actual',
                    'status' => 204
                ],
                200
            );
        }

        return response()->json(
            [
                'mensaje' => 'Se validó la contraseña'
            ],
            200
        );
    }

    public function registrarUsuario ($datosUsuario) {
        DB::beginTransaction();
            $validarUsuario = $this->usuarioRepository->validarCorreoExiste($datosUsuario['perfilInformacion']['correo']);
            
            if($validarUsuario > 0 ){
                return response()->json(
                    [
                        'mensaje' => 'Upss! Al parecer ya existe un Usuario con el mismo correo. Por favor validar la información',
                        'status' => 409
                    ],
                    200
                );
            }

            $this->usuarioRepository->registrarUsuario($datosUsuario['perfilInformacion']);
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información con éxito'
            ],
            200
        );
    }

    public function actualizarInformacionUsuario($datosUsuario){
        DB::beginTransaction();    
            $pkUsuario = isset($datosUsuario['pkUsuario']) ?
                            $datosUsuario['pkUsuario'] :
                            $this->usuarioRepository->obtenerInformacionUsuarioPorToken($datosUsuario['token'])[0]->pkTblUsuario;

            $validarUsuario = $this->usuarioRepository->validarCorreoExiste($datosUsuario['perfilInformacion']['correo'], $pkUsuario);
            
            if($validarUsuario > 0 ){
                return response()->json(
                    [
                        'mensaje' => 'Upss! Al parecer ya existe un Usuario con el mismo correo. Por favor validar la información',
                        'status' => 409
                    ],
                    200
                );
            }

            $this->usuarioRepository->actualizarInformacionUsuario(
                $datosUsuario['perfilInformacion'],
                $pkUsuario
            );
        DB::commit();

        return response()->json(
            [
                'mensaje' => 'Se actualizó la información con éxito'
            ],
            200
        );
    }

    public function actualizarPasswordUsuario ($datosUsuario) {
        $pkUsuario = isset($datosUsuario['pkUsuario']) ?
                     $datosUsuario['pkUsuario'] :
                     $this->usuarioRepository->obtenerInformacionUsuarioPorToken($datosUsuario['token'])[0]->pkTblUsuario;

        $this->usuarioRepository->actualizarPasswordUsuario(
            $pkUsuario,
            $datosUsuario['confContraseniaNueva']
        );

        return response()->json(
            [
                'mensaje' => 'Se actualizó la contraseña con éxito'
            ],
            200
        );
    }

    public function cambiarStatusSesion ($pkUsuario) {
        $activo = $this->usuarioRepository->obtenerInformacionUsuarioPorPk( $pkUsuario )[0]->activo;

        $this->usuarioRepository->cambiarStatusSesion($pkUsuario, $activo == 1 ? 0 : 1);
        $this->usuarioRepository->cerrarSesionesActivas($pkUsuario);

        return response()->json(
            [
                'mensaje' => 'Se cambio status de la sesión en cuestión con éxito'
            ],
            200
        );
    }

    public function formatearFecha($fecha) {
        if ($fecha == null || trim($fecha) == '' || trim($fecha) == '0000-00-00 00:00:00') return null;

        $carbon = Carbon::parse($fecha);
        $ayer = Carbon::yesterday();
        $antier = Carbon::today()->subDays(2);
    
        if ($carbon->isToday()) {
            return 'Hoy ' . $carbon->format('h:i a');
        } elseif ($carbon->isSameDay($ayer)) {
            return 'Ayer ' . $carbon->format('h:i a');
        } elseif ($carbon->isSameDay($antier)) {
            return 'Antier ' . $carbon->format('h:i a');
        } else {
            return $carbon->format('d-m-Y | h:i a');
        }
    }
}