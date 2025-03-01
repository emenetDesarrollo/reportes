<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblVisitas extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblVisita';
    protected $table = 'tblVisitas';
    protected $fillable = 
    [
        'pkTblVisita',
	    'fkUsuarioRegistro',
	    'fechaRegistro',
	    'fkUsuarioActualizacion',
	    'fechaActualizacion',
	    'fkUsuarioAtencion',
	    'fechaAtencion',
	    'fkUsuarioFinalizacion',
	    'fechaFinalizacion',
	    'fkUsuarioCancelacion',
	    'fechaCancelacion',
        'fkUsuarioRetoma',
        'fechaRetoma',
        'fkCatStatus'
    ];
}