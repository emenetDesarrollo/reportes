<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//auth
Route::post('/auth/login', 'App\Http\Controllers\Auth\LoginController@login');
Route::post('/auth', 'App\Http\Controllers\Auth\LoginController@auth');
Route::post('/logout', 'App\Http\Controllers\Auth\LoginController@logout');

// apis usuarios
Route::post('/usuarios/obtenerInformacionUsuarioPorToken', 'App\Http\Controllers\Admin\UsuarioController@obtenerInformacionUsuarioPorToken');
Route::get('/usuarios/obtenerInformacionUsuarioPorPk/{pkUsuario}', 'App\Http\Controllers\Admin\UsuarioController@obtenerInformacionUsuarioPorPk');
Route::post('/usuarios/validarContraseniaActual', 'App\Http\Controllers\Admin\UsuarioController@validarContraseniaActual');
Route::post('/usuarios/registrarUsuario', 'App\Http\Controllers\Admin\UsuarioController@registrarUsuario');
Route::post('/usuarios/actualizarInformacionUsuario', 'App\Http\Controllers\Admin\UsuarioController@actualizarInformacionUsuario');
Route::post('/usuarios/actualizarPasswordUsuario', 'App\Http\Controllers\Admin\UsuarioController@actualizarPasswordUsuario');
Route::get('/usuarios/obtenerListaUsuarios', 'App\Http\Controllers\Admin\UsuarioController@obtenerListaUsuarios');

// estadisticas
Route::post('/estadisticas/obtenerEstadisticas', 'App\Http\Controllers\Admin\GenericController@obtenerEstadisticasGenerales');
Route::get('/estadisticas/obtenerMetricasUsuarios/{visualizar}', 'App\Http\Controllers\Admin\GenericController@obtenerMetricasUsuarios');

// Apis catálogos

// poblaciones
Route::post('/catalogos/registrarPoblacion', 'App\Http\Controllers\Admin\CatalogoController@registrarPoblacion');
Route::get('/catalogos/obtenerPoblacionesSelect', 'App\Http\Controllers\Admin\CatalogoController@obtenerPoblacionesSelect');
Route::post('/catalogos/obtenerPoblacionesSectoresUsuario', 'App\Http\Controllers\Admin\CatalogoController@obtenerPoblacionesSectoresUsuario');
Route::get('/catalogos/obtenerPoblaciones', 'App\Http\Controllers\Admin\CatalogoController@obtenerPoblaciones');
Route::get('/catalogos/obtenerDetallePoblacion/{pkPoblacion}', 'App\Http\Controllers\Admin\CatalogoController@obtenerDetallePoblacion');
Route::post('/catalogos/actualizarPoblacion', 'App\Http\Controllers\Admin\CatalogoController@actualizarPoblacion');
Route::get('/catalogos/obtenerListaPerfiles', 'App\Http\Controllers\Admin\CatalogoController@obtenerListaPerfiles');

// razones visita
Route::get('/catalogos/obtenerRazonesVisitaSelect', 'App\Http\Controllers\Admin\CatalogoController@obtenerRazonesVisitaSelect');
Route::get('/catalogos/obtenerProblemasReporteSelect', 'App\Http\Controllers\Admin\CatalogoController@obtenerProblemasReporteSelect');

// apis reportes
Route::get('/reportes/validarReportePendiente/{pkReporte}/{identificadorMybussines}', 'App\Http\Controllers\Admin\ReporteController@validarReportePendiente');
Route::post('/reportes/generarReporte', 'App\Http\Controllers\Admin\ReporteController@generarReporte');
Route::get('/reportes/obtenerListaReportesStatus/{status}', 'App\Http\Controllers\Admin\ReporteController@obtenerListaReportesStatus');
Route::post('/reportes/obtenerDetalleReporte', 'App\Http\Controllers\Admin\ReporteController@obtenerDetalleReporte');
Route::post('/reportes/actualizarReporte', 'App\Http\Controllers\Admin\ReporteController@actualizarReporte');
Route::post('/reportes/atnederReporte', 'App\Http\Controllers\Admin\ReporteController@atnederReporte');
Route::post('/reportes/finalizarReporte', 'App\Http\Controllers\Admin\ReporteController@finalizarReporte');
Route::post('/reportes/retomarReporte', 'App\Http\Controllers\Admin\ReporteController@retomarReporte');
Route::post('/reportes/agregarSeguimiento', 'App\Http\Controllers\Admin\ReporteController@agregarSeguimiento');
Route::post('/reportes/obtenerSeguimiento', 'App\Http\Controllers\Admin\ReporteController@obtenerSeguimiento');
Route::post('/reportes/actualizarSeguimiento', 'App\Http\Controllers\Admin\ReporteController@actualizarSeguimiento');
Route::post('/reportes/eliminarAnexoSeguimiento', 'App\Http\Controllers\Admin\ReporteController@eliminarAnexoSeguimiento');

