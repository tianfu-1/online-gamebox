


const scriptsInEvents = {

	async Evsnapshotshare_Event44_Act1(runtime, localVars)
	{
		const params = {
		    id: "shared"
		    // ... any other param
		} 
		return PokiSDK.shareableURL(params).then(url =>{ 
			runtime.globalVars.SHARE_URL = url
		})
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

