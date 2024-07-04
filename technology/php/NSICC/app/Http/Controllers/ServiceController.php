<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\{ServiceRequest,ListRequest,MatrimoniaRequest,FuneralRequest};
use App\Model\{MarriageServices,User};
use App\Services\{ MservicesService,  MatrimonialService,  FuneralService, MailService, registerUserService };
use App\Http\Resources\{ MservicesResource, MatrimonialResource, FuneralResource, MarriageCollection, MatrimonialCollection , FuneralCollection };
use Auth;
use JWTAuth;

class ServiceController extends Controller
{
 /**
     * @var MservicesService
     */
    protected $mservicesService;

    public function __construct(
        MservicesService $mservicesService,  MatrimonialService $matrimonialService,  FuneralService $funeralService, MailService $mailService, registerUserService $registeruserservice
    )
    {
        $this->mservicesService = $mservicesService;
        $this->matrimonialService = $matrimonialService;
        $this->funeralService = $funeralService;
        $this->mailService = $mailService;
        $this->registeruserservice = $registeruserservice;
    }

    /**
     * Get Marriage service list
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function marriagelist(ListRequest $request)
    {
         $filter = $request->all();
         $result = $this->mservicesService->getMarriageList($filter);
         if($result)
         {
             return new MarriageCollection($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }
    
     /**
     * Add Marriage service
     * @param  App\Http\Requests\ServiceRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function storeMarriage(ServiceRequest $request)
    {
        $data = $request->all();
        $data['password']='NSICC1-'.rand(987,868382);
       
        $register_user = $this->registeruserservice->register($data);
        if(isset($data['user_id']))
        {
             $data['user_id']=$data['user_id'];
 
         }
         else{
             $data['user_id']=$register_user;
         }
        $data['role_id'] = '7';
        $result = $this->mservicesService->addMarriage($data);
        if($result)
        {
        /***************** Mail Function  ********************/
        $template = 'basic_mail';
        $admin_template = 'admin_mail'; 
        $title = 'NSICC: Marriage Registration'; 
        $admin_title = 'New User Registration: Marriage'; 

        $customer_details = [ 
            'name' => $data['groom_full_name'], 
            'email' => $data['email'],
            'password' => $data['password']
        ];  
        $admin_details = [ 
            'name' => env('ADMIN_NAME', 'Admin'), 
            'email' => env('MAIL_ADMIN', 'support@nsicc.com'),
        ]; 
          $order_details = []; 
          $result_mail = $this->mailService->sendmail($template,$title,$customer_details,$order_details);
          $admin_mail  = $this->mailService->sendmail($admin_template,$admin_title,$admin_details,$customer_details);

