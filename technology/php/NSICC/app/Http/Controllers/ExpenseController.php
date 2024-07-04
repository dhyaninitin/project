<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\{ ExpenseService };
use App\Http\Requests\{ StorecategoryRequest,StoreaccountRequest,ListRequest,StorexpenseRequest };
use App\Http\Resources\{ ExpensecategoriesCollection,ExpensecategoriesResource,ExpenseaccountCollection,ExpenseaccountResource,
    ExpenseResource,ExpenseCollection };
use Auth;
use Session;


class ExpenseController extends Controller
{

    public function __construct(ExpenseService $expenseservice)
    {
        $this->Expenseservice = $expenseservice;
    }

    public function storecategory(StorecategoryRequest $request)
    {
        $user = Auth::user();  
        $insert = $request->all();
        $result = $this->Expenseservice->storecategory($insert);
        return new ExpensecategoriesResource($result);
    } 

    public function gettype(Request $request)
    {
        $result = $this->Expenseservice->gettype();
        return new ExpensecategoriesCollection($result);
    }

    public function deletecategory(Request $request,$categoryid)
    {
        $user = Auth::user();
        $result = $this->Expenseservice->deletecategory($categoryid);
        return response()->json([
            'result' => 'Expenses Categories has been successfully removed.'
        ]);
    }

    public function storeaccount(StoreaccountRequest $request){
        $user = Auth::user();
        $user_id = $user->id;
        $insertaccount = $request->all();
        $result = $this->Expenseservice->storeaccount($insertaccount,$user_id);
        return new ExpenseaccountResource($result);
    }

    public function getaccountlist(Request $request){
        $user = Auth::user();
        $user_id = $user->id;
        $get_account_list = $this->Expenseservice->getaccountlist($user_id);
        return new ExpenseaccountCollection($get_account_list);
    }

    public function deleteaccountnumber(Request $request,$delid)
    {
        $user = Auth::user();
        $updateaccount = $request->all();
        $get_account_list = $this->Expenseservice->deleteaccountnumber($delid,$updateaccount);
        return response()->json([
            'result' => 'Expenses Account number has been successfully removed.'
        ]);
    }


    public function getlist(ListRequest $request)
    {
        $search = $request->all();
        $result = $this->Expenseservice->getlist($search);
        return new ExpenseCollection($result);
    }

    public function store(StorexpenseRequest $request)
    {
        $user = Auth::user(); $user_id = $user->id;
        $insert = $request->all();
        $store_result = $this->Expenseservice->store($insert,$user_id);
        return new ExpenseResource($store_result);
    }

    public function show(Request $request,$getid)
    {
        $user = Auth::user(); 
        $store_result = $this->Expenseservice->show($getid);
        return new ExpenseResource($store_result);
    }

    function update(Request $request,$update_id)
    {
        $user = Auth::user();
        $updateExpense = $request->all();
        $updateResult = $this->Expenseservice->update($updateExpense,$update_id);
        return new ExpenseResource($updateResult);

    }

    public function delete(Request $request,$delete_id)
    {
        $user = Auth::user();
        $get_account_list = $this->Expenseservice->delete($delete_id);
        return response()->json([
            'result' => 'Expenses has been successfully removed.'
        ]);
    }


}
