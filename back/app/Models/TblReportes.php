<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblReportes extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblReporte';
    protected $table = 'tblReportes';
    protected $fillable = 
    [
        'pkTblReporte',
        'fkUsuarioRegistro',
        'fechaRegistro',
        'fkUsuarioActualizacion',
        'fechaActualizacion',
        'fkUsuarioAtencion',
        'fechaAtencion',
        'fkUsuarioSoluciono',
        'fechaSoluciono',
        'fkUsuarioRetoma',
        'fechaRetoma',
        'fkCatStatus',
    ];
}