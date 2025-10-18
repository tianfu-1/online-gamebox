var configDict;
var hasFetchedConfig;
var gameInstance;
var tokenRefreshInterval;
var tokenRefreshLastTime = null;
var pendingConflictCredential = null; // Store credential for conflict resolution

function initializeFirebase(unityInstance){
	gameInstance = unityInstance;
	const firebaseConfig = {
	  apiKey: "AIzaSyDyBOKTSOCMvzJJsaf14eU9SezR0B12uPs",
	  authDomain: "pocketrun-33bdc.firebaseapp.com",
	  projectId: "pocketrun-33bdc",
	  storageBucket: "pocketrun-33bdc.firebasestorage.app",
	  messagingSenderId: "697749284925",
	  appId: "1:697749284925:web:c2a1c0cf954d39a8766254",
	  measurementId: "G-QMXGQJ95CQ"
	};
	
	const app = firebase.initializeApp(firebaseConfig);
	initalizeConfig();
	
	// Set up auth state change listener
	firebase.auth().onAuthStateChanged(user => {
	    if (user) {
	        // Set up token refresh
	        setupTokenRefresh();
	    } else {
	        // Clear any existing refresh interval
	        if (tokenRefreshInterval) {
                console.log("onAuthStateChanged clearInterval");
	            //clearInterval(tokenRefreshInterval);
	            //tokenRefreshInterval = null;
	        }
	    }
	});
}

function initalizeConfig(){
	const remoteConfig = firebase.remoteConfig();
	remoteConfig.settings.minimumFetchIntervalMillis = 10 * 60 * 1000; // 10 minutes
	remoteConfig.fetchAndActivate()
	  .then(() => {
		configDict = {};
        for (let [k,v] of Object.entries(remoteConfig.getAll())) {
          configDict[k] = v.asString();
        }
		console.log(configDict);

		hasFetchedConfig = true;
	  })
	  .catch((err) => {
		console.log(err);
		configDict = {};
	  });
}

function isFirebaseInitialized(){
	return hasFetchedConfig;	
}

function getRemoteConfig(){
	return configDict;	
}

function sendGoogleAnalyticsEvent(eventName, parameters) {
    try {
        if (firebase.analytics) {
            firebase.analytics().logEvent(eventName, parameters);
            console.log('Analytics event sent:', eventName, parameters);
        } else {
            console.warn('Firebase Analytics not initialized');
        }
    } catch (error) {
        console.error('Error sending analytics event:', error);
    }
}

function setupTokenRefresh() {
    console.log("setupTokenRefresh");
    
    tokenRefreshLastTime = Date.now();
    if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
    }
    
    // Refresh token every 50 minutes
    tokenRefreshInterval = setInterval(() => {
        const now = Date.now();
            if (now - tokenRefreshLastTime >= 50 * 60 * 1000) {
                refreshIdToken();
                tokenRefreshLastTime = Date.now();
            }
    }, 1 * 60 * 1000); // Check every 1 minutes
}

// Function to refresh the ID token
async function refreshIdToken() {
    try {
        const auth = firebase.auth();
        if (auth.currentUser) {
            // Force token refresh
            const token = await auth.currentUser.getIdToken(true);
            console.log("Token refreshed successfully");
            
            // Notify Unity about the new token (matching mobile implementation)
            gameInstance.SendMessage('Firebase', 'OnTokenRefreshed', JSON.stringify({
                success: true,
                uid: auth.currentUser.uid,
                idToken: token,
                provider: getPrimaryProvider(auth.currentUser)
            }));
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
        gameInstance.SendMessage('Firebase', 'OnTokenRefreshed', JSON.stringify({
            success: false,
            error: error.message
        }));
    }
}

function getPrimaryProvider(user) {
    if (!user || !user.providerData || user.providerData.length === 0) {
        return 'Anonymous';
    }
    
    // Priority order matching mobile: Google > Apple > Other > Anonymous
    for (const provider of user.providerData) {
        switch (provider.providerId) {
            case 'google.com':
                return 'Google';
            case 'apple.com':
                return 'Apple';
        }
    }
    
    return 'Anonymous';
}

async function loginAnonymously() {
    try {
        const auth = firebase.auth();
        
        // Try to get existing user first
        if (auth.currentUser) {
            // Force token refresh to ensure it's not expired
            const token = await auth.currentUser.getIdToken(true);
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: true,
                uid: auth.currentUser.uid,
                idToken: token,
                provider: 'Anonymous'
            }));
            
            return;
        }

        // If no existing user, create new anonymous account
        const userCredential = await auth.signInAnonymously();
        const token = await userCredential.user.getIdToken();

        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: userCredential.user.uid,
            idToken: token,
            provider: 'Anonymous'
        }));
    } catch (error) {
        console.error("Anonymous login failed:", error);
        // If token expired, try to refresh and login again (matching mobile implementation)
        if (error.code === 'auth/id-token-expired') {
            try {
                await firebase.auth().currentUser.getIdToken(true);
                loginAnonymously(); // Try again after refresh
            } catch (refreshError) {
                gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                    success: false,
                    error: "Token refresh failed: " + refreshError.message
                }));
            }
        } else {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }

    setupTokenRefresh();
}

