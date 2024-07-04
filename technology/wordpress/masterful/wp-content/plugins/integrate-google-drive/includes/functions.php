<?php

defined( 'ABSPATH' ) || exit();

use IGD\App;
use IGD\Account;
use IGD\Download;
use IGD\Shortcode_Builder;
use IGD\Zip;

function igd_get_breadcrumb( $folder ) {

	if ( empty( $folder['id'] ) || $folder['id'] == Account::get_active_account()['root_id'] ) {
		return [];
	}

	$items = [
		$folder['id'] => $folder['name'],
	];

	if ( ! empty( $folder['parents'] ) ) {
		$item  = App::instance()->get_file_by_id( $folder['parents'][0] );
		$items = array_merge( $items, igd_get_breadcrumb( $item ) );
	}

	return $items;
}

function igd_is_dir( $type ) {
	return $type == 'application/vnd.google-apps.folder';
}

function igd_get_files_recursive(
	$file,
	$current_path = '',
	&$list = [
		'folders' => [],
		'files'   => [],
		'size'    => 0,
	]
) {

	if ( igd_is_dir( $file['type'] ) ) {
		$folder_path = $current_path . $file['name'] . '/';

		$list['folders'][] = $folder_path;

		$account_id = ! empty( $file['accountId'] ) ? $file['accountId'] : Account::get_active_account()['id'];
		$files      = App::instance( $account_id )->get_files( [], $file['id'] );

		if ( ! empty( $files ) ) {
			foreach ( $files as $file ) {
				igd_get_files_recursive( $file, $folder_path, $list );
			}
		}

	} else {
		$file_path = $current_path . $file['name'];

		if ( empty( $file['webContentLink'] ) ) {
			$export_as = igd_get_export_as( $file['type'] );

			$format        = reset( $export_as );
			$download_link = 'https://www.googleapis.com/drive/v3/files/' . $file['id'] . '/export?mimeType=' . urlencode( $format['mimetype'] ) . '&alt=media';
			$file_path     .= '.' . $format['extension'];
		} else {
			$download_link = 'https://www.googleapis.com/drive/v3/files/' . $file['id'] . '?alt=media';
		}

		$file['downloadLink'] = $download_link;

		$file['path']    = $file_path;
		$list['files'][] = $file;
		$list['size']    += $file['size'];
	}


	return $list;
}

