<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatSectores extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatSector';
    protected $table = 'catSectores';
    protected $fillable = 
    [
        'pkCatSector',
	    'nombre',
	    'descripcion',
	    'activo'
    ];
}