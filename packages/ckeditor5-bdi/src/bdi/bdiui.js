/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bdi/bdi/bdiui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

const BDI = 'bdi';

/**
 * The BDI UI feature. It introduces the BDI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BdiUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BdiUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add BDI button to feature components.
		editor.ui.componentFactory.add( BDI, locale => {
			const command = editor.commands.get( BDI );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Bidirectional Isolate' ),
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( BDI );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
