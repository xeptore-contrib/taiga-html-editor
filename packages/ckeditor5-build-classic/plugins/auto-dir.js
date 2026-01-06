/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * Plugin that automatically sets dir="auto" on all block elements by default.
 * This works in conjunction with the TextDirection plugin.
 */
export default class AutoDir extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoDir';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;

		// Add a post-fixer that ensures all blocks have textDirection='auto' by default
		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			let hasChanged = false;

			for ( const entry of changes ) {
				// Check for inserted elements
				if ( entry.type === 'insert' && entry.name !== '$text' ) {
					const item = entry.position.nodeAfter;

					if ( item && item.is( 'element' ) ) {
						// Apply to all block elements that support the textDirection attribute
						if ( model.schema.checkAttribute( item, 'textDirection' ) ) {
							// Only set if not already set
							if ( !item.hasAttribute( 'textDirection' ) ) {
								writer.setAttribute( 'textDirection', 'auto', item );
								hasChanged = true;
							}
						}
					}
				}
			}

			return hasChanged;
		} );

		// Set dir="auto" on existing content when the editor is ready
		editor.model.document.on( 'change:data', () => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();
				const range = writer.createRangeIn( root );

				for ( const item of range.getItems() ) {
					if ( item.is( 'element' ) &&
						model.schema.checkAttribute( item, 'textDirection' ) &&
						!item.hasAttribute( 'textDirection' ) ) {
						writer.setAttribute( 'textDirection', 'auto', item );
					}
				}
			} );
		}, { priority: 'low' } );
	}
}
