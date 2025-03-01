<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatPoblaciones extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatPoblacion';
    protected $table = 'catPoblaciones';
    protected $fillable = 
    [
        'pkCatPoblacion',
	    'nombrePoblacion',
	    'siglas',
	    'descripcion',
	    'activo'
    ];
}