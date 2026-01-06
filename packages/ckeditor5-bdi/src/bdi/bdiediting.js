/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bdi/bdi/bdiediting
 */

import { Plugin } from 'ckeditor5/src/core';
import AttributeCommand from '@ckeditor/ckeditor5-basic-styles/src/attributecommand';

const BDI = 'bdi';

/**
 * The BDI editing feature.
 *
 * It registers the `'bdi'` command and introduces the `bdi` attribute in the model which renders to the view
 * as a `<bdi>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BdiEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BdiEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		// Allow bdi attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: BDI } );
		editor.model.schema.setAttributeProperties( BDI, {
			isFormatting: true,
			copyOnEnter: true
		} );

		// Build converter from model to view for data and editing pipelines.
		editor.conversion.attributeToElement( {
			model: BDI,
			view: 'bdi'
		} );

		// Create bdi command.
		editor.commands.add( BDI, new AttributeCommand( editor, BDI ) );
	}
}
