<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ExportService;
use App\Http\Requests\{ExportTokenRequest, DownloadRequest};
use Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\{VehicleRequestExport,RegisterUserExport,RequestExport,QuotesExport,QuotesRevenueExport,WholesaleQuotesExport,WholesaleQuoteRevenueExport,PurchaseOrderRevenueExport, ContactExport};
use PDF;
use App\Model\{Quote,WholeSaleQuote, PurchaseOrder};
use Carbon\Carbon;
use Propaganistas\LaravelPhone\PhoneNumber;
use App\Enums\{PortalAction};
use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;
use League\Csv\Reader;
use League\Csv\CannotInsertRecord;
use App\Jobs\{DealsExportJob, ContactExportJob};
use App\Http\Resources\VehicleRequestExportResource;

class ExportController extends Controller
{
    /**
     * @var RoleService
     */
    protected $exportService;

    public function __construct(ExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Return export token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function request(ExportTokenRequest $request)
    {
        $filters = $request->all();
        $result = $this->exportService->createExportToken($filters, 'request');
        return response()->json([
            'data' => $result
        ]);
    }

     /**
     * Return export token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function deals(ExportTokenRequest $request)
    {
        
        $portal_user = Auth::user();
        $filters = $request->all();
        $filters['login_user'] = $portal_user;
        $result = $this->exportService->dealsExportsCount($filters);
        $saveRequestAndGetToken = $this->exportService->createExportToken($filters, 'request');

        if($result < 30000){
            return response()->json([
                'open_url' => true,
                'data' => $saveRequestAndGetToken
            ]);
        } else {
            DealsExportJob::dispatch($filters);
            return response()->json([
                'open_url' => false,
                'data' => 'Your file is taking too much time, so we will send this file to your email.'
            ]);
        }
    }

    /**
     * Return export quote token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function quote(ExportTokenRequest $request)
    {
        $filters = $request->all();
        $result = $this->exportService->createExportToken($filters, 'quote');
        return response()->json([
            'data' => $result
        ]);
    }

    /**
     * Return export quote print token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function quotePrint(ExportTokenRequest $request)
    {
        
        $filters = $request->all();
        $result = $this->exportService->createExportToken($filters, 'quote-print');
        return response()->json([
            'data' => $result
        ]);
    }

    /**
     * Return export quote print token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function wholesaleQuotePrint(ExportTokenRequest $request)
    {   
        $filters = $request->all();
        $result = $this->exportService->createExportToken($filters, 'wholesale-quote-print');
        return response()->json([
            'data' => $result
        ]);
    }

    /**
     * Return export reports token
     *
     * @param  ExportTokenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function reports(ExportTokenRequest $request)
    {
        $filters = $request->all();
        $result = $this->exportService->createExportToken($filters, $filters['type']);
        return response()->json([
            'data' => $result
        ]);

    }

    

    /**
     * Download CSV file
     *
     * @param  DownloadRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function download(DownloadRequest $request)
    {
        $token = $request->get('token');
        $tokenObject = $this->exportService->getDataFromToken($token);
        if (!$tokenObject)
        {
            return response()->json([
                'error' => 'Token is invalid.'
            ], 400);       
        }
        switch ($tokenObject->type) {
            case 'request':
                return Excel::download(new VehicleRequestExport($tokenObject), 'deals.csv');
                break;
            case 'registered-user':
                return Excel::download(new RegisterUserExport($tokenObject),'register-users-report.csv');
                break;
            case 'export-request':
                return Excel::download(new RequestExport($tokenObject),'request-report.csv');
                break;
            case 'quote':
                $filter = json_decode($tokenObject->filter);
                $quote = Quote::with(['dealerContactItem', 'dealerItem'])->find($filter->id)->toArray();
                $customer_name = $quote['first_name'] . ' ' . $quote['last_name'];
                $quote['full_name'] = $customer_name;

                $file_name = 'Broker Fee Agreement '.$customer_name;
                if ($quote['year'])
                    $file_name .= ' - '.$quote['year'];
                if ($quote['make'])
                    $file_name .= ' '.$quote['make'];
                if ($quote['model'])
                    $file_name .= ' '.$quote['model'];
                $file_name .= '.pdf';
                
                $pdf = PDF::loadView('pdf.quote', compact('quote'));
                return $pdf->download($file_name);
                break;
            case 'quote-print':
                $filter = json_decode($tokenObject->filter);
                $quoteItem = Quote::find($filter->id);
                $purchaseOrder = PurchaseOrder::where('quote_id', $filter->id)->get()->toArray();
                $quote = $quoteItem->toArray();
                $quote['contract_date'] = Carbon::parse(
                    $quote['contract_date']
                )->format('m/d/Y');
                $quote['delivery_date'] = Carbon::parse(
                    $quote['delivery_date']
                )->format('m/d/Y');
                $quote['salesperson'] = $quoteItem->portalUser ? $quoteItem->portalUser->full_name : '';
                $quote['supplier'] = $quoteItem->dealerItem ? $quoteItem->dealerItem->name : '';
                $quote['contact'] = $quoteItem->dealerContactItem ? $quoteItem->dealerContactItem->name : '';
                $quote['contact_phone'] = $quoteItem->dealerContactItem && $quoteItem->dealerContactItem->phone ? PhoneNumber::make($quoteItem->dealerContactItem->phone) : '';

                $quote['type_wholesale_str'] = '';
                switch ($quote['type_wholesale']) {
                    case '1':
                        $quote['type_wholesale_str'] = 'Lease Returned';
                        break;
                    case '2':
                        $quote['type_wholesale_str'] = 'Auction';
                        break;
                    default:
                        break;
                }

                $quote['customersWholeSale'] = array_map(function($item) {
                    $item['paid_to'] = $item['paid_to'] == 1 ? 'Paid To Dealer': 'Paid To Carblip';
                    $item['date'] = $item['date'] ? Carbon::parse($item['date'])->format('m/d/Y'): '';
                    return $item;
                }, $quote['customersWholeSale']);

                $quote['net_deal_expensevendor_str'] = '';
                switch ($quote['net_deal_expensevendor']) {
                    case 1:
                        $quote['net_deal_expensevendor_str'] = 'Yes';
                        break;
                    case 0:
                        $quote['net_deal_expensevendor_str'] = 'No';
                        break;
                    default:
                        break;
                }

                $customer_name = $quote['first_name'] . ' ' . $quote['last_name'];

                $file_name = 'RECAP print '.$customer_name;
                if ($quote['year'])
                    $file_name .= ' - '.$quote['year'];
                if ($quote['make'])
                    $file_name .= ' '.$quote['make'];
                if ($quote['model'])
                    $file_name .= ' '.$quote['model'];
                $file_name .= '.pdf';
                
                $pdf = PDF::loadView('pdf.quote-print', compact('quote', 'purchaseOrder'));
                
                return $pdf->download($file_name);
                break;
            case 'wholesale-quote-print':
                $filter = json_decode($tokenObject->filter);
                $wholesaleQuoteItem = WholeSaleQuote::find($filter->id);
                
                $wholesaleQuote = $wholesaleQuoteItem->toArray();
                
                $wholesaleQuote['sale_date'] = Carbon::parse(
                    $wholesaleQuote['sale_date']
                )->format('m/d/Y');
                $wholesaleQuote['title_payoff_date'] = Carbon::parse(
                    $wholesaleQuote['title_payoff_date']
                )->format('m/d/Y');
                $wholesaleQuote['title_receive_date'] = Carbon::parse(
                    $wholesaleQuote['title_receive_date']
                )->format('m/d/Y');

                $wholesaleQuote['salesperson'] = $wholesaleQuoteItem->wholesaleSalesPerson ? $wholesaleQuoteItem->wholesaleSalesPerson->full_name : '';
                $wholesaleQuote['new_car_salesperson'] = $wholesaleQuoteItem->newCarSalesPerson ? $wholesaleQuoteItem->newCarSalesPerson->full_name : '';
                $wholesaleQuote['supplier'] = $wholesaleQuoteItem->dealerItem ? $wholesaleQuoteItem->dealerItem->name : '';
                $wholesaleQuote['stock_no'] = $wholesaleQuoteItem->quoteItem ? $wholesaleQuoteItem->quoteItem->stock_no : '';
                $wholesaleQuote['contact'] = $wholesaleQuoteItem->dealerContactItem ? $wholesaleQuoteItem->dealerContactItem->name : '';
                $wholesaleQuote['contact_phone'] = $wholesaleQuoteItem->dealerContactItem && $wholesaleQuoteItem->dealerContactItem->phone ? PhoneNumber::make($wholesaleQuoteItem->dealerContactItem->phone) : '';
                
                if ($wholesaleQuote['customersWholeSale']){
                    $totalCustomerPayment = 0;
                    foreach ($wholesaleQuote['customersWholeSale'] as $item) {
                        $totalCustomerPayment += ($item['amount'] != "NaN") ? $item['amount'] : 0;
                    }
                }

                if($wholesaleQuote['expenseChargedClient']){
                    $totalChargedClient = 0;
                    foreach ($wholesaleQuote['expenseChargedClient'] as $item ) {
                        $totalChargedClient += ($item['charge']) ? $item['charge'] : 0;
                    }
                }

                if($wholesaleQuote['expenseChargedDealer']){
                    $totalChargedDealer = 0;
                    foreach ($wholesaleQuote['expenseChargedDealer'] as $item) {
                        $totalChargedDealer += ($item['charge']) ? $item['charge'] : 0;
                    }
                }

                if($wholesaleQuote['expenseVendor']){
                    $totalExpenseVendor = 0;
                    foreach ($wholesaleQuote['expenseVendor'] as $item) {
                        $totalExpenseVendor += ($item['amount'] != "NaN") ? $item['amount'] : 0;
                    }
                }

                $wholesaleQuote['total_customer_payment'] = $totalCustomerPayment;
                $wholesaleQuote['total_chargedclient'] = $totalChargedClient;
                $wholesaleQuote['total_chargeddealer'] = $totalChargedDealer;
                $wholesaleQuote['total_expensevendor'] = $totalExpenseVendor;
              
                $customer_name = $wholesaleQuote['client_name'];

                $file_name = 'RECAP print '.$customer_name;
                if ($wholesaleQuote['year'])
                    $file_name .= ' - '.$wholesaleQuote['year'];
                if ($wholesaleQuote['make'])
                    $file_name .= ' '.$wholesaleQuote['make'];
                if ($wholesaleQuote['model'])
                    $file_name .= ' '.$wholesaleQuote['model'];
                $file_name .= '.pdf';
                
                $pdf = PDF::loadView('pdf.wholesale-quote-print', compact('wholesaleQuote'));
                return $pdf->download($file_name);
                break;
            case 'contact':
                return Excel::download(new ContactExport($tokenObject), 'contacts.csv');
                break;
            default:
                break;
        }
    }

    public function contact(ExportTokenRequest $request)
    {
        $portalUser = Auth::user();
        $filters = $request->all();
        $filters['login_user'] = $portalUser;
        $result = $this->exportService->contactExports($filters, true);
        $saveContactAndGetToken = $this->exportService->createExportToken($filters, 'contact');

        if($result < 30000){
            return response()->json([
                'open_url' => true,
                'data' => $saveContactAndGetToken
            ]);
        } else {
            ContactExportJob::dispatch($filters);
            return response()->json([
                'open_url' => false,
                'data' => 'Your file is taking too much time, so we will send this file to your email.'
            ]);
        }
    }
}
