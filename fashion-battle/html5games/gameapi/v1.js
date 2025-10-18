(function(d, params, env, apiHost, hosts) {
	// set params
	(function(regex, qs, tokens) {
		regex = /[?&]?([^=]+)=([^&]*)/g;
		qs = d.location && d.location.search ? d.location.search.split('+').join(' ') : '';

		while ((tokens = regex.exec(qs))) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}
	})();

	// if (typeof fg_api == "function" && typeof famobi != "undefined" && famobi instanceof fg_api) {
	// 	// famobi api already loadedgameapi\script\gameapi\script\149b23a7-d0f0-4751-9706-81e342767712\48fd668a-7711-4ef7-9b1d-723b3af47503.js
	// 	return false;
	// }
 
		env = params.fg_env || 'prod';
		apiHost = hosts[env];
		// load script
		(function (d, url, fgJS, firstJS) {
			fgJS = d.createElement('script');
			firstJS = d.getElementsByTagName('script')[0];
			fgJS.src = url+"?_location="+encodeURIComponent(d.location.href.split('#')[0]);
			firstJS.parentNode.insertBefore(fgJS, firstJS);
		})(d, './gameapi/script/149b23a7-d0f0-4751-9706-81e342767712/48fd668a-7711-4ef7-9b1d-723b3af47503.js')
	
})(document, {}, '', '', {
	'dev': 'api.dev', 
	'staging': 'api.staging.gc',
	'staging.aws': 'api.staging.aws',
	'staging.gc': 'api.staging.gc',
	'prod': 'api'
});