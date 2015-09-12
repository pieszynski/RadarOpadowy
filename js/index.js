
(function (window, undefined) {
	"use strict";

	if (!window.applicationCache)
		return;

	var appCache = window.applicationCache;

	appCache.oncached = function onCachedEvt(evt) {
		console.log('app is cached!', appCache.status);
	}

})(window);