          /***************** Mail Function  ********************/
         if($result_mail)
        {
            return new MservicesResource($result);
        }else{ 
            return response()->json(['message' => 'Mail Error!'], 400); 
        } 
        }
        else{
            return response()->json(['error' => 'API Error'], 400);
        }
    }
     /**
     * Detail marriage  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $marriage_service_id
     */
    public function editMarriage(Request $request,$id)
    {
        $user = Auth::user();
        $result = $this->mservicesService->editmarriage($id);
        return new MservicesResource($result);
    }

    /**
     * Update marriage  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $marriage_service_id
     */
    public function updateMarriage(ServiceRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->mservicesService->updateMarriage($id, $data);
        return new MservicesResource($result);
    }
  /**
     * Delete marriage
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function deleteMarriage(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->mservicesService->deleteMarriage($id);
        return response()->json([
            'result' => 'Marriage has been successfully removed.'
        ]);
    }


 /**
     * Get matrimonia service list user based
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function matrimoniallist(ListRequest $request)
    {
         $filter = $request->all();
         $result = $this->matrimonialService->getmatrimonialList($filter);
         return new MatrimonialCollection($result);
    }

 /**
     * Add matrimonia service
     * @param  App\Http\Requests\MatrimoniaRequest  $request
     * @return \Illuminate\Http\Response
     */

    public function storeMatrimonial(MatrimoniaRequest $request){
        $user = Auth::user();
        $insert = $request->all();
        $insert['password']='NSICC2-'.rand(456,868382);
        $insert['role_id'] = '7';
        $result = $this->matrimonialService->addmatrimonial($insert);
        if($result)
        {
        /***************** Mail Function  ********************/
        $template = 'basic_mail';
        $admin_template = 'admin_mail'; 
        $title = 'NSICC: Matrimonial Registration'; 
        $admin_title = 'New User Registration: Matrimonial'; 

        $customer_details = [ 
            'name' => $insert['full_name'], 
            'email' => $insert['email'],
            'password' => $insert['password']
        ];  
        $admin_details = [ 
            'name' => env('ADMIN_NAME', 'Admin'), 
            'email' => env('MAIL_ADMIN', 'support@nsicc.com'),
        ]; 
          $order_details = []; 
          $result_mail = $this->mailService->sendmail($template,$title,$customer_details,$order_details);
          $admin_mail  = $this->mailService->sendmail($admin_template,$admin_title,$admin_details,$customer_details);

          /***************** Mail Function  ********************/   
        return new MatrimonialResource($result);
        }
        else{
            return response()->json(['error' => 'API Error'], 400);
        }
    }
   
    /**
     * Update  Matrimonial  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $matrimonial_id
     */
    public function updateMatrimonial(MatrimoniaRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->matrimonialService->updatematrimonial($id, $data);
        return new MatrimonialResource($result);
    }
    /**
     * Delete Matrimonial
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function deleteMatrimonial(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->matrimonialService->deleteMatrimonial($id);
        
        return response()->json([
            'result' => 'Matrimonial has been successfully removed.'
        ]);
    }


     /**
     * Get Funeral service list user based
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function Funerallist(ListRequest $request)
    {
         $filter = $request->all();
         $result = $this->funeralService->getFuneralList($filter);
         return new FuneralCollection($result);
    }

     /**
     * Add Funeral service
     * @param  App\Http\Requests\FuneralRequest  $request
     * @return \Illuminate\Http\Response
     */

    public function storeFuneral(FuneralRequest $request){
        $user = Auth::user();
        $insert = $request->all();
        $insert['password']='NSICC3-'.rand(456,868382);
        $insert['role_id'] = '7';

        $result = $this->funeralService->addfuneral($insert);
        if($result)
        {

        /***************** Mail Function  ********************/
        $template = 'basic_mail';
        $admin_template = 'admin_mail'; 
        $title = 'NSICC: Funeral Registration'; 
        $admin_title = 'New User Registration: Funeral'; 

        $customer_details = [ 
            'name' => $insert['full_name'], 
            'email' => $insert['email'],
            'password' => $insert['password']
        ];  
        $admin_details = [ 
            'name' => env('ADMIN_NAME', 'Admin'), 
            'email' => env('MAIL_ADMIN', 'support@nsicc.com'),
        ]; 
          $order_details = []; 
          $result_mail = $this->mailService->sendmail($template,$title,$customer_details,$order_details);
          $admin_mail  = $this->mailService->sendmail($admin_template,$admin_title,$admin_details,$customer_details);

          /***************** Mail Function  ********************/ 
            return new FuneralResource($result);
        }
        else{
            return response()->json(['error' => 'API Error'], 400);
        }
    }
   
    /**
     * Update  Funeral  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $funeral_id
     */
    public function updateFuneral(FuneralRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->funeralService->updatefuneral($id, $data);
        return new FuneralResource($result);
    }
     /**
     * Delete Funeral
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function deleteFuneral(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->funeralService->deleteFuneral($id);
        
        return response()->json([
            'result' => 'Funeral has been successfully removed.'
        ]);
    }

    /**
     * Update  Funeral  Status
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $funeral_id
     */
    public function updateFuneralStatus(Request $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->funeralService->updatefuneralstatus($id, $data);
        return new FuneralResource($result);
    }



}