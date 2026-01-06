/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

// import ltrIcon from '@ckeditor/ckeditor5-core/theme/icons/text-left.svg';
// import rtlIcon from '@ckeditor/ckeditor5-core/theme/icons/text-right.svg';

const TEXT_DIRECTION = 'textDirection';

/**
 * The text direction UI plugin.
 *
 * It introduces the `'textDirectionLtr'` and `'textDirectionRtl'` buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextDirectionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextDirectionUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;

		// Register the LTR button
		componentFactory.add( 'textDirectionLtr', locale => {
			const command = editor.commands.get( TEXT_DIRECTION );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Text direction left-to-right' ),
				// icon: 'ltrIcon',
				tooltip: true,
				isToggleable: true
			} );

			// Bind button to the command.
			buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );
			buttonView.bind( 'isOn' ).to( command, 'value', value => value === 'ltr' );

			// Execute the command when the button is clicked.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( TEXT_DIRECTION, { value: 'ltr' } );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );

		// Register the RTL button
		componentFactory.add( 'textDirectionRtl', locale => {
			const command = editor.commands.get( TEXT_DIRECTION );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Text direction right-to-left' ),
				// icon: rtlIcon,
				tooltip: true,
				isToggleable: true
			} );

			// Bind button to the command.
			buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );
			buttonView.bind( 'isOn' ).to( command, 'value', value => value === 'rtl' );

			// Execute the command when the button is clicked.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( TEXT_DIRECTION, { value: 'rtl' } );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}
