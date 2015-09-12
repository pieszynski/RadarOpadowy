
(function (window, undefined) {
	"use strict";

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