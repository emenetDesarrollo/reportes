<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatStatus extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'pkCatStatus';
    protected $table = 'catStatus';
    protected $fillable = 
    [
        'pkCatStatus',
	    'nombreStatus',
	    'descripcionStatus',
        'activo'
    ];
}