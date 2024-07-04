<?php
/**
 * Title: Tour Master extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.1.0
 * @package   KnitPay\Extensions\TourMaster
 */

namespace KnitPay\Extensions\TourMaster;

use Pronamic\WordPress\Pay\Dependencies\Dependency;

/**
 * TourMasterDependency
 *
 * @author Gautam Garg
 */
class TourMasterDependency extends Dependency {


	/**
	 * Is met.
	 *
	 * @return bool True if dependency is met, false otherwise.
	 */
	public function is_met() {
		return \defined( '\TOURMASTER_LOCAL' ) || \defined( '\TOURMASTER_URL' ) || \defined( '\TOURMASTER_AJAX_URL' );
	}
}