function igd_file_map( $item, $account_id = null ) {

	if ( empty( $account_id ) ) {
		$account_id = Account::get_active_account()['id'];
	}

	$file = [
		'id'                           => $item->getId(),
		'name'                         => $item->getName(),
		'type'                         => $item->getMimeType(),
		'size'                         => $item->getSize(),
		'iconLink'                     => $item->getIconLink(),
		'thumbnailLink'                => $item->getThumbnailLink(),
		'webViewLink'                  => $item->getWebViewLink(),
		'webContentLink'               => $item->getWebContentLink(),
		'created'                      => $item->getCreatedTime(),
		'updated'                      => $item->getModifiedTime(),
		'description'                  => $item->getDescription(),
		'parents'                      => $item->getParents(),
		'shared'                       => $item->getShared(),
		'sharedWithMeTime'             => $item->getSharedWithMeTime(),
		'extension'                    => $item->getFileExtension(),
		'resourceKey'                  => $item->getResourceKey(),
		'copyRequiresWriterPermission' => $item->getCopyRequiresWriterPermission(),
		'starred'                      => $item->getStarred(),
		'exportLinks'                  => $item->getExportLinks(),
		'accountId'                    => $account_id,
	];

	$can_preview                            = true;
	$can_download                           = true;
	$can_share                              = false;
	$can_delete                             = $item->getOwnedByMe();
	$can_trash                              = $item->getOwnedByMe();
	$can_add                                = $item->getOwnedByMe();
	$can_move                               = $item->getOwnedByMe();
	$can_rename                             = $item->getOwnedByMe();
	$can_changecopyrequireswriterpermission = true;

	$capabilities = $item->getCapabilities();


	if ( ! empty( $capabilities ) ) {
		$can_edit                               = $capabilities->getCanEdit() && igd_is_editable( $file['type'] );
		$can_share                              = $capabilities->getCanShare();
		$can_add                                = $capabilities->getCanEdit();
		$can_rename                             = $capabilities->getCanRename();
		$can_delete                             = $capabilities->getCanDelete();
		$can_trash                              = $capabilities->getCanTrash();
		$can_move                               = $capabilities->getCanMoveItemWithinDrive();
		$can_changecopyrequireswriterpermission = $capabilities->getCanChangeCopyRequiresWriterPermission();
	}

	// Permission users
	$users = [];

	$permissions = $item->getPermissions();
	if ( count( $permissions ) > 0 ) {
		foreach ( $permissions as $permission ) {
			$users[ $permission->getId() ] = [
				'type'   => $permission->getType(),
				'role'   => $permission->getRole(),
				'domain' => $permission->getDomain()
			];
		}
	}

	// Set the permissions
	$file['permissions'] = [
		'can_edit'                               => $can_edit,
		'can_preview'                            => $can_preview,
		'can_download'                           => $can_download,
		'can_delete'                             => $can_delete,
		'can_trash'                              => $can_trash,
		'can_move'                               => $can_move,
		'can_add'                                => $can_add,
		'can_rename'                             => $can_rename,
		'can_share'                              => $can_share,
		'copyRequiresWriterPermission'           => $item->getCopyRequiresWriterPermission(),
		'can_ChangeCopyRequiresWriterPermission' => $can_changecopyrequireswriterpermission,
		'users'                                  => $users,
	];

	// Set owner
	if ( ! empty( $item->getOwners() ) ) {
		$file['owner'] = $item->getOwners()[0]['displayName'];
	}

	// Get export as
	$file['exportAs'] = igd_get_export_as( $item->getMimeType() );

	//Meta Data
	$image_meta_data = $item->getImageMediaMetadata();
	$video_meta_data = $item->getVideoMediaMetadata();

	if ( $image_meta_data ) {
		$file['metaData'] = [
			'width'  => $image_meta_data->getWidth(),
			'height' => $image_meta_data->getHeight(),
		];
	} elseif ( $video_meta_data ) {
		$file['metaData'] = [
			'width'    => $video_meta_data->getWidth(),
			'height'   => $video_meta_data->getHeight(),
			'duration' => $video_meta_data->getDurationMillis(),
		];
	}

	return $file;
}

function igd_is_editable( $type ) {
	$is_editable = false;

	if ( in_array( $type, [
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.google-apps.document',
		'application/vnd.ms-excel',
		'application/vnd.ms-excel.sheet.macroenabled.12',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.google-apps.spreadsheet',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
		'application/vnd.google-apps.presentation',
		'application/vnd.google-apps.drawing',
	] ) ) {
		$is_editable = true;
	}

	return $is_editable;
}

