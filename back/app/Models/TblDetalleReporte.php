<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblDetalleReporte extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblDetalleReporte';
    protected $table = 'tblDetalleReporte';
    protected $fillable = 
    [
        'pkTblDetalleReporte',
        'fkTblReporte',
        'nombreCliente',
        'telefonos',
        'codigoPostal',
        'fkCatPoblacion',
        'newFkCatPoblacion',
        'coordenadas',
        'newCoordenadas',
        'direccionDomicilio',
        'newDireccionDomicilio',
        'caracteristicasDomicilio',
        'referenciasDomicilio',
        'newReferenciasDomicilio',
        'fkCatProblemaReporte',
        'otroProblema',
        'diagnostico',
        'solucion',
        'disponibilidadHorario',
        'descripcion',
        'observaciones',
        'anexosReporte'
    ];
}