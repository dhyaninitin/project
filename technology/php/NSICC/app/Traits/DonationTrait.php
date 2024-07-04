<?php

namespace App\Traits;
use App\Model\{ City,Country,DonationType,PaymentMethodType,ExpensesCategory,ExpensesAccounts};
use Carbon\Carbon;

trait DonationTrait
{

    protected function formatCity($city)
    {
        $city = City::find($city);
        if ($city)
        {
            $citystr = $city->city_name;
        }
        return $citystr;
    }

    protected function formatCountry($country)
    {
        $country = Country::find($country);
        if ($country)
        {
            $countrystr = $country->country_name;
        }
        return $countrystr;
    }

    protected function formatDonationtype($donation_type)
    {
        $donationtype = DonationType::where('donation_type_id', $donation_type)->first();
        if ($donationtype)
        {
            $donationstr = $donationtype->type_name;
        }
        return $donationstr;
    }

    protected function formatpaymetMethod($method)
    {
        $payMethod = PaymentMethodType::where('payment_method_type_id', $method)->first();
        if ($payMethod)
        {
            $payMethodstr = $payMethod->type_name;
        }
        return $payMethodstr;
    }

    protected function formatExpenseCategory($expense_cat_id)
    {
        $ExpenseCategor = ExpensesCategory::where('id', $expense_cat_id)->first();
        if ($ExpenseCategor)
        {
            $ExpenseCategor = $ExpenseCategor->cat_name;
        }
        return $ExpenseCategor;
    }

    protected function formatAccountNumber($account_id)
    {
        $AccountNumber = ExpensesAccounts::where('id', $account_id)->first();
        if ($AccountNumber)
        {
            $Accountnum = $AccountNumber->account_number;
        }
        return $Accountnum;
    }
    



    
    
}
