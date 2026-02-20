<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class StripeController extends Controller {

  protected $stripe;

  public function __construct() {
    $this->stripe = new StripeClient(config('services.stripe.sk'));
  }

  public function init(Lesson $lesson) {
    $discount_amount = $lesson->price - ($lesson->price * ($lesson->discount / 100));

    $session = $this->stripe->checkout->sessions->create([
      'success_url' => url('/courses/payment-success?s={CHECKOUT_SESSION_ID}'),
      'cancel_url'  => url('/courses/payment-cancelled'),
      'return_url'  => url('/courses/payment-cancelled'),
      'mode'        => 'payment',

      'line_items' => [
        [
          'quantity' => 1,
          'price_data' => [
            'currency' => 'mxn',
            'product_data' => [
              'name' => $lesson->course()->title,
              'description' => $discount_amount > 0 ? "Original Price: {$lesson->price} MXN, Discount: {$lesson->discount}%" : "No discount",
            ],
            'unit_amount' => ($discount_amount * 100), // Stripe works with cents
          ],
        ],
      ],
    ]);

    $user = request()->user();

    $purchase = new Purchase();
    $purchase->student_id = $user->id;
    $purchase->lesson_id = $lesson->id;
    $purchase->price = $lesson->price;
    $purchase->discount = $lesson->discount;
    $purchase->pay_id = $session->id;
    $purchase->status = 'draft';
    $purchase->save();

    Log::info("Created purchase record for user {$user->id} and lesson {$lesson->id} with session ID {$session->id}:" . json_encode($session));

    return response()->json([
      'checkout_url' => $session->url,
    ]);
  }
}
