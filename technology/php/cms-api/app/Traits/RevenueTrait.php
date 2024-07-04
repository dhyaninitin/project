<?php

namespace App\Traits;
use App\Model\{PurchaseOrder, PhoneNumbers, PortalUser, Location};
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

trait RevenueTrait
{

    protected function getgross($remaining_payments_chargedclient,$payment_chargedclient,$expenseChargedClient,$allowance_chargedclient,$brokeer_fee_dealer_expensevendor,$brokeer_fee_customer_expensevendor)
    {
        $getTotalChargedClientAll =  $this->getTotalChargedClientAll($remaining_payments_chargedclient,$payment_chargedclient);
        $getTotalChargedClient = $this->getTotalChargedClient($expenseChargedClient);

        return (float)($getTotalChargedClientAll + $getTotalChargedClient+$allowance_chargedclient)+$brokeer_fee_dealer_expensevendor+$brokeer_fee_customer_expensevendor;

    }


    protected function getTotalChargedClientAll($remaining_payments_chargedclient,$payment_chargedclient)
    {
        $TotalPaymentChargedClient = $remaining_payments_chargedclient * $payment_chargedclient;
        return (float)$TotalPaymentChargedClient;
    }

    protected function getTotalChargedClient($expenseChargedClient)
    {
         if(count($expenseChargedClient) == 0 ){
            return 0;
         }else{
            return array_reduce($expenseChargedClient, function(&$res, $item) {
                return (float)$res + (float)$item['charge'];
            }, 0);
         }

    }



    protected function getnet($getgross,$quotes_id,$expenseVendor)
    {
         $getTotalPurchaseOrderCost = $this->getTotalPurchaseOrderCost($quotes_id);
        $expenseVendor = $this->getTotalActualCost($expenseVendor);
        return (float)$getgross - (float)($getTotalPurchaseOrderCost + $expenseVendor );

    }

    protected function getTotalPurchaseOrderCost($quotes_id)
    {
        $getPurchaseorder = PurchaseOrder::where(['quote_id' => $quotes_id])->get()->toarray();
        return  array_reduce($getPurchaseorder, function(&$ress, $order) {
            return (float)$ress + (float)$order['amount'];
        }, 0);
    }

    protected function getTotalActualCost($expenseVendor)
    {
        return  array_reduce($expenseVendor, function(&$resss, $vendor) {
            if($vendor['amount'] != 'NaN'){
                return (float)$resss + (float)$vendor['amount'];
            }
        }, 0);
    }


    protected function getwholesalegross($paid_by,$payoff_amount,$allowance_to_new,$check_to_client,$expenseChargedClient,$expenseChargedDealer,$sale_amount)
    {
        if($paid_by == 1 || $paid_by == 3 || $paid_by == 4 || $paid_by == 5)
        {
            $payoff_amount = (float)$payoff_amount;
        }else
        {
            $payoff_amount = 0;
        }

        if($paid_by == 1) {
            $check_to_client = 0;
        } else {
            $check_to_client = (float)$check_to_client;
        }


        $getTotalChargedClientAll = $this->getwholesaleTotalChargedClientAll($expenseChargedClient);
        $getTotalChargedDealerAll = $this->getTotalChargedDealerAll($expenseChargedDealer);
        return (float)$sale_amount - (float)$allowance_to_new - (float)$check_to_client + (float)$getTotalChargedClientAll + (float)$getTotalChargedDealerAll - (float)$payoff_amount;
    }

    protected function getwholesaleTotalChargedClientAll($expenseChargedClient)
    {
        if(count($expenseChargedClient) == 0 ){
            return 0;
         }else{
            return array_reduce($expenseChargedClient, function(&$re, $var) {
                return (float)$re + (float)$var['charge'];
            }, 0);
         }

    }

    protected function getTotalChargedDealerAll($expenseChargedDealer)
    {
        if(count($expenseChargedDealer) == 0 ){
            return 0;
         }else{
            return array_reduce($expenseChargedDealer, function(&$ressss, $itemss) {
                return (float)$ressss + (float)$itemss['charge'];
            }, 0);
         }
    }

