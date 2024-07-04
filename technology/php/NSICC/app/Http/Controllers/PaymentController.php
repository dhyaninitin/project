<?php 
namespace App\Http\Controllers; 
use Illuminate\Http\Request; 
use App\Services\{ PaymentService };
use Beanstream;

class PaymentController extends Controller 
{ 
    /**
     * @var PaymentService
     */
    protected $paymentService;

    public function __construct(
        PaymentService $paymentService
    )
    {
        $this->paymentService = $paymentService;
    }
    public function pay(Request $request) 
    { 
        $data = $request->all();
        $result = $this->paymentService->payOne($data);
        if($result)
        {
            return response()->json(['message' => 'Mail Sent Sucssfully'], 200); 
        }else{ 
            return response()->json(['message' => 'Mail Sent fail'], 400); 
        } 

}

}