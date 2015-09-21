
(function (window, undefined) {
	"use strict";
	// AppCache

	if (!window.applicationCache)
		return;

	var appCache = window.applicationCache;

	appCache.oncached = function onCachedEvt(evt) {
		console.log('app is cached!', appCache.status);
	}
	appCache.onupdateready = function onUpdateReadyEvt(evt) {
		console.log('update ready!', appCache.status, appCache.UPDATEREADY);

		//appCache.update(); // ręczne wymuszenie aktualizacji

		if (appCache.UPDATEREADY === appCache.status) {	// === 4
			appCache.swapCache();
			window.location.reload();
		}
	}

	console.log(appCache.status);

})(window);


(function (window, document, undefined) {
	"use strict";
	// rotacja obrazków
	// radars[0] - najnowszy!

	var radars = [],
		frameMs = 500,
		loopDelayMs = 1500,
		__locker = undefined;

	function prepRadar(idx) {
		var elem = document.getElementById('radar' + idx);
		elem.idx = idx;
		elem.onload = function () {
			radars[idx] = elem;
			if (!radars[0]) {
				radars[0] = elem;
			} else if (radars[0].idx > idx) {
				radars[0] = elem;
			}

			if (!__locker && !!(__locker = 'locked')) // specjalne przypisanie!
				startFrames();
		}
		//elem.src = 'api/radar' + idx + '.png';
	}

	function startFrames(idx, last) {
		if (undefined === idx)
			idx = radars.length-1;

		if (-1 === idx) {
			setTimeout(function () {
				if (last !== undefined)
					radars[last].style.display = 'none';
				startFrames();
			}, loopDelayMs);
			return;
		}

		if (last !== undefined)
			radars[last].style.display = 'none';

		var rd = radars[idx];
		if (rd) {
			rd.style.display = 'block';
		}

		//console.log('radar-' + idx);

		setTimeout(function() { startFrames(idx-1, !!rd ? idx : last); }, frameMs);
	}

	prepRadar(0);
	prepRadar(1);
	prepRadar(2);

	//window.p = startFrames;

	setTimeout(function() {
		// w razie czego gdyby żadne ze zdarzeń onLoad dla obrazka nie wystartowało w czasie jednego cyklu
		if (!__locker) {
			__locker = 'locked';
			startFrames()
		}
	}, frameMs + 3*frameMs + loopDelayMs);

})(window, document);
