/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';

import TextDirectionEditing from './textdirectionediting';
import TextDirectionUI from './textdirectionui';

/**
 * The text direction plugin.
 *
 * This is a "glue" plugin which loads the {@link module:textdirection/textdirectionediting~TextDirectionEditing}
 * and {@link module:textdirection/textdirectionui~TextDirectionUI} plugins.
 *
 * For a detailed overview, check the {@glink features/text-direction Text Direction} guide.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextDirection extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextDirectionEditing, TextDirectionUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextDirection';
	}
}
