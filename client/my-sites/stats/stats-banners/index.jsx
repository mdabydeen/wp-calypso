/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import config from 'config';
import ECommerceManageNudge from 'blocks/ecommerce-manage-nudge';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getGSuiteSupportedDomains, hasGSuite, hasGSuiteOtherProvidor } from 'lib/gsuite';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business-stats-nudge';
import GSuiteStatsNudge from 'blocks/gsuite-stats-nudge';
import isGoogleMyBusinessStatsNudgeVisibleSelector from 'state/selectors/is-google-my-business-stats-nudge-visible';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';
import isUpworkStatsNudgeDismissed from 'state/selectors/is-upwork-stats-nudge-dismissed';
import QuerySiteDomains from 'components/data/query-site-domains';
import UpworkStatsNudge from 'blocks/upwork-stats-nudge';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import { getDomainHasForwards } from 'state/selectors/get-email-forwards';
import QueryEmailForwards from 'components/data/query-email-forwards';

class StatsBanners extends Component {
	static propTypes = {
		emailForwardingDataReady: PropTypes.bool.isRequired,
		firstSupportedGSuiteDomainHasForwards: PropTypes.bool.isRequired,
		firstSupportedGSuiteDomainName: PropTypes.string.isRequired,
		domainsSupportedForGSuite: PropTypes.array.isRequired,
		domains: PropTypes.array.isRequired,
		isGoogleMyBusinessStatsNudgeVisible: PropTypes.bool.isRequired,
		isGSuiteStatsNudgeVisible: PropTypes.bool.isRequired,
		isUpworkStatsNudgeVisible: PropTypes.bool.isRequired,
		siteId: PropTypes.number.isRequired,
		slug: PropTypes.string.isRequired,
	};

	shouldComponentUpdate( nextProps ) {
		return (
			this.props.isGSuiteStatsNudgeVisible !== nextProps.isGSuiteStatsNudgeVisible ||
			this.props.isUpworkStatsNudgeVisible !== nextProps.isUpworkStatsNudgeVisible ||
			this.props.isGoogleMyBusinessStatsNudgeVisible !==
				nextProps.isGoogleMyBusinessStatsNudgeVisible ||
			this.props.domains.length !== nextProps.domains.length ||
			this.props.firstSupportedGSuiteDomainHasForwards !==
				nextProps.firstSupportedGSuiteDomainHasForwards ||
			this.props.emailForwardingDataReady !== nextProps.emailForwardingDataReady
		);
	}

	renderBanner() {
		if ( this.showUpworkBanner() ) {
			return this.renderUpworkBanner();
		} else if ( this.showGSuiteBanner() ) {
			return this.renderGSuiteBanner();
		} else if ( this.showGoogleMyBusinessBanner() ) {
			return this.renderGoogleMyBusinessBanner();
		}
	}

	renderGoogleMyBusinessBanner() {
		const { isGoogleMyBusinessStatsNudgeVisible, siteId, slug } = this.props;
		return (
			<GoogleMyBusinessStatsNudge
				siteSlug={ slug }
				siteId={ siteId }
				visible={ isGoogleMyBusinessStatsNudgeVisible }
			/>
		);
	}

	renderGSuiteBanner() {
		const { siteId, slug } = this.props;
		return (
			<GSuiteStatsNudge
				siteSlug={ slug }
				siteId={ siteId }
				domainSlug={ this.props.firstSupportedGSuiteDomainName }
			/>
		);
	}

	renderUpworkBanner() {
		const { siteId, slug } = this.props;
		return <UpworkStatsNudge siteSlug={ slug } siteId={ siteId } />;
	}

	showGoogleMyBusinessBanner() {
		return (
			config.isEnabled( 'google-my-business' ) && this.props.isGoogleMyBusinessStatsNudgeVisible
		);
	}

	showGSuiteBanner() {
		const {
			domainsSupportedForGSuite,
			emailForwardingDataReady,
			firstSupportedGSuiteDomainHasForwards,
		} = this.props;
		const hasNoForwardsForSelectedDomain = ! firstSupportedGSuiteDomainHasForwards;
		return (
			emailForwardingDataReady &&
			this.props.isGSuiteStatsNudgeVisible &&
			hasNoForwardsForSelectedDomain &&
			domainsSupportedForGSuite.length > 0 &&
			domainsSupportedForGSuite.filter( function( domain ) {
				return hasGSuite( domain ) || hasGSuiteOtherProvidor( domain );
			} ).length === 0
		);
	}

	showUpworkBanner() {
		return (
			abtest( 'builderReferralStatsNudge' ) === 'builderReferralBanner' &&
			this.props.isUpworkStatsNudgeVisible
		);
	}

	firstSupportedGSuiteDomainHasForwards() {}

	render() {
		// window.console.log( [ '009', this.props.domainsSupportedForGSuite, this.props.emailForwardingDataReady , this.props.firstSupportedGSuiteDomainName ] );
		const { planSlug, siteId } = this.props;
		if ( ! this.props.domains.length ) {
			return null;
		}

		return (
			<Fragment>
				<QueryEmailForwards domainName={ this.props.firstSupportedGSuiteDomainName } />
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ 'ecommerce-bundle' !== planSlug && <WpcomChecklist viewMode="banner" /> }
				{ 'ecommerce-bundle' === planSlug && <ECommerceManageNudge siteId={ siteId } /> }
				{ this.renderBanner() }
			</Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const domains = getDecoratedSiteDomains( state, ownProps.siteId );
	const domainsSupportedForGSuite = getGSuiteSupportedDomains( domains );
	const firstSupportedGSuiteDomainName =
		domainsSupportedForGSuite.length > 0 ? domainsSupportedForGSuite[ 0 ].name : null;
	const firstSupportedGSuiteDomainHasForwards = getDomainHasForwards(
		state,
		firstSupportedGSuiteDomainName,
		true
	);
	return {
		emailForwardingDataReady: ! isEmpty( state.emailForwarding ),
		firstSupportedGSuiteDomainHasForwards,
		firstSupportedGSuiteDomainName,
		domainsSupportedForGSuite,
		domains,
		isGoogleMyBusinessStatsNudgeVisible: isGoogleMyBusinessStatsNudgeVisibleSelector(
			state,
			ownProps.siteId
		),
		isGSuiteStatsNudgeVisible: ! isGSuiteStatsNudgeDismissed( state, ownProps.siteId ),
		isUpworkStatsNudgeVisible: ! isUpworkStatsNudgeDismissed( state, ownProps.siteId ),
	};
} )( localize( StatsBanners ) );
