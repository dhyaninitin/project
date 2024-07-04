<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ ExpensesCategory,ExpensesAccounts,Expenses };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class ExpenseService extends AbstractService
{

    public function gettype()
    {
        $gettype = ExpensesCategory::select('*')->where('archive', 0)->get();
        return $gettype;
    }

    public function deletecategory($categoryid)
    {
        $deletecat = ExpensesCategory::find($categoryid)->update(['archive'=>1]);
        if($deletecat){
            return true;
        }
    }

    public function storecategory($insert)
    {
        $category = ExpensesCategory::where('cat_name', $insert['category_name'])->first();
        if (!$category)
        {
            $category = new ExpensesCategory;
        }
            $category->cat_name = $insert['category_name'];
            $category->save();
        return $category;
    }

    public function storeaccount($insertaccount,$user_id)
    {
        $store_account = ExpensesAccounts::where([
            'account_number'=> $insertaccount['account_number'],
            'user_id'=> $user_id,
            ])->first();
        if (!$store_account)
        {
            $store_account = new ExpensesAccounts;
        }
            $store_account->account_number = $insertaccount['account_number'];
            $store_account->user_id = $user_id;
            $store_account->save();
        return $store_account;
    }

    public function getaccountlist($userid)
    {
       return ExpensesAccounts::where(['user_id' => $userid,'archive' => 0])->get();
    }

    public function deleteaccountnumber($delid,$updateaccount)
    {
        $del_accountnumber = ExpensesAccounts::find($delid);
        $data = array(
            "archive" => 1
        );
        $del_accountnumber->update($data);
        return $del_accountnumber;
    }


    public function getlist($search)
    {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($search['page']) ? $search['page'] : 1;
        $per_page = isset($search['per_page']) ? $search['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($search['search']) ? $search['search']: '';
        $query = Expenses::select('*');

        $num_results_filtered = $query->count();

        $query = $query->offset($offset)->limit($per_page);
        $expenses = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($expenses, $num_results_filtered, $per_page, $page);
        $result->setPath(route('expense.getlist'));
        return $result;

    }

    public function store($insert,$user_id)
    {
        $store_expenses = Expenses::create([
            "created_by_user_id" => $user_id,
            "expense_cat_id" => $insert['category_id'],
            "paid_to" => $insert['paid_to'],
            "description" => $insert['description'],
            "payment_method"=>$insert['payment_method'],
            "account_number"=> $insert['account_number'],
            "cheque_number"=> $insert['cheque_number'],
            "hst"=> $insert['hst'],
            "amount"=> $insert['amount'],
        ]);
        return $store_expenses;
    }

    public function show($getid)
    {
        $get_expenses = Expenses::find($getid);
        return $get_expenses;
    }

    public function update($updateExpense,$update_id)
    {
        $UpExpense = Expenses::find($update_id);
        $data = array(
            "expense_cat_id" => $updateExpense['category_id'],
            "paid_to" => $updateExpense['paid_to'],
            "description" => $updateExpense['description'],
            "payment_method"=>$updateExpense['payment_method'],
            "account_number"=> $updateExpense['account_number'],
            "cheque_number"=> $updateExpense['cheque_number'],
            "hst"=> $updateExpense['hst'],
            "amount"=> $updateExpense['amount'],
        );
        $UpExpense->update($data);
        return $UpExpense;
    }

    public function delete($delete_id)
    {
        $DelExpense = Expenses::find($delete_id);
        $deldata = array(
            "archive" => 1
        );
        $DelExpense->update($deldata);
        return $DelExpense;
    }

}
