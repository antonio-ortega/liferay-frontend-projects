/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) connection and
 * remote state. `FDSConnection` (and its companion
 * `FDSConnectionConstructor`) let a Client Extension read and write FDS
 * search state and take its filtering over, while `FDSConnectionInfo`,
 * `FDSConnectionStatus`, `FDSConnectionOptions`, `FDSConnectionOwnership`,
 * and `FDSStateChangeCallback` describe how a connection is opened and
 * observed. Unlike the other contracts in this package, `FDSConnection` is
 * declared as both a value (the constructor) and a type (the instance), so a
 * Client Extension can `new FDSConnection(...)` and annotate with it exactly
 * as it would a class; at runtime that value comes from the portal through
 * the import map.
 *
 * Two rules run through the whole contract, and neither of them is any one
 * type's to state.
 *
 * Filtering belongs either to the data set or to one Client Extension, never
 * to both, and a connection says which as it opens rather than at its first
 * filter, through `owns`: the data set can then drop the filter UI it is
 * about to lose as part of connecting. A data set has one filtering owner and
 * the first connection to ask for it gets it, so asking is not getting — the
 * rest settle at `refused` and drive the search alone.
 *
 * Filtering a data set is part of its address, and taking the filtering over
 * does not change that. Alongside the OData expressions, `setFilters()`
 * carries one value of the Client Extension's own choosing, which the data
 * set keeps in the page URL and hands back through the `restore` callback on
 * the next visit. The Client Extension derives the expressions again from it,
 * so restoring is the same operation as filtering rather than a second one,
 * and the expressions themselves never reach the URL.
 */

/**
 * Filter applied by a Client Extension, through `setFilters()`. Only the
 * final OData expression crosses the boundary: how the Client Extension
 * collects the values behind it is its own business. Each expression is
 * wrapped in parentheses and joined with the others through "and", so it
 * must be self-contained and balanced.
 */
export interface FDSConnectionFilter {
	id: string;
	odataFilterString: string;
}

/**
 * The data set state, which describes what a connection may influence and
 * nothing else: the search query, and the filters a Client Extension
 * applied. The filters the data set declares in its configuration are
 * deliberately absent, because the data set owns them: writing them is not
 * part of this contract.
 *
 * A Client Extension never writes this state: it calls `setSearch()` and
 * `setFilters()`, and the provider writes. Every member is readonly because
 * no member is ever changed in place — the provider replaces each one whole,
 * spreading a state it read back deep frozen, which a mutable type would
 * reject.
 */
export interface FDSState {
	readonly connectionFilters?: ReadonlyArray<FDSConnectionFilter>;

	/**
	 * What the Client Extension asked the data set to remember, opaque to
	 * it, filed under the `appId` of the connection that asked. The data set
	 * keeps it in the page URL for as long as the filters it was passed with
	 * reach the request, and reads nothing in it.
	 *
	 * It is one value per connection rather than one per filter, so that what
	 * comes back is what was given: a Client Extension is handed its own
	 * state, not a set of parts to reassemble. Today one connection owns the
	 * filtering, so one key is in play, and the shape is a map anyway so that
	 * a second one can join without changing what a saved link means.
	 */
	readonly connectionState?: Readonly<Record<string, unknown>>;

	/**
	 * The `appId` of the connection that owns the filtering, and the one
	 * thing that says the filtering is owned at all. A connection claims it
	 * by writing its own `appId` where it finds none, and gives it back on
	 * disconnect.
	 *
	 * It is deliberately not inferred from `connectionFilters`: a Client
	 * Extension owns the filtering from the moment it connects, which is
	 * before it has any filter to apply, and the data set has to drop its
	 * own filter UI then rather than when the first filter arrives. Naming
	 * the owner also keeps the claim to one data set, since every data set
	 * has its own state.
	 */
	readonly filteringOwnerAppId?: string;

	/**
	 * What the page URL says a previous visit left, which the data set
	 * writes and a connection only reads: the one part of this state that
	 * travels from the data set to the Client Extension rather than the
	 * other way around. It reaches the Client Extension through the
	 * `restore` state change callback, and the data set stops offering it
	 * once a connection has adopted it.
	 *
	 * `null` means a visit with nothing to restore, which is what going back
	 * to an unfiltered address looks like. Absent means nothing is on offer.
	 *
	 * A connection takes its own `appId` out of the map and hands that on,
	 * so a key left by a Client Extension that is no longer on the page
	 * reaches nobody, and the data set drops it when it gives up waiting.
	 */
	readonly restoredConnectionState?: Readonly<Record<string, unknown>> | null;

	readonly search: {readonly query: string};
}

