<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblAvisos extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblAviso';
    protected $table = 'tblAvisos';
    protected $fillable = 
    [
        'pkTblAviso',
        'tituloAviso',
        'descripcion',
        'fechaInicio',
        'fechaFin',
        'fkTblUsuarioAlta',
        'fechaAlta',
        'fkTblUsuarioActualizacion',
        'fechaActualizacion'
    ];
}