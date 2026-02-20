<?php

namespace App\Services;

use Stripe\StripeClient;

class StripeService extends StripeClient {

  public function client(): StripeClient {
    return new StripeClient(config('services.stripe.sk'));
  }

}
