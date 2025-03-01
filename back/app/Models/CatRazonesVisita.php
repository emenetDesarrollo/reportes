<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatRazonesVisita extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatRazonVisita';
    protected $table = 'catRazonesVisita';
    protected $fillable = 
    [
        'pkCatRazonVisita',
	    'razon',
	    'abreviacionRazon',
	    'descripcionRazon',
	    'activo'
    ];
}