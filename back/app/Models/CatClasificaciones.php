<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatClasificaciones extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatClasificacion';
    protected $table = 'catClasificaciones';
    protected $fillable = 
    [
        'pkCatClasificacion',
	    'nombreClasificacion',
        'abreviacionClasificacion',
	    'descripcionClasificacion',
	    'activo'
    ];
}