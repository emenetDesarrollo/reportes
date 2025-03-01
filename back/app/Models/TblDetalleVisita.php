<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleVisita extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblDetalleVisita';
    protected $table = 'tblDetalleVisita';
    protected $fillable = 
    [
        'pkTblDetalleVisita',
        'fkTblVisita',
        'nombreCliente',
        'telefonos',
        'correos',
        'codigoPostal',
        'fkCatPoblacion',
        'coordenadas',
        'direccionDomicilio',
        'caracteristicasDomicilio',
        'referenciasDomicilio',
        'fkCatRazonVisita',
        'otraRazon',
        'descripcion',
        'observaciones'
    ];
}