/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bdi/bdi
 */

import { Plugin } from 'ckeditor5/src/core';
import BdiEditing from './bdi/bdiediting';
import BdiUI from './bdi/bdiui';

/**
 * The BDI (Bidirectional Isolate) feature.
 *
 * This is a "glue" plugin which loads the {@link module:bdi/bdi/bdiediting~BdiEditing BDI editing feature}
 * and {@link module:bdi/bdi/bdiui~BdiUI BDI UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Bdi extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BdiEditing, BdiUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Bdi';
	}
}
