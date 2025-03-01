<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatPerfiles extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatPerfil';
    protected $table = 'catPerfiles';
    protected $fillable = 
    [
        'pkCatPerfil',
        'nombre',
        'descripcion',
        'objPermisos',
        'activo'
    ];
}