    protected function getwholesalenet($getgross,$expenseVendor, $total_expensevendor, $expenseChargedDealer,$payoff_amount,$paid_by)
    {
        $getActualCostForSupplier = 0;
        if(empty($total_expensevendor)) {
            $getActualCostForSupplier = $this->getActualCostForSupplier($expenseVendor);
        } else {
            $getActualCostForSupplier = $total_expensevendor;
        }

        $getTotalChargedDealerAll = $this->getTotalChargedDealerAll($expenseChargedDealer);

        // if($paid_by == 3 || $paid_by == 4 || $paid_by == 5)
        // {
        //     $payoff_amount = (float)$payoff_amount;
        // }else{
        //     $payoff_amount = 0;
        // }
        $payoff_amount = 0;
        return (float)$getgross - (float)$getActualCostForSupplier - (float)$payoff_amount;
    }

    protected function getActualCostForSupplier($expenseVendor)
    {
        if(count($expenseVendor) == 0 ){
            return 0;
         }else{
            return array_reduce($expenseVendor, function(&$cost, $varr) {
                $amount = 0;
                    if($varr['actual_cost_type'] == '1' || $varr['actual_cost_type'] == '2'){
                        $amount = (float)$varr['amount'];
                    }
                    return (float)$cost + (float)$amount;
            }, 0);
         }

    }

    protected function getQuoteComission($getgross, $item) {
        $net = $this->getnet($getgross, $item->quotes_id, $item->expenseVendor);
        $pack = $item->pack_expensevendor;
        $percent = $item->comission_percent_expensevendor;
        $comission = (($net - $pack) * $percent) / 100;
        if ($comission < 0) {
            $comission = 0;
        }
        return (float)$comission;
    }

    protected function getQuoteCompanyNet($getgross, $item) {
        $companyNet = ($this->getnet($getgross, $item->quotes_id, $item->expenseVendor) - $this->getQuoteComission($getgross, $item));
        return (float)($companyNet);
    }

    protected function getWholesaleQuoteComission($getgross, $item, $total_expensevendor) {
        $net = $this->getwholesalenet($getgross,$item->expenseVendor, $total_expensevendor, $item->expenseChargedDealer,$item->payoff_amount,$item->paid_by);
        $comission = ($net * $item->wholesale_commission) / 100;
        return (float)$comission;
    }

    protected function getWholesaleQuoteCompanyNet($getgross, $item, $total_expensevendor) {
        $wholesaleQuoteNet = $this->getwholesalenet($getgross,$item->expenseVendor, $total_expensevendor, $item->expenseChargedDealer,$item->payoff_amount,$item->paid_by);
        $wholesaleCommission = $this->getWholesaleQuoteComission($getgross, $item, $total_expensevendor);
        $newCarCommission =  (($wholesaleQuoteNet - $item->pack_fee) * $item->newcar_commission) / 100;
        $companyNet = ($wholesaleQuoteNet - ($wholesaleCommission + $newCarCommission));
        return (float)($companyNet);
    }

    public function getProfileUrl($fileName, $filePath) {
        $path = config('filesystems.disks.s3.bucket') . '/' . getenv('APP_ENV').'/'.'profile/'.$filePath;
        return Storage::disk('s3')->url($path);
    }

    protected function getCarblipAssignedNumber($portaluserid)
    {
        $getCarblipAssignedNumber = PhoneNumbers::where(['portal_user_id' => $portaluserid])->get()->toarray();
        if(empty($getCarblipAssignedNumber)) {
            return "";
        } else {
            return $getCarblipAssignedNumber[0]['phone'];
        }
    }

    protected function getPortalUserDetailById($portaluserid)
    {
        $getUserDetails = PortalUser::where(['id' => $portaluserid])->get()->toarray();
        if(empty($getUserDetails)) {
            return "";
        } else {
            return $getUserDetails;
        }
    }

    protected function getLocation($locations)
    {   
        $locations = !empty($locations) ? $locations : ['1'];
        $getUserLocation =  Location::whereIn('id', $locations)->get();
        return $getUserLocation;
    }


}