async function loginWithGoogle() {
    try {
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add scopes if needed
        provider.addScope('profile');
        provider.addScope('email');
        
        console.log("Starting Google Sign In...");
        const result = await auth.signInWithPopup(provider);
        const token = await result.user.getIdToken();
        
        console.log("Google Sign In successful for user:", result.user.uid);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: result.user.uid,
            idToken: token,
            provider: 'Google'
        }));
        
        setupTokenRefresh();
    } catch (error) {
        console.error("Google login failed:", error);
        
        // Handle account linking conflicts (matching mobile implementation)
        if (error.code === 'auth/account-exists-with-different-credential' || 
            error.code === 'auth/credential-already-in-use') {
            await handleAccountLinkingConflict(error, 'Google', false);
        } else {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: error.message,
                errorCode: error.code
            }));
        }
    }
}

async function loginWithApple() {
    try {
        const auth = firebase.auth();
        const provider = new firebase.auth.OAuthProvider('apple.com');
        
        // Add scopes if needed
        provider.addScope('email');
        provider.addScope('name');
        
        console.log("Starting Apple Sign In...");
        const result = await auth.signInWithPopup(provider);
        const token = await result.user.getIdToken();
        
        console.log("Apple Sign In successful for user:", result.user.uid);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: result.user.uid,
            idToken: token,
            provider: 'Apple'
        }));
        
        setupTokenRefresh();
    } catch (error) {
        console.error("Apple login failed:", error);
        
        // Handle account linking conflicts (matching mobile implementation)
        if (error.code === 'auth/account-exists-with-different-credential' || 
            error.code === 'auth/credential-already-in-use') {
            await handleAccountLinkingConflict(error, 'Apple', false);
        } else {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: error.message,
                errorCode: error.code
            }));
        }
    }
}

async function linkGoogleProvider() {
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error("No user signed in");
        }
        
        console.log("Linking Google provider to current user:", user.uid);
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await user.linkWithPopup(provider);
        const token = await result.user.getIdToken();
        
        console.log("Google provider linked successfully");
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: result.user.uid,
            idToken: token,
            provider: 'Google',
            operation: 'link'
        }));
    } catch (error) {
        console.error("Google provider linking failed:", error);
        
        // Handle account linking conflicts (matching mobile implementation)
        if (error.code === 'auth/credential-already-in-use' || 
            error.code === 'auth/account-exists-with-different-credential') {
            await handleAccountLinkingConflict(error, 'Google', true);
        } else {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: error.message,
                errorCode: error.code,
                operation: 'link'
            }));
        }
    }
}

async function linkAppleProvider() {
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error("No user signed in");
        }
        
        console.log("Linking Apple provider to current user:", user.uid);
        const provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        
        const result = await user.linkWithPopup(provider);
        const token = await result.user.getIdToken();
        
        console.log("Apple provider linked successfully");
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: result.user.uid,
            idToken: token,
            provider: 'Apple',
            operation: 'link'
        }));
    } catch (error) {
        console.error("Apple provider linking failed:", error);
        
        // Handle account linking conflicts (matching mobile implementation)
        if (error.code === 'auth/credential-already-in-use' || 
            error.code === 'auth/account-exists-with-different-credential') {
            await handleAccountLinkingConflict(error, 'Apple', true);
        } else {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: error.message,
                errorCode: error.code,
                operation: 'link'
            }));
        }
    }
}

async function unlinkProvider(providerId) {
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error("No user signed in");
        }
        
        console.log("Unlinking provider:", providerId);
        await user.unlink(providerId);
        console.log(`Successfully unlinked provider: ${providerId}`);
        
        // Notify Unity about successful unlinking
        const token = await user.getIdToken();
        gameInstance.SendMessage('Firebase', 'OnProviderUnlinked', JSON.stringify({
            success: true,
            providerId: providerId,
            uid: user.uid,
            idToken: token
        }));
    } catch (error) {
        console.error(`Failed to unlink provider ${providerId}:`, error);
        gameInstance.SendMessage('Firebase', 'OnProviderUnlinked', JSON.stringify({
            success: false,
            error: error.message,
            providerId: providerId
        }));
    }
}

