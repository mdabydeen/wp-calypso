/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import {
	createPreviewDocumentTitle,
	getIframeSource,
	getPreviewParamClass,
	isIE,
	revokeObjectURL,
} from 'components/signup-site-preview/utils';

export default class SignupSitePreviewIframe extends Component {
	static propTypes = {
		cssUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		fontUrl: PropTypes.string,
		gutenbergStylesUrl: PropTypes.string,
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		onPreviewClick: PropTypes.func,
		resize: PropTypes.bool,
		setIsLoaded: PropTypes.func,
		setWrapperHeight: PropTypes.func,
		scrolling: PropTypes.bool,
		defaultViewportDevice: PropTypes.oneOf( [ 'desktop', 'phone' ] ),
	};

	static defaultProps = {
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
		setIsLoaded: () => {},
		setWrapperHeight: () => {},
		resize: false,
		scrolling: true,
	};

	constructor( props ) {
		super( props );
		this.iframe = React.createRef();
	}

	componentDidMount() {
		this.setIframeSource( this.props );

		// TODO: we'll do this right later if it works
		window.addEventListener( 'message', event => {
			let data;
			if ( 'string' === typeof event.data ) {
				try {
					data = JSON.parse( event.data );
				} catch ( err ) {
					// The string needs to be a valid serialized JSON: we don't accept arbitrary strings
					// We'll ignore this message.
					return;
				}
			} else {
				data = event.data;
			}
			console.log( 'From parent:', event.origin, data );
			if ( typeof data.height === 'number' && this.props.resize ) {
				this.props.setWrapperHeight( data.height + 25 );
			}

			if ( typeof data.loaded === true  ) {

			}

		} );
	}



	shouldComponentUpdate( nextProps ) {
		if (
			this.props.verticalId !== nextProps.verticalId ||
			this.props.siteTypeId !== nextProps.siteTypeId
		) {
			this.setIframeSource( nextProps );
			return false;
		}

		/*if (
			this.props.content.title !== nextProps.content.title ||
			this.props.content.tagline !== nextProps.content.tagline
		) {
			this.setContentTitle( nextProps.content.title, nextProps.content.tagline );
		}

		if ( this.props.content.body !== nextProps.content.body ) {
			this.setIframeBodyContent( nextProps.content );
		}

		if (
			this.props.content.body !== nextProps.content.body ||
			! shallowEqual( this.props.content.params, nextProps.content.params )
		) {
			this.setContentParams( nextProps.content.params );
		}*/

		return false;
	}

	setContentTitle( title, tagline ) {
		this.setIframeElementContent( '.signup-site-preview__title', title );
		this.setIframeElementContent( 'title', createPreviewDocumentTitle( title, tagline ) );
	}

	setContentParams( params ) {
		for ( const [ key, value ] of Object.entries( params ) ) {
			this.setIframeElementContent( `.${ getPreviewParamClass( key ) }`, value );
		}
	}

	setIframeBodyContent( content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.entry-content' );

		if ( element ) {
			element.innerHTML = content.body;
			this.props.resize && this.setContainerHeight();
		}
	}

	setIframeElementContent( selector, content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const elements = this.iframe.current.contentWindow.document.querySelectorAll( selector );

		for ( const element of elements ) {
			element.textContent = content;
		}
	}

	setOnPreviewClick = () => {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.body;

		if ( element ) {
			element.onclick = () => this.props.onPreviewClick( this.props.defaultViewportDevice );
		}
	};

	setIframeIsLoading = () => {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.home' );

		if ( element ) {
			element.classList.remove( 'is-loading' );
		}
	};

	setContainerHeight = () => {
		if ( ! this.iframe.current ) {
			return;
		}

		const element = this.iframe.current.contentWindow.document.querySelector( '#page' );

		if ( element ) {
			this.props.setWrapperHeight( element.scrollHeight + 25 );
		}
	};

	setLoaded = () => {
		/*		this.setOnPreviewClick();
		this.setIframeIsLoading();
		this.props.resize && this.setContainerHeight();

		const { params, tagline, title } = this.props.content;

		this.setContentTitle( title, tagline );
		this.setContentParams( params );*/
		this.props.setIsLoaded( true );
	};

	setIframeSource = ( { siteTypeId, verticalId } ) => {
		if ( ! this.iframe.current ) {
			return;
		}
		/*
		const iframeSrc = getIframeSource(
			content,
			cssUrl,
			fontUrl,
			gutenbergStylesUrl,
			isRtl,
			langSlug,
			this.props.scrolling
		);

		if ( isIE() ) {
			this.iframe.current.contentWindow.document.open();
			this.iframe.current.contentWindow.document.write( iframeSrc );
			this.iframe.current.contentWindow.document.close();
		} else {
			revokeObjectURL( this.iframe.current.src );
			this.iframe.current.contentWindow.location.replace( iframeSrc );
		}

		const { params, tagline, title } = content;

		this.setContentTitle( title, tagline );
		this.setContentParams( params );*/

		this.props.setIsLoaded( false );
		// the base site URL could come from the verticals API
		// added to the annotation during generation?
		this.iframe.current.src = `https://a8cvm${ siteTypeId }${
			verticalId && siteTypeId === 1 ? verticalId : ''
		}.wordpress.com?onboarding_preview=true&size=${ this.props.defaultViewportDevice }#${ window.location.origin }`;
	};

	render() {
		return (
			<iframe
				ref={ this.iframe }
				className="signup-site-preview__iframe"
				onLoad={ this.setLoaded }
				title="WordPress.com"
			/>
		);
	}
}
