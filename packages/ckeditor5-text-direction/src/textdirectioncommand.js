/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

const TEXT_DIRECTION = 'textDirection';

/**
 * The text direction command plugin.
 *
 * @extends module:core/command~Command
 */
export default class TextDirectionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const firstBlock = first( this.editor.model.document.selection.getSelectedBlocks() );

		this.isEnabled = !!firstBlock && this._canHaveTextDirection( firstBlock );

		if ( this.isEnabled && firstBlock.hasAttribute( TEXT_DIRECTION ) ) {
			this.value = firstBlock.getAttribute( TEXT_DIRECTION );
		} else {
			this.value = 'auto';
		}
	}

	/**
	 * Executes the command. Applies the text direction to the selected blocks.
	 *
	 * @fires execute
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] The value to apply. Should be 'ltr', 'rtl', or 'auto'.
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		const value = options.value;

		model.change( writer => {
			const blocks = Array.from( doc.selection.getSelectedBlocks() )
				.filter( block => this._canHaveTextDirection( block ) );

			const currentTextDirection = blocks[ 0 ].getAttribute( TEXT_DIRECTION );

			// If clicking the same button again, toggle back to 'auto'
			if ( currentTextDirection === value ) {
				setTextDirectionOnSelection( blocks, writer, 'auto' );
			} else if ( value ) {
				// Set the specified direction (ltr, rtl, or auto)
				setTextDirectionOnSelection( blocks, writer, value );
			} else {
				// If no value provided, set to 'auto'
				setTextDirectionOnSelection( blocks, writer, 'auto' );
			}
		} );
	}

	/**
	 * Checks whether a block can have text direction set.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} block The block to be checked.
	 * @returns {Boolean}
	 */
	_canHaveTextDirection( block ) {
		return this.editor.model.schema.checkAttribute( block, TEXT_DIRECTION );
	}
}

/**
 * Helper function that sets the text direction attribute on given blocks.
 */
function setTextDirectionOnSelection( blocks, writer, textDirection ) {
	for ( const block of blocks ) {
		writer.setAttribute( TEXT_DIRECTION, textDirection, block );
	}
}