// Apis instalaciones
Route::post('/instalaciones/agendarInstalacion', 'App\Http\Controllers\Admin\InstalacionController@agendarInstalacion');
Route::get('/instalaciones/obtenerListaInstalacionesStatus/{status}', 'App\Http\Controllers\Admin\InstalacionController@obtenerListaInstalacionesStatus');
Route::get('/instalaciones/obtenerInstalacionesRetardoUsuario/{pkUsuario}', 'App\Http\Controllers\Admin\InstalacionController@obtenerInstalacionesRetardoUsuario');
Route::get('/instalaciones/obtenerDetalleInstalcion/{pk}', 'App\Http\Controllers\Admin\InstalacionController@obtenerDetalleInstalcion');
Route::post('/instalaciones/actualizarInstalacion', 'App\Http\Controllers\Admin\InstalacionController@actualizarInstalacion');
Route::post('/instalaciones/atnederInstalacion', 'App\Http\Controllers\Admin\InstalacionController@atnederInstalacion');
Route::post('/instalaciones/finalizarInstalacion', 'App\Http\Controllers\Admin\InstalacionController@finalizarInstalacion');
Route::post('/instalaciones/instalacionNoExitosa', 'App\Http\Controllers\Admin\InstalacionController@instalacionNoExitosa');
Route::post('/instalaciones/retomarInstalacion', 'App\Http\Controllers\Admin\InstalacionController@retomarInstalacion');

// apis visitas
Route::post('/visitas/agendarVisita', 'App\Http\Controllers\Admin\VisitaController@agendarVisita');
Route::get('/visitas/obtenerListaVisitasStatus/{status}', 'App\Http\Controllers\Admin\VisitaController@obtenerListaVisitasStatus');
Route::post('/visitas/obtenerDetalleVisita', 'App\Http\Controllers\Admin\VisitaController@obtenerDetalleVisita');
Route::post('/visitas/actualizarVisita', 'App\Http\Controllers\Admin\VisitaController@actualizarVisita');
Route::post('/visitas/atnederVisita', 'App\Http\Controllers\Admin\VisitaController@atnederVisita');
Route::post('/visitas/finalizarVisita', 'App\Http\Controllers\Admin\VisitaController@finalizarVisita');
Route::post('/visitas/visitaNoExitosa', 'App\Http\Controllers\Admin\VisitaController@visitaNoExitosa');
Route::post('/visitas/retomarVisita', 'App\Http\Controllers\Admin\VisitaController@retomarVisita');
Route::post('/visitas/agregarSeguimiento', 'App\Http\Controllers\Admin\VisitaController@agregarSeguimiento');
Route::post('/visitas/obtenerSeguimiento', 'App\Http\Controllers\Admin\VisitaController@obtenerSeguimiento');
Route::post('/visitas/actualizarSeguimiento', 'App\Http\Controllers\Admin\VisitaController@actualizarSeguimiento');
Route::post('/visitas/eliminarAnexoSeguimiento', 'App\Http\Controllers\Admin\VisitaController@eliminarAnexoSeguimiento');

// apis sectores
Route::get('/sectores/obtenerPoblacionesDisponibles/{pkSector}', 'App\Http\Controllers\Admin\SectorController@obtenerPoblacionesDisponibles');
Route::post('/sectores/registrarSector', 'App\Http\Controllers\Admin\SectorController@registrarSector');
Route::post('/sectores/actualizarSector', 'App\Http\Controllers\Admin\SectorController@actualizarSector');
Route::get('/sectores/obtenerListaSectores', 'App\Http\Controllers\Admin\SectorController@obtenerListaSectores');
Route::get('/sectores/obtenerPoblacionesSector/{pkSector}', 'App\Http\Controllers\Admin\SectorController@obtenerPoblacionesSector');
Route::get('/sectores/obtenerDetalleSector/{pkSector}', 'App\Http\Controllers\Admin\SectorController@obtenerDetalleSector');
Route::get('/sectores/obtenerListaSectoresSelect', 'App\Http\Controllers\Admin\SectorController@obtenerListaSectoresSelect');

// apis avisos
Route::post('/avisos/registrarAviso', 'App\Http\Controllers\Admin\AvisoController@registrarAviso');
Route::get('/avisos/obtenerAvisos/{busqueda}', 'App\Http\Controllers\Admin\AvisoController@obtenerAvisos');
Route::get('/avisos/obtenerDetalleAviso/{pkAviso}', 'App\Http\Controllers\Admin\AvisoController@obtenerDetalleAviso');
Route::post('/avisos/actualizarAviso', 'App\Http\Controllers\Admin\AvisoController@actualizarAviso');
Route::get('/avisos/eliminarAviso/{pkAviso}', 'App\Http\Controllers\Admin\AvisoController@eliminarAviso');