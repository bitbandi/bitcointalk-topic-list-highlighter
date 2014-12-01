var img_like = chrome.extension.getURL('img/accept.png'),
	img_clean = chrome.extension.getURL('img/help.png'),
	img_dislike = chrome.extension.getURL('img/delete.png');

$( document ).ready(function() {
	if (window.location.search.match(/^\?board=/)) {
		getOptions(function(data) {
			setupHideButton(data.hidedisinterested);
			setupRows(data.hidedisinterested);
		});
	}
	if (window.location.search.match(/^\?topic=/)) {
		var topicid = location.search.split('=')[1].split('.')[0];
		setupTopicButtons(topicid);
	}
});

function setupHideButton(hide) {
	var hely = $('div#bodyarea > div.tborder > '
		+ 'table.bordercolor[cellpadding="4"] > tbody > tr > '
		+ 'td.catbg3[colspan="2"]');
	if (hely.length > 0) {
		hely.html('').attr("align", "center");
		if (hide) {
			$('<a href="#">Show</a>')
				.appendTo(hely)
				.click(function(e){
					setOptions(false, function() {
						setupHideButton(false);
						setupRows(false)
					});
					return false;
				})
		} else {
			$('<a href="#">Hide</a>')
				.appendTo(hely)
				.click(function(e){
					setOptions(true, function() {
						setupHideButton(true);
						setupRows(true)
					});
					return false;
				})
		}
	}
}

function setupTopicButtons(topicid)
{
	var table = $('div#bodyarea > table[cellpadding="0"] > tbody > tr > '
		+ 'td:first-of-type');
	if (table.length > 0) {
		var col = $('<td align="center" valign="bottom" style="padding-bottom: 4px;" />')
			.insertAfter(table);
		queryStorage(topicid, function (storage){
			updateTopicButton(col, topicid, storage);
		});
	}
}

function updateTopicButton(col, id, state)
{
	var data = { col: col, id: id };
	col.html('');
	if (state == 1) {
		col.addClass('bcth-interested');
	} else {
		col.removeClass('bcth-interested');
	}
	if (state == 0) {
		col.addClass('bcth-disinterested');
	} else {
		col.removeClass('bcth-disinterested');
	}
	if (state != 1) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				addToStorage(e.data.id, 1, function() {
					updateTopicButton(e.data.col, e.data.id, 1);
				});
				return false;
			})
			.after('&nbsp;')
			.append($('<img />', { src: img_like}));
	}
	if (state == 1 || state == 0) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				deleteFromStorage(e.data.id, function() {
					updateTopicButton(e.data.col, e.data.id, null);
				});
				return false;
			})
			.after('&nbsp;')
			.append($('<img />', { src: img_clean}));
	}
	if (state != 0) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				addToStorage(e.data.id, 0, function() {
					updateTopicButton(e.data.col, e.data.id, 0);
				});
				return false;
			})
			.after('&nbsp;')
			.append($('<img />', { src: img_dislike}));
	}
}

function setupRows(hide) {
	var rows = $('div#bodyarea > div.tborder > '
		+ 'table.bordercolor[cellpadding="4"] '
		+ '> tbody > tr');
	if (rows.length > 0) {
		getStorage(function (storage)
		{
			rows.each(function( index, element )
			{
				if ($( this ).find('td.windowbg2').length == 0) return;
				var row = $( this );
				var topicid = row.find('td:nth-child(3) a').attr('href')
					.split('=')[1].split('.')[0];
				updateRow(row, topicid, storage[topicid], hide);
			})
		});
	}
}

function updateRow(row, id, state, allowhide) {
	var data = { row: row, id: id };
	var col = row.find(">:first-child");
	col.html('');
	if (allowhide && state == 0) {
		row.addClass('bcth-hide');
	} else {
		row.removeClass('bcth-hide');
	}
	row.find('td').each(function(i, e) {
		if (state == 1) {
			$(this).addClass('bcth-interested');
		} else {
			$(this).removeClass('bcth-interested');
		}
		if (state == 0) {
			$(this).addClass('bcth-disinterested');
		} else {
			$(this).removeClass('bcth-disinterested');
		}
	});
	if (state != 1) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				addToStorage(e.data.id, 1, function() {
					updateRow(e.data.row, e.data.id, 1, false);
				});
				return false;
			})
			.append($('<img />', { src: img_like}));
	}
	if (state == 1 || state == 0) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				deleteFromStorage(e.data.id, function() {
					updateRow(e.data.row, e.data.id, null, false);
				});
				return false;
			})
			.append($('<img />', { src: img_clean}));
	}
	if (state != 0) {
		$('<a href="#" />')
			.appendTo(col)
			.click(data, function(e){
				addToStorage(e.data.id, 0, function() {
					updateRow(e.data.row, e.data.id, 0, false);
				});
				return false;
			})
			.append($('<img />', { src: img_dislike}));
	}
}

function addToStorage(topicId, state, callback) {
	chrome.storage.local.get("bcth", function(result) {
		var item = result.bcth;
		if (!item) {
			item = {time: Date.now(), data: {}};
		}
		item.data[topicId] = state;
		chrome.storage.local.set({bcth: item}, callback);
	});
}

function getStorage(callback) {
	chrome.storage.local.get("bcth", function(result) {
		if (result.bcth) {
			callback(result.bcth.data);
			return;
		}
		callback({});
	});
}

function queryStorage(topicId, callback) {
	chrome.storage.local.get("bcth", function(result) {
		if (result.bcth) {
			callback(result.bcth.data[topicId]);
			return;
		}
		callback(undefined);
	});
}

function deleteFromStorage(topicId, callback) {
	chrome.storage.local.get("bcth", function(result) {
		var item = result.bcth;
		if (item) {
			delete item.data[topicId];
		} else {
			item = {time: Date.now(), data: {}};
		}
		chrome.storage.local.set({bcth: item}, callback);
	});
}

function setOptions(hidedisinterested, callback) {
	chrome.storage.local.set({
		hidedisinterested: hidedisinterested
	}, callback);
}

function getOptions(callback) {
	chrome.storage.local.get({
		hidedisinterested: false
	}, callback);
}