function igd_get_export_as( $type ) {
	$export_as = [];

	if ( 'application/vnd.google-apps.document' == $type ) {
		$export_as = [
			'MS Word document' => [
				'mimetype'  => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'extension' => 'docx',
			],

			'HTML' => [
				'mimetype'  => 'text/html',
				'extension' => 'html',
			],

			'Text' => [
				'mimetype'  => 'text/plain',
				'extension' => 'txt',
			],

			'Open Office document' => [
				'mimetype'  => 'application/vnd.oasis.opendocument.text',
				'extension' => 'odt',
			],

			'PDF' => [
				'mimetype'  => 'application/pdf',
				'extension' => 'pdf',
			],

			'ZIP' => [
				'mimetype'  => 'application/zip',
				'extension' => 'zip',
			],

		];

	} elseif ( 'application/vnd.google-apps.spreadsheet' == $type ) {
		$export_as = [
			'MS Excel document'      => [
				'mimetype'  => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'extension' => 'xlsx',
			],
			'Open Office sheet'      => [
				'mimetype'  => 'application/x-vnd.oasis.opendocument.spreadsheet',
				'extension' => 'ods',
			],
			'PDF'                    => [
				'mimetype'  => 'application/pdf',
				'extension' => 'pdf',
			],
			'CSV (first sheet only)' => [
				'mimetype'  => 'text/csv',
				'extension' => 'csv',
			],
			'ZIP'                    => [
				'mimetype'  => 'application/zip',
				'extension' => 'zip',
			],
		];
	} elseif ( 'application/vnd.google-apps.drawing' == $type ) {
		$export_as = [
			'JPEG' => [ 'mimetype' => 'image/jpeg', 'extension' => 'jpeg', 'icon' => 'eva-download' ],
			'PNG'  => [ 'mimetype' => 'image/png', 'extension' => 'png', 'icon' => 'eva-download' ],
			'SVG'  => [ 'mimetype' => 'image/svg+xml', 'extension' => 'svg', 'icon' => 'eva-download' ],
			'PDF'  => [ 'mimetype' => 'application/pdf', 'extension' => 'pdf', 'icon' => 'eva-download' ],
		];

	} elseif ( 'application/vnd.google-apps.presentation' == $type ) {
		$export_as = [
			'MS PowerPoint document' => [
				'mimetype'  => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'extension' => 'pptx',
			],
			'PDF'                    => [
				'mimetype'  => 'application/pdf',
				'extension' => 'pdf',
			],
			'Text'                   => [
				'mimetype'  => 'text/plain',
				'extension' => 'txt',
			],
		];
	} elseif ( 'application/vnd.google-apps.script' == $type ) {
		$export_as = [
			'JSON' => [
				'mimetype'  => 'application/vnd.google-apps.script+json',
				'extension' => 'json',
			],
		];
	} elseif ( 'application/vnd.google-apps.form' == $type ) {
		$export_as = [
			'ZIP' => [ 'mimetype' => 'application/zip', 'extension' => 'zip', 'icon' => 'eva-download' ],
		];
	}

	return $export_as;
}

function igd_get_embed_content( $items, $show_file_name = true ) {

	$files = [];
	foreach ( $items as $item ) {

		// skip root folders
		if ( ! is_array( $item ) ) {
			continue;
		}

		if ( ! igd_is_dir( $item['type'] ) ) {
			$files[] = $item;
		} else {
			$folder_files = App::instance()->get_files( [], $item['id'] );

			foreach ( $folder_files as $folder_file ) {
				if ( ! igd_is_dir( $folder_file['type'] ) ) {
					$files[] = $folder_file;
				}

			}

		}
	}

	ob_start();
	foreach ( $files as $file ) {

		$id   = $file['id'];
		$type = $file['type'];
		$name = $file['name'];

		$download_instance = Download::instance( $file );

		if ( ! $download_instance->has_permission() ) {
			$download_instance->set_permission();
		}

		$arguments = 'preview?rm=demo';

		if ( in_array( $type, [
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.google-apps.document',
		] ) ) {
			$arguments = 'preview?rm=minimal'; //rm=minimal&overridemobile=true'; Causing errors on iPads
			$url       = "https://docs.google.com/document/d/$id/$arguments";
		} elseif ( in_array( $type, [
			'application/vnd.ms-excel',
			'application/vnd.ms-excel.sheet.macroenabled.12',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.google-apps.spreadsheet',
		] ) ) {
			$url = "https://docs.google.com/spreadsheets/d/$id/preview";
		} elseif ( in_array( $type, [
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
			'application/vnd.google-apps.presentation',
		] ) ) {
			$url = "https://docs.google.com/presentation/d/$id/$arguments";
		} elseif ( 'application/vnd.google-apps.folder' == $type ) {
			$url = "https://drive.google.com/open?id=$id";
		} elseif ( 'application/vnd.google-apps.drawing' == $type ) {
			$url = "https://docs.google.com/drawings/d/$id?";
		} elseif ( 'application/vnd.google-apps.form' == $type ) {
			$url = "https://docs.google.com/forms/d/$id/viewform?";
		} else {
			$url = "https://drive.google.com/file/d/$id/preview?rm=minimal";
		}

		if ( $show_file_name ) { ?>
            <h4 class="my-2"><?php echo $name; ?></h4>
		<?php } ?>
        <iframe class="igd-embed mb-4" style="width: 100%%" frameborder="0" src="<?php echo $url; ?>" width="100%%"
                height="480" allow="autoplay"></iframe>
		<?php
	}

	$content = ob_get_clean();

	return $content;

}

