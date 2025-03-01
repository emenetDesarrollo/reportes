<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PoblacionesSector extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'poblacionesSector';
    protected $fillable = 
    [
        'fkCatSector',
	    'fkCatPoblacion'
    ];
}