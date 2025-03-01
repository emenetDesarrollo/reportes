<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblInstalaciones extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblInstalacion';
    protected $table = 'tblInstalaciones';
    protected $fillable = 
    [
        'pkTblInstalacion',
        'fkUsuarioRegistro',
        'fechaRegistro',
        'fkUsuarioActualizacion',
        'fechaActualizacion',
        'fkUsuarioAtencion',
        'fechaAtencion',
        'fkUsuarioInstalacion',
        'fechaInstalacion',
        'fkUsuarioCancelacion',
        'fechaCancelacion',
        'fkUsuarioRetoma',
        'fechaRetoma',
        'fkCatStatus'
    ];
}