function igd_delete_thumbnail_cache() {
	$dirname = IGD_CACHE_DIR . '/thumbnails';

	if ( is_dir( $dirname ) ) {
		array_map( 'unlink', glob( "$dirname/*.*" ) );
		rmdir( $dirname );
	}
}

function igd_is_cached_folder( $folder ) {
	$cached_folders = (array) get_option( 'igd_cached_folders' );

	return in_array( $folder, $cached_folders );
}

function igd_update_cached_folders( $folder ) {
	$cached_folders   = (array) get_option( 'igd_cached_folders' );
	$cached_folders[] = $folder;

	update_option( 'igd_cached_folders', $cached_folders );
}

function igd_mime_to_ext( $mime ) {
	$mime_map = [
		'video/3gpp2'                                                               => '3g2',
		'video/3gp'                                                                 => '3gp',
		'video/3gpp'                                                                => '3gp',
		'application/x-compressed'                                                  => '7zip',
		'audio/x-acc'                                                               => 'aac',
		'audio/ac3'                                                                 => 'ac3',
		'application/postscript'                                                    => 'ai',
		'audio/x-aiff'                                                              => 'aif',
		'audio/aiff'                                                                => 'aif',
		'audio/x-au'                                                                => 'au',
		'video/x-msvideo'                                                           => 'avi',
		'video/msvideo'                                                             => 'avi',
		'video/avi'                                                                 => 'avi',
		'application/x-troff-msvideo'                                               => 'avi',
		'application/macbinary'                                                     => 'bin',
		'application/mac-binary'                                                    => 'bin',
		'application/x-binary'                                                      => 'bin',
		'application/x-macbinary'                                                   => 'bin',
		'image/bmp'                                                                 => 'bmp',
		'image/x-bmp'                                                               => 'bmp',
		'image/x-bitmap'                                                            => 'bmp',
		'image/x-xbitmap'                                                           => 'bmp',
		'image/x-win-bitmap'                                                        => 'bmp',
		'image/x-windows-bmp'                                                       => 'bmp',
		'image/ms-bmp'                                                              => 'bmp',
		'image/x-ms-bmp'                                                            => 'bmp',
		'application/bmp'                                                           => 'bmp',
		'application/x-bmp'                                                         => 'bmp',
		'application/x-win-bitmap'                                                  => 'bmp',
		'application/cdr'                                                           => 'cdr',
		'application/coreldraw'                                                     => 'cdr',
		'application/x-cdr'                                                         => 'cdr',
		'application/x-coreldraw'                                                   => 'cdr',
		'image/cdr'                                                                 => 'cdr',
		'image/x-cdr'                                                               => 'cdr',
		'zz-application/zz-winassoc-cdr'                                            => 'cdr',
		'application/mac-compactpro'                                                => 'cpt',
		'application/pkix-crl'                                                      => 'crl',
		'application/pkcs-crl'                                                      => 'crl',
		'application/x-x509-ca-cert'                                                => 'crt',
		'application/pkix-cert'                                                     => 'crt',
		'text/css'                                                                  => 'css',
		'text/x-comma-separated-values'                                             => 'csv',
		'text/comma-separated-values'                                               => 'csv',
		'application/vnd.msexcel'                                                   => 'csv',
		'application/x-director'                                                    => 'dcr',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   => 'docx',
		'application/x-dvi'                                                         => 'dvi',
		'message/rfc822'                                                            => 'eml',
		'application/x-msdownload'                                                  => 'exe',
		'video/x-f4v'                                                               => 'f4v',
		'audio/x-flac'                                                              => 'flac',
		'video/x-flv'                                                               => 'flv',
		'image/gif'                                                                 => 'gif',
		'application/gpg-keys'                                                      => 'gpg',
		'application/x-gtar'                                                        => 'gtar',
		'application/x-gzip'                                                        => 'gzip',
		'application/mac-binhex40'                                                  => 'hqx',
		'application/mac-binhex'                                                    => 'hqx',
		'application/x-binhex40'                                                    => 'hqx',
		'application/x-mac-binhex40'                                                => 'hqx',
		'text/html'                                                                 => 'html',
		'image/x-icon'                                                              => 'ico',
		'image/x-ico'                                                               => 'ico',
		'image/vnd.microsoft.icon'                                                  => 'ico',
		'text/calendar'                                                             => 'ics',
		'application/java-archive'                                                  => 'jar',
		'application/x-java-application'                                            => 'jar',
		'application/x-jar'                                                         => 'jar',
		'image/jp2'                                                                 => 'jp2',
		'video/mj2'                                                                 => 'jp2',
		'image/jpx'                                                                 => 'jp2',
		'image/jpm'                                                                 => 'jp2',
		'image/jpeg'                                                                => 'jpeg',
		'image/pjpeg'                                                               => 'jpeg',
		'application/x-javascript'                                                  => 'js',
		'application/json'                                                          => 'json',
		'text/json'                                                                 => 'json',
		'application/vnd.google-earth.kml+xml'                                      => 'kml',
		'application/vnd.google-earth.kmz'                                          => 'kmz',
		'text/x-log'                                                                => 'log',
		'audio/x-m4a'                                                               => 'm4a',
		'audio/mp4'                                                                 => 'm4a',
		'application/vnd.mpegurl'                                                   => 'm4u',
		'audio/midi'                                                                => 'mid',
		'application/vnd.mif'                                                       => 'mif',
		'video/quicktime'                                                           => 'mov',
		'video/x-sgi-movie'                                                         => 'movie',
		'audio/mpeg'                                                                => 'mp3',
		'audio/mpg'                                                                 => 'mp3',
		'audio/mpeg3'                                                               => 'mp3',
		'audio/mp3'                                                                 => 'mp3',
		'video/mp4'                                                                 => 'mp4',
		'video/mpeg'                                                                => 'mpeg',
		'application/oda'                                                           => 'oda',
		'audio/ogg'                                                                 => 'ogg',
		'video/ogg'                                                                 => 'ogg',
		'application/ogg'                                                           => 'ogg',
		'font/otf'                                                                  => 'otf',
		'application/x-pkcs10'                                                      => 'p10',
		'application/pkcs10'                                                        => 'p10',
		'application/x-pkcs12'                                                      => 'p12',
		'application/x-pkcs7-signature'                                             => 'p7a',
		'application/pkcs7-mime'                                                    => 'p7c',
		'application/x-pkcs7-mime'                                                  => 'p7c',
		'application/x-pkcs7-certreqresp'                                           => 'p7r',
		'application/pkcs7-signature'                                               => 'p7s',
		'application/pdf'                                                           => 'pdf',
		'application/octet-stream'                                                  => 'pdf',
		'application/x-x509-user-cert'                                              => 'pem',
		'application/x-pem-file'                                                    => 'pem',
		'application/pgp'                                                           => 'pgp',
		'application/x-httpd-php'                                                   => 'php',
		'application/php'                                                           => 'php',
		'application/x-php'                                                         => 'php',
		'text/php'                                                                  => 'php',
		'text/x-php'                                                                => 'php',
		'application/x-httpd-php-source'                                            => 'php',
		'image/png'                                                                 => 'png',
		'image/x-png'                                                               => 'png',
		'application/powerpoint'                                                    => 'ppt',
		'application/vnd.ms-powerpoint'                                             => 'ppt',
		'application/vnd.ms-office'                                                 => 'ppt',
		'application/msword'                                                        => 'doc',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
		'application/x-photoshop'                                                   => 'psd',
		'image/vnd.adobe.photoshop'                                                 => 'psd',
		'audio/x-realaudio'                                                         => 'ra',
		'audio/x-pn-realaudio'                                                      => 'ram',
		'application/x-rar'                                                         => 'rar',
		'application/rar'                                                           => 'rar',
		'application/x-rar-compressed'                                              => 'rar',
		'audio/x-pn-realaudio-plugin'                                               => 'rpm',
		'application/x-pkcs7'                                                       => 'rsa',
		'text/rtf'                                                                  => 'rtf',
		'text/richtext'                                                             => 'rtx',
		'video/vnd.rn-realvideo'                                                    => 'rv',
		'application/x-stuffit'                                                     => 'sit',
		'application/smil'                                                          => 'smil',
		'text/srt'                                                                  => 'srt',
		'image/svg+xml'                                                             => 'svg',
		'application/x-shockwave-flash'                                             => 'swf',
		'application/x-tar'                                                         => 'tar',
		'application/x-gzip-compressed'                                             => 'tgz',
		'image/tiff'                                                                => 'tiff',
		'font/ttf'                                                                  => 'ttf',
		'text/plain'                                                                => 'txt',
		'text/x-vcard'                                                              => 'vcf',
		'application/videolan'                                                      => 'vlc',
		'text/vtt'                                                                  => 'vtt',
		'audio/x-wav'                                                               => 'wav',
		'audio/wave'                                                                => 'wav',
		'audio/wav'                                                                 => 'wav',
		'application/wbxml'                                                         => 'wbxml',
		'video/webm'                                                                => 'webm',
		'image/webp'                                                                => 'webp',
		'audio/x-ms-wma'                                                            => 'wma',
		'application/wmlc'                                                          => 'wmlc',
		'video/x-ms-wmv'                                                            => 'wmv',
		'video/x-ms-asf'                                                            => 'wmv',
		'font/woff'                                                                 => 'woff',
		'font/woff2'                                                                => 'woff2',
		'application/xhtml+xml'                                                     => 'xhtml',
		'application/excel'                                                         => 'xl',
		'application/msexcel'                                                       => 'xls',
		'application/x-msexcel'                                                     => 'xls',
		'application/x-ms-excel'                                                    => 'xls',
		'application/x-excel'                                                       => 'xls',
		'application/x-dos_ms_excel'                                                => 'xls',
		'application/xls'                                                           => 'xls',
		'application/x-xls'                                                         => 'xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         => 'xlsx',
		'application/vnd.ms-excel'                                                  => 'xlsx',
		'application/xml'                                                           => 'xml',
		'text/xml'                                                                  => 'xml',
		'text/xsl'                                                                  => 'xsl',
		'application/xspf+xml'                                                      => 'xspf',
		'application/x-compress'                                                    => 'z',
		'application/x-zip'                                                         => 'zip',
		'application/zip'                                                           => 'zip',
		'application/x-zip-compressed'                                              => 'zip',
		'application/s-compressed'                                                  => 'zip',
		'multipart/x-zip'                                                           => 'zip',
		'text/x-scriptzsh'                                                          => 'zsh',
	];

	return isset( $mime_map[ $mime ] ) ? $mime_map[ $mime ] : false;
}

