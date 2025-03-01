<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblSesiones extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkTblSesion';
    protected $table = 'tblSesiones';
    protected $fillable = 
    [
        'pkTblSesion',
        'fkTblUsuario',
        'token'
    ];
}