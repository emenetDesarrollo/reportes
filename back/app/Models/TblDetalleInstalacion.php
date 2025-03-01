<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleInstalacion extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkDetalleInstalacion';
    protected $table = 'tblDetalleInstalacion';
    protected $fillable = 
    [
        'pkDetalleInstalacion',
        'fkTblInstalacion',
        'nombreCliente',
        'telefonos',
        'correos',
        'codigoPostal',
        'fkCatPoblacion',
        'coordenadas',
        'direccionDomicilio',
        'caracteristicasDomicilio',
        'referenciasDomicilio',
        'pkPlanInternet',
        'costoInstalacion',
        'disponibilidadHorario',
        'fkCatClasificacion',
        'duracionEstimada',
        'ont',
        'noSerieOnt',
        'etiquetaSpliter',
        'puertoEspliter',
        'potencia',
        'coordenadasSpliter',
        'fibraInicio',
        'fibraFin',
        'nombreRed',
        'passwordRed',
        'evidencias',
        'observaciones'
    ];
}