function igd_get_all_child_folders( $parent_id, &$list = [] ) {

	if ( 'computers' == $parent_id ) {
		$files = App::instance()->get_computers_files();
	} elseif ( 'shared' == $parent_id ) {
		$files = App::instance()->get_shared_files();
	} elseif ( 'recent' == $parent_id ) {
		$files = App::instance()->get_recent_files();
	} elseif ( 'starred' == $parent_id ) {
		$files = App::instance()->get_starred_files();
	} else {
		$files = App::instance()->get_files( [], $parent_id );
	}

	if ( ! empty( $files['error'] ) ) {
		error_log( 'Integrate Google Drive - Error: ' . $files['error'] );
	}

	if ( ! empty( $files ) ) {
		foreach ( $files as $file ) {

			if ( ! igd_is_dir( $file['type'] ) ) {
				continue;
			}

			$file_id = $file['id'];

			$list[] = $file_id;

			igd_get_all_child_folders( $file_id, $list );
		}
	}

	return $list;

}

function igd_get_scheduled_interval( $hook ) {
	$schedule  = wp_get_schedule( $hook );
	$schedules = wp_get_schedules();

	return ! empty( $schedules[ $schedule ] ) ? $schedules[ $schedule ]['interval'] : false;
}

function igd_get_shortcodes_array() {
	$shortcodes = Shortcode_Builder::instance()->get_shortcode();

	$formatted = [];

	if ( ! empty( $shortcodes ) ) {
		foreach ( $shortcodes as $shortcode ) {

			$formatted[ $shortcode->id ] = $shortcode->title;
		}
	}

	return $formatted;
}

