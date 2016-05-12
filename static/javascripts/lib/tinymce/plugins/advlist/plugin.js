/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('advlist', function(editor) {
	var olMenuItems, ulMenuItems, lastStyles = {};

	function buildMenuItems(listName, styleValues) {
		var items = [];

		tinymce.each(styleValues.split(/[ ,]/), function(styleValue) {
			items.push({
				//// 用中文
				//text: styleValue,
				text: styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function(chr) {
					return chr.toUpperCase();
				}),
				data: styleValue == '默认' ? '' : styleValue
			});
		});
		console.log(items);
		return items;
	}

	olMenuItems = buildMenuItems('OL', editor.getParam(
		"advlist_number_styles",
		"默认,小写英文字母,小写希腊字母,小写罗马字母,大写英文字母,大写罗马字母"
	));

	ulMenuItems = buildMenuItems('UL', editor.getParam("advlist_bullet_styles", "默认,空心圆,实心圆,方形"));

	function applyListFormat(listName, styleValue) {
		editor.undoManager.transact(function() {
			var list, dom = editor.dom, sel = editor.selection;

			// Check for existing list element
			list = dom.getParent(sel.getNode(), 'ol,ul');

			// Switch/add list type if needed
			if (!list || list.nodeName != listName || styleValue === false) {
				editor.execCommand(listName == 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList');
			}

			// Set style
			styleValue = styleValue === false ? lastStyles[listName] : styleValue;
			lastStyles[listName] = styleValue;

			list = dom.getParent(sel.getNode(), 'ol,ul');
			if (list) {
				dom.setStyle(list, 'listStyleType', styleValue ? styleValue : null);
				list.removeAttribute('data-mce-style');
			}

			editor.focus();
		});
	}

	function updateSelection(e) {
		var listStyleType = editor.dom.getStyle(editor.dom.getParent(editor.selection.getNode(), 'ol,ul'), 'listStyleType') || '';

		e.control.items().each(function(ctrl) {
			ctrl.active(ctrl.settings.data === listStyleType);
		});
	}

	editor.addButton('numlist', {
		type: 'splitbutton',
		tooltip: '编号格式',
		menu: olMenuItems,
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('OL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('OL', false);
		}
	});

	editor.addButton('bullist', {
		type: 'splitbutton',
		tooltip: '项目符号',
		menu: ulMenuItems,
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('UL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('UL', false);
		}
	});
});