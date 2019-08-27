/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty, isArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Disabled } from '@wordpress/components';
/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth } ) => {
	const previewElClasses = classnames( 'template-selector-preview', 'editor-styles-wrapper' );

	if ( isEmpty( blocks ) || ! isArray( blocks ) ) {
		return (
			<div className={ previewElClasses }>
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	return (
		<div className={ previewElClasses }>
			<Disabled>
				<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
			</Disabled>
		</div>
	);
};

export default TemplateSelectorPreview;