function igd_download_zip( $file_ids ) {

	$files = [];

	if ( ! empty( $file_ids ) ) {
		foreach ( $file_ids as $file_id ) {
			$files[] = App::instance()->get_file_by_id( $file_id );
		}
	}

	Zip::instance( $files )->do_zip();
	exit();
}

function igd_get_free_memory_available() {
	$memory_limit = igd_return_bytes( ini_get( 'memory_limit' ) );

	if ( $memory_limit < 0 ) {
		if ( defined( 'WP_MEMORY_LIMIT' ) ) {
			$memory_limit = igd_return_bytes( WP_MEMORY_LIMIT );
		} else {
			$memory_limit = 1024 * 1024 * 92; // Return 92MB if we can't get any reading on memory limits
		}
	}

	$memory_usage = memory_get_usage( true );

	$free_memory = $memory_limit - $memory_usage;

	if ( $free_memory < ( 1024 * 1024 * 10 ) ) {
		// Return a minimum of 10MB available
		return 1024 * 1024 * 10;
	}

	return $free_memory;
}

function igd_return_bytes( $size_str ) {
	if ( empty( $size_str ) ) {
		return $size_str;
	}

	$unit = substr( $size_str, - 1 );
	if ( ( 'B' === $unit || 'b' === $unit ) && ( ! ctype_digit( substr( $size_str, - 2 ) ) ) ) {
		$unit = substr( $size_str, - 2, 1 );
	}

	switch ( $unit ) {
		case 'M':
		case 'm':
			return (int) $size_str * 1048576;

		case 'K':
		case 'k':
			return (int) $size_str * 1024;

		case 'G':
		case 'g':
			return (int) $size_str * 1073741824;

		default:
			return $size_str;
	}
}

