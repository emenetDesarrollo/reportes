<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatProblemasReporte extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatProblemaReporte';
    protected $table = 'catProblemasReporte';
    protected $fillable = 
    [
        'pkCatProblemaReporte',
        'problema',
        'descripcionProblema',
        'activo'
    ];
}