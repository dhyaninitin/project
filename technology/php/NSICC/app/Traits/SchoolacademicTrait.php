<?php

namespace App\Traits;
use App\Model\{ AcademicYear,AcademicYearMonth};
use Carbon\Carbon;

trait SchoolacademicTrait
{

    protected function formatAcademictitle($academic_id)
    {
        $academic_year = AcademicYear::where('academic_year_id', $academic_id)->first();
        if ($academic_year)
        {
            $academic_name = $academic_year->title;
        }
        return $academic_year;
    }
    /**
     * @return String
     */
    protected function formatacademicRequest($request)
    {
        $academic_year = AcademicYearMonth::where('academic_year_id', $request)->get();
        return $academic_year;

    }
}