function getLinkedProviders() {
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        
        if (!user) {
            return [];
        }
        
        return user.providerData.map(provider => provider.providerId);
    } catch (error) {
        console.error("Failed to get linked providers:", error);
        return [];
    }
}



async function getCurrentUserWithToken() {
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        
        if (!user) {
            gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
                success: false,
                error: "No user signed in"
            }));
            return;
        }
        
        const token = await user.getIdToken(true);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: user.uid,
            idToken: token,
            provider: getPrimaryProvider(user)
        }));
    } catch (error) {
        console.error("Failed to get current user with token:", error);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: false,
            error: error.message
        }));
    }
}

async function logoutUser() {
    try {
        const auth = firebase.auth();
        
        console.log("Signing out user from Firebase...");
        await auth.signOut();
        
        // Clear token refresh interval
        if (tokenRefreshInterval) {
            clearInterval(tokenRefreshInterval);
            tokenRefreshInterval = null;
        }
        
        // Clear any stored credentials
        pendingConflictCredential = null;
        
        console.log("User signed out successfully");
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            operation: 'logout'
        }));
    } catch (error) {
        console.error("Logout failed:", error);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: false,
            error: error.message,
            operation: 'logout'
        }));
    }
}

// Enhanced account linking conflict handling matching mobile implementation
async function handleAccountLinkingConflict(error, providerName, isLinking = false) {
    console.warn(`Account linking conflict for ${providerName}:`, error);
    
    const operation = isLinking ? 'link' : 'login';
    
    // Store the credential for potential account switching
    pendingConflictCredential = error.credential;
    
    // Extract existing user info if available
    let existingUserInfo = "unknown";
    if (error.email) {
        existingUserInfo = error.email;
    }
    
    // Send conflict information to Unity for resolution (matching mobile pattern)
    gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
        success: false,
        error: `This ${providerName} account is already linked to a different user account.`,
        conflictType: 'account-linking-conflict',
        provider: providerName,
        operation: operation,
        errorCode: error.code,
        existingUser: existingUserInfo
    }));
}

// Function called from Unity when user chooses to switch to existing account
async function switchToExistingAccount() {
    try {
        if (!pendingConflictCredential) {
            throw new Error("No pending credential for account switching");
        }
        
        console.log("Switching to existing account with stored credential");
        
        const auth = firebase.auth();
        const result = await auth.signInWithCredential(pendingConflictCredential);
        const token = await result.user.getIdToken();
        
        // Clear the pending credential
        pendingConflictCredential = null;
        
        console.log("Successfully switched to existing account:", result.user.uid);
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: true,
            uid: result.user.uid,
            idToken: token,
            provider: getPrimaryProvider(result.user),
            operation: 'switch'
        }));
        
        setupTokenRefresh();
    } catch (error) {
        console.error("Failed to switch to existing account:", error);
        pendingConflictCredential = null;
        
        gameInstance.SendMessage('Firebase', 'OnLoginComplete', JSON.stringify({
            success: false,
            error: "Failed to switch to existing account: " + error.message,
            operation: 'switch'
        }));
    }
}

// Enhanced error handling for better debugging
function logError(context, error) {
    console.error(`[${context}] Error:`, {
        code: error.code,
        message: error.message,
        credential: error.credential,
        email: error.email
    });
}

// Utility function to get user's authentication state
function getAuthState() {
    const auth = firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
        return {
            isSignedIn: false,
            user: null,
            providers: []
        };
    }
    
    return {
        isSignedIn: true,
        user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous
        },
        providers: user.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            email: p.email,
            displayName: p.displayName
        }))
    };
}

function setAnalyticsUserId(userId) {
    try {
        if (firebase.analytics) {
            firebase.analytics().setUserId(userId);
        } else {
            console.warn('Firebase Analytics not initialized');
        }
    } catch (error) {
        console.error('Error setting analytics user ID:', error);
    }
}

function setAnalyticsUserProperty(name, value) {
    try {
        if (firebase.analytics) {
            firebase.analytics().setUserProperties({[name]: value});
            console.log('Analytics user property set:', name, value);
        } else {
            console.warn('Firebase Analytics not initialized');
        }
    } catch (error) {
        console.error('Error setting user property:', error);
    }
} 
