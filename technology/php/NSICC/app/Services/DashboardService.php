<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MarriageServices,MatrimonialServices,User };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class DashboardService extends AbstractService
{

  
    function serviceCount(){

        $marriage = MarriageServices::select(DB::raw("MIN(DATE_FORMAT(created_at, '%m')) AS MONTH"), 
        DB::raw("MIN(DATE_FORMAT(created_at, '%b')) AS MONTHNAME"),
        DB::raw("MIN(DATE_FORMAT(created_at, '%Y')) AS YEAR"),
        DB::raw('count(*) as count'));
        $marriage_chart = $marriage->where('archive', 0)
        ->groupBy(DB::raw("MONTH(created_at)"))->orderBy('created_at')->get()->toarray();

        $matrimonail = MatrimonialServices::select(DB::raw("MIN(DATE_FORMAT(created_at, '%m')) AS MONTH"), 
         DB::raw("MIN(DATE_FORMAT(created_at, '%b')) AS MONTHNAME"),
         DB::raw("MIN(DATE_FORMAT(created_at, '%Y')) AS YEAR"),
        DB::raw('count(*) as count'));
        $matrimonail_chart = $matrimonail->where('archive', 0)
        ->groupBy(DB::raw("MONTH(created_at)"))->orderBy('created_at')->get()->toarray();


        $resltts =  array_merge($marriage_chart,$matrimonail_chart);
        $final_array=[]; $n=0;
        foreach($matrimonail_chart as $value){
            if($this->find_key_value($marriage_chart,'MONTH',$value['MONTH'],$value['YEAR'],$value['count']) == false){
                $final_array[$n]['MONTH'] = $value['MONTH'];
                $final_array[$n]['MONTHNAME'] = $value['MONTHNAME'];
                $final_array[$n]['YEAR'] = $value['YEAR'];
                $final_array[$n]['count'] = $value['count'];
            }
            else{
                $final_array[$n]['MONTH'] = $value['MONTH'];
                $final_array[$n]['MONTHNAME'] = $value['MONTHNAME'];
                $final_array[$n]['YEAR'] = $value['YEAR'];
                $final_array[$n]['count'] = $this->find_key_value($matrimonail_chart,'MONTH',$value['MONTH'],$value['YEAR'],$value['count']);
            } 
            $n++;
        }
        print_r($final_array);
        //return $qut_chart;
    }
     
    function find_key_value($array, $key, $month,$year, $count){
        foreach ($array as $item){
           if ($item[$key] == $month && $item['YEAR'] == $year) 
           {

            return $item['count']+$count; 
           }
        }
        return false;
    }

    public function gettype()
    {
        $gettype = DonationType::select('*')->where('archive', 0)->get();
        return $gettype;
    }

    public function deletetype($donationtypeid)
    {
        $deletedonation = DonationType::where('donation_type_id', $donationtypeid)->update(['archive'=>1]);
        if($deletedonation){
            return true;
        }
    }

    public function storedonation($insert)
    {
        $cmsusers = User::where('email', $insert['email'])->first();
        if (!$cmsusers)
        {
            $cmsusers = new User;
            $cmsusers->fname = $insert['first_name'];
            $cmsusers->lname = $insert['last_name'];
            $cmsusers->email = $insert['email'];
            $cmsusers->password = \bcrypt(123456789);
            $cmsusers->contact_number = $insert['contact_number'];
            $cmsusers->role_id = 1;
            $cmsusers->is_website_user = 1;
            $cmsusers->permissions = "";
            $cmsusers->active = 1;
            $cmsusers->save();
            
        }

        $donation = Donation::create([
            "user_id" => $cmsusers->id,
            "fname" => $insert['first_name'],
            "lname" => $insert['last_name'],
            "email" => $insert['email'],
            "contact_number"=>$insert['contact_number'] ,
            "donation_amount"=> $insert['donation_amount'],
            "donation_type"=> $insert['donation_type'],
            "city"=> $insert['city'],
            "country"=> $insert['country'],
            "payment_method"=> $insert['payment_method'],
            "transcation_id"=> 'cdsad1',
            "payment_date"=> '2022-02-18',
            "payment_sts"=>1,
        ]);
        return $donation;
    }

    public function showdonation($showdonation){
        $Donation = Donation::where('id', $showdonation)->first();
        return $Donation;
    }

    public function deletedonation($donationid)
    {
        $deldonation = Donation::where('id', $donationid)->update(['archive'=>1]);
        if($deldonation){
            return true;
        }
    }

    public function update($updateid, $update_data)
    {
        $donation_up = Donation::find($updateid);
        $data = array(
            "fname" => $update_data['first_name'],
            "lname" => $update_data['last_name'],
            "email" => $update_data['email'],
            "contact_number"=>$update_data['contact_number'] ,
            "donation_amount"=> $update_data['donation_amount'],
            "donation_type"=> $update_data['donation_type'],
            "city"=> $update_data['city'],
            "country"=> $update_data['country'],
            "payment_method"=> $update_data['payment_method'],
        );
        $donation_up->update($data);
        return $donation_up;
    }



}
