<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class GeneradorController extends Controller {
    public function imprimir(){
        $today = Carbon::now()->format('d/m/Y');
        $pdf = PDF::loadView('ejemplo', compact('today'));
        return $pdf->download('ejemplo.pdf');
    }
}
