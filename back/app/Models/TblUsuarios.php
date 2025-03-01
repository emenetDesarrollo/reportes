<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblUsuarios extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblUsuario';
    protected $table = 'tblUsuarios';
    protected $fillable = 
    [
        'pkTblUsuario',
        'nombre',
        'aPaterno',
        'aMaterno',
        'correo',
        'password',
        'fechaAlta',
        'activo',
        'sectores',
        'fkCatPerfil',
        'permisos'
    ];
}