/**
 * How a connection reports the data set's state to the Client Extension.
 *
 * `search` fires for every connection, whether it drives the search or not.
 *
 * `restore` fires only for a connection that owns the filtering, and it
 * carries the `connectionState` a previous visit left: once when the
 * connection is ready, with what the page URL held, and again whenever the
 * browser's back or forward button lands on a different one. It fires with
 * `null` when a filtered address is left behind, so that going back to an
 * unfiltered one clears the filter UI rather than leaving it stale.
 *
 * Validate what `restore` hands over before using it. Nothing else has: it
 * arrives from a URL anyone can edit, and may have been written by an older
 * version of the Client Extension. The data set cannot read the value, which
 * is exactly why it cannot check it either.
 *
 * Call `setFilters()` from inside the callback, not from an effect it
 * schedules. A data set loading an address that carries state holds its
 * first request until the connection has handed that state over, so filters
 * applied a turn later arrive after the data set has already asked for the
 * unfiltered page, and the user sees those results first. Drawing the filter
 * UI can wait for a render; putting the filters back cannot.
 */
export interface FDSStateChangeCallback {
	restore?: (connectionState: unknown) => void;
	search: (query: string) => void;
}

/**
 * A part of a data set a connection takes over.
 *
 * `search` is what every connection drives through its state change
 * callback, and is what a connection owns when it declares nothing. It
 * leaves the data set's own search box in place, since the two stay in sync.
 *
 * `filters` is what `setFilters()` needs: without it the call is ignored, so
 * that the filtering of a data set never has two owners. Declaring it makes
 * the data set drop its filters dropdown and its filter chips for as long as
 * the connection lasts, since they would describe filters that no longer
 * reach the request while the Client Extension offers a filter UI of its
 * own.
 *
 * Asking for `filters` is not the same as getting it: another connection may
 * already own the filtering of that data set, or the connection may have left
 * out the `appId` that owning it requires. The `refused` status says so.
 */
export type FDSConnectionOwnership = 'filters' | 'search';

/**
 * How a connection is opened: what it takes over, how it is named in the page
 * URL, where it is drawn, and how long it waits for the data set to show up.
 * `owns` defaults to `['search']`, which is what every connection has always
 * driven.
 *
 * `appId` is how the connection is named in the page URL, and the one option a
 * connection that owns the filtering cannot leave out: without it the
 * filtering is refused, since a value filed under no name is a value nothing
 * can be done with later. It names the Client Extension rather than the widget
 * instance, so two instances of the same Client Extension on one page share
 * it. Only one of them can own the filtering of a data set, so only one of
 * them ever writes what a link carries for that data set, and the link stays
 * readable whichever instance drew it. Pick something stable and specific — a
 * link outlives a deployment, and the value under a name is only meaningful to
 * the code that wrote it.
 *
 * `element` is the element the Client Extension is drawn in, and it is how the
 * connection is noticed leaving the page without disconnecting. A connection
 * that owns the filtering should always name it: the option costs one line,
 * and what it buys is a data set that can be filtered again once the Client
 * Extension that owned it is gone.
 */
export interface FDSConnectionOptions {
	appId?: string;
	element?: HTMLElement;
	owns?: ReadonlyArray<FDSConnectionOwnership>;
	timeout?: number;
}

export interface FDSConnectionInfo {
	fdsName: string;
	instanceId: number;
	status: FDSConnectionStatus;
}

/**
 * Where a connection has settled.
 *
 * `ready` means the connection is open and owns everything it asked for.
 *
 * `refused` means it is open, and driving the search, but something it asked
 * to own belongs to another connection or was not asked for properly. It is
 * deliberately not `ready`: a Client Extension that enables its controls once
 * ready then leaves them alone, which is the right thing to do with controls
 * that would reach nothing, and it costs no code to get right. The search is
 * never refused, so a connection that asked for both it and the filters is
 * still driving the search here.
 */
export type FDSConnectionStatus =
	| 'connecting'
	| 'ready'
	| 'refused'
	| 'timeout'
	| 'disconnected';

/**
 * The connection a Client Extension holds to a data set.
 *
 * `clearFilters()` leaves nothing applied without giving the filtering back,
 * so the filters the data set declares stay out of the request and its filter
 * UI stays hidden: a shortcut for `setFilters([])`. Giving the filtering back
 * is what `disconnect()` does, after which the data set filters and offers
 * its UI as it did before.
 */
export interface FDSConnection {
	clearFilters: () => void;
	disconnect: () => void;
	getSearch: () => string | null;

	/**
	 * Applies the given expressions, replacing whatever a previous call
	 * passed: the Client Extension owns the whole filter expression. Ignored
	 * by a connection that was not granted the filtering, whatever it asked
	 * for.
	 *
	 * `connectionState` is the value the data set keeps in the page URL, for
	 * as long as these filters reach the request, and hands back through the
	 * `restore` callback.
	 */
	setFilters: (
		filters: Array<FDSConnectionFilter>,
		connectionState?: unknown
	) => void;

	setSearch: (query: string) => void;
}

export interface FDSConnectionConstructor {
	new (
		fdsName: string,
		fdsStateChangeCallback: FDSStateChangeCallback,
		onFDSConnectionInfoChange: (
			fdsConnectionInfo: FDSConnectionInfo
		) => void,
		options?: FDSConnectionOptions
	): FDSConnection;
}

// `FDSConnection` intentionally uses PascalCase: it is a class-like
// constructor (typed as `FDSConnectionConstructor`), not a plain variable.
// The `const` value and the `FDSConnection` interface above share the same
// name so consumers can use it as both a value and a type, like a class.

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const FDSConnection: FDSConnectionConstructor;
