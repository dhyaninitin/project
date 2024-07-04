<?php

namespace IGD\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

defined( 'ABSPATH' ) || exit();

class Module_Widget extends Widget_Base {

	public function get_name() {
		return 'igd_module';
	}

	public function get_title() {
		return __( 'Google Drive Module', 'integrate-google-drive' );
	}

	public function get_icon() {
		return 'eicon-cloud-check';
	}

	public function get_categories() {
		return [ 'integrate_google_drive' ];
	}

	public function get_keywords() {
		return [
			"google drive",
			"drive",
			"shortcode",
			"module",
			"cloud",
			"shortcode",
		];
	}

	public function _register_controls() {

		$this->start_controls_section( '_section_module_builder',
			[
				'label' => __( 'Google Drive Module', 'integrate-google-drive' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			] );


		$this->add_control( 'module_data', [
			'label'       => __( 'Module Data', 'integrate-google-drive' ),
			'type'        => Controls_Manager::HIDDEN,
			'render_type' => 'none',
			'default'     => '{"isEdit":true,"id":null,"status":"on","title":"Shortcode Title","type":"embed","allFolders":false,"folders":[],"privateFolders":false,"excludeExtensions":null,"excludeAllExtensions":false,"excludeExceptExtensions":null,"excludeNames":null,"excludeAllNames":false,"excludeExceptNames":null,"showFiles":true,"showFolders":true,"fileNumbers":-1,"sort":{"sortBy":"name","sortDirection":"asc"},"view":"grid","maxFileSize":"","enableFolderUpload":false,"openNewTab":true,"rename":false,"moveCopy":false,"canDelete":false,"upload":false,"download":true,"displayFor":"everyone","displayUsers":["everyone"],"displayEveryone":false,"displayExcept":[]}',
		] );

		ob_start(); ?>
        <div style="margin-bottom: 10px">
            <i class="eicon-edit"></i>
            <span>Configure  MOdule</span>
        </div>

        <ul>
            <li style="margin-bottom: 5px">1. Select a Module Type</li>
            <li style="margin-bottom: 5px">2. Select Source Folders & Files</li>
            <li style="margin-bottom: 5px">3. Configure Excludes Settings</li>
            <li style="margin-bottom: 5px">4. Configure Advanced Settings</li>
            <li style="margin-bottom: 5px">5. Configure Permissions Settings</li>
        </ul>

		<?php $html = ob_get_clean();

		$this->add_control(
			'_html',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw'  => $html,
			]
		);

		$this->end_controls_section();
	}

	public function render() {
		$settings = $this->get_settings_for_display(); ?>
        <script type="application/json"
                id="igd_elementor_module_data_<?php echo $this->get_id(); ?>"><?php echo $settings['module_data']; ?></script>
        <div id="igd-elementor-module-builder"></div>
	<?php }

}