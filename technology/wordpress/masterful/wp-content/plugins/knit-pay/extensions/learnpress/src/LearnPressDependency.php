<?php

/**
 * Title: Learn Press extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   1.6.0
 */

namespace KnitPay\Extensions\LearnPress;

use Pronamic\WordPress\Pay\Dependencies\Dependency;

class LearnPressDependency extends Dependency {
	/**
	 * Is met.
	 *
	 * @return bool True if dependency is met, false otherwise.
	 */
	public function is_met() {
		if ( ! \class_exists( '\LearnPress' ) ) {
			return false;
		}

		return true;
	}
}
