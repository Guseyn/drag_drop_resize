
var elms = [];
var zIndexes = [];
var maxZIndex = 0;
var mouseMoveEvents = [];

function scrollTopPosition() {
	return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
}

function scrollLeftPosition() {
	return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
}

function clientHeight() {
	return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function clientWidth() {
	return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function clientTopPosition() {
	return document.documentElement.clientTop || document.body.clientTop || 0;
}

function clientLeftPosition() {
	return document.documentElement.clientLeft || document.body.clientLeft || 0;
}

function elmCoordinates(elm) {
	let rect = elm.getBoundingClientRect();
	let clientTop = clientTopPosition();
	let clientLeft = clientLeftPosition();
	let scrollTop = scrollTopPosition();
	let scrollLeft = scrollLeftPosition();
	let top = rect.top - clientTop + scrollTop;
	let left = rect.left - clientLeft + scrollLeft;
	let bottom = rect.bottom - clientTop + scrollTop;
	let right = rect.right - clientLeft + scrollLeft;
	return {
		 top: Math.round(top),
		 left: Math.round(left),
		 bottom: Math.round(bottom),
		 right: Math.round(right)
	};
}

function prohibitSelection() {
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	}
}

function dragAndDrop(elm, wrapElm) {
	
	elms.push(elm);

	let elmIndex = elms.length - 1;

	let topLimit;
	let leftLimit;
	let bottomLimit;
	let rightLimit;

	let elmZIndex = elm.style.zIndex || 0;

	if (wrapElm) {
			let wrapElmCrds = elmCoordinates(wrapElm);
			let scrollTop = scrollTopPosition();
			let scrollLeft = scrollLeftPosition();
			topLimit = wrapElmCrds.top + scrollTop;
			leftLimit = wrapElmCrds.left + scrollLeft;
			bottomLimit = topLimit + wrapElm.offsetHeight;
			rightLimit = leftLimit + wrapElm.offsetWidth;
	} else {
			topLimit = clientTopPosition();
			leftLimit = clientLeftPosition();
			bottomLimit = clientHeight();
			rightLimit = clientWidth();
	}

	let elmHeight = elm.offsetHeight;
	let elmWidth = elm.offsetWidth;

	document.onmouseup = function() {
		
		for (let i = 0; i < elms.length; i++) {
			document.removeEventListener('mousemove', mouseMoveEvents[i]);
			elms[i].style.zIndex = zIndexes[i];
			elms[i].style.cursor = 'default';
		}
		mouseMoveEvents.length = 0;
	
	}

	elm.onmousedown = function(event) {

		let e = event || window.event;
		if ((e.which && e.which == 1) || (e.button && e.button == 1)) {
			let elmCrds = elmCoordinates(elm);
			
			let elmTop = elmCrds.top;
			let elmLeft = elmCrds.left;
			let elmBottom = elmCrds.bottom;
			let elmRight = elmCrds.right;

			let yStart = e.clientY;
			let xStart = e.clientX;

			let deltaBetweenCursorPositionAndElmTop = yStart - elmTop;
			let deltaBetweenCursorPositionAndElmLeft = xStart - elmLeft;
			let deltaBetweenCursorPositionAndElmBottom = elmBottom - yStart;
			let deltaBetweenCursorPositionAndElmRight = elmRight - xStart;


			elm.style.zIndex = maxZIndex + 1;
			elm.style.cursor = 'move';

			let elmMouseMoveEvent = function(event) {
				let e = event || window.event;

				prohibitSelection();
					
				let scrollTop = scrollTopPosition();
				let scrollLeft = scrollLeftPosition();
				let curY = e.clientY;
				let curX = e.clientX;
				let yMove = elmTop + curY - yStart;
				let xMove = elmLeft + curX - xStart;

				let curElmTop = curY - deltaBetweenCursorPositionAndElmTop + scrollTop;
				let curElmLeft = curX - deltaBetweenCursorPositionAndElmLeft + scrollLeft;
				let curElmBottom = curY + deltaBetweenCursorPositionAndElmBottom + scrollTop;
				let curElmRight = curX + deltaBetweenCursorPositionAndElmRight + scrollLeft;

				if (curElmTop < topLimit) {
					elm.style.top = '0px';
				} else if (curElmBottom > bottomLimit) {
					elm.style.top = bottomLimit - elmHeight - topLimit + 'px';
				} else {
					elm.style.top = yMove - topLimit + 'px';
				}
				if (curElmLeft < leftLimit) {
					elm.style.left = '0px';
				} else if (curElmRight > rightLimit) {
					elm.style.left = rightLimit - elmWidth - leftLimit + 'px';
				} else {
					elm.style.left = xMove - leftLimit + 'px';
				}
			};

			document.addEventListener('mousemove', elmMouseMoveEvent);
			mouseMoveEvents.push(elmMouseMoveEvent);

		}

	};

	zIndexes.push(elm.style.zIndex);
	
	maxZIndex = zIndexes.reduce(function(a, b) {
    return Math.max(a, b);
	});

}

function dragAndResize(elm, resizeDragElm, minH, minW) {
	resizeDragElm.onmousedown = function (event) {
		let e = event || window.event;
		document.addEventListener('mouseup', function () {
			document.onmousemove = null;
			elm.style.cursor = "default";
		});
		if ((e.which && e.which == 1) || (e.button && e.button == 1)) {
			let elmCrds = elmCoordinates(elm);
			let elmHeight = elm.offsetHeight;
			let elmWidth = elm.offsetWidth;
			let yStart = e.clientY;
			let xStart = e.clientX;
			let yLimit = yStart - elmCrds.top;
			let xLimit = xStart - elmCrds.left;
			document.onmousemove = function (event) {
				prohibitSelection();
				let e = event || window.event;
				let y = e.clientY - yStart;
				let x = e.clientX - xStart;
				let newHeight = elmHeight + y;
				let newWidth = elmWidth + x;
				if (newHeight >= minH && newWidth >= minW) {
					directCursor(y, x, resizeDragElm);
					elm.style.height = newHeight + 'px';
					elm.style.width = newWidth + 'px';
				}
			}
		}
		return false;
	}
}

function directCursor(y, x, elm) {
	if ((y >= 0 && x >= 0) || (y <= 0 && x < 0)) {
		elm.style.cursor = 'nwse-resize';
	} else if ((y >= 0 && x < 0) || (y <= 0 && x >= 0)) {
		elm.style.cursor = 'nesw-resize';
	}
}
