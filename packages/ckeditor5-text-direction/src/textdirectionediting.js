/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';

import TextDirectionCommand from './textdirectioncommand';

const TEXT_DIRECTION = 'textDirection';

/**
 * The text direction editing plugin.
 *
 * It introduces the `'textDirection'` command and adds the `textDirection` attribute to the editor's
 * {@link module:engine/model/model~Model model} which renders as `dir` attribute in the view.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextDirectionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextDirectionEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Allow the textDirection attribute on all blocks.
		schema.extend( '$block', { allowAttributes: TEXT_DIRECTION } );

		editor.model.schema.setAttributeProperties( TEXT_DIRECTION, {
			isFormatting: true
		} );

		// Define conversion for the textDirection attribute.
		this._defineConverters();

		// Add the command.
		editor.commands.add( TEXT_DIRECTION, new TextDirectionCommand( editor ) );
	}

	/**
	 * Defines conversion for the textDirection attribute.
	 *
	 * @private
	 */
	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// Downcast conversion: model -> view
		conversion.for( 'downcast' ).attributeToAttribute( {
			model: TEXT_DIRECTION,
			view: direction => {
				// Only add the dir attribute if it's rtl (ltr is the default)
				if ( direction === 'rtl' ) {
					return {
						key: 'dir',
						value: 'rtl'
					};
				}
				// Return null for ltr to remove the attribute
				return null;
			}
		} );

		// Upcast conversion: view -> model
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				key: 'dir',
				value: /^(ltr|rtl)$/
			},
			model: {
				key: TEXT_DIRECTION,
				value: viewElement => {
					const direction = viewElement.getAttribute( 'dir' );
					return direction === 'rtl' ? 'rtl' : 'ltr';
				}
			}
		} );
	}
}
