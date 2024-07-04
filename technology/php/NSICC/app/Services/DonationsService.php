<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ DonationType,Donation,User };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class DonationsService extends AbstractService
{

    public function getList($search){

        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($search['page']) ? $search['page'] : 1;
        $per_page = isset($search['per_page']) ? $search['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($search['search']) ? $search['search']: '';
        $query = Donation::select('*')->where('archive', '0');

        if($search_value) { 
            $search_value_arr = explode(' ', $search_value);
            $query->join("city", "donations.city", "=", "city.id");
            $query->join("country", "donations.country", "=", "country.id"); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`fname`,''), ' ', COALESCE(`lname`, ''), ' ', COALESCE(`email`, ''), ' ', COALESCE(`contact_number`, ''), ' ', COALESCE(`city_name`, ''), ' ',COALESCE(`country_name`, '')) like '%{$value}%'");
            }
        }
        /*********** Donation Type Filter******* */
        $donation_type = isset($search['donation_type']) ? $search['donation_type']: '';
        if($donation_type)
        {
            $query = $query->where('donation_type', $donation_type);

        }
        /*********** Date Filter******* */
       
        $from_date = isset($search['from_date']) ? $search['from_date']: '';
        $to_date = isset($search['to_date']) ? $search['to_date']: '';
        if($from_date && $to_date)
        {
            $query = $query->whereDate('created_at', '>=', $from_date)
            ->whereDate('created_at', '<=', $to_date);

        } 
         /*********** Price Filter******* */
       
         $min_amount = isset($search['min_amount']) ? $search['min_amount']: '';
         $max_amount = isset($search['max_amount']) ? $search['max_amount']: '';
         if($min_amount && $max_amount)
         {
             $query = $query->where('donation_amount', '>=', $min_amount)->where('donation_amount', '<=', $max_amount);
 
         } 
        $num_results_filtered = $query->count();


        $query = $query->offset($offset)->limit($per_page);
        $users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('Users.index'));
        return $result;

    }
   
    public function storetype($donationval)
    {
        $type = DonationType::where('type_name', $donationval['donation_type'])->first();
        if (!$type)
        {
            $type = new DonationType;
        }
        $type->type_name = $donationval['donation_type'];
        $type->save();
        return $type;

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
