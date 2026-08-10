/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) connection and
 * remote state. `FDSConnection` (and its companion
 * `FDSConnectionConstructor`) let a Client Extension read and write FDS
 * search and filter state, while `FDSConnectionInfo`,
 * `FDSConnectionStatus`, `FDSConnectionOptions`, and
 * `FDSStateChangeCallback` describe how a connection is opened and
 * observed.
 *
 * Unlike the other contracts in this package, `FDSConnection` is declared
 * here as both a value (the constructor) and a type (the instance), so
 * consumers can `new FDSConnection(...)` and annotate with `FDSConnection`
 * exactly as they would a class. At runtime the connection is implemented
 * and served by the portal as the `@liferay/frontend-data-set-web/api` ES
 * module and resolved through the import map. A Client Extension redirects
 * that import-map specifier to this module at build time (via a `tsconfig`
 * `paths` entry) so it can construct a connection with full typing while
 * the value is pulled from the import-map module at runtime.
 */

/**
 * The kinds of filter an FDS can declare. `clientExtension` filters are
 * contributed by a Client Extension (see `./filter`) and their selection
 * payload is opaque to the connection.
 */
export type FDSFilterType =
	| 'clientExtension'
	| 'dateRange'
	| 'dateTimeRange'
	| 'selection';

/**
 * The immutable description of a filter declared by the FDS. A Client
 * Extension cannot create filters: it can only read the descriptors the
 * FDS publishes and drive the selection of one of them by `id`.
 */
export interface FDSFilterDescriptor {
	id: string;
	label: string;

	/**
	 * Whether the filter accepts more than one selected value. Only
	 * meaningful for `selection` filters.
	 */
	multiple?: boolean;
	type: FDSFilterType;
}

/**
 * A filter descriptor together with its current selection. This is the
 * public projection of the FDS internal filter state: implementation
 * details (preloaded data, module URLs, the compiled OData string, the
 * resolved Client Extension binding, …) are intentionally not exposed.
 */
export interface FDSFilterState<T = unknown> extends FDSFilterDescriptor {
	/**
	 * Whether the filter currently constrains the data set.
	 */
	active: boolean;

	/**
	 * The current selection, in the shape the filter's `type` dictates.
	 * `undefined` when the filter is not active.
	 */
	selectedData?: T;

	/**
	 * Human readable summary of the current selection, as computed by the
	 * FDS (for `clientExtension` filters, by the Client Extension's
	 * `descriptionBuilder`). Read only: it is recomputed by the FDS on
	 * every write.
	 */
	selectedItemsLabel: string;
}

/**
 * A single item of a `selection` filter selection.
 */
export interface FDSSelectionFilterItem {
	label?: string;
	value: string;
}

/**
 * Selection payload of a `selection` filter. `exclude` inverts the
 * matching (`ne`/`and` instead of `eq`/`or`).
 */
export interface FDSSelectionFilterSelectedData {
	exclude?: boolean;
	selectedItems: Array<FDSSelectionFilterItem>;
}

/**
 * A calendar instant expressed as parts, as used by `dateRange` and
 * `dateTimeRange` filters. `dateRange` filters ignore `hour`/`minute`.
 */
export interface FDSDateParts {
	day?: number;
	hour?: number;
	minute?: number;
	month?: number;
	offset?: string;
	year?: number;
}

/**
 * Selection payload of a `dateRange` or `dateTimeRange` filter. A `null`
 * bound means the range is open on that end.
 */
export interface FDSDateRangeFilterSelectedData {
	from: FDSDateParts | null;
	to: FDSDateParts | null;
}

/**
 * Maps a filter `type` to the selection payload it expects, so a Client
 * Extension can type `setFilter` calls precisely.
 */
export interface FDSFilterSelectedDataByType {
	clientExtension: unknown;
	dateRange: FDSDateRangeFilterSelectedData;
	dateTimeRange: FDSDateRangeFilterSelectedData;
	selection: FDSSelectionFilterSelectedData;
}

/**
 * A batch entry for `setFilters`.
 */
export interface FDSFilterSelection<T = unknown> {
	filterId: string;
	selectedData: T;
}

/**
 * Why a write to the FDS filter state was rejected.
 *
 * - `unknown-filter` — no filter with that `id` is declared by the FDS.
 * - `invalid-selected-data` — the payload does not match the shape the
 *   filter's `type` expects.
 * - `not-ready` — the connection is not `ready` (or already
 *   disconnected), so there is no state to write to.
 */
export type FDSFilterWriteRejectionReason =
	| 'invalid-selected-data'
	| 'not-ready'
	| 'unknown-filter';

/**
 * The outcome of a filter write. Writes never throw: a rejected write is
 * a no-op that reports why, so an external component can degrade
 * gracefully when it is out of sync with the FDS configuration.
 */
export interface FDSFilterWriteResult {
	accepted: boolean;
	reason?: FDSFilterWriteRejectionReason;

	/**
	 * The ids that were rejected. Only present for batch writes.
	 */
	rejectedFilterIds?: Array<string>;
}

/**
 * The public view of the FDS remote state.
 */
export interface FDSState {
	filters: Array<FDSFilterState>;
	search: {query: string};
}

/**
 * Callbacks invoked when the corresponding slice of the FDS state
 * changes. Each callback is optional: a consumer only observes what it
 * cares about. Every provided callback is also invoked once, with the
 * current value, as soon as the connection becomes `ready`.
 */
export interface FDSStateChangeCallback {
	filters?: (filters: Array<FDSFilterState>) => void;
	search?: (query: string) => void;
}

export interface FDSConnectionOptions {
	timeout?: number;
}

export interface FDSConnectionInfo {
	fdsName: string;
	instanceId: number;
	status: FDSConnectionStatus;
}

export type FDSConnectionStatus =
	| 'connecting'
	| 'ready'
	| 'timeout'
	| 'disconnected';

export interface FDSConnection {
	/**
	 * Deactivates a single filter, clearing its selection. Rejected with
	 * `unknown-filter` if the FDS declares no such filter.
	 */
	clearFilter: (filterId: string) => FDSFilterWriteResult;

	/**
	 * Deactivates every filter in a single write.
	 */
	clearFilters: () => FDSFilterWriteResult;

	disconnect: () => void;

	/**
	 * Returns the current state of a single filter, or `null` when the
	 * connection is not ready or no such filter is declared.
	 */
	getFilter: <T = unknown>(filterId: string) => FDSFilterState<T> | null;

	/**
	 * Returns every filter the FDS declares, active or not. This is the
	 * authoritative list an external component must build its UI from:
	 * only these ids can be written back. Returns `null` while the
	 * connection is not ready.
	 */
	getFilters: () => Array<FDSFilterState> | null;

	getSearch: () => string | null;

	/**
	 * Activates a filter with the given selection, replacing any previous
	 * one. The FDS recomputes the OData query and the selection label.
	 */
	setFilter: <K extends FDSFilterType = FDSFilterType>(
		filterId: string,
		selectedData: FDSFilterSelectedDataByType[K]
	) => FDSFilterWriteResult;

	/**
	 * Applies several selections in a single write, so the data set is
	 * refetched once instead of once per filter. Rejected entries are
	 * skipped; the accepted ones are still applied, and the rejected ids
	 * are reported back.
	 */
	setFilters: (selections: Array<FDSFilterSelection>) => FDSFilterWriteResult;

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