function igd_get_settings( $key = null, $default = null ) {
	$settings = get_option( 'igd_settings' );

	if ( empty( $settings ) && ! empty( $default ) ) {
		return $default;
	}

	if ( empty( $key ) ) {
		return ! empty( $settings ) ? $settings : [];
	}

	return isset( $settings[ $key ] ) ? $settings[ $key ] : $default;
}

function igd_get_embed_url( $file_id, $account_id ) {

	$file = App::instance( $account_id )->get_file_by_id( $file_id );

	$download_instance = Download::instance( $file );

	if ( ! $download_instance->has_permission() ) {
		$download_instance->set_permission();
	}

	$arguments = 'preview?rm=demo';

	switch ( $file['type'] ) {
		case 'application/msword':
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		case 'application/vnd.google-apps.document':
			$arguments = 'preview?rm=minimal'; //rm=minimal&overridemobile=true'; Causing errors on iPads
			$preview   = 'https://docs.google.com/document/d/' . $file_id . '/' . $arguments;

			break;

		case 'application/vnd.ms-excel':
		case 'application/vnd.ms-excel.sheet.macroenabled.12':
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		case 'application/vnd.google-apps.spreadsheet':
			$preview = 'https://docs.google.com/spreadsheets/d/' . $file_id . '/' . $arguments;

			break;

		case 'application/vnd.ms-powerpoint':
		case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
		case 'application/vnd.google-apps.presentation':
			$preview = 'https://docs.google.com/presentation/d/' . $file_id . '/' . $arguments;

			break;

		case 'application/vnd.google-apps.folder':
			$preview = 'https://drive.google.com/open?id=' . $file_id;

			break;

		case 'application/vnd.google-apps.drawing':
			$preview = 'https://docs.google.com/drawings/d/' . $file_id . '?';

			break;

		case 'application/vnd.google-apps.form':
			$preview = 'https://docs.google.com/forms/d/' . $file_id . '/viewform?';

			break;

		default:
			$preview = 'https://drive.google.com/file/d/' . $file_id . '/preview?rm=minimal';

			break;
	}

	// Add Resources key to give permission to access the item
	if ( $file['resourceKey'] ) {
		$preview .= "&resourcekey={$file['resourceKey']}";
	}

	// For images, just return the actual file
	//if ( in_array( igd_mime_to_ext( $file['type'] ), [ 'jpg', 'jpeg', 'gif', 'png', 'webp' ] ) ) {
		//$preview = get_thumbnail_preview();
	//}

	return $preview;

}
