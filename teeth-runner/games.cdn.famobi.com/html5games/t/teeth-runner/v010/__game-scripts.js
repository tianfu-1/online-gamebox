// AssetsLoader.js
class AssetsLoader {
    static getInstance() {
        if (!AssetsLoader._instance) {
            AssetsLoader._instance = new AssetsLoader();
        }
        return AssetsLoader._instance;
    }

    constructor() {
        this.app = (pc.AppBase || pc.Application).getApplication();
        AssetsLoader._app = this.app;

        /* init variables */
        this.pendingAssets = [];
        this.numAssetsLoaded = 0;
        this.totalAssetsInQueue = 0;
    }

    loadAsset(asset) {
        return new Promise((resolve, reject) => {

            if (asset.loaded) {
                return Promise.resolve(asset);
            }

            Debug.log('[Loader] loading asset ' + asset.name);

            asset.once('load', () => {
                this.app.fire(EventTypes.ASSETS_LOADER_ASSET_LOADED, asset);
                resolve(asset);
            });

            asset.once('error', () => {
                console.warn('failed to load ' + asset.id + ' ' + asset.name);
                this.app.fire(EventTypes.ASSETS_LOADER_ASSET_FAILED, asset);
                reject('an error occurred during asset ' + asset.id + ' (' + assetName + ') loading');
            });

            this.app.assets.load(asset);
        });
    }

    loadAssetByName(assetName, assetType) {
        const asset = this.app.assets.find(assetName, assetType);
        if (!asset) {
            return Pormise.reject(`Asset '${assetName}' not found in the app library!`);
        }

        return this.loadAsset(asset);
    }

    loadAssets(assetsList) {
        return new Promise((resolve, reject) => {

            let pendingAssets = assetsList.filter(a => !a.loaded);
            let totalAssetsInQueue = pendingAssets.length;
            let numAssetsLoaded = 0;

            // console.log(`Preloading ${pendingAssets.length} assets ...`);
            this.app.fire(EventTypes.ASSETS_LOADER_STARTED_LOADING, totalAssetsInQueue);

            const handleAsset = asset => {
                const assetIndex = pendingAssets.indexOf(asset);
                if (assetIndex !== -1) {
                    numAssetsLoaded += 1;
                }
                this.app.fire(EventTypes.ASSETS_LOADER_PROGRESS, numAssetsLoaded / totalAssetsInQueue);
            };

            this.app.on(EventTypes.ASSETS_LOADER_ASSET_LOADED, handleAsset);
            this.app.on(EventTypes.ASSETS_LOADER_ASSET_FAILED, handleAsset);

            const promises = pendingAssets.map(asset => this.loadAsset(asset));

            Promise.all(promises).then((result) => {
                // console.log('Pending assets have finished loading');
                this.app.fire(EventTypes.ASSETS_LOADER_COMPLETE);
                resolve();
            }).catch(error => {
                console.log('All the assets have finished loading, however some failed');
                this.app.fire(EventTypes.ASSETS_LOADER_COMPLETE);
                reject(error);
            }).finally(result => {
                this.app.off(EventTypes.ASSETS_LOADER_ASSET_LOADED, handleAsset);
                this.app.off(EventTypes.ASSETS_LOADER_ASSET_FAILED, handleAsset);
            });
        });
    }

    loadByTag(...tags) {
        return this.loadAssets(this.app.assets.findByTag(...tags));
    }

    getAssetsByTag(...tags) {
        return this.app.assets.findByTag(...tags);
    }

    loadPendingAssets() {
        return this.loadAssets(this.app.assets.filter(asset => asset.loading));
    }

    loadNotLoadedAssets() {
        return this.loadAssets(this.app.assets.filter(asset => !asset.loaded));
    }
}



// EconomyManager.js
var EconomyManager = pc.createScript('economyManager');

EconomyManager.attributes.add('cleanFaceGems', { type: 'number', title: 'Clean Face Gems' });
EconomyManager.attributes.add('feverGemsMul', { type: 'number', title: 'Fever Multiplier' });
EconomyManager.attributes.add('gemsTxts', { type: 'entity', array: true });

EconomyManager.prototype.initialize = function () {

    EconomyManager.Instance = this;

    this.totalGems = 0;
    this.levelGems = 0;


    if (APIMediator.getStorageItem("TR_GEMS") === null) {
        this.updateGems();
    } else {
        let jsonData = APIMediator.getStorageItem("TR_GEMS");
        this.totalGems = parseInt(JSON.parse(jsonData));
    }


    this.fever = false;
    this.levelEndMul = 1;

    this.on("destroy", this.onDestroy, this);

    this.app.on(this.app.events.economy.rewardFaceCleaned, this.rewardFaceCleaned, this);
    this.app.on(this.app.events.fever.finish, this.onFeverFinish, this);
    this.app.on(this.app.events.fever.start, this.onFeverStart, this);
    this.app.on("LevelFinisher:scoreMultipler", this.scoreMultipler, this);
    this.app.on("addGems", this.addGems, this);



};

EconomyManager.prototype.onDestroy = function () {

    this.app.off(this.app.events.economy.rewardFaceCleaned, this.rewardFaceCleaned, this);
    this.app.off(this.app.events.fever.finish, this.onFeverFinish, this);
    this.app.off(this.app.events.fever.start, this.onFeverStart, this);
    this.app.off("LevelFinisher:scoreMultipler", this.scoreMultipler, this);
    this.app.off("addGems", this.addGems, this);

};

EconomyManager.prototype.updateGems = function (prevValue, tweenDuration = 0) {

    APIMediator.setStorageItem("TR_GEMS", JSON.stringify(this.totalGems));

    for (let i = 0; i < this.gemsTxts.length; i++) {
        if (tweenDuration > 0) {
            Utils.tweenText(this.gemsTxts[i], prevValue, this.totalGems, tweenDuration, 0, pc.Linear, true);
        } else {
            this.gemsTxts[i].element.text = this.totalGems;
        }
    }
};

EconomyManager.prototype.addGems = function (gems, tweenDuration = 0.25) {
    const prevValue = this.totalGems;
    this.totalGems = this.totalGems + gems;
    this.updateGems(prevValue, tweenDuration);
};


EconomyManager.prototype.onFeverStart = function () {

    this.fever = true;

};

EconomyManager.prototype.onFeverFinish = function () {

    this.fever = false;

};

EconomyManager.prototype.scoreMultipler = function (mul) {

    this.levelEndMul = mul;

};

EconomyManager.prototype.rewardFaceCleaned = function () {
    this.addGemsLevel(this.cleanFaceGems * (this.fever ? this.feverGemsMul : 1));
    this.app.fire(this.app.events.gameplayMenu.setGemsTxt, this.levelGems);
    this.app.fire('Missions:ProgressCoins', this.levelGems);
};

EconomyManager.prototype.addGemsLevel = function (val, toAssign) {
    this.levelGems = toAssign ? val : this.levelGems + val;
    APIMediator.sendScore(this.levelGems);
};

EconomyManager.prototype.addGemsTotal = function (val, toAssign) {
    this.totalGems = toAssign ? val : this.totalGems + val;
};


EconomyManager.prototype.update = function (dt) {

};

// ShopManager.js
var ShopManager = pc.createScript('shopManager');

var shopData = {

    "brushes": {
        "DefaultToothBrush": {
            isBought: true,
            isSelected: true,
            modelID: "Toothbrush.json",
            price: 5000,
        },
        "ToothBrush_Alien": {
            isBought: false,
            isSelected: false,
            modelID: "Alien.json",
            price: 5000,
        },
        "ToothBrush_Bone": {
            isBought: false,
            isSelected: false,
            modelID: "Bone.json",
            price: 7000,
        },
        "ToothBrush_Broom": {
            isBought: false,
            isSelected: false,
            modelID: "Broom.json",
            price: 8500,
        },
        "ToothBrush_Buffer": {
            isBought: false,
            isSelected: false,
            modelID: "Buffer.json",
            price: 9500,
        },
        "ToothBrush_CatPaw": {
            isBought: false,
            isSelected: false,
            modelID: "CatPaw.json",
            price: 10500,
        },
        "ToothBrush_Chancla": {
            isBought: false,
            isSelected: false,
            modelID: "Chancla.json",
            price: 12500,
        },
        "Toothbrush_Drill": {
            isBought: false,
            isSelected: false,
            modelID: "Drill.json",
            price: 14500,
        },
        "Toothbrush_Leek": {
            isBought: false,
            isSelected: false,
            modelID: "Leek.json",
            price: 16500,
        },
        "ToothBrush_Mouse": {
            isBought: false,
            isSelected: false,
            modelID: "Mouse.json",
            price: 18500,
        },
        "Toothbrush_Paintbrush": {
            isBought: false,
            isSelected: false,
            modelID: "Paintbrush.json",
            price: 20000,
        },
        "ToothBrush_PaintingKnife": {
            isBought: false,
            isSelected: false,
            modelID: "PaintingKnife.json",
            price: 25000,
        },
        "ToothBrush_PaintRoll": {
            isBought: false,
            isSelected: false,
            modelID: "PaintRoll.json",
            price: 30000,
        },
        "Toothbrush_Paw": {
            isBought: false,
            isSelected: false,
            modelID: "Paw.json",
            price: 40000,
        },
        "ToothBrush_Spatula": {
            isBought: false,
            isSelected: false,
            modelID: "Spatula.json",
            price: 50000,
        },
        "ToothBrush_ToiletBrush": {
            isBought: false,
            isSelected: false,
            modelID: "ToiletBrush.json",
            price: 60000,
        },
        "ToothBrush_Flat": {
            isBought: false,
            isSelected: false,
            modelID: "ToothBrush_Flat.json",
            price: 0,
        },
        "Toothbrush_Foot": {
            isBought: false,
            isSelected: false,
            modelID: "Foot.json",
            price: 0,
        },
        "Toothbrush_GolfClub": {
            isBought: false,
            isSelected: false,
            modelID: "GolfClub.json",
            price: 0,
        },
        "ToothBrush_Hand": {
            isBought: false,
            isSelected: false,
            modelID: "Hand.json",
            price: 0,
        },

        currentSelected: "DefaultToothBrush"

    },
    "canons": {
        "GreyCannon": {
            isBought: true,
            isSelected: true,
            modelID: "Canon.json",
            price: 2500,
        },
        "BarrellCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_Barrell.json",
            price: 3500,
        },
        "BlackToothCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_BlackTooth.json",
            price: 4500,
        },
        "Circus": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Circus.json",
            price: 6500,
        },

        "CrystalCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Crystal.json",
            price: 8500,
        },
        "DarkGoldCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_DarkGold.json",
            price: 10500,
        },
        "DemonWingCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_DemonWing.json",
            price: 12500,
        },
        "DiamondCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Diamond.json",
            price: 14500,
        },


        "FlowerBlueCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_FlowerBlue.json",
            price: 16500,
        },

        "FlowerPowerCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_FlowerPower.json",
            price: 17500,
        },
        "GoldenBulletCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_GoldenBullet.json",
            price: 18500,
        },
        "GoldFeatherCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_GoldFeather.json",
            price: 19500,
        },

        "HydroCannonCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_HydroCannon.json",
            price: 21500,
        },
        "LaserHydroCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Laser.json",
            price: 23500,
        },
        "Medieval": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Medieval.json",
            price: 25500,
        },
        "SaphireCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_Saphire.json",
            price: 27500,
        },



        "SilverJewelCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SilverJewel.json",
            price: 30500,
        },
        "SomberGoldenCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SomberGolden.json",
            price: 32500,
        },
        "SomberSilver": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SomberSilver.json",
            price: 34500,
        },
        "Steampunk": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Steampunk.json",
            price: 36500,
        },

        "TankCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_Tank.json",
            price: 38500,
        },
        "TechnologyCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_Technology.json",
            price: 45500,
        },
        "WingCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Wing.json",
            price: 55500,
        },
        "SciFi": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SciFi.json",
            price: 60000,
        },
        "DragonCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Dragon.json",
            price: 0,
        },
        "Laser": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_Laser.json",
            price: 0,
        },
        "DinosaurCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Canon_Dinosaur.json",
            price: 0,
        },
        "FireRubyCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_FireRuby.json",
            price: 0,
        },
        "SilverFeatherCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SilverFeather.json",
            price: 0,
        },
        "SilverGunCannon": {
            isBought: false,
            isSelected: false,
            modelID: "Cannon_SilverGun.json",
            price: 0,
        },

        currentSelected: "GreyCannon"

    },
    "monsters": {
        "DefaultZombie1": {
            isBought: true,
            isSelected: true,
            modelID: "DefaultZombie1",
            price: 2500,
        },

        "DefaultZombie2": {
            isBought: false,
            isSelected: false,
            modelID: "DefaultZombie2",
            price: 5000,
        },

        "ZombieC": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieC",
            price: 10000,
        },

        "ZombieD": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieD",
            price: 20000,
        },

        "ZombieE": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieE",
            price: 25000,
        },

        "ZombieF": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieF",
            price: 30000,
        },

        "ZombieG": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieG",
            price: 40000,
        },

        "ZombieH": {
            isBought: false,
            isSelected: false,
            modelID: "ZombieH",
            price: 50000,
        },

        "Frankenstein": {
            isBought: false,
            isSelected: false,
            modelID: "Frankenstein",
            price: 0,
        },

        "Joker": {
            isBought: false,
            isSelected: false,
            modelID: "Joker",
            price: 0,
        },

        currentSelected: "DefaultZombie1"
    }

};

ShopManager.attributes.add('shopPreviewModel', { type: 'entity' });
ShopManager.attributes.add('shopPreviewModelCanon', { type: 'entity' });
ShopManager.attributes.add('shopPreviewModelMonster', { type: 'entity' });

ShopManager.attributes.add('shopBuyBtn', { type: 'entity' });
ShopManager.attributes.add('shopBuyBtnPriceTxt', { type: 'entity' });
ShopManager.attributes.add('shopBlankBuyBtn', { type: 'entity' });
ShopManager.attributes.add('shopBlankBuyBtnPriceTxt', { type: 'entity' });


// initialize code called once per entity
ShopManager.prototype.initialize = function () {

    ShopManager.instance = this;
    this.loadingAdScreen = this.app.root.findByName("Loading Ad");


    if (APIMediator.getStorageItem("TR_SHOPDATA") === null) {
        this.updateShopData();
    } else {
        let jsonData = APIMediator.getStorageItem("TR_SHOPDATA");
        shopData = JSON.parse(jsonData);
        Debug.log(shopData);
    }


    this.app.on("Enable3DinShop", () => {
        this.shopPreviewModel.enabled = true;
        this.shopPreviewModelCanon.enabled = true;
        this.shopPreviewModelMonster.enabled = true;
    });

    this.zombieModelsMap = new Map();
    this.zombieModelsMap.set('DefaultZombie1', this.app.assets.find('ZombieVariant1', 'template'));
    this.zombieModelsMap.set('DefaultZombie2', this.app.assets.find('ZombieVariant2', 'template'));
    this.zombieModelsMap.set('ZombieC', this.app.assets.find('ZombieVariant3', 'template'));
    this.zombieModelsMap.set('ZombieD', this.app.assets.find('ZombieVariant4', 'template'));
    this.zombieModelsMap.set('ZombieE', this.app.assets.find('ZombieVariant5', 'template'));
    this.zombieModelsMap.set('ZombieF', this.app.assets.find('ZombieVariant6', 'template'));
    this.zombieModelsMap.set('ZombieG', this.app.assets.find('ZombieVariant7', 'template'));
    this.zombieModelsMap.set('ZombieH', this.app.assets.find('ZombieVariant8', 'template'));
    this.zombieModelsMap.set('Frankenstein', this.app.assets.find('ZombieVariantFrankenstein', 'template'));
    this.zombieModelsMap.set('Joker', this.app.assets.find('ZombieVariantJoker', 'template'));

    this.defaultZombieTemplate = this.zombieModelsMap.get('DefaultZombie1');

    this.currentIDChosen = "";
    this.currentCategory = "";
    this.initEvents();

};

ShopManager.prototype.postInitialize = function () {

    this.setButtons("brushes");
    this.setButtons("canons");
    this.setButtons("monsters");

};

ShopManager.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.app.on("onShopEnable", this.onShopEnable, this);
    this.app.on("btnId", this.onShopBtnClick, this);
    this.shopBuyBtn.button.on("click", this.onShopBuyBtn, this);

    // Ads
    // this.app.on("game:pause", this.pauseGame, this);
    // this.app.on("giveReward:resume", this.resumeGiveReward, this);
    // this.app.on("game:resume", this.resumeNoReward, this);
    // this.app.on("rewardedAd:notAvailable", this.adNotAvailable, this);

};

ShopManager.prototype.onDestroy = function () {

    this.app.off("onShopEnable", this.onShopEnable, this);
    this.app.off("btnId", this.onShopBtnClick, this);
    // this.app.off("game:pause", this.pauseGame, this);
    // this.app.off("giveReward:resume", this.resumeGiveReward, this);
    // this.app.off("game:resume", this.resumeNoReward, this);
    // this.app.off("rewardedAd:notAvailable", this.adNotAvailable, this);

};

ShopManager.prototype.updateShopData = function () {
    APIMediator.setStorageItem("TR_SHOPDATA", JSON.stringify(shopData));
};

ShopManager.prototype.pauseGame = function () {
    this.loadingAdScreen.enabled = true;
};

ShopManager.prototype.resumeGiveReward = function () {

    this.loadingAdScreen.enabled = false;
    this.onShopBuyBtn();
    // Give the user a reward

};

ShopManager.prototype.resumeNoReward = function () {
    this.loadingAdScreen.enabled = false;
};

ShopManager.prototype.adNotAvailable = function () {
    this.app.fire("showNoAdPopup");
};

ShopManager.prototype.isRestartNeeded = function() {
    if(this._pendingLevelRegenerate) {
        this._pendingLevelRegenerate = false;
        return true;
    }
    return false;
}


ShopManager.prototype.getUnlockedMonsterTemplates = function() {
    const availableTemplates = [];
    const monsters = shopData.monsters;
    for (let key in monsters) {
        const value = monsters[key];
        if(value.isBought) {
            availableTemplates.push(this.getMonserTemplateByModelID(value.modelID));
        }
    }

    return availableTemplates;
};

ShopManager.prototype.getSelectedZombieTemplate = function() {
    const monsters = shopData.monsters;
    for (let key in monsters) {
        const value = monsters[key];
        if(value.isSelected) return this.getMonserTemplateByModelID(value.modelID);
    }

    return this.defaultZombieTemplate;
};

ShopManager.prototype.getMonserTemplateByModelID = function(modelID) {
    return this.zombieModelsMap.get(modelID) || this.defaultZombieTemplate;
};

ShopManager.prototype.onShopBuyBtn = function () {
    if (this.currentCategory === undefined || this.currentCategory === "") return;
    if (this.currentIDChosen === undefined || this.currentIDChosen === "") return;

    let data = shopData[this.currentCategory][this.currentIDChosen];
    if (!data.isBought) {
        let coins = EconomyManager.Instance.totalGems - data.price;
        if (coins >= 0) {

            if (this.currentCategory === "brushes")
                this.deSelectCurrent("brushes");
            else if (this.currentCategory === "canons")
                this.deSelectCurrent("canons");
            else if (this.currentCategory === "monsters")
                this.deSelectCurrent("monsters");

            if (data.price >= 40000) // Show happy time if player purchased the items with prices more than equal to 40k diamonds
                this.app.fire("showHappyTime");

            this.app.fire("addGems", - data.price);
            // EconomyManager.Instance.totalGems = EconomyManager.Instance.totalGems - data.price;

            // GameAnalytics("addResourceEvent", "Sink", "Gems", parseInt(data.price), "ShopItemBuy", this.currentCategory);

            data.isBought = true;
            data.isSelected = true;
            shopData[this.currentCategory].currentSelected = this.currentIDChosen;

            this.setButtons("brushes");
            this.setButtons("canons");
            this.setButtons("monsters");

            this.app.fire("UpdateBrushModel");
            this.app.fire("UpdateCanonModel");
            this.app.fire("UpdateMonsterModel");
            this._pendingLevelRegenerate = true;


            this.shopBuyBtn.enabled = false;
            this.shopBlankBuyBtn.enabled = false;
            this.updateShopData();

            APIMediator.setStorageItem("TR_GEMS", JSON.stringify(EconomyManager.Instance.totalGems));

            this.app.fire("updateShopGems");

            this.app.fire(EventTypes.PLAY_SFX, 'purchase');

        } else {
            this.shopPreviewModel.enabled = false;
            this.shopPreviewModelCanon.enabled = false;
            this.shopPreviewModelMonster.enabled = false;
            this.app.fire("showGenericPopup", LocalizationManager.getInstance().getLocalizedText("Not enough gems!"), "Enable3DinShop");
        }
    }
    Debug.log(data);

};


ShopManager.prototype.deSelectCurrent = function (type) {
    for (var key of Object.keys(shopData[type])) {
        shopData[type][key].isSelected = false;
    }
};

ShopManager.prototype.onShopEnable = function () {
    const selectedBrush = shopData.brushes[shopData.brushes.currentSelected];
    const selectedCannon = shopData.canons[shopData.canons.currentSelected];

    if (!this.currentCategory || !this.currentIDChosen || shopData[this.currentCategory][this.currentIDChosen].isBought) {
        this.shopBuyBtn.enabled = false;
        this.shopBlankBuyBtn.enabled = false;
    } else {
        this.shopBuyBtn.enabled = true;
        this.shopBlankBuyBtn.enabled = false;
    }

    this._showBrushModel(shopData.brushes[shopData.brushes.currentSelected].modelID);

    /* update cannon model */
    this._showCannonModel(shopData.canons[shopData.canons.currentSelected].modelID);
    /* end update cannon model */

    this.handleMonsterSimple();
    //this.shopPreviewModelMonster.model.asset = this.app.assets.find(shopData.monsters[shopData.monsters.currentSelected].modelID, 'model');
};


ShopManager.prototype._showCannonModel = async function (modelID) {
    while (this.shopPreviewModelCanon.children.length > 0) this.shopPreviewModelCanon.children[0].destroy();
    const cannonTemplateName = modelID.replace('.json', '');
    const cannonAsset = this.app.assets.find(cannonTemplateName, 'template');
    if (!cannonAsset) return console.error('Can not find cannon asset ' + cannonTemplateName);
    await AssetsLoader.getInstance().loadByTag(cannonTemplateName);

    const cannonSkinInstance = cannonAsset.resource.instantiate();
    this.shopPreviewModelCanon.addChild(cannonSkinInstance);

    LayersHelper.getInstance().removeLayer('World', cannonSkinInstance);
    LayersHelper.getInstance().addLayer('ShopPreview', cannonSkinInstance);
};

ShopManager.prototype._showBrushModel = async function (modelID) {
    while (this.shopPreviewModel.children.length > 0) this.shopPreviewModel.children[0].destroy();
    const templateName = modelID.replace('.json', '');
    const templateAsset = this.app.assets.find(templateName, 'template');
    if (!templateAsset) return console.error('Can not find brush asset ' + templateName);
    await AssetsLoader.getInstance().loadByTag(templateName);

    const skinInstance = templateAsset.resource.instantiate();
    this.shopPreviewModel.addChild(skinInstance);

    LayersHelper.getInstance().removeLayer('World', skinInstance);
    LayersHelper.getInstance().addLayer('ShopPreview', skinInstance);
};



ShopManager.prototype.handleMonsterSimple = function () {

    this.shopPreviewModelMonster.children[0].destroy();
    let template = this.app.assets.find(shopData.monsters[shopData.monsters.currentSelected].modelID, 'template');
    let newMonster = template.resource.instantiate();
    this.shopPreviewModelMonster.addChild(newMonster);

};


ShopManager.prototype.handleMonster = function (category, id) {

    this.shopPreviewModelMonster.children[0].destroy();
    let template = this.app.assets.find(shopData[category][id].modelID, 'template');
    let newMonster = template.resource.instantiate();
    this.shopPreviewModelMonster.addChild(newMonster);

};

ShopManager.prototype.onShopBtnClick = function (id, entity, isRewarded, category) {
    Debug.log(id);
    Debug.log(entity);
    Debug.log(shopData[category][id]);

    let data = shopData[category][id];

    // console.log(id);

    if (category === "brushes")
        this._showBrushModel(shopData[category][id].modelID);
    else if (category === "canons")
        this._showCannonModel(shopData[category][id].modelID);
    else if (category === "monsters") {
        this.handleMonster(category, id);
    }
    //     this.shopPreviewModelMonster.model.asset = this.app.assets.find(shopData[category][id].modelID, 'model');

    this.shopBuyBtnPriceTxt.element.text = data.price;
    //console.log(data.price);
    this.shopBlankBuyBtnPriceTxt.element.text = data.price;

    if (data.isBought) {
        this.shopBuyBtn.enabled = false;
        this.shopBlankBuyBtn.enabled = false;

        let btnCurrent = this.app.root.findByTag(shopData[category].currentSelected)[0];

        btnCurrent.children[1].enabled = true;
        btnCurrent.children[1].children[0].enabled = false;

        let btn = this.app.root.findByTag(id)[0];
        btn.children[1].enabled = true;
        btn.children[1].children[0].enabled = true;

        this.deSelectCurrent(category);
        data.isSelected = true;


        shopData[category].currentSelected = id;
        this.updateShopData();
        this.app.fire("UpdateBrushModel");
        this.app.fire("UpdateCanonModel");
        this.app.fire("UpdateMonsterModel");
        this._pendingLevelRegenerate = true;

    } else {
        this.currentIDChosen = id;
        this.currentCategory = category;
        this.shopBuyBtn.enabled = true;
        this.shopBlankBuyBtn.enabled = false;
    }

    // Rewarded

    if (isRewarded) {
        this.shopBlankBuyBtn.enabled = false;
        this.shopBuyBtn.enabled = false;
        if (data.isBought === false) {

            if (APIMediator.isRewardedAdAvailable("button:shop:unlockpremiumitem")) {
                // Show ad and give reward 
                const resumeGiveRewardCallback = ShopManager.instance.resumeGiveReward.bind(this);
                const pauseCallback = ShopManager.instance.pauseGame.bind(this);
                const resumeCallback = ShopManager.instance.resumeNoReward.bind(this);
                const noADAvailableCallack = ShopManager.instance.adNotAvailable.bind(this);

                this.app.fire("showRewardedAD", resumeGiveRewardCallback, pauseCallback, resumeCallback, noADAvailableCallack, "button:shop:unlockpremiumitem");
            } else {
                this.resumeGiveReward();
            }

        }
    }

};

ShopManager.prototype.setButtons = function (type) {

    for (var key of Object.keys(shopData[type])) {
        Debug.log(key);
        Debug.log(shopData[type][key]);
        if (shopData[type][key].isBought) {
            let btn = this.app.root.findByTag(key)[0];
            btn.children[1].enabled = true;
            btn.children[1].children[0].enabled = false;

            // For Rewarded Buttons
            if (btn.children[3])
                btn.children[3].enabled = false;

        }

        if (shopData[type][key].isSelected) {
            let btn = this.app.root.findByTag(key)[0];
            btn.children[1].enabled = true;
            btn.children[1].children[0].enabled = true;

            // For Rewarded Buttons
            if (btn.children[3])
                btn.children[3].enabled = false;

            if (type === "brushes")
                this._showBrushModel(shopData[type][key].modelID);
            else if (type === "canons")
                this._showCannonModel(shopData[type][key].modelID);
            else if (type === "monsters")
                this.handleMonster(type, key);
        }
    }

};

// update code called every frame
ShopManager.prototype.update = function (dt) {

};

// enviornmentGenerator.js
var EnviornmentGenerator = pc.createScript('enviornmentGenerator');

EnviornmentGenerator.EnvTypes = {
    'Default': 0,
    'Mexican': 1,
    'French': 2,
    'Farm': 3,
    'Vampire': 4
};

EnviornmentGenerator.attributes.add('environmentType', {

    type: 'number',
    enum: [
        { 'Default': EnviornmentGenerator.EnvTypes.Default },
        { 'Mexican': EnviornmentGenerator.EnvTypes.Mexican },
        { 'French': EnviornmentGenerator.EnvTypes.French },
        { 'Farm': EnviornmentGenerator.EnvTypes.Farm },
        { 'Vampire': EnviornmentGenerator.EnvTypes.Vampire }
    ],
    title: "EnvType"

});

EnviornmentGenerator.attributes.add('Configs', { type: 'entity', array: true });


// initialize code called once per entity
EnviornmentGenerator.prototype.initialize = function () {

    this.Configs[EnviornmentGenerator.EnvTypes[EnvManager.instance.getEnvType().envType]].enabled = true;
    // this.Configs[this.environmentType].enabled = true;

};

EnviornmentGenerator.prototype.setType = function(type) {
    this.environmentType = type;
};

// update code called every frame
EnviornmentGenerator.prototype.update = function (dt) {

};

// environmentConfig.js
var EnvironmentConfig = pc.createScript('environmentConfig');

EnvironmentConfig.attributes.add('config', {
    type: 'json',
    schema: [{
        name: 'thumbnailUI',
        type: 'asset',
    },
    {
        name: 'nextThumbnailUI',
        type: 'asset',
    }, {
        name: 'whiteToothPaste',
        type: 'asset',
    }, {
        name: 'greenToothPaste',
        type: 'asset',
    }, {
        name: 'cleanTeethMaterial',
        type: 'asset',
    }, {
        name: 'cleanTeethMaterialDiffuse',
        type: 'rgba',
    }, {
        name: 'heads',
        type: 'asset',
        array: true
    }, {
        name: 'monsterHeads',
        type: 'asset',
        array: true
    }, {
        name: 'defaultSkyBox',
        type: 'asset'
    }, {
        name: 'envDecor',
        type: 'asset'
    }, {
        name: 'feverCubemap',
        type: 'asset'
    }, {
        name: 'feverCubemapNon',
        type: 'asset'
    }, {
        name: 'feverCubemapColor',
        type: 'rgba'
    }, {
        name: 'nonFeverCubemapColor',
        type: 'rgba'
    }, {
        name: 'groundColor',
        type: 'rgba'
    }, {
        name: 'borderColor',
        type: 'rgba'
    }, {
        name: 'greenSmallPaste',
        type: 'rgba'
    }, {
        name: 'whiteSmallPaste',
        type: 'rgba'
    }
    ]
});

EnvironmentConfig.instance = null;

EnvironmentConfig.prototype.initialize = function () {
    EnvironmentConfig.instance = this;
};

EnvironmentConfig.prototype.postInitialize = function () {

    this.setupConfig();

};

EnvironmentConfig.prototype.setupConfig = function () {
    CustomCoroutine.Instance.set(() => {
        this.app.fire("setupEnvironmentConfig");
    }, 0.2);
};

EnvironmentConfig.prototype.setupCleanMaterial = function () {
    EnvironmentConfig.instance.config.cleanTeethMaterial.resource.diffuse.set(color.r, color.g, color.b);
};

EnvironmentConfig.prototype.update = function (dt) {

};

// GameMenuEventListener.js
var GameMenuEventListener = pc.createScript('gameMenuEventListener');

GameMenuEventListener.attributes.add('feverSettings', {
    type: 'json',
    title: 'Fever Settings',
    schema: [
        { name: 'feverMat', title: 'Fever Material', type: 'entity' },
        { name: 'collectFade', title: 'Collect Fade', type: 'entity' },
        { name: 'feverCompleted', title: 'Fever Completed', type: 'entity' },
        { name: 'feverContainer', title: 'Fever Container', type: 'entity' },
        { name: 'feverExpansion', title: 'Fever Text Fade Out', type: 'entity' },
        { name: 'gaugeGlow', title: 'Gauge Glow', type: 'entity' },
    ],
});

GameMenuEventListener.attributes.add('speedSettings', {
    type: 'json',
    title: 'Speed Settings',
    schema: [
        { name: 'maxWidth', title: 'Max Width', type: 'number' },
        { name: 'speelMulTxt', title: 'Speed Multiplier', type: 'entity' },
        { name: 'speelFill', title: 'Speed Fill', type: 'entity' },
        { name: 'maxSpeedIndicator', title: 'Max Speed Indicator', type: 'entity' },
        { name: 'speedContainer', title: 'Speed Container', type: 'entity' },
    ],
});

GameMenuEventListener.attributes.add('cleanTeethFinisherSettings', {
    type: 'json',
    title: 'Teeth Clean Settings',
    schema: [
        { name: 'finisherGrp', title: 'Finisher Group', type: 'entity' },
        { name: 'scratchTxt', title: 'Scratch Text', type: 'entity' },
        { name: 'fillMask', title: 'Fill Mask', type: 'entity' },
        { name: 'handImg', title: 'Tutorial Hand Img', type: 'entity' },
    ],
});

GameMenuEventListener.attributes.add('canonFinisherSettings', {
    type: 'json',
    title: 'Canon Settings',
    schema: [
        { name: 'canonFinisherGrp', title: 'Finisher Group', type: 'entity' },
        { name: 'canonFinisherSubGrp', title: 'Finisher Sub Group', type: 'entity' },
        { name: 'canonPowerTxt', title: 'Canon Power Text', type: 'entity' },
        { name: 'tapTxt', title: 'Tap txt', type: 'entity' },
        { name: 'handImg', title: 'Tutorial Hand Img', type: 'entity' },
        { name: 'circleImg', title: 'Tutorial Circle Img', type: 'entity' },
        { name: 'fillMask', title: 'Fill Mask', type: 'entity' },
        { name: 'maxGaugeTxt', title: 'Max Gauge Txt', type: 'entity' },
        { name: 'tapBtn', title: 'Tap Btn', type: 'entity' },
        { name: 'gaugeOutline', title: 'Gauge Outline', type: 'entity' },
        { name: 'bonusText', title: 'Bonus Text', type: 'entity' },
    ],
});

GameMenuEventListener.attributes.add('otherRefs', {
    type: 'json',
    title: 'Other References',
    schema: [
        { name: 'gemsTxt', title: 'Gems Text', type: 'entity' },
        { name: 'gemsContainer', title: 'Gems Container', type: 'entity' },
    ],
});

GameMenuEventListener.instance = null;

// initialize code called once per entity
GameMenuEventListener.prototype.initialize = function () {

    GameMenuEventListener.instance = this;
    Debug.log(GameMenuEventListener.instance);

    this.app.on(this.app.events.fever.valueUpdated, this.onFeverValueUpdated, this);
    this.app.on(this.app.events.speed.valueUpdated, this.onSpeedValueUpdated, this);
    this.app.on("Game:OnCompleted", this.onLevelComplete, this);
    // this.app.on("LevelFinisherCanon:CameraTransitionComplete", this.onCanonCameraTransitionComplete, this);
    this.app.on("LevelFinisher:startMaskTimer", this.startMaskTimer, this);
    this.app.on("setTutorialHandState", this.onSetTutorialHandState, this);
    this.app.on(this.app.events.gameplayMenu.setGemsTxt, this.setGemsTxt, this);
    this.app.on("setCanonBonusTxt", this.setCanonBonusTxt, this);
    this.app.on("LevelManager:LoadLevel", this.loadLevel, this);
    this.canonFinisherSettings.tapBtn.button.on("click", this.onCanonPowerTapBtnClick, this);

    this.speedTween = undefined;
    this.feverTween = undefined;
    this.flameTargetScale = new pc.Vec3(1.5, 1.5, 1.5);
    this.feverTextScale = new pc.Vec3(3, 3, 3);
    this.feverGaugeGlowQuat = new pc.Quat().setFromEulerAngles(0, 0, 135);
    this.teethFinisherMaskWidth = this.cleanTeethFinisherSettings.fillMask.element.width;
    this.scratchTxtTween();

    this.on("destroy", this.onDestroy, this);
};

GameMenuEventListener.prototype.onDestroy = function () {

    this.app.off(this.app.events.fever.valueUpdated, this.onFeverValueUpdated, this);
    this.app.off(this.app.events.speed.valueUpdated, this.onSpeedValueUpdated, this);
    this.app.off("Game:OnCompleted", this.onLevelComplete, this);
    // this.app.off("LevelFinisherCanon:CameraTransitionComplete", this.onCanonCameraTransitionComplete, this);
    this.app.off("LevelFinisher:startMaskTimer", this.startMaskTimer, this);
    this.app.off("setTutorialHandState", this.onSetTutorialHandState, this);
    this.app.off(this.app.events.gameplayMenu.setGemsTxt, this.setGemsTxt, this);
    this.app.off("setCanonBonusTxt", this.setCanonBonusTxt, this);
    this.app.off("LevelManager:LoadLevel", this.loadLevel, this);
    this.canonFinisherSettings.tapBtn.button.off("click", this.onCanonPowerTapBtnClick, this);

};

GameMenuEventListener.prototype.onCanonPowerTapBtnClick = function () {
    this.app.fire("GameMenuEventListener:onCanonPowerTapBtnClick");
};

GameMenuEventListener.prototype.loadLevel = function () {

    Debug.log("loadLevel");

    // Reset Teeth Clean Settings
    this.cleanTeethFinisherSettings.finisherGrp.enabled = false;
    this.feverSettings.feverContainer.enabled = true;
    this.speedSettings.speedContainer.enabled = true;

    this.cleanTeethFinisherSettings.scratchTxt.enabled = false;
    this.cleanTeethFinisherSettings.handImg.enabled = false;

    // Reset Canon Settings
    this.canonFinisherSettings.canonFinisherGrp.enabled = false;
    this.feverSettings.feverContainer.enabled = true;
    this.speedSettings.speedContainer.enabled = true;

    this.canonFinisherSettings.canonPowerTxt.element.opacity = 0;
    this.canonFinisherSettings.canonPowerTxt.enabled = false;

};

GameMenuEventListener.prototype.startFingerTween = function () {

    this.canonFinisherSettings.handImg
        .tween(this.canonFinisherSettings.handImg.getLocalScale())
        .to(new pc.Vec3(0.9, 0.9, 0.9), 0.5, pc.SineIn)
        .loop(true)
        .yoyo(true)
        .onLoop( () => {

        })
        .start();

};

GameMenuEventListener.prototype.setGemsTxt = function (gems) {
    this.otherRefs.gemsTxt.element.text = gems;

    this.otherRefs.gemsContainer.setLocalScale(0.8, 0.8, 0.8);
    this.app.fire(this.app.events.vfx.economyStars);
    TweenWrapper.Tween(this.otherRefs.gemsContainer, this.otherRefs.gemsContainer.getLocalScale(), pc.Vec3.ONE, 1, undefined, pc.ElasticOut);
    // this.otherRefs.gemsIcon.setLocalScale(0.8, 0.8, 0.8);
    // TweenWrapper.Tween(this.otherRefs.gemsIcon, this.otherRefs.gemsIcon.getLocalScale(), pc.Vec3.ONE, 1, undefined, pc.ElasticOut);
};

GameMenuEventListener.prototype.onLevelComplete = function () {

};

GameMenuEventListener.prototype.startMaskTimer = function (time, onComplete) {

    this.cleanTeethFinisherSettings.fillMask.element.width = this.teethFinisherMaskWidth;

    var timer = { value: this.teethFinisherMaskWidth };
    this.entity
        .tween(timer)
        .to({ value: 0 }, time, pc.Linear)
       .onUpdate( function () {
            this.cleanTeethFinisherSettings.fillMask.element.width = timer.value;

        }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .start();

};

GameMenuEventListener.prototype.onCanonCameraTransitionComplete = function () {

    this.startFingerTween();
    TweenWrapper.TweenOpacity(this.canonFinisherSettings.tapTxt.element, 1, 0.4, 0.8, undefined, pc.SineOut, true, true);
    this.canonFinisherSettings.canonFinisherGrp.enabled = true;
    this.canonFinisherSettings.canonFinisherSubGrp.enabled = true;

    this.feverSettings.feverContainer.enabled = false;
    this.speedSettings.speedContainer.enabled = false;

    this.canonFinisherSettings.canonPowerTxt.element.opacity = 1;
    this.canonFinisherSettings.canonPowerTxt.enabled = true;

    setTimeout(() => {
        TweenWrapper.TweenOpacity(this.canonFinisherSettings.canonPowerTxt.element, 1, 0, 1, () => {
            this.canonFinisherSettings.canonPowerTxt.enabled = false;
        }, pc.SineOut, false, false);

    }, 1000);

};

GameMenuEventListener.prototype.onCameraTransitionComplete = function () {

    this.cleanTeethFinisherSettings.finisherGrp.enabled = true;
    this.feverSettings.feverContainer.enabled = false;
    this.speedSettings.speedContainer.enabled = false;
    this.cleanTeethFinisherSettings.scratchTxt.enabled = true;

};

GameMenuEventListener.prototype.onSetTutorialHandState = function (state) {

    this.cleanTeethFinisherSettings.handImg.enabled = state;

};

GameMenuEventListener.prototype.setCanonBonusTxt = function (state, text) {

    this.canonFinisherSettings.bonusText.enabled = state;
    this.canonFinisherSettings.bonusText.element.text = text;

};

GameMenuEventListener.prototype.onFeverValueUpdated = function (val, max) {

    // console.log("onFeverValueUpdated: ", val, max);
    if (val === max) {
        // isCompleted
        this.feverSettings.feverCompleted.enabled = true;
        this.feverSettings.feverExpansion.enabled = true;

        TweenWrapper.TweenOpacity(this.feverSettings.feverExpansion.element, 1, 0, 0.5, function () {
            this.feverSettings.feverExpansion.enabled = false;
        }.bind(this));

        this.feverSettings.feverExpansion.setLocalScale(1, 1, 1);
        TweenWrapper.Tween(
            this.feverSettings.feverExpansion,
            this.feverSettings.feverExpansion.getLocalScale(),
            this.feverTextScale, 0.5
        );

        // TODO: Change Skybox to pinkish purpule
    }
    else {
        this.feverSettings.feverCompleted.enabled = false;
        this.tweenFeverGauge(val, max);
        this.feverSettings.feverMat.element.material.update();
        // console.log("alphaTest: ", this.feverSettings.feverMat.element.material.alphaTest);
    }
};

GameMenuEventListener.prototype.onSpeedValueUpdated = function (val, max) {
    if (val === max) {
        this.speedSettings.maxSpeedIndicator.enabled = true;
    }
    else {
        this.speedSettings.maxSpeedIndicator.enabled = false;
        this.speedSettings.speelMulTxt.element.text = LocalizationManager.getInstance().getLocalizedText('SPEED X0').replace('#', `${val - 1}`);
        this.tweenSpeedFill(val, max);
    }
};

GameMenuEventListener.prototype.tweenSpeedFill = function (val, max) {
    if (this.speedTween) TweenWrapper.StopTween(this.speedTween);

    if (val - 2 >= 0) {
        let a = ((val - 2) / max) * this.speedSettings.maxWidth;
        let b = ((val - 1) / max) * this.speedSettings.maxWidth;

        this.speedTween = TweenWrapper.TweenNumber(a, b, 0.5, function (obj) {
            this.speedSettings.speelFill.element.width = obj.number;
        }.bind(this), function () {
            this.speedSettings.speelFill.element.width = b;
        }.bind(this));
    }
    else
        this.speedSettings.speelFill.element.width = ((val - 1) / max) * this.speedSettings.maxWidth;

};

GameMenuEventListener.prototype.tweenFeverGauge = function (val, max) {
    if (this.feverTween) TweenWrapper.StopTween(this.feverTween);

    let a = this.feverSettings.feverMat.element.material.alphaTest;
    let b = 1 - (parseFloat(val) / max);

    this.animateFeverFlame(a > b);
    this.animateFeverGlow();

    this.feverTween = TweenWrapper.TweenNumber(a, b, 0.5, function (obj) {
        this.feverSettings.feverMat.element.material.alphaTest = obj.number;
    }.bind(this), function () {
        this.feverSettings.feverMat.element.material.alphaTest = b;
    }.bind(this));
};

GameMenuEventListener.prototype.animateFeverFlame = function (isAdded) {
    this.feverSettings.collectFade.element.color = isAdded ? pc.Color.WHITE : pc.Color.BLACK;

    TweenWrapper.TweenOpacity(this.feverSettings.collectFade.element, 1, 0, 0.5);
    this.feverSettings.collectFade.setLocalScale(1, 1, 1);
    if (isAdded)
        TweenWrapper.Tween(this.feverSettings.collectFade, this.feverSettings.collectFade.getLocalScale(), this.flameTargetScale, 0.5);
};

GameMenuEventListener.prototype.animateFeverGlow = function () {
    let glow = this.feverSettings.gaugeGlow;
    glow.enabled = true;
    glow.setLocalEulerAngles(0, 0, 0);
    TweenWrapper.Tween(glow, glow.getLocalRotation(), this.feverGaugeGlowQuat, 0.5, function () {
        glow.enabled = false;
    });
};

GameMenuEventListener.prototype.scratchTxtTween = function () {
    // this.tweenOpacity(this.cleanTeethFinisherSettings.scratchTxt, 1, 0.4, 0.8, null, true, true);
    TweenWrapper.TweenOpacity(this.cleanTeethFinisherSettings.scratchTxt.element, 1, 0.4, 0.8, undefined, pc.SineOut, true, true);
};

GameMenuEventListener.prototype.tweenOpacity = function (entity, from, to, time, onComplete, canLoop, canYoyo) {
    var opacity = { value: from };
    entity
        .tween(opacity)
        .to({ value: to }, time, pc.SineOut)
        .loop(canLoop)
        .yoyo(canYoyo)
       .onUpdate( function () { entity.element.opacity = opacity.value; }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .start();
};

// update code called every frame
GameMenuEventListener.prototype.update = function (dt) {

};


// PlayerController.js
var PlayerController = pc.createScript('playerController');

PlayerController.attributes.add('lookAtFace', { type: 'entity', title: 'DummyPos' });
PlayerController.attributes.add('dummy', { type: 'number', title: 'Dummy' });
PlayerController.attributes.add('rotationLimit', { type: 'vec2', title: 'Rotation Limit' });
PlayerController.attributes.add('moveSpeed', { type: 'number', title: 'Move Speed' });
PlayerController.attributes.add('rotSpeed', { type: 'number', title: 'Rotation Speed' });
PlayerController.attributes.add('rayCastStart', { type: 'entity', title: 'Raycast Start' });
PlayerController.attributes.add('rayCastEnd', { type: 'entity', title: 'Raycast End' });
PlayerController.attributes.add('brushHandle', { type: 'entity', title: 'Brush Handle' });
PlayerController.attributes.add('spreadPasteController', { type: 'entity', title: 'Paste Controller' });
PlayerController.attributes.add('obstacleRayCastStart', { type: 'entity', title: 'Obstacle Raycast Start' });
PlayerController.attributes.add('obstacleRayCastEnd', { type: 'entity', title: 'Obstacle Raycast End' });

// ************************
// * Playcanvas Callbacks *
// ************************

PlayerController.prototype.postInitialize = function () {

    this.updateBrushModel();

};

// initialize code called once per entity
PlayerController.prototype.initialize = function () {

    this.isStarted = false;
    this.positionLerpValue = 0;
    this.rotationLerpValue = 0;
    this.isPressed = false;
    this.touchId = -1;

    this.moveSpeed = this.app.player.moveSpeed;
    this.rotSpeed = this.app.player.rotSpeed;
    this.rotationLimit = new pc.Vec2(45, -45);

    this.toothBrushEntity = this.entity.findByName("Toothbrush");

    this.currentY = 0;

    this.pasteController = this.spreadPasteController.script.spreadPasteController;

    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onPressDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onPressUp, this);

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }

    this.app.on(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.on("Game:OnCompleted", this.onGameCompletedEnv, this);
    this.app.on(this.app.events.pasteController.pasteCollected, this.onPasteCollected, this);
    this.app.on("UpdateBrushModel", this.updateBrushModel, this);

    this.on("destroy", this.onDestroy, this);

};

PlayerController.prototype.onDestroy = function () {

    this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onPressDown, this);
    this.app.mouse.off(pc.EVENT_MOUSEUP, this.onPressUp, this);

    if (this.app.touch) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    }

    this.app.off(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.off("Game:OnCompleted", this.onGameCompletedEnv, this);
    this.app.off(this.app.events.pasteController.pasteCollected, this.onPasteCollected, this);
    this.app.off("UpdateBrushModel", this.updateBrushModel, this);

};

PlayerController.prototype.updateBrushModel = async function () {
    while(this.toothBrushEntity.children.length > 0) this.toothBrushEntity.children[0].destroy();

    const templateName = shopData.brushes[shopData.brushes.currentSelected].modelID.replace('.json', '');
    const templateAsset =  this.app.assets.find(templateName, 'template');
    if(!templateAsset) return console.error('Can not find brush asset ' + templateName);

    await AssetsLoader.getInstance().loadByTag(templateName);

    const skinInstance = templateAsset.resource.instantiate();
    this.toothBrushEntity.addChild(skinInstance);
};

PlayerController.prototype.onGameStartEnv = async function (isStarted) {
    this.isStarted = isStarted;
};

PlayerController.prototype.onGameCompletedEnv = function () {

    this.isStarted = false;

};

PlayerController.prototype.update = function (dt) {
    if (!this.isStarted) return;

    this.positionLerpValue += (0.02 * this.moveSpeed) * (this.isPressed ? 1 : -1);
    this.positionLerpValue = pc.math.clamp(this.positionLerpValue, 0, 1);

    let pos = this.brushHandle.getLocalPosition();

    let raycastHit = this.getRaycastHit();
    this.getObstacleRaycastHit();
    // Debug.log("!raycastHit: ", raycastHit);

    if (!raycastHit)
        return;


    this.handleBrushRot(raycastHit, dt);

    let y = pc.math.lerp(this.rayCastStart.getLocalPosition().y, raycastHit.point.y, this.positionLerpValue);

    this.brushHandle.setLocalPosition(pos.x, y + 1, pos.z);

};

// *******************
// * Event Listeners *
// *******************

PlayerController.prototype.onTouchStart = function (ev) {
    if(APIMediator.isPaused()) return;

    if (this.touchId !== -1) return;

    var touch = ev.changedTouches[0];
    this.touchId = touch.id;
    this.onMousePressed(true);
    ev.event.preventDefault();
    ev.event.stopPropagation();
};

PlayerController.prototype.onTouchEnd = function (ev) {
    if (this.touchId === -1) return;

    for (var i = 0; i < ev.changedTouches.length; i++) {
        var t = ev.changedTouches[i];
        if (t.id == this.touchId) {
            this.onMousePressed(false);
            ev.event.stopImmediatePropagation();
            this.touchId = -1;
            return;
        }
    }
};

// * Mouse Events *

PlayerController.prototype.onPressDown = function (ev) {
    if(APIMediator.isPaused()) return;
    this.isMousePressed = true;
    //ev.event.stopImmediatePropagation();
    this.onMousePressed(true);
};

PlayerController.prototype.onPressUp = function (ev) {
    this.isMousePressed = false;
    //ev.event.stopImmediatePropagation();
    this.onMousePressed(false);
};

PlayerController.prototype.onMousePressed = function (isPressed) {
    this.isPressed = isPressed;

    // if(this.isPressed) {
    //     this.app.fire(EventTypes.UNMUTE_SOUND, 'brushing');
    // } else {
    //      this.app.fire(EventTypes.MUTE_SOUND, 'brushing');
    // }
};

// *******************
// * Functionalities *
// *******************

PlayerController.prototype.getRaycastHit = function () {
    // The pc.Vec3 to raycast from (the position of the camera)
    var from = this.rayCastStart.getPosition();
    var to = this.rayCastEnd.getPosition();

    // Raycast between the two points and return the closest hit result
    var result = this.app.systems.rigidbody.raycastFirst(from, to);

    // If there was a hit, store the entity
    if (result) {
        return result;
    }
};

PlayerController.prototype.getObstacleRaycastHit = function () {
    // The pc.Vec3 to raycast from (the position of the camera)
    var from = this.obstacleRayCastStart.getPosition();
    var to = this.obstacleRayCastEnd.getPosition();

    // Raycast between the two points and return the closest hit result
    var result = this.app.systems.rigidbody.raycastFirst(from, to);


    if (result) {
        if (result.entity.tags.has("obstacle")) {
            // Debug.log(result);

            result.entity.parent.fire("onObstacleHit");
            this.app.fire(this.app.events.fever.addPoint, -1);

        }
    }
};

PlayerController.prototype.calculateAngle = function (raycast) {
    if (!raycast.entity) return;
    // var p1 = raycast.entity.getPosition().normalize();
    var p1 = this.dummyPos.getPosition().normalize();
    var p2 = this.brushHandle.getPosition().normalize();

    Debug.log(raycast.entity.name, " : ", p1.x.toFixed(3), p1.y.toFixed(3), p1.z.toFixed(3), " | ", p2.x.toFixed(3), p2.y.toFixed(3), p2.z.toFixed(3));

    // var dot = vecA.dot(vecB);
    // var angleInRadians = Math.acos(dot);
    // var angle = angleInRadians * pc.math.RAD_TO_DEG;
    // return angle;

    // var angleRadians = Math.atan2(p2.z - p1.z, p2.x - p1.x);

    // angle in degrees
    var angleDeg = Math.atan2(p2.z - p1.z, p2.x - p1.x) * 180 / Math.PI;

    return angleDeg;
};

PlayerController.prototype.onPasteCollected = function (isWhitePaste) {
    this.pasteController.onPasteCollected(isWhitePaste);
};

PlayerController.prototype.handleBrushRot = function (raycastHit, dt) {
    let rot = this.brushHandle.getLocalEulerAngles();
    // Debug.log("!handleBrushRot: ", rot);

    if (this.pasteController.spreadPaste(raycastHit, this.brushHandle.getPosition(), dt)) {
        this.pasteController.detectHeadHit(raycastHit);

        if (raycastHit.entity.name === "Collider") {
            // this.lookAtFace.lookAt(raycastHit.entity.parent.getPosition());
            // Debug.log(this.entity.name, " ->", this.brushHandle.getPosition().z.toFixed(3), " : ", raycastHit.entity.parent.getPosition().z.toFixed(3), " : ", raycastHit.entity.getPosition().z.toFixed(3));

            let val = pc.math.clamp(this.brushHandle.getPosition().z - raycastHit.entity.parent.getPosition().z, 0, 1.6) / 1.6;
            let angleY = pc.math.lerpAngle(this.rotationLimit.y, this.rotationLimit.x, val);
            // Debug.log(angleY);
            // Debug.log((this.brushHandle.getPosition().z - raycastHit.entity.parent.getPosition().z).toFixed(3), " : ", angleY);
            // Debug.log(this.entity.name, " ->", (this.brushHandle.getPosition().z - raycastHit.entity.getPosition().z).toFixed(3));
            this.brushHandle.setLocalEulerAngles(0, angleY, 90);
            Debug.log(this.brushHandle.getLocalEulerAngles().y.toFixed(3), " : ", val);
            this.rotationLerpValue = 0;
        }
        else {
            // Debug.log("rotationLerpValue1: ", this.rotationLerpValue);
            this.rotationLerpValue += (dt * this.rotSpeed);
            this.rotationLerpValue = pc.math.clamp(this.rotationLerpValue, 0, 1);

            let rotY = pc.math.lerpAngle(rot.y, 0, this.rotationLerpValue);
            this.brushHandle.setLocalEulerAngles(0, rotY, 90);
        }
    }
    else {
        // Debug.log("rotationLerpValue2: ", this.rotationLerpValue);
        this.rotationLerpValue += (dt * this.rotSpeed);
        this.rotationLerpValue = pc.math.clamp(this.rotationLerpValue, 0, 1);
        let rotY = pc.math.lerpAngle(rot.y, 0, this.rotationLerpValue);
        this.brushHandle.setLocalEulerAngles(0, rotY, 90);
    }
};

PlayerController.prototype.angle = function (from, to) {
    // sqrt(a) * sqrt(b) = sqrt(a * b) -- valid for real numbers
    let denominator = Math.Sqrt(from.sqrMagnitude * to.sqrMagnitude);
    if (denominator < kEpsilonNormalSqrt)
        return 0;

    let dot = Mathf.Clamp(Dot(from, to) / denominator, -1, 1);
    return Math.Acos(dot) * Mathf.Rad2Deg;
};

// Returns the signed angle in degrees between /from/ and /to/. Always returns the smallest possible angle

PlayerController.prototype.signedAngle = function (from, to) {
    let unsigned_angle = Angle(from, to);
    let sign = Mathf.Sign(from.x * to.y - from.y * to.x);
    return unsigned_angle * sign;
};

// RotatePlayer.js
var RotatePlayer = pc.createScript('rotatePlayer');

// initialize code called once per entity
RotatePlayer.prototype.initialize = function () {

};

// update code called every frame
RotatePlayer.prototype.update = function (dt) {
};

// swap method called for script hot-reloading
// inherit your script state here
// RotatePlayer.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// TweenWrapper.js
/*jshint esversion: 6 */

const TweenWrapper_App = pc.Application.getApplication();

const TweenWrapper = {

    // * FOR *
    // SCALE
    // POSITION
    // ROTATION
    Tween: function(entity, start, end, time, onComplete, type, isLoop, isYoyo, onUpdate, delayTime)
    {
        return entity.tween(start)
            .to(end, time, type || pc.Linear)
            .start()
            .loop(isLoop === true)
            .yoyo(isYoyo === true)
            .delay(delayTime)
            .onComplete( function(){ if(onComplete) onComplete();})
           .onUpdate( function () { if (onUpdate) onUpdate(); });
    },

    TweenOpacity: function (element, from, to, time, onComplete, type, isLoop, isYoyo) {

        element.opacity = from;

        let obj = { opacity: from };
        let toIncrease = from < to;

        return TweenWrapper_App.tween(obj)
            .to({ opacity: to }, time, type || pc.Linear)
           .onUpdate( function () {
                element.opacity = obj.opacity;
                if (toIncrease ? element.opacity >= to : element.opacity <= to)
                    if (onComplete) onComplete();
            }, this)
            .loop(isLoop === true)
            .yoyo(isYoyo === true)
            .start();
    },

    TweenColor: function(element, oldColor, newColor, time, onComplete) {

        if(element.color === newColor)
            return;

        var color = oldColor.clone();

        return TweenWrapper_App
            .tween(color)
            .to(newColor, time, pc.Linear)
           .onUpdate( function () {
            element.color = color;

            if(element.color === color)
                if(onComplete) onComplete();
        }.bind(this))
            .start();
    },

    // can be used in update if needed
    TweenNumberO: function(from, to, speed, element, label) {

        // console.log(from + " -> " + to);
        if(from !== to) // if 'from' is not equal to 'to'
        {
            var eq1 = pc.math.lerp(from, to, speed);
            var eq2 = from < to ? from >= to : from <= to;
            from =  from < to ? Math.ceil(eq1): Math.floor(eq1);
            // console.log("visibleScore -> " + from);

            if(eq2)
            {
                from = to;   
                if(element !== undefined)
                    element.text = label + from;
                return [false, from];
            }

            if(element !== undefined)
                element.text = label + from;
        }
        else
            return [false, from];

        return [true, from];
    },

    TweenNumber: function(from, to, time, updateFunction, onComplete, type, isLoop, isYoyo) {

        // console.log(from + " -> " + to);
        if(from !== to) // if 'from' is not equal to 'to'
        {
            let obj = { number: from};
            return TweenWrapper_App.tween(obj)
                .to({ number: to}, time, type || pc.Linear)
                .loop(isLoop === true)
                .yoyo(isYoyo === true)
               .onUpdate( updateFunction.bind(this, obj))
                .onComplete( function(){ if(onComplete) onComplete(); })
                .start();
        }
    },

    StopTween: function(tween) {
        if(tween)
            tween.stop();
    }
};

// Move.js
var Move = pc.createScript('moveEntity');

Move.attributes.add('start', { title: 'Start', type: 'vec3' });
Move.attributes.add('endOffset', { title: 'End Offset', type: 'vec3' });
Move.attributes.add('speed', { title: 'Speed', type: 'vec3' });
Move.attributes.add('setSpeed', { title: 'Set Speed', type: 'string', default: 'Player:SetSpeed' });
Move.attributes.add('onComplete', { title: 'onComplete', type: 'string', default: 'Game:OnCompleted' });

// initialize code called once per entity
Move.prototype.initialize = function () {

    this.isStarted = false;
    this.lerpValues = new pc.Vec3(0, 0, 0);
    this.onCompletedEventRaised = false;

    this.app.on(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.on(this.setSpeed, this.onSetSpeed, this);
    this.app.on("Ref:levelFinisher", this.levelFinisherUpdate, this);

    this.on("destroy", this.onDestroy, this);
};

Move.prototype.onDestroy = function () {

    this.app.off(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.off(this.setSpeed, this.onSetSpeed, this);
    this.app.off("Ref:levelFinisher", this.levelFinisherUpdate, this);
};

Move.prototype.levelFinisherUpdate = function(levelFinisher) {
    this.end = levelFinisher.getLocalPosition();
    this.end.z += levelFinisher.parent.getLocalPosition().z;
    this.speed.z = 5.25 / this.end.z;
};

Move.prototype.onGameStartEnv = function (isStarted) {
    this.isStarted = isStarted;
    this.onCompletedEventRaised = false;
};

Move.prototype.onSetSpeed = function (speed) {
    this.speed.set(speed.x, speed.y, speed.z);
};

// update code called every frame
Move.prototype.update = function (dt) {
    if (!this.isStarted && !this.onCompletedEventRaised) return;

    this.lerpValues.x += this.speed.x * dt;
    this.lerpValues.y += this.speed.y * dt;
    this.lerpValues.z += this.speed.z * dt;

    let x = this.speed.x != 0 ? pc.math.lerp(this.start.x, this.end.x + this.endOffset.x, this.lerpValues.x) : this.entity.getLocalPosition().x;
    let y = this.speed.y != 0 ? pc.math.lerp(this.start.y, this.end.y + this.endOffset.y, this.lerpValues.y) : this.entity.getLocalPosition().y;
    let z = this.speed.z != 0 ? pc.math.lerp(this.start.z, this.end.z + this.endOffset.z, this.lerpValues.z) : this.entity.getLocalPosition().z;

    this.entity.setLocalPosition(x, y, z);

    let xCompleted = this.speed.x != 0 ? this.lerpValues.x >= 1 : true;
    let yCompleted = this.speed.y != 0 ? this.lerpValues.y >= 1 : true;
    let zCompleted = this.speed.z != 0 ? this.lerpValues.z >= 1 : true;

    if (xCompleted && yCompleted && zCompleted && !this.onCompletedEventRaised) {
        this.onCompletedEventRaised = true;
        if (this.onComplete.length > 0) {
            this.app.fire(this.onComplete);
        }
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Move.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// StartScreenTweens.js
var StartScreenTweens = pc.createScript('startScreenTweens');

StartScreenTweens.attributes.add('fingerImg', { title: 'fingerImg', type: 'entity' });
StartScreenTweens.attributes.add('starTxt', { title: 'starTxt', type: 'entity' });
StartScreenTweens.attributes.add('circleImg', { title: 'circleImg', type: 'entity' });

// initialize code called once per entity
StartScreenTweens.prototype.initialize = function () {
    this.startFingerTween();
    this.startTxtTween();
};

// update code called every frame
StartScreenTweens.prototype.update = function (dt) {

};

StartScreenTweens.prototype.startFingerTween = function () {
    this.fingerImg
        .tween(this.fingerImg.getLocalScale())
        .to(new pc.Vec3(0.9, 0.9, 0.9), 0.8, pc.SineIn)
        .loop(true)
        .yoyo(true)
        .onLoop( () => {

        })
        .start();

};

StartScreenTweens.prototype.startTxtTween = function () {
    this.tweenOpacity(this.starTxt, 1, 0.4, 0.8, null, true, true);
};

StartScreenTweens.prototype.tweenOpacity = function (entity, from, to, time, onComplete, canLoop, canYoyo) {
    var opacity = { value: from };
    entity
        .tween(opacity)
        .to({ value: to }, time, pc.SineOut)
        .loop(canLoop)
        .yoyo(canYoyo)
       .onUpdate( function () { entity.element.opacity = opacity.value; }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .start();
};

// StartMenuEventListener.js
var StartMenuEventListener = pc.createScript('startMenuEventListener');

StartMenuEventListener.attributes.add('fingerImg', { title: 'Finger Img', type: 'entity' });
StartMenuEventListener.attributes.add('starTxt', { title: 'Star Txt', type: 'entity' });
StartMenuEventListener.attributes.add('circleImg', { title: 'Circle Img', type: 'entity' });
StartMenuEventListener.attributes.add('tapArea', { title: 'Tap Area', type: 'entity' });
StartMenuEventListener.attributes.add('gemsText', { type: 'entity' });

StartMenuEventListener.attributes.add('levelProgression', {
    type: 'json',
    title: 'Level Progression entities',
    schema: [
        { name: 'currentLevelSprite', type: 'entity' },
        { name: 'nextLevelSprite', type: 'entity' }
    ],
});

StartMenuEventListener.attributes.add('startMenuBtns', {
    type: 'json',
    title: 'Start Menu Buttons',
    schema: [
        { name: 'settingsBtn', title: 'Settings Button', type: 'entity' },
        { name: 'noAdsBtn', title: 'No Ads Button', type: 'entity' },
        { name: 'missionsBtn', title: 'Mission Button', type: 'entity' },
        { name: 'shopBtn', title: 'Shop Button', type: 'entity' }
    ],
});

// initialize code called once per entity
StartMenuEventListener.prototype.initialize = function () {

    StartMenuEventListener.instance = this;
    this.missionsEnabled = false;
    this.tapArea.button.on('click', this.onClickTapAreaButton, this);
    this.startFingerTween();
    this.startTxtTween();
    this.initEvents();
    this.loadingAdScreen = this.app.root.findByName("Loading Ad Screen");
    this.gemsText.element.text = EconomyManager.Instance.totalGems;

    this.on("enable", () => {
        this.gemsText.element.text = EconomyManager.Instance.totalGems;
    });
};

StartMenuEventListener.prototype.postInitialize = function () {
    this.onEnable();
};

StartMenuEventListener.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.on("disable", this.onDisable, this);
    this.on("enable", this.onEnable, this);

    this.startMenuBtns.settingsBtn.button.on("click", this.onSettingsBtnClicked, this);
    this.startMenuBtns.noAdsBtn.button.on("click", this.onNoAdsBtnClicked, this);
    this.startMenuBtns.missionsBtn.button.on("click", this.onMissionsBtnClicked, this);
    this.startMenuBtns.shopBtn.button.on("click", this.onShopBtnClicked, this);
    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);

};

StartMenuEventListener.prototype.onEnable = function () {

    this.startMenuBtns.settingsBtn.button.active = true;
    this.startMenuBtns.missionsBtn.button.active = true;
    this.startMenuBtns.shopBtn.button.active = true;
    this.isGameStarted = false;


    // console.log("onEnable");
    // this.missionsEnabled = true;
    // MenuManager.Instance.changeState(MenuManager.States.Mission);
    // this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Mission);
};

StartMenuEventListener.prototype.onDisable = function () {
    // if (this.missionsEnabled)
    //     this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.CloseOverlay);
    // this.missionsEnabled = false;
};

StartMenuEventListener.prototype.onDestroy = function () {

    this.startMenuBtns.settingsBtn.button.off("click", this.onSettingsBtnClicked, this);
    this.startMenuBtns.noAdsBtn.button.off("click", this.onNoAdsBtnClicked, this);
    this.startMenuBtns.missionsBtn.button.off("click", this.onMissionsBtnClicked, this);
    this.startMenuBtns.shopBtn.button.off("click", this.onShopBtnClicked, this);
    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);


};


StartMenuEventListener.prototype.onEnvConfigRcv = function () {

    this.levelProgression.currentLevelSprite.element.sprite = EnvironmentConfig.instance.config.thumbnailUI.resource;
    this.levelProgression.nextLevelSprite.element.sprite = EnvironmentConfig.instance.config.nextThumbnailUI.resource;

};


StartMenuEventListener.prototype.onSettingsBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:MainMenu:Settings"
    });
    this.app.fire("sound:playSound", "BtnSound");
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Settings);

};

StartMenuEventListener.prototype.onNoAdsBtnClicked = function () {


};

StartMenuEventListener.prototype.onMissionsBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:MainMenu:Missions"
    });
    this.app.fire("sound:playSound", "BtnSound");
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Mission);

};

StartMenuEventListener.prototype.onShopBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:MainMenu:Shop"
    });

    //this.app.fire("sound:playSound", "BtnSound");
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Shop);
    this.app.fire("onShopEnable");

    this.app.fire("displayBanner", "none");

};


StartMenuEventListener.prototype.onClickTapAreaButton = function () {
    if (this.isGameStarted) return;
    this.isGameStarted = true;

    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:MainMenu:TapToStart"
    });


    this.startMenuBtns.settingsBtn.button.active = false;
    this.startMenuBtns.missionsBtn.button.active = false;
    this.startMenuBtns.shopBtn.button.active = false;

    this.app.fire("displayBanner", "none");
    this.app.fire("onGameStart", true);

    APIMediator.showInterstitialAd('button:mainmenu:start', 'start').then(() => {
        this.onStartGame();
    });
};

StartMenuEventListener.prototype.onStartGame = function () {
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Gameplay);
    this.app.fire(this.app.events.game.requestStart, true);
    this.loadingAdScreen.enabled = false;
};

StartMenuEventListener.prototype.onPause = function () {

    this.loadingAdScreen.enabled = true;
    // this.app.timeScale = 0;

};


StartMenuEventListener.prototype.startFingerTween = function () {
    TweenWrapper.Tween(this.fingerImg, this.fingerImg.getLocalScale(), new pc.Vec3(0.9, 0.9, 0.9), 0.8, undefined, pc.SineIn, true, true);

};

StartMenuEventListener.prototype.startTxtTween = function () {
    this.tweenOpacity(this.starTxt, 1, 0.4, 0.8, null, true, true);
};

StartMenuEventListener.prototype.tweenOpacity = function (entity, from, to, time, onComplete, canLoop, canYoyo) {
    TweenWrapper.TweenOpacity(entity.element, from, to, time, function () {
        if (onComplete) onComplete();
    }.bind(this), pc.SineOut, canLoop, canYoyo);
};

StartMenuEventListener.prototype.update = function (dt) {
    this.startMenuBtns.settingsBtn.enabled = APIMediator.areAudioControlsAllowed() && APIMediator.isPausingAllowed();
};

// GameConstants.js
var GameConstants = pc.createScript('gameConstants');


var EventTypes = {};

/* General */
EventTypes.APP_LOADED = 'app:onLoaded';
EventTypes.SAVE_APP = 'app:save';
EventTypes.SAVEDATA_LOADED = 'app:savedataLoaded';
EventTypes.POSTINITIALIZE = 'postinitialize';

/* Assets loader */
EventTypes.ASSETS_LOADER_STARTED_LOADING = 'assetsLoader:started';
EventTypes.ASSETS_LOADER_PROGRESS = 'assetsLoader:progress';
EventTypes.ASSETS_LOADER_COMPLETE = 'assetsLoader:complete';
EventTypes.ASSETS_LOADER_ASSET_LOADED = 'assetsLoader:assetLoaded';
EventTypes.ASSETS_LOADER_ASSET_FAILED = 'assetsLoader:assetFailed';

EventTypes.ENABLE_MUSIC = 'music:enable';
EventTypes.DISABLE_MUSIC = 'music:disable';
EventTypes.ENABLE_SFX = 'sfx:enable';
EventTypes.DISABLE_SFX = 'sfx:disable';
EventTypes.SET_SFX_VOLUME = 'sfx:setVolume';
EventTypes.SET_MUSIC_VOLUME = 'music:setVolume';
EventTypes.PLAY_MUSIC = 'music:play';
EventTypes.STOP_MUSIC = 'music:stop';
EventTypes.CHOKE_MUSIC = 'music:choke';
EventTypes.UNCHOKE_MUSIC = 'music:unchoke';
EventTypes.PLAY_EXTERNAL_SFX = 'sfx:playExternal';
EventTypes.PLAY_SFX = 'sfx:play';
EventTypes.STOP_SFX = 'sfx:stop';
EventTypes.MUTE_SOUND = 'audio:mute';
EventTypes.UNMUTE_SOUND = 'audio:unmute';
EventTypes.SOUND_STATE_CHANGED = 'sound:stateChanged';
EventTypes.MUSIC_STATE_CHANGED = 'music:stateChanged';
EventTypes.SET_MASTER_VOLUME = 'audio:setMasterVolume';

EventTypes.Screen = {
    RESIZED: 'app:screen:resized',
    SET_SCALE_BLEND: 'app:screen:setScaleBlend',
    SET_SHADOWS_ENABLED: 'app:screen:shadowsEnabled'
};

EventTypes.afterAll = async function (...eventNames) {
    return Promise.all(eventNames.map(eventKey => new Promise((resolve, reject) => {
        pc.AppBase.getApplication().once(eventKey, () => resolve());
    }))); 
};

EventTypes.afterAny = async function (...eventNames) {
    let _alreadyFulfilled = false;
    const promises = eventNames.map(eventKey => new Promise((resolve, reject) => {
        pc.AppBase.getApplication().once(eventKey, () => {
            if(!_alreadyFulfilled) {
                _alreadyFulfilled = true;
                resolve(eventKey);
            }
        });
    }));
    return Promise.any(promises); 
};




pc.Entity.prototype.delayedCall = function (durationMS, f, scope) {
    var n = 0;
    while (this["delayedExecuteTween" + n]) {
        n++;
    }
    var id = "delayedExecuteTween" + n;
    var m;
    this[id] = this.tween(m)
        .to(1, durationMS / 1000, pc.Linear)
        ;
    this[id].start();

    this[id].once("complete", function () {
        f.call(scope);
        this[id] = null;
    }, this);

    return this[id];
};






var Constants = {};
Constants.GAME_NAME = 'TeethRunner';
Constants.GAME_VERSION = 'v1.0';

GameConstants.prototype.initialize = function () {

    this.app.player = {
        moveSpeed: 4,
        rotSpeed: 3
    };

    this.app.paste = {
        spawnDelayMin: 0.01,
        spawnDelayMax: 0.035,
        scaleMin: 1,
        scaleMax: 1.7,
        spreadDist: 1
    };

    this.app.gameData = {
        currentLevel: 1
    };

    this.app.events = {
        menuManager: {
            changeState: 'MenuManager:ChangeState',
        },
        configManager: {
            initialized: 'ConfigManager:Initialized',
        },
        game: {
            requestStart: 'Game:RequestStart',
            start: 'Game:Start',
        },
        pasteController: {
            pasteCollected: "PasteController:PasteCollected",
        },
        fever: {
            addPoint: 'Fever:AddPoint',
            requestStart: 'Fever:RequestStart',
            start: 'Fever:Start',
            finish: 'Fever:Finish',
            value: 'Fever:Finish',
            valueUpdated: 'Fever:ValueUpdated',
        },
        speed: {
            valueUpdated: 'Speed:ValueUpdated',
        },
        economy: {
            rewardFaceCleaned: 'Economy:RewardFaceCleaned',
        },
        gameplayMenu: {
            setGemsTxt: 'GameplayMenu:SetGemsTxt',
        },
        vfx: {
            economyStars: 'Vfx:EconomyStars',
        }
    };

};

// SmoothFollow.js
var SmoothFollow = pc.createScript('smoothFollow');

SmoothFollow.attributes.add('followX', { type: 'boolean', title: 'Follow X' });
SmoothFollow.attributes.add('followY', { type: 'boolean', title: 'Follow Y' });
SmoothFollow.attributes.add('followZ', { type: 'boolean', title: 'Follow Z' });

SmoothFollow.attributes.add('followSpeed', { type: 'vec3', title: 'Follow Speed' });
SmoothFollow.attributes.add('followOffset', { type: 'vec3', title: 'Follow Offset' });
SmoothFollow.attributes.add('target', { type: 'entity', title: 'Follow Target' });
SmoothFollow.attributes.add('setSpeed', { title: 'Set Speed', type: 'string', default: 'Player:SetSpeed' });

// initialize code called once per entity
SmoothFollow.prototype.initialize = function () {

    this.app.on(this.setSpeed, this.onSetSpeed, this);

    this.pos = this.entity.getLocalPosition();
    this.lerpValues = {
        x: 0, y: 0, z: 0,
    };

    this.on("destroy", this.onDestroy, this);

};


SmoothFollow.prototype.onDestroy = function () {

    this.app.off(this.setSpeed, this.onSetSpeed, this);

};

SmoothFollow.prototype.onSetSpeed = function (speed) {

    this.followSpeed.set(speed.x, speed.y, speed.z);

};

// update code called every frame
SmoothFollow.prototype.postUpdate = function (dt) {
    // let pos = this.entity.getLocalPosition();
    let target = this.target.getLocalPosition();

    let x = this.followX ? pc.math.lerp(this.pos.x, target.x + this.followOffset.x, dt * this.followSpeed.x) : pos.x;
    let y = this.followY ? pc.math.lerp(pos.y, target.y + this.followOffset.y, dt * this.followSpeed.y) : pos.y;
    let z = this.followZ ? pc.math.lerp(pos.z, target.z + this.followOffset.z, dt * this.followSpeed.z) : pos.z;

    this.entity.setLocalPosition(x, y, z);
};

// PasteController.js
var PasteController = pc.createScript('pasteController');

PasteController.attributes.add('isWhitePaste', { type: 'boolean', title: 'Is White Paste' });
PasteController.attributes.add('radius', { type: 'number', title: 'Radius', default: 1 });
PasteController.attributes.add('shrinkTime', { type: 'number', title: 'Shrink Time', default: 0.4 });
PasteController.attributes.add('center', { type: 'entity', title: 'Center' });

// initialize code called once per entity
PasteController.prototype.initialize = function () {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.isCollected = false;
    this.cache = {
        vec1: new pc.Vec3(),
    };

    this.player = this.app.root.findByTag('PlayerHandle')[0];
    //Debug.log(this.entity.parent.name, " -> ", this.entity);
};

// update code called every frame
PasteController.prototype.update = function (dt) {
    if (this.isCollected) return;
    this.checkPlayerHit();
};

PasteController.prototype.checkPlayerHit = function () {
// let playerPos = ReferenceManager.Instance.player.getPosition();
    this.initialize();
    let playerPos = this.player.getPosition();

    let pos = this.center.getPosition();

    let dist = Math.dist(playerPos.y, playerPos.z, pos.y, pos.z);
    if (2 > dist) {
        Debug.log(this.radius, dist);

        this.isCollected = true;
        this.app.fire(this.app.events.pasteController.pasteCollected, this.isWhitePaste);
        this.doScale(true);
    }    
};

PasteController.prototype.doScale = function (animate) {
    if (animate) {
        var self = this;
        this.cache.vec1.set(1, this.isWhitePaste ? 1 : 0.1, this.isWhitePaste ? 0 : 1);
        TweenWrapper.Tween(this.entity, this.entity.getLocalScale(), this.cache.vec1, this.shrinkTime, function () {
            if (self.isWhitePaste)
                self.entity.enabled = false;
            Debug.log("Paste: ", self.isWhitePaste);
        });
    }
    else
        this.entity.setLocalScale(1, this.isWhitePaste ? 1 : 0.1, this.isWhitePaste ? 0 : 1);
};


// Utils.js
Math.dist = function (x1, y1, x2, y2) {
    if (!x2) x2 = 0;
    if (!y2) y2 = 0;
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

Math.noiseAbs = function (x) {
    x = (x << 13) ^ x;
    return Math.abs(parseFloat(1.0 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0));
};


Math.checkCircleRectangleOverlap = function (r, xc, yc, x1, y1, x2, y2) {
    // Find the nearest point on the
    // rectangle to the center of
    // the circle
    let xn = Math.max(x1, Math.min(xc, x2));
    let yn = Math.max(y1, Math.min(yc, y2));

    // BB_BallsManager.Instance.points[3].setPosition(xn, yn, 0);

    // Find the distance between the
    // nearest point and the center
    // of the circle
    // Distance between 2 points,
    // (x1, y1) & (x2, y2) in
    // 2D Euclidean space is
    // ((x1-x2)**2 + (y1-y2)**2)**0.5
    let dx = xn - xc;
    let dy = yn - yc;
    return (dx * dx + dy * dy) <= r * r;
};

// x and y are center of rectangle
// w and h are wih=dth and height
Math.findRectangleOppositeCorners = function (w, h, x, y) {
    let oppositeCorners = { x1: x - w, y1: y - h, x2: x + w, y2: y + h };
    // BB_BallsManager.Instance.points[1].setPosition(oppositeCorners.x1, oppositeCorners.y1, 0);
    // BB_BallsManager.Instance.points[2].setPosition(oppositeCorners.x2, oppositeCorners.y2, 0);

    return oppositeCorners;
};

Math.randomPlusMinus = function () {
    return (parseInt(pc.math.random(0, 100)) % 2 === 0 ? 1 : -1);
};

Math.clamp01 = function (a) {
    return pc.math.clamp(a, 0, 1);
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function changeRange(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}



var Utils = {};


Utils.setSpriteElementFromAsset = function (elementImage, spriteAsset) {
    const app = pc.AppBase.getApplication();
    const atlasFrameKey = spriteAsset.data.frameKeys[0];
    const textureAtlas = app.assets.get(spriteAsset.data.textureAtlasAsset);
    const rect = textureAtlas.resource.frames[atlasFrameKey].rect;
    elementImage.element.spriteAsset = spriteAsset.id;
    elementImage.element.width = rect.z;
    elementImage.element.height = rect.w;
};

Utils.setSpriteElementFromSprite = function (elementImage, sprite, maxWidth, maxHeight) {
    const atlasFrameKey = sprite.frameKeys[0];
    const rect = sprite.atlas.frames[atlasFrameKey].rect;
    elementImage.element.sprite = sprite;
    elementImage.element.width = rect.z;
    elementImage.element.height = rect.w;

    if(maxWidth && maxHeight) {
        Utils.clampSpriteSizeTo(elementImage, maxWidth, maxHeight);
    }
};

Utils.clampSpriteSizeTo = function(sprite, maxWidth, maxHeight) {
    const currentWidth = sprite.element.width;
    const currentHeight = sprite.element.height;
    const scaleFactor = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);
    sprite.element.width = currentWidth * scaleFactor;
    sprite.element.height = currentHeight * scaleFactor;
};

Utils.wait = function (duration) {
    return new Promise((resolve, reject) => {
        const app = pc.AppBase.getApplication();
        if (duration !== undefined) {
            if (app) {
                pc.AppBase.getApplication().root.delayedCall(duration, () => {
                    resolve();
                })

            } else {
                setTimeout(() => resolve(), duration);
            }
        } else {
            resolve();
        }
    })
};
Utils.setSpriteElement = function (elementImage, spriteAsset) {
    const app = pc.AppBase.getApplication();
    const atlasFrameKey = spriteAsset.data.frameKeys[0];
    const textureAtlas = app.assets.get(spriteAsset.data.textureAtlasAsset);
    const rect = textureAtlas.resource.frames[atlasFrameKey].rect;
    elementImage.element.spriteAsset = spriteAsset.id;
    elementImage.element.width = rect.z;
    elementImage.element.height = rect.w;
};

Utils.worldToLocalPosition = function (entity, worldPosition) {
    if (!entity.parent) {
        console.warn('worldToLocalPosition: entity is not parented!');
        return pc.Vec3.ZERO;
    }
    this._transformMatrix = this._transformMatrix || new pc.Mat4();
    this._transformMatrix.copy(entity.parent.getWorldTransform());
    return this._transformMatrix.invert().transformPoint(worldPosition)
};

Utils.localToWorldPosition = function (entity, localPosition) {
    this._transformMatrix = this._transformMatrix || new pc.Mat4();
    this._transformMatrix.copy(entity.getWorldTransform());
    return this._transformMatrix.transformPoint(localPosition)
};


Utils.worldToLocalEulerAngles = function (entity, targetEulerAngles) {
    const initialLocalAngles = entity.getLocalEulerAngles().clone();
    entity.setEulerAngles(targetEulerAngles);
    const targetLocalAngles = entity.getLocalEulerAngles().clone();
    entity.setLocalEulerAngles(initialLocalAngles);
    return targetLocalAngles;
};

Utils.tweenText = function (textElement, initialValue, targetValue, duration, delay, easing) {
    textElement.element.textValue = initialValue;
    textElement.element.text = '' + Math.floor(initialValue);
    textElement.tween(textElement.element)
        .to({ textValue: targetValue }, duration, easing)
        .delay(delay)
        .onUpdate(() => textElement.element.text = '' + Math.floor(textElement.element.textValue))
        .onComplete(() => textElement.element.text = '' + Math.floor(targetValue))
        .start();
};



Utils.tweenOpacity = function (entity, opacity, duration, ease = pc.Linear, delay = 0) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.element)
            .to({ opacity: opacity }, duration, ease)
            .delay(delay)
            .onComplete(() => resolve())
            .start();
    });
};

Utils.tweenPosition = function (entity, localPosition, duration, ease = pc.Linear, delay = 0) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.getLocalPosition())
            .to(localPosition, duration, ease)
            .delay(delay)
            .onComplete(() => resolve())
            .start();
    });
};


Utils.tweenScale = function (entity, localScale, duration, ease = pc.Linear, delay = 0) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.getLocalScale())
            .to(localScale, duration, ease)
            .delay(delay)
            .onComplete(() => resolve())
            .start();
    });
};


Utils.getRandomItem = function (objects, startIndex, length) {
    if (objects === null) { return null; }
    if (startIndex === undefined) { startIndex = 0; }
    if (length === undefined) { length = objects.length; }

    var randomIndex = startIndex + Math.floor(Math.random() * length);

    return objects[randomIndex] === undefined ? null : objects[randomIndex];
};

Utils.getRandomItemBut = function (objects, butObject) {
    return Utils.getRandomItem(objects.slice().filter(o => o !== butObject));
};

// eyesLookAt.js
var EyesLookAt = pc.createScript('eyesLookAt');

// initialize code called once per entity
EyesLookAt.prototype.initialize = function () {
    this.brush = this.app.root.findByName("ToothBrush");
    this.leftEye = this.entity.children[0];
    this.rightEye = this.entity.children[1];

};

// update code called every frame
EyesLookAt.prototype.update = function (dt) {
    this.leftEye.lookAt(this.brush.getPosition());
    this.rightEye.lookAt(this.brush.getPosition());

    this.leftEye.rotate(0, 180, 0);
    this.rightEye.rotate(0, 180, 0);
};

// ios-select-fix-patch.js

var meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1, user-scalable=no";
document.getElementsByTagName('head')[0].appendChild(meta);


(function () {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML =
        "canvas{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline:0;-webkit-tap-highlight-color:rgba(255,255,255,0)}" +
        "body{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline:0}";
})();

// head.js
var Head = pc.createScript('head');

Head.attributes.add('isMonster', { title: 'isMonster', type: 'boolean', default: false });

// initialize code called once per entity
Head.prototype.initialize = function () {

    this.initEvents();
    this.setupReferences();
    this.cloneHeadMat();

    this.topTeeth = null;
    this.bottomTeeth = null;
    this.whiteColor = new pc.Color(1, 1, 1, 1);
    this.redColor = new pc.Color(1, 0, 0, 1);
};

Head.prototype.initEvents = function () {
    this.on("destroy", this.onDestroy, this);
    this.entity.once("cleanTeeth", this.cleanTeeth, this);
    this.entity.once("dirtyTeeth", this.dirtyTeeth, this);
    this.entity.on("resetTeeth", this.resetTeeth, this);
    this.app.on("setupCleanTeethMaterial", this.setupCleanTeethMaterial, this);

};

Head.prototype.onDestroy = function () {

    this.entity.off("cleanTeeth", this.cleanTeeth, this);
    this.entity.off("dirtyTeeth", this.dirtyTeeth, this);
    this.entity.off("resetTeeth", this.resetTeeth, this);
    this.app.off("setupCleanTeethMaterial", this.setupCleanTeethMaterial, this);

};

Head.prototype.setupCleanTeethMaterial = function () {

    let color = EnvironmentConfig.instance.config.cleanTeethMaterialDiffuse;
    this.cleanTeethMat.resource.diffuse.set(color.r, color.g, color.b);
    this.cleanTeethMat.resource.update();

};

Head.prototype.setupReferences = function () {

    this.allTeethTop = this.entity.findByName("TeethTop");
    this.allTeethBottom = this.entity.findByName("TeethBottom");
    this.headA = this.entity.findByName("HeadA");
    this.headB = this.entity.findByName("HeadB");
    this.happyVFX = this.entity.findByName("HappyVFX");
    this.angryVFX = this.entity.findByName("AngryVFX");
    this.bubblesVFX = this.entity.findByName("BubblesVFX");
    this.sparkleVFX = this.entity.findByName("SparkleVFX");

    this.bubblesDirtyVFX = this.entity.findByName("BubblesDirtyVFX");
    this.sparkleDirtyVFX = this.entity.findByName("SparkleDirtyVFX");

    // White Teeth Mat
    let whiteTeethMat = this.app.assets.findByTag("CleanTeethMat");
    this.cleanTeethMat = whiteTeethMat[0];

    // Poop Teeth Mat
    let poopTeethMat = this.app.assets.findByTag("PoopTeethMat");
    this.cleanMonsterTeethMat = poopTeethMat[0];
};

Head.prototype.cloneHeadMat = function () {

    if (this.headA) {
        this.headAMatName = this.headA.render.material.name;

    } else {
        this.headBMatName = this.headB.render.material.name;

    }

};

Head.prototype.cleanTeeth = function () {
    this.app.fire('Missions:ProgressCleanCount', 1);

    this.app.fire(this.app.events.economy.rewardFaceCleaned);
    this.app.fire(this.app.events.fever.addPoint, 1);
    this.tweenHead(true);
    this.morphHead(true);
    this.animateTeeth(true);
    this.runVFX(true);

};

Head.prototype.resetTeeth = function () {

    if (this.topDirtyTeeth)
        this.topDirtyTeeth.enabled = true;

    if (this.botDirtyTeeth)
        this.botDirtyTeeth.enabled = true;

    if (this.topCleanTeeth)
        this.topCleanTeeth.enabled = false;

    if (this.botCleanTeeth)
        this.botCleanTeeth.enabled = false;

    this.headA.render.meshInstances[0].morphInstance.setWeight(0, 0);
    this.headA.render.meshInstances[0].morphInstance.setWeight(0, 0);

    this.headB.render.meshInstances[0].morphInstance.setWeight(0, 0);
    this.headB.render.meshInstances[0].morphInstance.setWeight(0, 0);

};

Head.prototype.tweenHead = function (isClean) {

    if (isClean) {
        this.entity
            .tween(this.entity.getLocalScale())
            .to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.BackInOut)
            .repeat(2)
            .yoyo(true)
            .start();
    } else {
        this.entity.setLocalEulerAngles(-90, 100, 0);

        this.entity
            .tween(this.entity.getLocalEulerAngles())
            .rotate(new pc.Vec3(this.entity.getLocalEulerAngles().x, 100, this.entity.getLocalEulerAngles().z), 0.3, pc.CircularInOut)
            .yoyo(true)
            .repeat(2)
            .start()
            .onComplete(() => {
                this.entity
                    .tween(this.entity.getLocalEulerAngles())
                    .rotate(new pc.Vec3(this.entity.getLocalEulerAngles().x, 90, this.entity.getLocalEulerAngles().z), 0.2, pc.BackOut)
                    .start();
            });
    }

};

Head.prototype.morphHead = function (isClean) {

    if (this.headA) {
        if (this.headA.enabled) {
            if (isClean) {
                this.tweenMorphTarget(this.headA, 0, 1, 0.3, 0);
            } else {
                this.tweenMorphTarget(this.headA, 0, 1, 0.3, 1);
            }
        }
    } else {
        if (isClean) {
            this.tweenMorphTarget(this.headB, 0, 1, 0.3, 0);
        } else {
            this.tweenMorphTarget(this.headB, 0, 1, 0.3, 1);
        }
    }


};

Head.prototype.runVFX = function (isClean) {

    if (isClean) {
        this.happyVFX.particlesystem.reset();
        this.happyVFX.particlesystem.play();


        if (this.isMonster) {
            this.bubblesDirtyVFX.particlesystem.reset();
            this.bubblesDirtyVFX.particlesystem.play();
            //this.sparkleDirtyVFX.particlesystem.reset();
            //this.sparkleDirtyVFX.particlesystem.play();
        } else {
            this.bubblesVFX.particlesystem.reset();
            this.bubblesVFX.particlesystem.play();
            this.sparkleVFX.particlesystem.reset();
            this.sparkleVFX.particlesystem.play();
        }


    } else {
        this.angryVFX.particlesystem.reset();
        this.angryVFX.particlesystem.play();
    }


};

Head.prototype.animateTeeth = function (isClean) {

    this.app.fire(EventTypes.PLAY_SFX, Utils.getRandomItem(['brush1', 'brush2', 'brush3', 'brush4']), 200);

    if (this.isMonster) {
        this.app.fire(EventTypes.PLAY_SFX, Utils.getRandomItem(['monsterGlad1', 'monsterGlad2', 'monsterGlad3']), 200);
    } else {
        this.app.fire(EventTypes.PLAY_SFX, Utils.getRandomItem(['humanGlad1', 'humanGlad2', 'humanGlad3']), 200);
    }


    for (let i = 0; i < this.allTeethTop.children.length; i++) {
        if (this.allTeethTop.children[i].enabled) {
            this.topTeeth = this.allTeethTop.children[i];
            break;
        }
    }

    for (let i = 0; i < this.allTeethBottom.children.length; i++) {
        if (this.allTeethBottom.children[i].enabled) {
            this.bottomTeeth = this.allTeethBottom.children[i];
            break;
        }
    }

    this.topDirtyTeeth = this.topTeeth.children[0];
    this.topCleanTeeth = this.topTeeth.children[1];

    this.botDirtyTeeth = this.bottomTeeth.children[0];
    this.botCleanTeeth = this.bottomTeeth.children[1];

    this.topDirtyTeeth.enabled = true;
    this.botDirtyTeeth.enabled = true;

    // TODO: Setup teeth clean material depending on the paste on the brush
    // For now, just apply White Material

    // Setup a new material for the teeth
    let topTeethMaterial = new pc.StandardMaterial();

    if (this.isMonster) {
        topTeethMaterial = this.cleanMonsterTeethMat.resource.clone();
    } else {
        topTeethMaterial = this.cleanTeethMat.resource.clone();
    }

    for (let i = 0; i < this.topCleanTeeth.render.meshInstances.length; i++) {
        this.topCleanTeeth.render.meshInstances[i].material = topTeethMaterial;
    }

    let botTeethMaterial = new pc.StandardMaterial();

    if (this.isMonster) {
        botTeethMaterial = this.cleanMonsterTeethMat.resource.clone();
    } else {
        botTeethMaterial = this.cleanTeethMat.resource.clone();
    }

    for (let i = 0; i < this.topCleanTeeth.render.meshInstances.length; i++) {
        this.botCleanTeeth.render.meshInstances[i].material = botTeethMaterial;
    }

    this.topCleanTeeth.enabled = true;
    this.botCleanTeeth.enabled = true;

    this.tweenOpacity(this.topCleanTeeth, 0.33, 0.81, 0.4, () => {
        this.topDirtyTeeth.enabled = false;


        setTimeout(() => {
            if (this.sparkleVFX.particlesystem) this.sparkleVFX.particlesystem.loop = false;
            if (this.sparkleDirtyVFX.particlesystem) this.sparkleDirtyVFX.particlesystem.loop = false;
        }, 2000);

    });

    this.tweenOpacity(this.botCleanTeeth, 0.33, 0.81, 0.4, () => { this.botDirtyTeeth.enabled = false; });

};

Head.prototype.tweenOpacity = function (entity, from, to, time, onComplete) {

    let cacheVec = new pc.Vec2(0, from);

    for (let i = 0; i < entity.render.meshInstances.length; i++) {
        entity.render.meshInstances[i].material.opacityMapOffset = cacheVec;
        entity.render.meshInstances[i].material.update();
    }

    var opacity = { value: from };
    entity
        .tween(opacity)
        .to({ value: to }, time, pc.SineOut)
        .onUpdate(function () {
            cacheVec.set(0, opacity.value);

            for (let i = 0; i < entity.render.meshInstances.length; i++) {
                entity.render.meshInstances[i].material.opacityMapOffset = cacheVec;
                entity.render.meshInstances[i].material.update();
            }

        }.bind(this))
        .onComplete(function () { if (onComplete) onComplete(); }.bind(this))
        .start();

};

Head.prototype.tweenMorphTarget = function (entity, from, to, time, index) {

    var morphVal = { value: from };
    entity
        .tween(morphVal)
        .to({ value: to }, time, pc.Linear)
        .onUpdate(function () {
            entity.render.meshInstances[0].morphInstance.setWeight(index, morphVal.value); // 0 Index is Smile morphTarget, 1 is Angry
        }.bind(this))
        .start();

};

Head.prototype.changeSkin = function (isClean) {

    if (isClean) {
        // TODO
    } else {
        // Debug.log(this.headA.render);
        if (this.headA) {
            this.tweenDiffuse(this.whiteColor, this.redColor, 0.6, this.headA);

        } else {
            this.tweenDiffuse(this.whiteColor, this.redColor, 0.6, this.headB);

        }
    }

};

Head.prototype.dirtyTeeth = function () {
    // Debug.log("dirtyTeeth");

    this.app.fire(EventTypes.PLAY_SFX, Utils.getRandomItem(['wrongPasteApplied1', 'wrongPasteApplied2', 'wrongPasteApplied3']), 200);

    this.app.fire(this.app.events.fever.addPoint, -1);
    this.tweenHead(false);
    this.morphHead(false);
    this.changeSkin(false);
    // this.animateTeeth(true); -> TODO
    this.runVFX(false);
};

Head.prototype.tweenDiffuse = function (fromDiffuse, toDiffuse, duration, entity) {


    let name = this.headAMatName ? this.headAMatName : this.headBMatName;
    Debug.log(name);

    let headBMat = new pc.StandardMaterial();
    let headBtMatAsset = this.app.assets.find(name, "material");
    if (headBtMatAsset && headBtMatAsset.resource) {
        headBMat = headBtMatAsset.resource.clone();
    }


    for (let i = 0; i < entity.render.meshInstances.length; i++) {
        entity.render.meshInstances[i].material = headBMat;
        entity.render.meshInstances[i].material.update();
    }

    this.tweenedProperties = {
        diffuse: fromDiffuse.clone()
    };

    // create a new tween using our script attributes
    let tween = this.app.tween(this.tweenedProperties.diffuse)
        .to(toDiffuse, duration, pc.Linear);

    // update diffuse on each tween update
    tween.onUpdate(function () {
        // Debug.log(entity.render);
        // Debug.log(entity.render.meshInstances);
        for (let i = 0; i < entity.render.meshInstances.length; i++) {
            entity.render.meshInstances[i].material.diffuse = this.tweenedProperties.diffuse;
            entity.render.meshInstances[i].material.emissive = this.tweenedProperties.diffuse;
            entity.render.meshInstances[i].material.update();
        }
    }.bind(this));

    // start the tween
    tween.start();
};


// update code called every frame
Head.prototype.update = function (dt) {

};

// tweenMaterial.js
var TweenMaterial = pc.createScript("tweenMaterial");
TweenMaterial.attributes.add("fromopacityMapOffset", {
    type: "vec2"
}),
    TweenMaterial.attributes.add("toopacityMapOffset", {
        type: "vec2"
    }),
    TweenMaterial.attributes.add("duration", {
        type: "number",
        default: 1
    }),
    TweenMaterial.attributes.add("easing", {
        type: "string",
        default: "Linear"
    }),
    TweenMaterial.attributes.add("delay", {
        type: "number",
        default: 0
    }),
    TweenMaterial.attributes.add("loop", {
        type: "boolean",
        default: !0
    }),
    TweenMaterial.attributes.add("yoyo", {
        type: "boolean",
        default: !1
    }),
    TweenMaterial.attributes.add("repeat", {
        type: "number",
        default: 2
    }),
    TweenMaterial.prototype.initialize = function () {
        this.initialMaterial = this.entity.render.material.clone(),
            this.reset(),
            this.on("attr:fromopacityMapOffset", this.reset, this),
            this.on("attr:toopacityMapOffset", this.reset, this),
            this.on("attr:duration", (function (t) {
                this.tween.duration = t
            }
            ), this),
            this.on("attr:easing", this.reset, this),
            this.on("attr:delay", this.reset, this),
            this.on("attr:loop", this.reset, this),
            this.on("attr:yoyo", this.reset, this),
            this.on("attr:repeat", this.reset, this)
    }
    ,
    TweenMaterial.prototype.reset = function () {
        this.tween && this.tween.stop(),
            this.tweenedProperties = {
                opacityMapOffset: this.fromopacityMapOffset.clone()
            },
            this.entity.render.material = this.initialMaterial.clone(),
            this.entity.render.material.opacityMapOffset = this.fromopacityMapOffset,
            this.entity.render.material.update(),
            this.tween = this.app.tween(this.tweenedProperties.opacityMapOffset).to(this.toopacityMapOffset, this.duration, pc[this.easing]).delay(this.delay).loop(this.loop).yoyo(this.yoyo),
            this.loop || this.tween.repeat(this.repeat),
            this.tween.onUpdate(function () {
                this.entity.render.material.opacityMapOffset = this.tweenedProperties.opacityMapOffset,
                    this.entity.render.material.update()
            }
                .bind(this)),
            this.tween.start()
    }
    ;

// tweenTeethMaterial.js
var TweenTeethMaterial = pc.createScript('tweenTeethMaterial');

// initialize code called once per entity
TweenTeethMaterial.prototype.initialize = function () {
    this.tweenOpacity(this.entity, 0.33, 0.82, 2, null);
    this.cacheVec = new pc.Vec2(0, 0);
};

TweenTeethMaterial.prototype.tweenOpacity = function (entity, from, to, time, onComplete) {
    var opacity = { value: from };
    entity
        .tween(opacity)
        .to({ value: to }, time, pc.SineOut)
       .onUpdate( function () {
            // console.log(opacity.value);
            this.cacheVec.set(0, opacity.value);
            this.entity.render.material.opacityMapOffset = this.cacheVec;
            this.entity.render.material.update();

        }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .start();
};


// update code called every frame
TweenTeethMaterial.prototype.update = function (dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// TweenTeethMaterial.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// PoolController.js
var PoolController = pc.createScript('PoolController');

PoolController.attributes.add('startingID', { title: 'Starting ID', type: 'number' });
PoolController.attributes.add('entityName', { title: 'Name', type: 'string' });
PoolController.attributes.add('capacity', { title: 'Capacity', type: 'number', description: 'Instantiates these much elements on initialize' });
PoolController.attributes.add('container', { title: 'Available Container', type: 'entity' });
PoolController.attributes.add('usedContainer', { title: 'Used Container', type: 'entity' });
PoolController.attributes.add('prefab', { title: 'Template', type: 'asset', assetType: 'template' });

PoolController.attributes.add('events', {
    title: 'Events',
    type: 'json',
    schema: [
        { title: 'Restore', name: 'restore', type: 'string' },
        { title: 'Get', name: 'get', type: 'string' },
        { title: 'Created New', name: 'createdNew', type: 'string' },
    ],
});


// initialize code called once per entity
PoolController.prototype.initialize = function () {
    this.avalibleID = this.startingID;

    if (this.events.restore.length > 0)
        this.app.on(this.events.restore, this.restore, this);

    if (this.events.get.length > 0)
        this.app.on(this.events.get, this.getEvent, this);

    this.on("destroy", this.onDestroy, this);

};

PoolController.prototype.onDestroy = function () {

    if (this.events.restore.length > 0)
        this.app.off(this.events.restore, this.restore, this);

    if (this.events.get.length > 0)
        this.app.off(this.events.get, this.getEvent, this);

};

PoolController.prototype.postInitialize = function () {
    this.initCapacity();
};

// update code called every frame
PoolController.prototype.initCapacity = function () {
    for (let i = 0; i < this.capacity; i++)
        this.createNew().reparent(this.container);
};

PoolController.prototype.getEvent = function (newParent, callback) {
    if (callback) callback(this.get(newParent));
};

PoolController.prototype.get = function (newParent) {
    let count = this.container.children.length;
    let entity = count <= 0 ? this.createNew() : this.container.children[count - 1];
    entity.reparent(newParent || this.usedContainer);
    // console.log("Get: " + entity.name + " => " + entity.enabled);
    return entity;
};

PoolController.prototype.restore = function (entity) {
    // console.log('restore: ' + this.entity.name);
    entity.enabled = false;
    entity.reparent(this.container);
};

PoolController.prototype.createNew = function () {
    let entity = this.prefab.resource.instantiate();
    entity.enabled = false;
    entity.name = `${this.entityName} ${this.avalibleID++}`;
    // console.log('Creating: ' + entity.name + " => " + entity.enabled);
    this.app.root.addChild(entity);
    this.app.fire(this.events.createdNew, entity);
    return entity;
};

// swap method called for script hot-reloading
// inherit your script state here
// PoolController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// LifeController.js
var LifeController = pc.createScript('lifeController');

LifeController.attributes.add('lifeTime', { type: 'number', title: 'Life Time', default: 1 });
LifeController.attributes.add('restoreEvent', { type: 'string', title: 'Restore Event', default: "Restore:PoolName" });

// initialize code called once per entity
LifeController.prototype.initialize = function () {
    this.onEnable();
    this.on('enable', this.onEnable, this);
};

LifeController.prototype.onEnable = function () {
    this.timer = this.lifeTime;
};

// update code called every frame
LifeController.prototype.update = function (dt) {
    if (this.timer <= 0) return;

    this.timer -= dt;
    if (this.timer <= 0)
        this.app.fire(this.restoreEvent, this.entity);
};

// swap method called for script hot-reloading
// inherit your script state here
// LifeController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// SpreadPasteController.js
var SpreadPasteController = pc.createScript('spreadPasteController');

SpreadPasteController.attributes.add('references', {
    title: 'References',
    type: 'json',
    schema: [
        { type: 'entity', title: 'Brush Paste', name: 'brushPaste' },
        // { type: 'entity', title: 'Pools', array: true, name: 'pools' }
    ],
});


SpreadPasteController.attributes.add('settings', {
    title: 'Settings',
    type: 'json',
    schema: [
        { type: 'vec2', title: 'Spawn Delay Range', name: 'spawnDelayRange' },
        { type: 'number', title: 'Spread Range', array: true, name: 'spreadRange' },
        { type: 'vec2', title: 'Scale Range', name: 'scaleRange' },
        { type: 'number', title: 'Y Offset', name: 'yOffset' },
        { type: 'number', title: 'Nozzles Count', name: 'nozzlesCount' },
        { type: 'number', title: 'Nozzles Offset', name: 'nozzlesOffset' },
        { type: 'number', title: 'Spread Distance', name: 'spreadDist' },
    ],
});

SpreadPasteController.attributes.add('pasteColor', { title: 'pasteColor', type: 'rgba' });
SpreadPasteController.attributes.add('shitColor', { title: 'poopColor', type: 'rgba' });


// initialize code called once per entity
SpreadPasteController.prototype.initialize = function () {
    this.isWhitePaste = true;
    this.timers = [];
    this.xMultipliers = [];
    this.pasteType = null;
    this.fever = false;

    this.pools = [];

    this.pools.push(this.app.root.findByTag('ShitPool')[0]);
    this.pools.push(this.app.root.findByTag('ShitSpherePool')[0]);

    this.settings.spawnDelayRange.x = this.app.paste.spawnDelayMin;
    this.settings.spawnDelayRange.y = this.app.paste.spawnDelayMax;
    this.settings.scaleRange.x = this.app.paste.scaleMin;
    this.settings.scaleRange.y = this.app.paste.scaleMax;
    this.settings.spreadDist = this.app.paste.spreadDist;


    for (let i = 0; i < this.settings.nozzlesCount; i++) {
        this.timers.push(0);
    }

    let dist = this.settings.nozzlesOffset;
    if (this.settings.nozzlesCount % 2 === 0) {
        for (let i = 0; i < this.settings.nozzlesCount / 2; i++) {
            this.xMultipliers.push((dist / 2) + (i * dist));
            this.xMultipliers.push(-((dist / 2) + (i * dist)));
        }
    }
    else {
        this.xMultipliers.push(0);
        for (let i = 1; i < this.settings.nozzlesCount / 2; i++) {
            this.xMultipliers.push(i * dist);
            this.xMultipliers.push(-(i * dist));
        }
    }

    this.shitMat = this.app.assets.findByTag("ShitMat")[0];

    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.app.on("Paste:CreatedNew", this.createNewPaste, this);
};

SpreadPasteController.prototype.onDestroy = function () {

    this.app.off("Paste:CreatedNew", this.createNewPaste, this);
    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);

};

SpreadPasteController.prototype.onEnvConfigRcv = function () {

    this.pasteColor.r = EnvironmentConfig.instance.config.whiteSmallPaste.r;
    this.pasteColor.g = EnvironmentConfig.instance.config.whiteSmallPaste.g;
    this.pasteColor.b = EnvironmentConfig.instance.config.whiteSmallPaste.b;

    this.shitColor.r = EnvironmentConfig.instance.config.greenSmallPaste.r;
    this.shitColor.g = EnvironmentConfig.instance.config.greenSmallPaste.g;
    this.shitColor.b = EnvironmentConfig.instance.config.greenSmallPaste.b;

};


SpreadPasteController.prototype.createNewPaste = function (entity) {

    mat = new pc.StandardMaterial();
    mat = this.shitMat.resource.clone();
    for (let i = 0; i < entity.children[0].children[0].render.meshInstances.length; i++) {
        entity.children[0].children[0].render.meshInstances[i].material = mat;
        entity.children[0].children[0].render.meshInstances[i].material.update();
    }

};

// update code called every frame
SpreadPasteController.prototype.update = function (dt) {

};

SpreadPasteController.prototype.onPasteCollected = function (isWhitePaste) {
    this.app.fire(EventTypes.PLAY_SFX, 'pasteCollected', 1250);

    let type = isWhitePaste ? "Paste" : "Shit";
    this.isWhitePaste = isWhitePaste;
    if (this.pasteType === type) return;

    this.pasteType = type;
    this.references.brushPaste.enabled = true;
    this.isWhitePaste = isWhitePaste;

    this.references.brushPaste.model.meshInstances[0].material.diffuse = isWhitePaste ? this.pasteColor : this.shitColor;
    this.references.brushPaste.model.meshInstances[0].material.update();
    // console.log("pasteCollected: ", this.references.brushPaste.model);
    // this.brushPaste.renderer
};

SpreadPasteController.prototype.spreadPaste = function (raycast, brushPos, dt) {

    let distanceFromSurface = Math.dist(raycast.point.z, raycast.point.y, brushPos.z, brushPos.y);
    // console.log("dist: ", raycast);

    if (distanceFromSurface < this.settings.spreadDist && this.pasteType !== null) {
        // console.log("timers: ", this.timers.length);
        this.detectHeadHit(raycast);
        for (let i = 0; i < this.timers.length; i++) {
            this.timers[i] -= dt;
            // console.log(i, " timers: ", this.timers[i]);


            if (this.timers[i] <= 0) {
                // spread paste if any

                this.timers[i] = pc.math.random(this.settings.spawnDelayRange.x, this.settings.spawnDelayRange.y);

                let pos = this.references.brushPaste.getPosition();
                let shit = this.getRandomElement();
                let scale = pc.math.random(this.settings.scaleRange.x, this.settings.scaleRange.y);
                // console.log(shit.model);
                let x = pos.x + this.xMultipliers[i];
                shit.setPosition(x, pos.y + this.settings.yOffset, pos.z);
                shit.setLocalScale(scale, scale, scale);
                shit.enabled = true;

                for (let i = 0; i < shit.children[0].children[0].render.meshInstances.length; i++) {
                    shit.children[0].children[0].render.meshInstances[i].material.diffuse = this.isWhitePaste ? this.pasteColor : this.shitColor;
                    shit.children[0].children[0].render.meshInstances[i].material.update();
                }
                // console.log(shit.children[0].children[0].render.material.diffuse);
            }
        }

        return true;
    }

    return false;
};

SpreadPasteController.prototype.getRandomElement = function () {
    let randomValue = pc.math.random(0, this.pools.length * 5);
    let index = parseInt(randomValue) % this.pools.length;

    // console.log("index: ", index, " | ", parseInt(randomValue), " | ", randomValue);
    return this.pools[index].script.PoolController.get();
};

SpreadPasteController.prototype.detectHeadHit = function (raycast) {
    // console.log(raycast.entity.name, " | ");

    let hasScript = raycast.entity.parent.script;
    if (hasScript) {
        let head = raycast.entity.parent.script.head;
        if (head) {
            // console.log("head: ", head);
            if (head.isMonster && !this.isWhitePaste) {
                // console.log("cleanTeeth M");
                head.entity.fire('cleanTeeth');
            }
            else if (!head.isMonster && this.isWhitePaste) {
                // console.log("cleanTeeth H");
                head.entity.fire('cleanTeeth');
            }
            else {
                // console.log("cleanTeeth D");
                head.entity.fire('dirtyTeeth');
            }
        }
    }
    // try { console.log(raycast.entity.parent.script.head.isMonster); }
    // catch (e) { console.log("E: ", e); }
};


// VfxManager.js
var VfxManager = pc.createScript('vfxManager');

// initialize code called once per entity
VfxManager.prototype.initialize = function () {

    this.app.on("Game:OnCompleted", this.onLevelComplete, this);

    this.on("destroy", this.onDestroy, this);

    // Level end VFX
    this.finishRParticleEffect = this.entity.findByName("FinishRParticleEffect");
    this.finishLParticleEffect = this.entity.findByName("FinishLParticleEffect");
};

VfxManager.prototype.onDestroy = function () {

    this.app.off("Game:OnCompleted", this.onLevelComplete, this);

};

VfxManager.prototype.onLevelComplete = function () {

    this.finishRParticleEffect.particlesystem.reset();
    this.finishRParticleEffect.particlesystem.play();
    this.finishLParticleEffect.particlesystem.reset();
    this.finishLParticleEffect.particlesystem.play();

};

// update code called every frame
VfxManager.prototype.update = function (dt) {

};

// ButtonShine.js
var ButtonShine = pc.createScript('buttonShine');

ButtonShine.attributes.add('speed', { type: 'number' });
ButtonShine.attributes.add('startX', { type: 'number' });
ButtonShine.attributes.add('boundaryX', { type: 'number' });

ButtonShine.prototype.initialize = function (dt) {


};

ButtonShine.prototype.update = function (dt) {

    this.entity.translateLocal(this.speed, 0, 0);
    var pos = this.entity.getLocalPosition();
    if (pos.x < this.boundaryX) {
        this.entity.setLocalPosition(this.startX, 0, 0);
    }

};



// tween.umd.js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TWEEN = {}));
}(this, (function (exports) { 'use strict';

    /**
     * The Ease class provides a collection of easing functions for use with tween.js.
     */
    var Easing = {
        Linear: {
            None: function (amount) {
                return amount;
            },
        },
        Quadratic: {
            In: function (amount) {
                return amount * amount;
            },
            Out: function (amount) {
                return amount * (2 - amount);
            },
            InOut: function (amount) {
                if ((amount *= 2) < 1) {
                    return 0.5 * amount * amount;
                }
                return -0.5 * (--amount * (amount - 2) - 1);
            },
        },
        Cubic: {
            In: function (amount) {
                return amount * amount * amount;
            },
            Out: function (amount) {
                return --amount * amount * amount + 1;
            },
            InOut: function (amount) {
                if ((amount *= 2) < 1) {
                    return 0.5 * amount * amount * amount;
                }
                return 0.5 * ((amount -= 2) * amount * amount + 2);
            },
        },
        Quartic: {
            In: function (amount) {
                return amount * amount * amount * amount;
            },
            Out: function (amount) {
                return 1 - --amount * amount * amount * amount;
            },
            InOut: function (amount) {
                if ((amount *= 2) < 1) {
                    return 0.5 * amount * amount * amount * amount;
                }
                return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
            },
        },
        Quintic: {
            In: function (amount) {
                return amount * amount * amount * amount * amount;
            },
            Out: function (amount) {
                return --amount * amount * amount * amount * amount + 1;
            },
            InOut: function (amount) {
                if ((amount *= 2) < 1) {
                    return 0.5 * amount * amount * amount * amount * amount;
                }
                return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
            },
        },
        Sinusoidal: {
            In: function (amount) {
                return 1 - Math.cos((amount * Math.PI) / 2);
            },
            Out: function (amount) {
                return Math.sin((amount * Math.PI) / 2);
            },
            InOut: function (amount) {
                return 0.5 * (1 - Math.cos(Math.PI * amount));
            },
        },
        Exponential: {
            In: function (amount) {
                return amount === 0 ? 0 : Math.pow(1024, amount - 1);
            },
            Out: function (amount) {
                return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
            },
            InOut: function (amount) {
                if (amount === 0) {
                    return 0;
                }
                if (amount === 1) {
                    return 1;
                }
                if ((amount *= 2) < 1) {
                    return 0.5 * Math.pow(1024, amount - 1);
                }
                return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
            },
        },
        Circular: {
            In: function (amount) {
                return 1 - Math.sqrt(1 - amount * amount);
            },
            Out: function (amount) {
                return Math.sqrt(1 - --amount * amount);
            },
            InOut: function (amount) {
                if ((amount *= 2) < 1) {
                    return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
                }
                return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
            },
        },
        Elastic: {
            In: function (amount) {
                if (amount === 0) {
                    return 0;
                }
                if (amount === 1) {
                    return 1;
                }
                return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
            },
            Out: function (amount) {
                if (amount === 0) {
                    return 0;
                }
                if (amount === 1) {
                    return 1;
                }
                return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
            },
            InOut: function (amount) {
                if (amount === 0) {
                    return 0;
                }
                if (amount === 1) {
                    return 1;
                }
                amount *= 2;
                if (amount < 1) {
                    return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
                }
                return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
            },
        },
        Back: {
            In: function (amount) {
                var s = 1.70158;
                return amount * amount * ((s + 1) * amount - s);
            },
            Out: function (amount) {
                var s = 1.70158;
                return --amount * amount * ((s + 1) * amount + s) + 1;
            },
            InOut: function (amount) {
                var s = 1.70158 * 1.525;
                if ((amount *= 2) < 1) {
                    return 0.5 * (amount * amount * ((s + 1) * amount - s));
                }
                return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
            },
        },
        Bounce: {
            In: function (amount) {
                return 1 - Easing.Bounce.Out(1 - amount);
            },
            Out: function (amount) {
                if (amount < 1 / 2.75) {
                    return 7.5625 * amount * amount;
                }
                else if (amount < 2 / 2.75) {
                    return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
                }
                else if (amount < 2.5 / 2.75) {
                    return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
                }
                else {
                    return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
                }
            },
            InOut: function (amount) {
                if (amount < 0.5) {
                    return Easing.Bounce.In(amount * 2) * 0.5;
                }
                return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
            },
        },
    };

    var now;
    // Include a performance.now polyfill.
    // In node.js, use process.hrtime.
    // eslint-disable-next-line
    // @ts-ignore
    if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
        now = function () {
            // eslint-disable-next-line
            // @ts-ignore
            var time = process.hrtime();
            // Convert [seconds, nanoseconds] to milliseconds.
            return time[0] * 1000 + time[1] / 1000000;
        };
    }
    // In a browser, use self.performance.now if it is available.
    else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
        // This must be bound, because directly assigning this function
        // leads to an invocation exception in Chrome.
        now = self.performance.now.bind(self.performance);
    }
    // Use Date.now if it is available.
    else if (Date.now !== undefined) {
        now = Date.now;
    }
    // Otherwise, use 'new Date().getTime()'.
    else {
        now = function () {
            return new Date().getTime();
        };
    }
    var now$1 = now;

    /**
     * Controlling groups of tweens
     *
     * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
     * In these cases, you may want to create your own smaller groups of tween
     */
    var Group = /** @class */ (function () {
        function Group() {
            this._tweens = {};
            this._tweensAddedDuringUpdate = {};
        }
        Group.prototype.getAll = function () {
            var _this = this;
            return Object.keys(this._tweens).map(function (tweenId) {
                return _this._tweens[tweenId];
            });
        };
        Group.prototype.removeAll = function () {
            this._tweens = {};
        };
        Group.prototype.add = function (tween) {
            this._tweens[tween.getId()] = tween;
            this._tweensAddedDuringUpdate[tween.getId()] = tween;
        };
        Group.prototype.remove = function (tween) {
            delete this._tweens[tween.getId()];
            delete this._tweensAddedDuringUpdate[tween.getId()];
        };
        Group.prototype.update = function (time, preserve) {
            if (time === void 0) { time = now$1(); }
            if (preserve === void 0) { preserve = false; }
            var tweenIds = Object.keys(this._tweens);
            if (tweenIds.length === 0) {
                return false;
            }
            // Tweens are updated in "batches". If you add a new tween during an
            // update, then the new tween will be updated in the next batch.
            // If you remove a tween during an update, it may or may not be updated.
            // However, if the removed tween was added during the current batch,
            // then it will not be updated.
            while (tweenIds.length > 0) {
                this._tweensAddedDuringUpdate = {};
                for (var i = 0; i < tweenIds.length; i++) {
                    var tween = this._tweens[tweenIds[i]];
                    var autoStart = !preserve;
                    if (tween && tween.update(time, autoStart) === false && !preserve) {
                        delete this._tweens[tweenIds[i]];
                    }
                }
                tweenIds = Object.keys(this._tweensAddedDuringUpdate);
            }
            return true;
        };
        return Group;
    }());

    /**
     *
     */
    var Interpolation = {
        Linear: function (v, k) {
            var m = v.length - 1;
            var f = m * k;
            var i = Math.floor(f);
            var fn = Interpolation.Utils.Linear;
            if (k < 0) {
                return fn(v[0], v[1], f);
            }
            if (k > 1) {
                return fn(v[m], v[m - 1], m - f);
            }
            return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
        },
        Bezier: function (v, k) {
            var b = 0;
            var n = v.length - 1;
            var pw = Math.pow;
            var bn = Interpolation.Utils.Bernstein;
            for (var i = 0; i <= n; i++) {
                b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
            }
            return b;
        },
        CatmullRom: function (v, k) {
            var m = v.length - 1;
            var f = m * k;
            var i = Math.floor(f);
            var fn = Interpolation.Utils.CatmullRom;
            if (v[0] === v[m]) {
                if (k < 0) {
                    i = Math.floor((f = m * (1 + k)));
                }
                return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
            }
            else {
                if (k < 0) {
                    return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
                }
                if (k > 1) {
                    return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
                }
                return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
            }
        },
        Utils: {
            Linear: function (p0, p1, t) {
                return (p1 - p0) * t + p0;
            },
            Bernstein: function (n, i) {
                var fc = Interpolation.Utils.Factorial;
                return fc(n) / fc(i) / fc(n - i);
            },
            Factorial: (function () {
                var a = [1];
                return function (n) {
                    var s = 1;
                    if (a[n]) {
                        return a[n];
                    }
                    for (var i = n; i > 1; i--) {
                        s *= i;
                    }
                    a[n] = s;
                    return s;
                };
            })(),
            CatmullRom: function (p0, p1, p2, p3, t) {
                var v0 = (p2 - p0) * 0.5;
                var v1 = (p3 - p1) * 0.5;
                var t2 = t * t;
                var t3 = t * t2;
                return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
            },
        },
    };

    /**
     * Utils
     */
    var Sequence = /** @class */ (function () {
        function Sequence() {
        }
        Sequence.nextId = function () {
            return Sequence._nextId++;
        };
        Sequence._nextId = 0;
        return Sequence;
    }());

    var mainGroup = new Group();

    /**
     * Tween.js - Licensed under the MIT license
     * https://github.com/tweenjs/tween.js
     * ----------------------------------------------
     *
     * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
     * Thank you all, you're awesome!
     */
    var Tween = /** @class */ (function () {
        function Tween(_object, _group) {
            if (_group === void 0) { _group = mainGroup; }
            this._object = _object;
            this._group = _group;
            this._isPaused = false;
            this._pauseStart = 0;
            this._valuesStart = {};
            this._valuesEnd = {};
            this._valuesStartRepeat = {};
            this._duration = 1000;
            this._initialRepeat = 0;
            this._repeat = 0;
            this._yoyo = false;
            this._isPlaying = false;
            this._reversed = false;
            this._delayTime = 0;
            this._startTime = 0;
            this._easingFunction = Easing.Linear.None;
            this._interpolationFunction = Interpolation.Linear;
            this._chainedTweens = [];
            this._onStartCallbackFired = false;
            this._id = Sequence.nextId();
            this._isChainStopped = false;
            this._goToEnd = false;
        }
        Tween.prototype.getId = function () {
            return this._id;
        };
        Tween.prototype.isPlaying = function () {
            return this._isPlaying;
        };
        Tween.prototype.isPaused = function () {
            return this._isPaused;
        };
        Tween.prototype.to = function (properties, duration) {
            // TODO? restore this, then update the 07_dynamic_to example to set fox
            // tween's to on each update. That way the behavior is opt-in (there's
            // currently no opt-out).
            // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
            this._valuesEnd = Object.create(properties);
            if (duration !== undefined) {
                this._duration = duration;
            }
            return this;
        };
        Tween.prototype.duration = function (d) {
            this._duration = d;
            return this;
        };
        Tween.prototype.start = function (time) {
            if (this._isPlaying) {
                return this;
            }
            // eslint-disable-next-line
            this._group && this._group.add(this);
            this._repeat = this._initialRepeat;
            if (this._reversed) {
                // If we were reversed (f.e. using the yoyo feature) then we need to
                // flip the tween direction back to forward.
                this._reversed = false;
                for (var property in this._valuesStartRepeat) {
                    this._swapEndStartRepeatValues(property);
                    this._valuesStart[property] = this._valuesStartRepeat[property];
                }
            }
            this._isPlaying = true;
            this._isPaused = false;
            this._onStartCallbackFired = false;
            this._isChainStopped = false;
            this._startTime = time !== undefined ? (typeof time === 'string' ? now$1() + parseFloat(time) : time) : now$1();
            this._startTime += this._delayTime;
            this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
            return this;
        };
        Tween.prototype._setupProperties = function (_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
            for (var property in _valuesEnd) {
                var startValue = _object[property];
                var startValueIsArray = Array.isArray(startValue);
                var propType = startValueIsArray ? 'array' : typeof startValue;
                var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
                // If `to()` specifies a property that doesn't exist in the source object,
                // we should not set that property in the object
                if (propType === 'undefined' || propType === 'function') {
                    continue;
                }
                // Check if an Array was provided as property value
                if (isInterpolationList) {
                    var endValues = _valuesEnd[property];
                    if (endValues.length === 0) {
                        continue;
                    }
                    // handle an array of relative values
                    endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
                    // Create a local copy of the Array with the start value at the front
                    _valuesEnd[property] = [startValue].concat(endValues);
                }
                // handle the deepness of the values
                if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                    _valuesStart[property] = startValueIsArray ? [] : {};
                    // eslint-disable-next-line
                    for (var prop in startValue) {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        _valuesStart[property][prop] = startValue[prop];
                    }
                    _valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
                }
                else {
                    // Save the starting value, but only once.
                    if (typeof _valuesStart[property] === 'undefined') {
                        _valuesStart[property] = startValue;
                    }
                    if (!startValueIsArray) {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                    }
                    if (isInterpolationList) {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
                    }
                    else {
                        _valuesStartRepeat[property] = _valuesStart[property] || 0;
                    }
                }
            }
        };
        Tween.prototype.stop = function () {
            if (!this._isChainStopped) {
                this._isChainStopped = true;
                this.stopChainedTweens();
            }
            if (!this._isPlaying) {
                return this;
            }
            // eslint-disable-next-line
            this._group && this._group.remove(this);
            this._isPlaying = false;
            this._isPaused = false;
            if (this._onStopCallback) {
                this._onStopCallback(this._object);
            }
            return this;
        };
        Tween.prototype.end = function () {
            this._goToEnd = true;
            this.update(Infinity);
            return this;
        };
        Tween.prototype.pause = function (time) {
            if (time === void 0) { time = now$1(); }
            if (this._isPaused || !this._isPlaying) {
                return this;
            }
            this._isPaused = true;
            this._pauseStart = time;
            // eslint-disable-next-line
            this._group && this._group.remove(this);
            return this;
        };
        Tween.prototype.resume = function (time) {
            if (time === void 0) { time = now$1(); }
            if (!this._isPaused || !this._isPlaying) {
                return this;
            }
            this._isPaused = false;
            this._startTime += time - this._pauseStart;
            this._pauseStart = 0;
            // eslint-disable-next-line
            this._group && this._group.add(this);
            return this;
        };
        Tween.prototype.stopChainedTweens = function () {
            for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                this._chainedTweens[i].stop();
            }
            return this;
        };
        Tween.prototype.group = function (group) {
            this._group = group;
            return this;
        };
        Tween.prototype.delay = function (amount) {
            this._delayTime = amount;
            return this;
        };
        Tween.prototype.repeat = function (times) {
            this._initialRepeat = times;
            this._repeat = times;
            return this;
        };
        Tween.prototype.repeatDelay = function (amount) {
            this._repeatDelayTime = amount;
            return this;
        };
        Tween.prototype.yoyo = function (yoyo) {
            this._yoyo = yoyo;
            return this;
        };
        Tween.prototype.easing = function (easingFunction) {
            this._easingFunction = easingFunction;
            return this;
        };
        Tween.prototype.interpolation = function (interpolationFunction) {
            this._interpolationFunction = interpolationFunction;
            return this;
        };
        Tween.prototype.chain = function () {
            var tweens = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tweens[_i] = arguments[_i];
            }
            this._chainedTweens = tweens;
            return this;
        };
        Tween.prototype.onStart = function (callback) {
            this._onStartCallback = callback;
            return this;
        };
        Tween.prototype.onUpdate = function (callback) {
            this._onUpdateCallback = callback;
            return this;
        };
        Tween.prototype.onRepeat = function (callback) {
            this._onRepeatCallback = callback;
            return this;
        };
        Tween.prototype.onComplete = function (callback) {
            this._onCompleteCallback = callback;
            return this;
        };
        Tween.prototype.onStop = function (callback) {
            this._onStopCallback = callback;
            return this;
        };
        /**
         * @returns true if the tween is still playing after the update, false
         * otherwise (calling update on a paused tween still returns true because
         * it is still playing, just paused).
         */
        Tween.prototype.update = function (time, autoStart) {
            if (time === void 0) { time = now$1(); }
            if (autoStart === void 0) { autoStart = true; }
            if (this._isPaused)
                return true;
            var property;
            var elapsed;
            var endTime = this._startTime + this._duration;
            if (!this._goToEnd && !this._isPlaying) {
                if (time > endTime)
                    return false;
                if (autoStart)
                    this.start(time);
            }
            this._goToEnd = false;
            if (time < this._startTime) {
                return true;
            }
            if (this._onStartCallbackFired === false) {
                if (this._onStartCallback) {
                    this._onStartCallback(this._object);
                }
                this._onStartCallbackFired = true;
            }
            elapsed = (time - this._startTime) / this._duration;
            elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
            var value = this._easingFunction(elapsed);
            // properties transformations
            this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
            if (this._onUpdateCallback) {
                this._onUpdateCallback(this._object, elapsed);
            }
            if (elapsed === 1) {
                if (this._repeat > 0) {
                    if (isFinite(this._repeat)) {
                        this._repeat--;
                    }
                    // Reassign starting values, restart by making startTime = now
                    for (property in this._valuesStartRepeat) {
                        if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                            this._valuesStartRepeat[property] =
                                // eslint-disable-next-line
                                // @ts-ignore FIXME?
                                this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                        }
                        if (this._yoyo) {
                            this._swapEndStartRepeatValues(property);
                        }
                        this._valuesStart[property] = this._valuesStartRepeat[property];
                    }
                    if (this._yoyo) {
                        this._reversed = !this._reversed;
                    }
                    if (this._repeatDelayTime !== undefined) {
                        this._startTime = time + this._repeatDelayTime;
                    }
                    else {
                        this._startTime = time + this._delayTime;
                    }
                    if (this._onRepeatCallback) {
                        this._onRepeatCallback(this._object);
                    }
                    return true;
                }
                else {
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback(this._object);
                    }
                    for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                        // Make the chained tweens start exactly at the time they should,
                        // even if the `update()` method was called way past the duration of the tween
                        this._chainedTweens[i].start(this._startTime + this._duration);
                    }
                    this._isPlaying = false;
                    return false;
                }
            }
            return true;
        };
        Tween.prototype._updateProperties = function (_object, _valuesStart, _valuesEnd, value) {
            for (var property in _valuesEnd) {
                // Don't update properties that do not exist in the source object
                if (_valuesStart[property] === undefined) {
                    continue;
                }
                var start = _valuesStart[property] || 0;
                var end = _valuesEnd[property];
                var startIsArray = Array.isArray(_object[property]);
                var endIsArray = Array.isArray(end);
                var isInterpolationList = !startIsArray && endIsArray;
                if (isInterpolationList) {
                    _object[property] = this._interpolationFunction(end, value);
                }
                else if (typeof end === 'object' && end) {
                    // eslint-disable-next-line
                    // @ts-ignore FIXME?
                    this._updateProperties(_object[property], start, end, value);
                }
                else {
                    // Parses relative end values with start as base (e.g.: +10, -3)
                    end = this._handleRelativeValue(start, end);
                    // Protect against non numeric properties.
                    if (typeof end === 'number') {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        _object[property] = start + (end - start) * value;
                    }
                }
            }
        };
        Tween.prototype._handleRelativeValue = function (start, end) {
            if (typeof end !== 'string') {
                return end;
            }
            if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                return start + parseFloat(end);
            }
            else {
                return parseFloat(end);
            }
        };
        Tween.prototype._swapEndStartRepeatValues = function (property) {
            var tmp = this._valuesStartRepeat[property];
            var endValue = this._valuesEnd[property];
            if (typeof endValue === 'string') {
                this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
            }
            else {
                this._valuesStartRepeat[property] = this._valuesEnd[property];
            }
            this._valuesEnd[property] = tmp;
        };
        return Tween;
    }());

    var VERSION = '18.6.4';

    /**
     * Tween.js - Licensed under the MIT license
     * https://github.com/tweenjs/tween.js
     * ----------------------------------------------
     *
     * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
     * Thank you all, you're awesome!
     */
    var nextId = Sequence.nextId;
    /**
     * Controlling groups of tweens
     *
     * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
     * In these cases, you may want to create your own smaller groups of tweens.
     */
    var TWEEN = mainGroup;
    // This is the best way to export things in a way that's compatible with both ES
    // Modules and CommonJS, without build hacks, and so as not to break the
    // existing API.
    // https://github.com/rollup/rollup/issues/1961#issuecomment-423037881
    var getAll = TWEEN.getAll.bind(TWEEN);
    var removeAll = TWEEN.removeAll.bind(TWEEN);
    var add = TWEEN.add.bind(TWEEN);
    var remove = TWEEN.remove.bind(TWEEN);
    var update = TWEEN.update.bind(TWEEN);
    var exports$1 = {
        Easing: Easing,
        Group: Group,
        Interpolation: Interpolation,
        now: now$1,
        Sequence: Sequence,
        nextId: nextId,
        Tween: Tween,
        VERSION: VERSION,
        getAll: getAll,
        removeAll: removeAll,
        add: add,
        remove: remove,
        update: update,
    };

    exports.Easing = Easing;
    exports.Group = Group;
    exports.Interpolation = Interpolation;
    exports.Sequence = Sequence;
    exports.Tween = Tween;
    exports.VERSION = VERSION;
    exports.add = add;
    exports.default = exports$1;
    exports.getAll = getAll;
    exports.nextId = nextId;
    exports.now = now$1;
    exports.remove = remove;
    exports.removeAll = removeAll;
    exports.update = update;

    Object.defineProperty(exports, '__esModule', { value: true });

})));


// EasyTween.js
var Tween = pc.createScript('tween');

Tween.attributes.add('tweens', {
    type: 'json',
    schema: [
        {
            name: 'autoPlay',
            title: 'Autoplay',
            description: 'Play tween immediately.',
            type: 'boolean',
            default: false
        }, {
            name: 'event',
            title: 'Trigger Event',
            description: 'Play tween on the specified event name. This event must be fired on the global application object (e.g. this.app.fire(\'eventname\');).',
            type: 'string'
        }, {
            name: 'path',
            title: 'Path',
            description: 'The path from the entity to the property. e.g. \'light.color\', \'camera.fov\' or \'script.vehicle.speed\'.',
            type: 'string'
        }, {
            name: 'relative',
            title: 'Relative',
            description: 'If checked, the start value is ingored and the end value will be the relative offset from the property\'s current value.',
            type: 'boolean',
            default: false
        }, {
            name: 'start',
            title: 'Start',
            type: 'vec4'
        }, {
            name: 'end',
            title: 'End',
            type: 'vec4'
        }, {
            name: 'easingFunction',
            title: 'Easing Function',
            type: 'number',
            enum: [
                { 'Linear': 0 },
                { 'Quadratic': 1 },
                { 'Cubic': 2 },
                { 'Quartic': 3 },
                { 'Quintic': 4 },
                { 'Sinusoidal': 5 },
                { 'Exponential': 6 },
                { 'Circular': 7 },
                { 'Elastic': 8 },
                { 'Back': 9 },
                { 'Bounce': 10 }
            ]
        }, {
            name: 'easingType',
            title: 'Easing Type',
            type: 'number',
            enum: [
                { 'In': 0 },
                { 'Out': 1 },
                { 'InOut': 2 }
            ]
        }, {
            name: 'duration',
            title: 'Duration',
            description: 'Time to execute the tween in milliseconds. Defaults to 1000.',
            type: 'number',
            default: 1000
        }, {
            name: 'delay',
            title: 'Delay',
            description: 'Time to wait in milliseconds after receiving the trigger event before executing the tween. Defaults to 0.',
            type: 'number',
            default: 0
        }, {
            name: 'repeat',
            title: 'Repeat',
            description: 'The number of times the tween should be repeated after the initial playback. Defaults to 0.',
            type: 'number',
            default: 0
        }, {
            name: 'repeatDelay',
            title: 'Repeat Delay',
            description: 'Time to wait in milliseconds before executing each repeat of the tween. Defaults to 0.',
            type: 'number',
            default: 0
        }, {
            name: 'yoyo',
            title: 'Yoyo',
            description: 'This function only has effect if used along with repeat. When active, the behaviour of the tween will be like a yoyo, i.e. it will bounce to and from the start and end values, instead of just repeating the same sequence from the beginning. Defaults to false.',
            type: 'boolean',
            default: false
        }, {
            name: 'startEvent',
            title: 'Start Event',
            description: 'Executed right before the tween starts animating, after any delay time specified by the delay method. This will be executed only once per tween, i.e. it will not be run when the tween is repeated via repeat(). It is great for synchronising to other events or triggering actions you want to happen when a tween starts.',
            type: 'string'
        }, {
            name: 'stopEvent',
            title: 'Stop Event',
            description: 'Executed when a tween is explicitly stopped via stop(), but not when it is completed normally.',
            type: 'string'
        }, {
            name: 'updateEvent',
            title: 'Update Event',
            description: 'Executed each time the tween is updated, after the values have been actually updated.',
            type: 'string'
        }, {
            name: 'completeEvent',
            title: 'Complete Event',
            description: 'Executed when a tween is finished normally (i.e. not stopped).',
            type: 'string'
        }, {
            name: 'repeatEvent',
            title: 'Repeat Event',
            description: 'Executed whenever a tween has just finished one repetition and will begin another.',
            type: 'string'
        }
    ],
    array: true
});

// initialize code called once per entity
Tween.prototype.initialize = function () {
    var app = this.app;
    var i;

    this.tweenInstances = [];
    this.tweenCallbacks = [];

    var makeStartCallback = function (i) {
        return function () {
            this.start(i);
        };
    };

    for (i = 0; i < this.tweens.length; i++) {
        var tween = this.tweens[i];
        if (tween.autoPlay) {
            this.start(i);
        }
        if (tween.event.length > 0) {
            this.tweenCallbacks[i] = {
                event: tween.event,
                cb: makeStartCallback(i)
            };
            app.on(this.tweenCallbacks[i].event, this.tweenCallbacks[i].cb, this);
        }
    }

    this.on('enable', function () {
        for (i = 0; i < this.tweens.length; i++) {
            if (this.tweenInstances[i] && this.tweenInstances[i].isPaused()) {
                this.tweenInstances[i].resume();
            }
        }
    });

    this.on('disable', function () {
        for (i = 0; i < this.tweens.length; i++) {
            if (this.tweenInstances[i]) {
                this.tweenInstances[i].pause();
            }
        }
    });

    this.on('attr', function (name, value, prev) {
        for (i = 0; i < this.tweenCallbacks.length; i++) {
            if (this.tweenCallbacks[i]) {
                app.off(this.tweenCallbacks[i].event, this.tweenCallbacks[i].cb, this);
                this.tweenCallbacks[i] = null;
            }
        }

        for (i = 0; i < this.tweens.length; i++) {
            var tween = this.tweens[i];
            if (tween.event.length > 0) {
                this.tweenCallbacks[i] = {
                    event: tween.event,
                    cb: makeStartCallback(i)
                };
                app.on(this.tweenCallbacks[i].event, this.tweenCallbacks[i].cb, this);
            }
        }
    });
};

Tween.prototype.start = function (idx) {
    var app = this.app;
    var tween = this.tweens[idx];

    var easingTypes = ['In', 'Out', 'InOut'];
    var easingFuncs = ['Linear', 'Quadratic', 'Cubic', 'Quartic', 'Quintic', 'Sinusoidal', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce'];

    var easingFunc;
    if (tween.easingFunction === 0) {
        easingFunc = TWEEN.Easing[easingFuncs[tween.easingFunction]].None;
    } else {
        easingFunc = TWEEN.Easing[easingFuncs[tween.easingFunction]][easingTypes[tween.easingType]];
    }

    var tweenInstances = this.tweenInstances;
    if (tweenInstances[idx]) {
        tweenInstances[idx].stop();
    }

    var pathSegments = tween.path.split('.');
    var propertyOwner = this.entity;
    for (i = 0; i < pathSegments.length - 1; i++) {
        propertyOwner = propertyOwner[pathSegments[i]];
    }

    var propertyName = pathSegments[pathSegments.length - 1];
    var property = propertyOwner[propertyName];

    var startValue, endValue;
    var isNumber = typeof property === 'number';
    var start = tween.start;
    var end = tween.end;
    if (isNumber) {
        startValue = { x: start.x };
        endValue = { x: end.x };
    } else if (property instanceof pc.Vec2) {
        startValue = new pc.Vec2(start.x, start.y);
        endValue = new pc.Vec2(end.x, end.y);
    } else if (property instanceof pc.Vec3) {
        startValue = new pc.Vec3(start.x, start.y, start.z);
        endValue = new pc.Vec3(end.x, end.y, end.z);
    } else if (property instanceof pc.Vec4) {
        startValue = start.clone();
        endValue = end.clone();
    } else if (property instanceof pc.Color) {
        startValue = new pc.Color(start.x, start.y, start.z, start.w);
        endValue = new pc.Color(end.x, end.y, end.z, end.w);
    } else {
        console.error('ERROR: tween - specified property must be a number, vec2, vec3, vec4 or color');
        return;
    }

    propertyOwner[propertyName] = isNumber ? startValue.x : startValue;

    switch (propertyName) {
        case 'localPosition':
            propertyOwner.setLocalPosition(startValue);
            break;
        case 'localEulerAngles':
            propertyOwner.setLocalEulerAngles(startValue);
            break;
        case 'localScale':
            propertyOwner.setLocalScale(startValue);
            break;
        case 'position':
            propertyOwner.setPosition(startValue);
            break;
        case 'eulerAngles':
            propertyOwner.setEulerAngles(startValue);
            break;
    }

    if (propertyOwner instanceof pc.Material) {
        propertyOwner.update();
    }

    tweenInstances[idx] = new TWEEN.Tween(startValue)
        .to(endValue, tween.duration)
        .easing(easingFunc)
        .onStart(function (obj) {
            if (tween.startEvent !== '') {
                app.fire(tween.startEvent);
            }
        })
        .onStop(function (obj) {
            if (tween.stopEvent !== '') {
                app.fire(tween.stopEvent);
            }
            tweenInstances[idx] = null;
        })
        .onUpdate(function (obj) {
            propertyOwner[propertyName] = isNumber ? obj.x : obj;

            switch (propertyName) {
                case 'localPosition':
                    propertyOwner.setLocalPosition(obj);
                    break;
                case 'localEulerAngles':
                    propertyOwner.setLocalEulerAngles(obj);
                    break;
                case 'localScale':
                    propertyOwner.setLocalScale(obj);
                    break;
                case 'position':
                    propertyOwner.setPosition(obj);
                    break;
                case 'eulerAngles':
                    propertyOwner.setEulerAngles(obj);
                    break;
            }

            if (propertyOwner instanceof pc.Material) {
                propertyOwner.update();
            }

            if (tween.updateEvent !== '') {
                app.fire(tween.updateEvent);
            }
        })
        .onComplete(function (obj) {
            if (tween.completeEvent !== '') {
                app.fire(tween.completeEvent);
            }
            tweenInstances[idx] = null;
        })
        .onRepeat(function (obj) {
            if (tween.repeatEvent !== '') {
                app.fire(tween.repeatEvent);
            }
        })
        .repeat(tween.repeat)
        .repeatDelay(tween.repeatDelay)
        .yoyo(tween.yoyo)
        .delay(tween.delay)
        .start();
};

// We have to update the tween.js engine somewhere once a frame...
var app = pc.Application.getApplication();
if (app) {
    app.on('update', function (dt) {
        TWEEN.update();
    });
}


// rotateUI.js
var RotateUi = pc.createScript('rotateUi');

// initialize code called once per entity
RotateUi.prototype.initialize = function () {
    this.tweenRotation(this.entity, 0, 180, 20, null);
};

// update code called every frame
RotateUi.prototype.update = function (dt) {

};

RotateUi.prototype.tweenRotation = function (entity, from, to, time, onComplete) {
    var rot = { value: from };
    entity
        .tween(rot)
        .to({ value: to }, time, pc.Linear)
       .onUpdate( function () {
            entity.setLocalEulerAngles(0, 0, rot.value);
        }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .loop(true)
        .start();
};


// FeverController.js
var FeverController = pc.createScript('feverController');

FeverController.attributes.add('totalFeverPoints', { type: 'number', title: 'Total Fever Points' });
FeverController.attributes.add('feverDuration', { type: 'number', title: 'Fever Duration' });
FeverController.attributes.add('feverSpeedMul', { type: 'number', title: 'Fever Speed Multiplier' });

// initialize code called once per entity
FeverController.prototype.initialize = function () {
    this.currentFeverPoints = 0;
    this.feverTimer = 0;

    this.app.on(this.app.events.fever.addPoint, this.addFeverPoint, this);

    this.on("destroy", this.onDestroy, this);
};

FeverController.prototype.onDestroy = function () {

    this.app.off(this.app.events.fever.addPoint, this.addFeverPoint, this);

};

FeverController.prototype.postInitialize = function () {
    this.app.fire(this.app.events.fever.valueUpdated, 0, this.totalFeverPoints);
};

// update code called every frame
FeverController.prototype.update = function (dt) {
    if (this.feverTimer <= 0) return;

    this.feverTimer -= dt;
    if (this.feverTimer <= 0) {
        this.finishFever();
    }
};

FeverController.prototype.finishFever = function () {
    this.currentFeverPoints = 0;
    this.feverTimer = 0;
    this.app.fire(this.app.events.fever.finish, 1);
    this.app.fire(this.app.events.fever.valueUpdated, this.currentFeverPoints, this.totalFeverPoints);
};

FeverController.prototype.addFeverPoint = function (point) {

    if (point <= 0) {
        this.finishFever();
        return;
    }

    if (this.feverTimer === 0) {
        this.currentFeverPoints += point;
        this.app.fire(this.app.events.fever.valueUpdated, this.currentFeverPoints, this.totalFeverPoints);

        if (this.currentFeverPoints >= this.totalFeverPoints) {
            this.startFever();
        }
    }
};

FeverController.prototype.startFever = function () {
    this.app.fire('Missions:ProgressFeverCount', 1);

    this.app.fire(EventTypes.PLAY_SFX, 'fever');

    this.feverTimer = this.feverDuration;
    this.app.fire(this.app.events.fever.start, this.feverSpeedMul);
};



// SpeedController.js
var SpeedController = pc.createScript('speedController');

SpeedController.attributes.add('incrementDuration', { type: 'number', title: 'Increment Duration' });
SpeedController.attributes.add('maxLevel', { type: 'number', title: 'Max Level' });

SpeedController.attributes.add('playerSettings', {
    type: 'json',
    title: 'Player Controller',
    schema: [
        { name: 'speed', title: 'Speed', type: 'number' },
        { name: 'increment', title: 'Increment', type: 'number' },
    ],
});

SpeedController.attributes.add('cameraSettings', {
    type: 'json',
    title: 'Camera Controller',
    schema: [
        { name: 'speed', title: 'Speed', type: 'number' },
        { name: 'increment', title: 'Increment', type: 'number' },
    ],
});

// initialize code called once per entity
SpeedController.prototype.initialize = function () {
    this.isGameStarted = false;
    this.feverMultiplier = 1;

    this.speedLevel = 1;
    this.speedIncrementTimer = this.incrementDuration;

    this.playerSpeed = new pc.Vec3(0, 0, this.playerSettings.speed);
    this.cameraSpeed = new pc.Vec3(0, 0, this.cameraSettings.speed);

    this.app.on(this.app.events.game.requestStart, this.onGameStartRequested, this);
    this.app.on(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.on(this.app.events.fever.start, this.setFever, this);
    this.app.on(this.app.events.fever.finish, this.setFever, this); // ?? Faiq
    this.app.on(this.app.events.fever.addPoint, this.resetSpeed, this);

    this.on("destroy", this.onDestroy, this);

};

SpeedController.prototype.onDestroy = function () {
    this.app.off(this.app.events.game.requestStart, this.onGameStartRequested, this);
    this.app.off(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.off(this.app.events.fever.start, this.setFever, this);
    this.app.off(this.app.events.fever.finish, this.setFever, this);
    this.app.off(this.app.events.fever.addPoint, this.resetSpeed, this);
};

SpeedController.prototype.onGameStartRequested = async function (isStarted) {
    if (isStarted) {
        /* tracking */
        APIMediator.track({
            event: "GA:Progression",
            progressionStatus: "Start",
            progression01: "Level" + LevelManager.getInstance().getCurrentLevel()
        });

        await APIMediator.gameStart(LevelManager.getInstance().getCurrentLevel());
    }
    this.app.fire(this.app.events.game.start, isStarted);
};

SpeedController.prototype.onGameStartEnv = async function (isStarted) {
    this.isGameStarted = isStarted;
};

SpeedController.prototype.postInitialize = function () {
    this.app.fire(this.app.events.speed.valueUpdated, 0, this.maxLevel);
};

// update code called every frame
SpeedController.prototype.update = function (dt) {
    if (!this.isGameStarted) return;
    this.handleSpeedIncrements(dt);
};

SpeedController.prototype.handleSpeedIncrements = function (dt) {
    if (this.speedLevel >= this.maxLevel) return;

    this.speedIncrementTimer -= dt;

    if (this.speedIncrementTimer <= 0) {
        this.speedIncrementTimer = this.incrementDuration;
        this.speedLevel++;
        // Debug.log("Speed Level: ", this.speedLevel);
        this.updateSpeed();
    }
};

SpeedController.prototype.setFever = function (multiplier) {
    Debug.log("resetSpeed");
    this.feverMultiplier = multiplier;
    this.updateSpeed();
};

SpeedController.prototype.updateSpeed = function () {
    this.playerSpeed.set(0, 0, this.playerSettings.speed * this.feverMultiplier + (this.speedLevel * this.playerSettings.increment));
    this.cameraSpeed.set(0, 0, this.cameraSettings.speed * this.feverMultiplier + (this.speedLevel * this.cameraSettings.increment));

    this.app.fire("Player:SetSpeed", this.playerSpeed);
    this.app.fire("Camera:SetSpeed", this.cameraSpeed);
    this.app.fire(this.app.events.speed.valueUpdated, this.speedLevel, this.maxLevel);
};

SpeedController.prototype.resetSpeed = function (point) {
    if (point > 0) return;

    this.speedLevel = 1;
    this.speedIncrementTimer = this.incrementDuration;

    this.updateSpeed();
};


// chestTween.js
var ChestTween = pc.createScript('chestTween');

ChestTween.attributes.add('isTop', { title: 'isTopChest', type: 'boolean' });

// initialize code called once per entity
ChestTween.prototype.initialize = function () {
    if (this.isTop) {

    } else {
        this.entity
            .tween(this.entity.getLocalScale())
            .to(new pc.Vec3(1.1, 1.1, 1), 0.1, pc.SineOut)
            .loop(true)
            .delay(1.0)

            .yoyo(true)
            .start();
    }
};

// update code called every frame
ChestTween.prototype.update = function (dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// ChestTween.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// MenuManager.js
var MenuManager = pc.createScript('menuManager');

MenuManager.attributes.add('allPanels', {
    type: 'json',
    schema: [
        { name: 'overlay', type: 'boolean' },
        { name: 'panel', type: 'entity' },
    ],
    array: true
});

MenuManager.States = {
    Main: 0,
    Gameplay: 1,
    Mission: 2,
    Settings: 3,
    Shop: 4,
    LevelEnd: 5,
    CloseOverlay: 6
};

// initialize code called once per entity
MenuManager.prototype.initialize = function () {
    Debug.log("initialize");
    MenuManager.Instance = this;

    this.defaultScaleBlend = this.entity.screen.scaleBlend;

    this.prevState = MenuManager.States.Main;
    this.currentState = MenuManager.States.Gameplay;
    this.currentOverlays = [];

    this.changeState(MenuManager.States.Main);

    this.on("destroy", this.onDestroy, this);
    this.app.on(this.app.events.menuManager.changeState, this.changeState, this);
    this.app.on(EventTypes.Screen.SET_SCALE_BLEND, this.setScaleBlend, this);
};

MenuManager.prototype.setScaleBlend = function (scaleBlend) {
    this.entity.screen.scaleBlend = scaleBlend;
};

MenuManager.prototype.onDestroy = function () {

    this.app.off(this.app.events.menuManager.changeState, this.changeState, this);

};

// update code called every frame
MenuManager.prototype.update = function (dt) {

};

MenuManager.prototype.changeState = async function (newState, force = false) {

    if (newState === MenuManager.States.Shop) {
        this.setScaleBlend(ScaleManager.getInstance().isPortrait() ? 0 : this.defaultScaleBlend);
    } else {
        this.setScaleBlend(this.defaultScaleBlend);
    }

    if (this.currentState !== newState && (newState === MenuManager.States.Settings || newState === MenuManager.States.Shop || newState === MenuManager.States.Mission)) {
        await APIMediator.gamePause();
    } else if (this._lastRequestedState !== newState && (this._lastRequestedState === MenuManager.States.Settings || this._lastRequestedState === MenuManager.States.Shop || this._lastRequestedState === MenuManager.States.Mission)) {
        await APIMediator.gameResume();
    }

    this._lastRequestedState = newState;

    Debug.log("changeState", newState);
    if (this.currentState === newState) {
        if (!force) return;
    }

    if (this.manageOverlayState(newState)) return;

    // Debug.log("Not overlay");

    this.prevState = this.currentState;
    this.currentState = newState;

    var prevPanel = this.allPanels[this.prevState].panel;
    var currentPanel = this.allPanels[this.currentState].panel;

    // if (!this.allPanels[this.currentState].overlay)
    //     prevPanel.enabled = false;

    currentPanel.enabled = true;
    currentPanel.fire('fade', true);
    if (prevPanel && prevPanel !== currentPanel) {
        prevPanel.fire('fade', false);
    }
};

MenuManager.prototype.manageOverlayState = function (state) {

    if (this.currentOverlays.length > 0 && state === MenuManager.States.CloseOverlay) {
        let i = this.currentOverlays.pop();
        this.allPanels[i].panel.fire('fade', false);
        // this.allPanels[i].panel.enabled = false;
        return true;
    }

    if (this.allPanels[state].overlay) {
        this.allPanels[state].panel.enabled = true;
        this.allPanels[state].panel.fire('fade', true);
        this.currentOverlays.push(state);
    }

    return this.allPanels[state].overlay;
};


// obstacleAnimation.js
var ObstacleAnimation = pc.createScript('obstacleAnimation');

ObstacleAnimation.attributes.add('isAirObs', { title: 'isAirObs', type: 'boolean', default: false });

// initialize code called once per entity
ObstacleAnimation.prototype.initialize = function () {

    this.entity.on("onObstacleHit", this.playAnim, this);
    this.isObsHit = false;
    this.on("destroy", this.onDestroy, this);

};

ObstacleAnimation.prototype.onDestroy = function () {

    this.entity.off("onObstacleHit", this.playAnim, this);

};

ObstacleAnimation.prototype.playAnim = function () {

    if (this.isObsHit)
        return;

    this.isObsHit = true;
    this.app.fire("camera:shake"); // Shake Camera
    this.entity.findByName("Collision").enabled = false;

    this.app.fire('effects:damage');
    this.app.fire(EventTypes.PLAY_SFX, 'obstacle', 175);

    // Reset Fever 

    if (this.isAirObs) {
        this.entity
            .tween(this.entity.getLocalEulerAngles())
            .rotate(new pc.Vec3(0, 90, 0), 1.2, pc.BounceOut)
            .start();
    } else {
        this.entity
            .tween(this.entity.getLocalEulerAngles())
            .rotate(new pc.Vec3(-90, 0, 0), 1.2, pc.BounceOut)
            .start();
    }

};

// update code called every frame
ObstacleAnimation.prototype.update = function (dt) {

};

// camera-shake.js
var CameraShake = pc.createScript('cameraShake');

CameraShake.attributes.add("shakeInterval", { type: "number", default: 0.1, title: "Camera Shake Interval" });
CameraShake.attributes.add("maxShakeDistance", { type: "number", default: 0.1, title: "Max Shake Distance" });
CameraShake.attributes.add("duration", { type: "number", default: 1, title: "Duration" });

// initialize code called once per entity
CameraShake.prototype.initialize = function () {
    this.time = 10000;
    this.timeSinceLastShake = 0;

    this.shakeInterval = Math.min(this.shakeInterval, 0.025);
    this.duration = 0.75;
    this.maxShakeDistance = 0.5;

    this.startPosition = this.entity.getPosition().clone();

    this.on("destroy", this.onDestroy, this);

    // Listen to the event that will trigger the camera shake
    this.app.on("camera:shake", this.onStartShake, this);
};

CameraShake.prototype.onDestroy = function () {

    this.app.off("camera:shake", this.onStartShake, this);

};

// update code called every frame
CameraShake.prototype.update = function (dt) {
    this.time += dt;

    if (this.time < this.duration) {
        this.timeSinceLastShake += dt;

        if (this.timeSinceLastShake >= this.shakeInterval) {
            var v = 1 - pc.math.clamp(this.time / this.duration, 0, 1);

            var t = 2 * Math.PI * pc.math.random(0, 1);
            var u = pc.math.random(0, this.maxShakeDistance) * v + pc.math.random(0, this.maxShakeDistance) * v;
            var r = u > 1 ? 2 - u : u;

            var x = r * Math.cos(t);
            var y = r * Math.sin(t);

            const localPosition = this.entity.getLocalPosition();

            this.entity.setLocalPosition(this.startPosition.x + x, this.startPosition.y + y, localPosition.z);
            this.timeSinceLastShake -= this.shakeInterval;
        }
    }
};

CameraShake.prototype.onStartShake = function () {
    this.startPosition = this.entity.getPosition().clone();

    this.time = 0;
};

// instancer-lite.js
var UranusInstancerLite = pc.createScript('uranusInstancerLite');

UranusInstancerLite.attributes.add('frustumCulling', {
    type: 'boolean',
    default: false,
    title: 'Frustum Culling',
    description: "Controls the culling of instances against the camera frustum (frustum culling needs to enabled on each camera component). If false all instances will be rendered regardless of their visibility. Changing this setting requires application reload."
});

UranusInstancerLite.attributes.add('autoUpdate', {
    type: 'boolean',
    default: true,
    title: 'Auto Update',
    description: "Run the instancer update method automatically per frame. If Frustum Culling is selected this property doesn't have any effect."
});

UranusInstancerLite.attributes.add('cloneMaterials', {
    type: 'boolean',
    default: true,
    title: 'Clone Materials',
    description: "If selected all instances will use a clone of the original model material. This is useful when the original material is being used in non instanced models and otherwise it will produce render artifacts. Changing this setting requires application reload."
});

UranusInstancerLite.attributes.add('disableShadows', {
    type: 'boolean',
    default: false,
    title: 'Disable Shadows',
    description: "If selected no shadows buffers will be created (optimization). Requires app reload."
});

UranusInstancerLite.attributes.add('disableTransparent', {
    type: 'boolean',
    default: true,
    title: 'Disable Transparent',
    description: "If selected transparent mesh instances will not be instanced."
});

UranusInstancerLite.attributes.add('excludeTag', {
    type: 'string',
    default: 'INSTANCING:Disable',
    title: 'Exclude Tag',
    description: "The tag that can be used on entities to exclude them from instancing."
});

UranusInstancerLite.attributes.add('excludeLayers', {
    type: 'string',
    array: true,
    default: ['Depth', 'Skybox', 'Immediate', 'UI'],
    title: 'Exclude Layers',
    description: 'Mesh instances rendered in these layers won\'t be instanced.'
});

// initialize code called once per entity
UranusInstancerLite.prototype.initialize = function () {

    UranusInstancerLite.api = this;

    // --- variables
    this.payloads = undefined;

    this.vec = new pc.Vec3();
    this.vec2 = new pc.Vec3();
    this.quat = new pc.Quat();
    this.matrix = new pc.Mat4();

    this.checkBatchGroups = true;

    // --- execute
    this.prepare();

    // TODO find a more elegant way to execute after other scripts have been prepared
    window.setTimeout(() => this.onState(true), 0);

    // --- events
    this.on('state', this.onState, this);

    this.on('attr:disableShadows', this.onDisableShadows, this);
    this.on('attr:autoUpdate', this.changeUpdateState, this);
};

UranusInstancerLite.prototype.prepare = function () {

    // --- override PC engine
    this.overrideEngine();

    // --- set initial data
    this.payloads = {};

    // --- check if we need an update loop
    if (!this.frustumCulling && this.autoUpdate) {
        this.app.on('update', this.onUpdate, this);
    }

    // --- events
    this.app.on('uranusInstancerLite:update', this.onUpdate, this);
};

UranusInstancerLite.prototype.changeUpdateState = function (state) {
    if (state) this.app.on('update', this.onUpdate, this);
    else this.app.off('update', this.onUpdate, this);
};

UranusInstancerLite.prototype.onState = function (state) {

    // --- with this trick, on start, we re-trigger all mesh instances to get added into layers to we can track them
    if (state) {
        const composition = this.app.scene.layers;
        const layers = composition.layerList;

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];

            if (this.isLayerValid(layer) === false) continue;

            // -- process existing mesh instances
            const opaqueMeshInstances = [];
            layer.opaqueMeshInstances?.forEach(o => opaqueMeshInstances.push(o));

            const transparentMeshInstances = layer.transparentMeshInstances;

            if (!this.disableTransparent) {
                layer.transparentMeshInstances.forEach(o => transparentMeshInstances.push(o));
            }

            UranusInstancerLite.removeMeshInstancesFunc.apply(layer, [opaqueMeshInstances]);
            layer.addMeshInstances(opaqueMeshInstances);

            if (!this.disableTransparent) {
                UranusInstancerLite.removeMeshInstancesFunc.apply(layer, [transparentMeshInstances]);
                layer.addMeshInstances(transparentMeshInstances);
            }
        }

    } else {
        // --- clear all payloads if we are disabling instancing
        for (let id in this.payloads) {

            const payload = this.payloads[id];
            const meshInstances = payload.refMeshInstances;
            const layer = payload.layer;

            this.clearPayload(payload);

            layer.addMeshInstances(meshInstances);
        }
        this.payloads = {};
    }
};

UranusInstancerLite.prototype.onDisableShadows = function (value) {

    if (this.enabled) {
        this.enabled = false;
        this.enabled = true;
    }
};

UranusInstancerLite.prototype.setShadows = function (state) {
    this.disableShadows = !state;
};

UranusInstancerLite.prototype.setCheckBatchGroups = function (state) {
    this.checkBatchGroups = state;
};

UranusInstancerLite.prototype.isLayerValid = function (layer) {
    return this.excludeLayers.indexOf(layer.name) === -1;
};

UranusInstancerLite.worldMatX = new pc.Vec3();
UranusInstancerLite.worldMatY = new pc.Vec3();
UranusInstancerLite.worldMatZ = new pc.Vec3();

UranusInstancerLite.prototype.shouldFlipFaces = function (node) {
    const worldMatX = UranusInstancerLite.worldMatX;
    const worldMatY = UranusInstancerLite.worldMatY;
    const worldMatZ = UranusInstancerLite.worldMatZ;

    const wt = node.getWorldTransform();
    wt.getX(worldMatX);
    wt.getY(worldMatY);
    wt.getZ(worldMatZ);
    worldMatX.cross(worldMatX, worldMatY);

    return worldMatX.dot(worldMatZ) >= 0 ? false : true;
};

UranusInstancerLite.prototype.getPayloadId = function (meshInstance, layer, castShadow, prevMaterial) {
    // Key definition:
    // Bit
    // 27 - 31 : layer
    // 26      : shadowcaster
    // 13 - 25 : Mesh ID
    // 0 - 12   : Material ID
    const material = prevMaterial ? prevMaterial : meshInstance.material;
    const flipFaces = this.shouldFlipFaces(meshInstance.node);

    return ((layer.id & 0x1ff) << 27) |
        ((castShadow ? 1 : 0) << 26) |
        ((flipFaces ? 1 : 0) << 25) |
        ((meshInstance.mesh.id & 0x1ff) << 12) |
        ((material.id & 0x1ff) << 0);
    //return `${layer.id}_${castShadow ? '1' : '0'}_${meshInstance.mesh.id}_${material.id}`;
};

UranusInstancerLite.prototype.getMeshInstanceEntity = function (meshInstance) {

    // --- find referenced node, if available
    let entity = meshInstance.node;

    // --- support for legacy model component
    if (entity instanceof pc.Entity === false) {

        while (entity instanceof pc.Entity === false && entity.parent) {
            entity = entity.parent;
        }

        // --- we don't support nodes not included in the hierarchy
        if (entity instanceof pc.Entity === false) return;
    }

    return entity;
};

UranusInstancerLite.prototype.addMeshInstance = function (meshInstance, layer, skipShadowCasters, onlyShadows) {

    // --- we don't parse mesh instances with no material or skinned meshes
    if (!meshInstance.material || meshInstance.mesh.skin) return false;

    // --- check conditions that can skip this meshinstance
    if (meshInstance.node.name === 'uranus-instancer-payload') return false;

    if (this.disableTransparent && meshInstance.material.blendType !== pc.BLEND_NONE) return false;

    // --- find referenced entity && node
    const entity = this.getMeshInstanceEntity(meshInstance);

    if (!entity) return false;

    const node = meshInstance.node !== entity ? meshInstance.node : entity;

    // --- check conditions that can skip this meshinstance
    if (entity.tags.has(this.excludeTag)) return false;

    // --- if model/render component is using batching or it's not a valid component, we skip
    const component = entity.render ? entity.render : entity.model;

    if (!component || (this.checkBatchGroups && component && component.batchGroupId > -1)) return false;

    // --- add to a payload
    if (!onlyShadows) {
        this.addToPayload(entity, node, meshInstance, layer, false);
    }

    // --- check if we are adding a shadow mesh instance
    if (!this.disableShadows && !skipShadowCasters && meshInstance.castShadow) {
        this.addToPayload(entity, node, meshInstance, layer, true);
    }

    // --- add property watchers (e.g. change of mesh instance material)
    this.overrideMeshInstance(meshInstance, () => {

        this.removeFromPayload(meshInstance, layer, false, null);
        this.removeFromPayload(meshInstance, layer, true, null);

        // --- add to a payload
        if (!onlyShadows) {
            this.addToPayload(entity, node, meshInstance, layer, false);
        }

        // --- check if we are adding a shadow mesh instance
        if (!this.disableShadows && !skipShadowCasters && meshInstance.castShadow) {
            this.addToPayload(entity, node, meshInstance, layer, true);
        }
    });

    return true;
};

UranusInstancerLite.prototype.addToPayload = function (entity, node, meshInstance, layer, castShadow) {

    // --- find unique payloadId used to group the instances
    const payloadId = this.getPayloadId(meshInstance, layer, castShadow);

    // --- check if we have a payload, if not spawn a new one
    let payload = this.payloads[payloadId];

    if (!payload) {
        payload = this.createPayload(payloadId, meshInstance, layer, castShadow);
    } else {
        // --- check if mesh instance already exists
        if (payload.refMeshInstances.indexOf(meshInstance) > -1) return payload;
    }

    // --- add instance to payload
    // --- all properties are commented out so only the necessary ones are filled to reduce memory usage
    const instance = {
        // entity,
        // meshInstance: meshInstance,
        // node: node,
        // refInstance: undefined
    };

    // --- check if we've received instanced data only
    instance.entity = entity;
    payload.refMeshInstances.push(meshInstance);

    // --- set mesh instance reference for later removal
    meshInstance.uranusPayloadMaterial = meshInstance.material;

    instance.meshInstance = meshInstance;
    instance.node = node;

    payload.instances.push(instance);

    // --- resize payload buffer
    this.updateVertexBuffer(payload, true);

    // --- if culling is disabled we need to update the buffer here
    if (!this.frustumCulling) this.isMeshInstanceVisible(null, payload);

    return payload;
};

UranusInstancerLite.prototype.removeMeshInstance = function (meshInstance, layer, skipShadowCasters, onlyShadows) {

    // --- we don't parse mesh instances with skinned meshes
    if (meshInstance.mesh.skin) return false;

    // --- check if it's a payload mesh instance
    if (meshInstance.node.name === 'uranus-instancer-payload') return false;

    // --- remove from payload
    let success = false;
    if (!onlyShadows) {
        success = this.removeFromPayload(meshInstance, layer, false);
    }

    // --- check if we are removing from shadows payload
    if (!this.skipShadowCasters && !skipShadowCasters) {
        success = this.removeFromPayload(meshInstance, layer, true);
    }

    this.overrideMeshInstance(meshInstance);

    return success;
};

UranusInstancerLite.prototype.removeFromPayload = function (meshInstance, layer, castShadow) {

    const payloadIdMaterial = meshInstance.uranusPayloadMaterial ? meshInstance.uranusPayloadMaterial : meshInstance.material;

    if (!payloadIdMaterial) return false;

    // --- find unique payloadId used to group the instances
    const payloadId = this.getPayloadId(meshInstance, layer, castShadow, payloadIdMaterial);

    const payload = this.payloads[payloadId];

    if (!payload) return false;

    if (payload.refMeshInstances.length > 0) {

        // --- find and remove mesh instance from payload
        const index = payload.refMeshInstances.indexOf(meshInstance);

        if (index === -1) {
            return false;
        }

        // --- remove from payload
        payload.instances.splice(index, 1);
        payload.refMeshInstances.splice(index, 1);
    }

    // --- check if payload is empty to remove
    if (payload.instances.length === 0) {
        this.clearPayload(payload);

        delete this.payloads[payloadId];
    } else {
        // --- resize payload buffer
        this.updateVertexBuffer(payload, true);

        // --- if culling is disabled we need to update the buffer here
        if (!this.frustumCulling) this.isMeshInstanceVisible(null, payload);
    }
};

UranusInstancerLite.prototype.clearPayload = function (payload) {

    payload.vertexBuffer.destroy();

    if (payload.shadowCaster) {
        payload.layer.removeShadowCasters([payload.meshInstance]);
    } else {
        payload.layer.removeMeshInstances([payload.meshInstance], true);
    }

    const material = payload.refMaterial;

    if (material) {
        material.onUpdateShader = function (options) {
            options.litOptions.useInstancing = true;
            return options;
        };
        material.update();

        if (this.cloneMaterials) payload.meshInstance.material.destroy();
    }
};

UranusInstancerLite.prototype.updateVertexBuffer = function (payload, reset, visibleCount) {

    let instancesCount;
    if (visibleCount !== undefined) {
        instancesCount = visibleCount;
    } else {
        instancesCount = payload.instances.length;
    }

    const vertexBuffer = payload.vertexBuffer;
    const format = vertexBuffer.format;
    vertexBuffer.numBytes = format.verticesByteSize ? format.verticesByteSize : format.size * instancesCount;

    if (reset || !vertexBuffer.originalStorage) {
        vertexBuffer.originalStorage = new Float32Array(instancesCount * 16);
        vertexBuffer.setData(vertexBuffer.originalStorage);
    } else {
        const bufferArray = vertexBuffer.originalStorage.subarray(0, instancesCount * 16);
        vertexBuffer.setData(bufferArray);
    }

    payload.meshInstance.instancingData.count = instancesCount;
    vertexBuffer.numVertices = instancesCount;
};

UranusInstancerLite.prototype.createPayload = function (payloadId, refMeshInstance, layer, castShadow) {

    // --- prepare the material
    const material = this.getPayloadMaterial(refMeshInstance.material);

    // --- prepare mesh instance
    const meshInstance = new pc.MeshInstance(refMeshInstance.mesh, material, new pc.GraphNode('uranus-instancer-payload'));
    meshInstance.pick = false;
    meshInstance.flipFaces = this.shouldFlipFaces(refMeshInstance.node);
    meshInstance.flipFacesFactor = refMeshInstance.node.worldTransform.scaleSign;

    meshInstance.castShadow = castShadow;
    meshInstance.aabb.center.copy(refMeshInstance.aabb.center);
    meshInstance.aabb.halfExtents.copy(refMeshInstance.aabb.halfExtents);

    // --- add mesh instance to layer
    if (castShadow) {
        layer.addShadowCasters([meshInstance]);
    } else {
        layer.addMeshInstances([meshInstance], true);
    }

    // --- create static vertex buffer containing the matrices
    const device = this.app.graphicsDevice;
    const vertexBuffer = new pc.VertexBuffer(
        device,
        pc.VertexFormat.getDefaultInstancingFormat(device),
        0,
        pc.BUFFER_DYNAMIC,
        new Float32Array()
    );
    meshInstance.setInstancing(vertexBuffer);

    // --- payload object
    const payload = {
        id: payloadId,
        instances: [],
        layer: layer,
        meshInstance: meshInstance,
        refMaterial: refMeshInstance.material, // use dirty & copy to handle material updates
        refMeshInstances: [],
        shadowCaster: castShadow,
        vertexBuffer: vertexBuffer
    };

    if (payload.shadowCaster) {
        payload.shouldUpdateShadows = true;
    }

    // --- custom visibility function used for culling
    this.setPayloadCulling(this.frustumCulling, payload);

    this.payloads[payloadId] = payload;

    return payload;
};

UranusInstancerLite.prototype.setPayloadCulling = function (state, payload) {

    if (state) {
        payload.meshInstance.cull = true; // we set it here since enabling instancing seems to turn it off
        payload.meshInstance.isVisibleFunc = (camera) => this.isMeshInstanceVisible(camera, payload);
    } else {
        payload.meshInstance.cull = false;
        delete payload.meshInstance.isVisibleFunc;
    }
};

UranusInstancerLite.prototype.isMeshInstanceVisible = function (camera, payload) {
    this.updatePayload(payload, camera);

    // --- if it's a shadowcaster, we need to calculate the AABB of all visible shadow casters
    if (payload.shadowCaster && payload.shouldUpdateShadows) {

        let emptyAabb = true;
        const visibleSceneAabb = payload.meshInstance.aabb;

        const visibleCasters = payload.instances;

        for (let i = 0; i < visibleCasters.length; i++) {
            const instance = visibleCasters[i];
            if (instance.cell) continue;

            const meshInstance = instance.meshInstance;

            if (meshInstance.visibleThisFrame === 0) continue;

            if (emptyAabb) {
                emptyAabb = false;
                visibleSceneAabb.copy(meshInstance.aabb);
            } else {
                visibleSceneAabb.add(meshInstance.aabb);
            }
        }
    }

    return true;
};

UranusInstancerLite.prototype.getPayloadMaterial = function (refMaterial) {

    const shouldClone = this.cloneMaterials;

    const material = shouldClone ? refMaterial.clone() : refMaterial;

    material.onUpdateShader = function (options) {
        options.litOptions.useInstancing = true;
        return options;
    };
    material.update();

    // --- broadcast the event to the app
    if (shouldClone) {
        this.app.fire('UranusInstancer:materialCloned', material);
    }

    return material;
};

UranusInstancerLite.prototype.onUpdate = function () {

    const payloads = this.payloads;

    if (!payloads || !this.cloneMaterials) return;

    for (let payloadId in payloads) {
        this.updatePayload(payloads[payloadId]);
    }
};

UranusInstancerLite.prototype.updatePayload = function (payload, camera) {

    // --- update instances
    let matrixIndex = 0;

    const instances = payload.instances;

    for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];

        matrixIndex = this.updateInstance(instance, payload, matrixIndex, camera);
    }


    const visibleCount = matrixIndex / 16;

    this.updateVertexBuffer(payload, false, visibleCount);

    if (this.cloneMaterials) this.checkPayloadMaterial(payload);
};

UranusInstancerLite.prototype.checkPayloadMaterial = function (payload) {

    // --- update material, if required
    const refMeshInstance = payload.refMeshInstances[0];
    if (!refMeshInstance) return;

    //const hasMaterialChanged = refMeshInstance.material !== payload.meshInstance.payload;
    const hasMaterialChanged = refMeshInstance.material !== payload.refMaterial;

    if (hasMaterialChanged) {
        payload.refMaterial = refMeshInstance.material;
    }

    const refMaterial = payload.refMaterial;

    if (refMaterial && (refMaterial.dirty || hasMaterialChanged)) {

        // --- TODO avoid cloning the material
        const material = this.getPayloadMaterial(refMaterial);
        payload.meshInstance.material = material;

        this.app.once('postrender', function () {
            payload.refMaterial.dirty = false;
        }, this);
    }
};

UranusInstancerLite.prototype.updateInstance = function (instance, payload, matrixIndex, camera) {

    // --- check if mesh instance is visible
    if (!instance.meshInstance.visible) {
        return matrixIndex;
    }

    // --- check if instance is visible/requires rendering
    if (camera) {

        const isVisible = this.cullInstance(instance, payload, camera);
        if (!isVisible) return matrixIndex;
    }

    // --- update vertex buffer storage
    const matrices = payload.vertexBuffer.originalStorage;
    const data = instance.data ? instance.data : instance.node.getWorldTransform().data;

    // copy matrix elements into array of floats
    for (let m = 0; m < 16; m++) {
        matrices[matrixIndex++] = data[m];
    }

    return matrixIndex;
};

UranusInstancerLite.prototype.cullInstance = function (instance, payload, camera) {

    // --- check frustum culling
    const meshInstance = instance.meshInstance;

    if (instance.data) meshInstance.aabb.center.copy(instance.cullPosition);

    let isVisible = meshInstance._isVisible(camera);
    meshInstance.visibleThisFrame = isVisible;

    return isVisible > 0;
};

UranusInstancerLite.prototype.overrideEngine = function () {
    const addMeshInstancesFunc = pc.Layer.prototype.addMeshInstances;

    pc.Layer.prototype.addMeshInstances = function (origMeshInstances, skipShadowCasters) {

        if (UranusInstancerLite.api && UranusInstancerLite.api.enabled && UranusInstancerLite.api.isLayerValid(this)) {

            let meshInstances = [];

            origMeshInstances.forEach(meshInstance => {

                const success = UranusInstancerLite.api.addMeshInstance(meshInstance, layer = this, skipShadowCasters, false);

                if (!success) {
                    meshInstances.push(meshInstance);
                }
            });

            arguments[0] = meshInstances;

            addMeshInstancesFunc.apply(this, arguments);

        } else {
            addMeshInstancesFunc.apply(this, arguments);
        }
    };

    const removeMeshInstancesFunc = pc.Layer.prototype.removeMeshInstances;
    UranusInstancerLite.removeMeshInstancesFunc = removeMeshInstancesFunc;

    pc.Layer.prototype.removeMeshInstances = function (origMeshInstances, skipShadowCasters) {

        if (UranusInstancerLite.api && UranusInstancerLite.api.enabled && UranusInstancerLite.api.isLayerValid(this)) {

            let meshInstances = [];

            origMeshInstances.forEach(meshInstance => {

                const success = UranusInstancerLite.api.removeMeshInstance(meshInstance, layer = this, skipShadowCasters, false);

                if (!success) {
                    meshInstances.push(meshInstance);
                }
            });

            arguments[0] = meshInstances;

            removeMeshInstancesFunc.apply(this, arguments);

        } else {

            removeMeshInstancesFunc.apply(this, arguments);
        }
    };

    const addShadowCastersFunc = pc.Layer.prototype.addShadowCasters;

    pc.Layer.prototype.addShadowCasters = function (origMeshInstances) {

        if (UranusInstancerLite.api && UranusInstancerLite.api.enabled && UranusInstancerLite.api.isLayerValid(this)) {

            let meshInstances = [];

            origMeshInstances.forEach(meshInstance => {

                const success = UranusInstancerLite.api.addMeshInstance(meshInstance, layer = this, false, true);

                if (!success) {
                    meshInstances.push(meshInstance);
                }
            });

            arguments[0] = meshInstances;

            addShadowCastersFunc.apply(this, arguments);

        } else {

            addShadowCastersFunc.apply(this, arguments);
        }
    };

    const removeShadowCastersFunc = pc.Layer.prototype.removeShadowCasters;

    pc.Layer.prototype.removeShadowCasters = function (origMeshInstances) {

        if (UranusInstancerLite.api && UranusInstancerLite.api.enabled && UranusInstancerLite.api.isLayerValid(this)) {

            let meshInstances = [];

            origMeshInstances.forEach(meshInstance => {

                const success = UranusInstancerLite.api.removeMeshInstance(meshInstance, layer = this, false, true);

                if (!success) {
                    meshInstances.push(meshInstance);
                }
            });

            arguments[0] = meshInstances;

            removeShadowCastersFunc.apply(this, arguments);

        } else {

            removeShadowCastersFunc.apply(this, arguments);
        }
    };
};

UranusInstancerLite.prototype.overrideMeshInstance = function (meshInstance, addCallback) {

    if (addCallback) {

        Object.defineProperty(meshInstance, 'material', {
            set: function (material) {

                for (let i = 0; i < this._shader?.length; i++) {
                    this._shader[i] = null;
                }

                const prevMat = this._material;

                // Remove the material's reference to this mesh instance
                if (prevMat) {
                    prevMat.removeMeshInstanceRef(this);
                }

                this._material = material;

                if (this._material) {

                    // Record that the material is referenced by this mesh instance
                    this._material.addMeshInstanceRef(this);

                    this.updateKey();

                    const prevBlend = prevMat && (prevMat.blendType !== pc.BLEND_NONE);
                    const thisBlend = this._material.blendType !== pc.BLEND_NONE;
                    if (prevBlend !== thisBlend) {
                        let scene = this._material._scene;
                        if (!scene && prevMat && prevMat._scene) scene = prevMat._scene;

                        if (scene) {
                            scene.layers._dirtyBlend = true;
                        } else {
                            this._material._dirtyBlend = true;
                        }
                    }

                    // --- add the instance if it's ready
                    if (addCallback && this._mesh) {
                        addCallback();
                    }
                }
            },
            get: function () {
                return this._material;
            },
            configurable: true
        });

    } else {

        Object.defineProperty(meshInstance, 'material', {
            set: function (material) {

                for (let i = 0; i < this._shader?.length; i++) {
                    this._shader[i] = null;
                }

                const prevMat = this._material;

                // Remove the material's reference to this mesh instance
                if (prevMat) {
                    prevMat.removeMeshInstanceRef(this);
                }

                this._material = material;

                if (this._material) {

                    // Record that the material is referenced by this mesh instance
                    this._material.addMeshInstanceRef(this);

                    this.updateKey();

                    const prevBlend = prevMat && (prevMat.blendType !== pc.BLEND_NONE);
                    const thisBlend = this._material.blendType !== pc.BLEND_NONE;
                    if (prevBlend !== thisBlend) {
                        let scene = this._material._scene;
                        if (!scene && prevMat && prevMat._scene) scene = prevMat._scene;

                        if (scene) {
                            scene.layers._dirtyBlend = true;
                        } else {
                            this._material._dirtyBlend = true;
                        }
                    }
                }
            },
            get: function () {
                return this._material;
            },
            configurable: true
        });
    }
};

// rotate.js
var Rotate = pc.createScript('rotate');

Rotate.attributes.add('cameraEntity', { type: 'entity', title: 'Camera Entity' });
Rotate.attributes.add('orbitSensitivity', {
    type: 'number',
    default: 0.3,
    title: 'Orbit Sensitivity',
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

Rotate.attributes.add('inertiaFactor', {
    type: 'number',
    default: 100,
    title: 'Inertia Factor',
    description: '0 for no inertia, higher numbers mean more inertia'
});


// initialize code called once per entity
Rotate.prototype.initialize = function () {
    this.currentAngleX = 0;
    this.currentAngleY = 0;

    this.targetAngleX = 0;
    this.targetAngleY = 0;
    this.lastTouchPoint = new pc.Vec2();

    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }

    this.app.on("rotateCamera:lookat", this.setTargetAngles, this);

    this.on("destroy", this.onDestroy, this);

};

Rotate.prototype.onDestroy = function () {

    this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

    if (this.app.touch) {

        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);

    }

    this.app.off("rotateCamera:lookat", this.setTargetAngles, this);

};

Rotate.prototype.setTargetAngles = function (entity, x, y) {
    this.targetAngleX = x;
    this.targetAngleY = y;
};

Rotate.prototype.update = function (dt) {
    var horzQuat = Rotate.horizontalQuat;
    var vertQuat = Rotate.verticalQuat;
    var resultQuat = Rotate.resultQuat;

    var t = Math.pow(2, -this.inertiaFactor * dt);

    this.currentAngleX = pc.math.lerp(this.currentAngleX, this.currentAngleX, t);
    this.currentAngleY = pc.math.lerp(this.currentAngleY, this.targetAngleY, t);
    // console.log("CurrentAngles: " + this.currentAngleX + " " + this.currentAngleY);
    // console.log("TargetAngles: " + this.targetAngleX + " " + this.targetAngleY);

    horzQuat.copy(vertQuat.copy(pc.Quat.IDENTITY));

    vertQuat.setFromAxisAngle(this.cameraEntity.right, this.currentAngleX);
    this.entity.setRotation(vertQuat);

    horzQuat.setFromAxisAngle(this.entity.up, this.currentAngleY);
    resultQuat.mul2(horzQuat, this.entity.getRotation());


    if (this.currentAngleX !== this.targetAngleY) {
        this.entity.setRotation(resultQuat);
    } else {
        this.entity.rotate(0, 50 * dt, 0);
    }

};


Rotate.prototype.rotate = function (dx, dy) {

    this.targetAngleX += dy * this.orbitSensitivity;
    this.targetAngleX = pc.math.clamp(this.targetAngleX, -90, 40);

    this.targetAngleY += dx * this.orbitSensitivity;
};


Rotate.horizontalQuat = new pc.Quat();
Rotate.verticalQuat = new pc.Quat();
Rotate.resultQuat = new pc.Quat();


Rotate.prototype.onTouchStart = function (event) {
    var touch = event.touches[0];
    this.lastTouchPoint.set(touch.x, touch.y);
};


Rotate.prototype.onTouchMove = function (event) {
    var touch = event.touches[0];
    var dx = touch.x - this.lastTouchPoint.x;
    var dy = touch.y - this.lastTouchPoint.y;

    this.rotate(dx, dy);

    this.lastTouchPoint.set(touch.x, touch.y);
};

Rotate.prototype.onMouseMove = function (event) {
    var mouse = this.app.mouse;
    if (mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        this.rotate(event.dx, event.dy);
    }
};


// rotateEntity.js
var RotateEntity = pc.createScript('rotateEntity');

RotateEntity.attributes.add('speed', { type: 'number', default: 1 });


// initialize code called once per entity
RotateEntity.prototype.initialize = function () {
    this.tweenRotation(this.entity, 0, -180, 30, null);
};

// update code called every frame
RotateEntity.prototype.update = function (dt) {

};

RotateEntity.prototype.tweenRotation = function (entity, from, to, time, onComplete) {
    var rot = { value: from };
    entity
        .tween(rot)
        .to({ value: to }, time, pc.Linear)
        .onUpdate( function () {
            entity.setLocalEulerAngles(0, rot.value, 0);
        }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .loop(true)
        .start();
};

// LevelFinisherTeethClean.js
var LevelFinisherTeethClean = pc.createScript('levelFinisherTeethClean');

LevelFinisherTeethClean.attributes.add('finishCamera', { type: 'entity' });
LevelFinisherTeethClean.attributes.add('detectionZone', { type: 'entity' });
LevelFinisherTeethClean.attributes.add('hoverParticle', { type: 'entity' });
LevelFinisherTeethClean.attributes.add('teethColZones', { type: 'entity', array: true });

// initialize code called once per entity
LevelFinisherTeethClean.prototype.initialize = function () {

    this.app.on("Game:OnCompleted", this.onGameCompleted, this);
    this.app.on("LevelFinisherTeethClean:StartTimer", this.startTimer, this);
    this.app.on("LevelFinisherTeethClean:changeMultiplier", this.changeMultiplier, this);
    this.app.on("levelFinisher:TimerFinished", this.timerFinished, this);
    this.entity.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);

    this.isMouseDown = false;
    this.isTimerStart = false;
    this.multiplier = 1;
    this.sequenceDuration = 2.5;
    this.multiplierTween = null;
    this.isTimerFinished = false;
    this.gameComplete = false;

    this.mouseIdleTimeOut = null;
    this.detectedTeeth = null;

    this.playerCamera = this.app.root.findByName("PlayerCamera");

    // Add a mousedown event handler
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.fingerDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.fingerUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.fingerMove, this);

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.fingerDown, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.fingerUp, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.fingerMove, this);
    }
    this.on("destroy", this.onDestroy, this);

};

LevelFinisherTeethClean.prototype.onDestroy = function () {

    this.app.off("Game:OnCompleted", this.onGameCompleted, this);
    this.app.off("LevelFinisherTeethClean:StartTimer", this.startTimer, this);
    this.app.off("LevelFinisherTeethClean:changeMultiplier", this.changeMultiplier, this);
    this.app.off("levelFinisher:TimerFinished", this.timerFinished, this);
    this.entity.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);

    this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.fingerDown, this);
    this.app.mouse.off(pc.EVENT_MOUSEUP, this.fingerUp, this);
    this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.fingerMove, this);

    if (this.app.touch) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.fingerDown, this);
        this.app.touch.off(pc.EVENT_TOUCHEND, this.fingerUp, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.fingerMove, this);
    }
};

LevelFinisherTeethClean.prototype.onEnvConfigRcv = function () {
    this.finishCamera.camera.clearColor.r = EnvironmentConfig.instance.config.nonFeverCubemapColor.r;
    this.finishCamera.camera.clearColor.g = EnvironmentConfig.instance.config.nonFeverCubemapColor.g;
    this.finishCamera.camera.clearColor.b = EnvironmentConfig.instance.config.nonFeverCubemapColor.b;
};

LevelFinisherTeethClean.prototype.fingerUp = function (e) {
    this.isMouseDown = false;
};

LevelFinisherTeethClean.prototype.fingerDown = function (e) {
    this.isMouseDown = true;
};

LevelFinisherTeethClean.prototype.fingerMove = function (e) {

    if (this.isMouseDown && !this.isTimerFinished && this.gameComplete) {

        if (this.mouseIdleTimeOut) {
            clearTimeout(this.mouseIdleTimeOut);
        }

        this.mouseIdleTimeOut = setTimeout(() => {
            this.cursorStatic();  // Force finger Up!
        }, 500);

        if (e.touches) {
            this.doRaycast(e.touches[0]);
        } else {
            this.doRaycast(e);
        }

    }

};

LevelFinisherTeethClean.prototype.cursorStatic = function () {

    this.hoverParticle.enabled = false;

    if (this.detectedTeeth)
        this.detectedTeeth.script.teethDetector.animScript.script.dirtyTeeth.startCleaningAnimation(false);


};

LevelFinisherTeethClean.prototype.doRaycast = function (screenPosition) {

    // The vec3 to raycast from
    var from = this.finishCamera.getPosition();
    // The vec3 to raycast to 
    var to = this.finishCamera.camera.screenToWorld(screenPosition.x, screenPosition.y, this.finishCamera.camera.farClip);

    // Raycast between the two points
    var result = this.app.systems.rigidbody.raycastAll(from, to);
    // here result is a combination of an entity, vector and point

    if (result.length > 0) {

        const results = result.filter(element => {
            return element.entity.name === "DetectionZone";
        });

        if (results.length > 0) {
            this.hoverParticle.enabled = true;
            this.hoverParticle.setPosition(result[0].point.x, this.hoverParticle.getPosition().y, result[0].point.z);
        }

        const teethZone = result.filter(element => {
            return element.entity.name === "TeethCollider";
        });

        if (teethZone.length > 0) {
            this.detectedTeeth = teethZone[0].entity;
            this.detectedTeeth.script.teethDetector.animScript.script.dirtyTeeth.startCleaningAnimation(true);

            // this.app.fire(EventTypes.PLAY_SFX, 'brush', 250);
            this.app.fire(EventTypes.PLAY_SFX, Utils.getRandomItem(['brush1', 'brush2', 'brush3', 'brush4']), 200);

        }

    } else {
        for (let i = 0; i < this.teethColZones.length; i++) {
            this.teethColZones[i].script.teethDetector.animScript.script.dirtyTeeth.startCleaningAnimation(false);
        }
        this.hoverParticle.enabled = false;
    }

};

LevelFinisherTeethClean.prototype.onGameCompleted = function () {
    this.gameComplete = true;

    setTimeout(() => {
        this.app.fire(this.app.events.game.requestStart, false);

        this.finishCameraPosition = this.finishCamera.getLocalPosition().clone();
        this.finishCameraRotation = this.finishCamera.getLocalEulerAngles().clone();
        this.finishCameraFov = 29.24;

        this.finishCamera.setPosition(this.playerCamera.getPosition());
        this.finishCamera.setRotation(this.playerCamera.getRotation());
        this.finishCamera.camera.fov = this.playerCamera.camera.fov;

        this.finishCamera.enabled = true;
        this.playerCamera.enabled = false;

        this.tweenFinishCamera();
        //this.app.fire("showHappyTime");
        this.app.fire("onGameStart", false);

    }, 500);

};

LevelFinisherTeethClean.prototype.tweenFinishCamera = function () {

    this.finishCamera
        .tween(this.finishCamera.getLocalPosition())
        .to(this.finishCameraPosition, 1.5, pc.Linear)
        .start();

    var fov = { value: this.playerCamera.camera.fov };

    this.finishCamera
        .tween(fov)
        .to({ value: this.finishCameraFov }, 1.5, pc.Linear)
        .onUpdate(function () {
            this.finishCamera.camera.fov = fov.value;
        }.bind(this))
        .start();


    setTimeout(() => {
        this.finishCamera
            .tween(this.finishCamera.getLocalEulerAngles())
            .rotate(this.finishCameraRotation, 1, pc.Linear)
            .onComplete(() => {

                setTimeout(() => {
                    GameMenuEventListener.instance.onCameraTransitionComplete();
                    this.app.fire("LevelFinisher:CameraTransitionComplete");
                }, 500);


            })
            .start();

    }, 500);

};

LevelFinisherTeethClean.prototype.startTimer = function () {

    if (!this.isTimerStart) {
        this.isTimerStart = true;
        this.app.fire("LevelFinisher:startMaskTimer", this.sequenceDuration, () => {
            this.app.fire("levelFinisher:TimerFinished");
        });
    }

};

LevelFinisherTeethClean.prototype.changeMultiplier = function (currentMultiplier, textEntity) {

    this.app.fire("LevelFinisherTeethClean:resetTextScales");

    if (currentMultiplier > this.multiplier) {
        this.multiplier = currentMultiplier;
        textEntity.setLocalScale(1, 1, 1);
        if (this.multiplierTween) {
            this.multiplierTween.stop();
        }
        this.multiplierTween = textEntity.tween(textEntity.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.4, pc.SineOut).loop(true).yoyo(true).start();
    }
};

LevelFinisherTeethClean.prototype.timerFinished = function () {

    this.isTimerFinished = true;
    this.hoverParticle.enabled = false;
    this.app.fire("LevelFinisher:scoreMultipler", this.multiplier);

    CustomCoroutine.Instance.set(() => {
        this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.LevelEnd);
    }, 0.75);

};

// update code called every frame
LevelFinisherTeethClean.prototype.update = function (dt) {

};

// LevelFinisherCanon.js
var LevelFinisherCanon = pc.createScript('levelFinisherCanon');

LevelFinisherCanon.attributes.add('finishCamera', { type: 'entity' });
LevelFinisherCanon.attributes.add('canonBall', { type: 'entity' });
LevelFinisherCanon.attributes.add('airParticles', { type: 'entity' });
LevelFinisherCanon.attributes.add('sparkleParticle', { type: 'entity' });
LevelFinisherCanon.attributes.add('headFinishers', { type: 'entity', array: true });


// initialize code called once per entity
LevelFinisherCanon.prototype.postInitialize = function () {

    this.canonModel = this.entity.parent.findByName("Canon_HydroCannon");
    this.playerCamera = this.app.root.findByName("PlayerCamera");
    this.app.on("Game:OnCompleted", this.onGameCompleted, this);
    this.app.on("UpdateCanonModel", this.onUpdateCanonModel, this);
    this.app.on("GameMenuEventListener:onCanonPowerTapBtnClick", this.onCanonPowerTapBtnClick, this);
    this.onUpdateCanonModel();
    this.entity.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);

    //this.detectionPoints = this.entity.parent.find('name', 'Multi Detection Point');

    this.detectPointsState = [];
    this.currentPointIndex = 0;

    for (let i = 0; i < this.headFinishers.length; i++) {
        this.detectPointsState.push({
            point: this.headFinishers[i].script.headFinisherController.multiDetectionPoint,
            isDetected: false,
        });
    }

    this.maxFill = 285;
    this.minFill = 1;
    this.incrementFill = 35;

    this.initialBallPosition = this.canonBall.getPosition().clone();

    this.maxBallDistZ = this.canonBall.getLocalPosition().clone().z - 135;
    this.minBallDistZ = this.canonBall.getLocalPosition().clone().z - 12;

    this.multiplier = 1;
    this.sequenceDuration = 4; // 4 sec of tapping allowed
    this.isSequenceRunning = false;
    this.isTappingAllowed = false;
    this.emptySpeed = 0.7;
    this.index1 = 0;
    this.index2 = 0;

    this.on("destroy", this.onDestroy, this);
};


LevelFinisherCanon.prototype.onDestroy = function () {
    this.app.off("Game:OnCompleted", this.onGameCompleted, this);
    this.app.off("GameMenuEventListener:onCanonPowerTapBtnClick", this.onCanonPowerTapBtnClick, this);
    this.app.off("UpdateCanonModel", this.onUpdateCanonModel, this);
    this.entity.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);
};

LevelFinisherCanon.prototype.onUpdateCanonModel = async function () {
    while (this.canonModel.children.length > 0) this.canonModel.children[0].destroy();

    const cannonTemplateName = shopData.canons[shopData.canons.currentSelected].modelID.replace('.json', '');
    const cannonAsset = this.app.assets.find(cannonTemplateName, 'template');
    if (!cannonAsset) return console.error('Can not find cannon asset ' + cannonTemplateName);

    await AssetsLoader.getInstance().loadByTag(cannonTemplateName);

    const cannonSkinInstance = cannonAsset.resource.instantiate();
    this.canonModel.addChild(cannonSkinInstance);
};

LevelFinisherCanon.prototype.onEnvConfigRcv = function () {
    this.finishCamera.camera.clearColor.r = EnvironmentConfig.instance.config.nonFeverCubemapColor.r;
    this.finishCamera.camera.clearColor.g = EnvironmentConfig.instance.config.nonFeverCubemapColor.g;
    this.finishCamera.camera.clearColor.b = EnvironmentConfig.instance.config.nonFeverCubemapColor.b;
};

LevelFinisherCanon.prototype.onCanonPowerTapBtnClick = function () {
    if (this.isTappingAllowed) {
        this.app.fire(EventTypes.PLAY_SFX, 'charge');

        let fillIncrement = this.fillMask.element.width + this.incrementFill;

        if (fillIncrement <= this.maxFill) {
            this.fillMask.element.width += this.incrementFill;
        }
        else {
            this.isTappingAllowed = false;
            clearTimeout(this.seqTimer);
            this.fillMask.element.width = this.maxFill;
            this.maxTxt.enabled = true;
            this.launchBall();
        }
    }
};

LevelFinisherCanon.prototype.onGameCompleted = function () {
    setTimeout(() => {
        this.app.fire(this.app.events.game.requestStart, false);
        this.finishCameraPosition = this.finishCamera.getLocalPosition().clone();
        this.finishCameraRotation = this.finishCamera.getLocalEulerAngles().clone();
        this.finishCameraFov = 44.03;

        this.finishCamera.setPosition(this.playerCamera.getPosition());
        this.finishCamera.setRotation(this.playerCamera.getRotation());
        this.finishCamera.camera.fov = this.playerCamera.camera.fov;

        this.finishCamera.enabled = true;
        this.playerCamera.enabled = false;

        this.tweenFinishCamera();
        // this.app.fire("showHappyTime");
        this.app.fire("onGameStart", false);
    }, 500);
};

LevelFinisherCanon.prototype.tweenFinishCamera = function () {
    this.finishCamera
        .tween(this.finishCamera.getLocalPosition())
        .to(this.finishCameraPosition, 1.5, pc.Linear)
        .start();

    var fov = { value: this.playerCamera.camera.fov };

    this.finishCamera
        .tween(fov)
        .to({ value: this.finishCameraFov }, 1.5, pc.Linear)
        .onUpdate(function () {
            this.finishCamera.camera.fov = fov.value;
        }.bind(this))
        .start();


    setTimeout(() => {
        this.finishCamera
            .tween(this.finishCamera.getLocalEulerAngles())
            .rotate(this.finishCameraRotation, 1, pc.Linear)
            .onComplete(() => {

                setTimeout(() => {

                    GameMenuEventListener.instance.onCanonCameraTransitionComplete();
                    //this.app.fire("LevelFinisherCanon:CameraTransitionComplete");

                    this.fillMask = GameMenuEventListener.instance.canonFinisherSettings.fillMask;
                    this.maxTxt = GameMenuEventListener.instance.canonFinisherSettings.maxGaugeTxt;
                    this.tapBtn = GameMenuEventListener.instance.canonFinisherSettings.tapBtn;
                    this.canonFinisherSubGrp = GameMenuEventListener.instance.canonFinisherSettings.canonFinisherSubGrp;
                    this.canonFinisherBonusText = GameMenuEventListener.instance.canonFinisherSettings.bonusText;

                    this.tapBtn.enabled = true;
                    this.fillMask.element.width = this.minFill;
                    this.maxTxt.enabled = false;
                    this.startTimer();

                }, 500);

            })
            .start();

    }, 500);
};

LevelFinisherCanon.prototype.startTimer = function () {

    this.isTappingAllowed = true;

    this.seqTimer = setTimeout(() => {
        this.isTappingAllowed = false;
        this.launchBall();
    }, this.sequenceDuration * 1000);

};

LevelFinisherCanon.prototype.launchBall = function () {

    setTimeout(() => {

        this.canonFinisherSubGrp.enabled = false;
        let currentWidth = this.fillMask.element.width;
        let zDistance = changeRange(currentWidth, this.minFill, this.maxFill, this.minBallDistZ, this.maxBallDistZ);
        this.app.fire("onCanonFollowCamera", true);
        this.canonFinisherBonusText.enabled = true;

        this.airParticles.enabled = true;
        this.sparkleParticle.enabled = true;
        this.startPointsDetection(true);
        this.tweenBallRotation();

        this.app.fire(EventTypes.PLAY_SFX, 'cannonBallShot');
        this.app.fire(EventTypes.UNMUTE_SOUND, 'ballRolling');

        const volumeHolder = { volume: 0.7 };

        this.canonBall.tween(volumeHolder)
            .to({ volume: 0.0 }, 5.25, pc.SineIn)
            .onUpdate(() => {
                this.app.fire(EventTypes.UNMUTE_SOUND, 'ballRolling', volumeHolder.volume);
            })
            .start();

        this.canonBall.tween(this.canonBall.getLocalPosition())
            .to({ x: this.canonBall.getLocalPosition().x, y: this.canonBall.getLocalPosition().y, z: zDistance }, 6, pc.CubicOut)
            .onComplete(() => {

                this.app.fire(EventTypes.MUTE_SOUND, 'ballRolling');

                this.airParticles.enabled = false;
                this.sparkleParticle.enabled = false;
                this.app.fire("onCanonFollowCamera", false);
                this.startPointsDetection(false);

                this.canonFinisherBonusText.enabled = false;
                this.app.fire("LevelFinisher:scoreMultipler", parseFloat(this.multiplier.toFixed(1)));

                CustomCoroutine.Instance.set(() => {
                    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.LevelEnd);
                }, 0.6);
            })
            .start();

    }, 500);

};

LevelFinisherCanon.prototype.startPointsDetection = function (canStart) {

    this.isSequenceRunning = canStart;

};

LevelFinisherCanon.prototype.tweenBallRotation = function () {

    var rot = { value: 0 };

    this.entity
        .tween(rot)
        .to({ value: -2000 }, 6, pc.SineOut)
        .onUpdate(function () {

            this.canonBall.setEulerAngles(rot.value, 0, 0);

        }.bind(this))
        .start();

};

// update code called every frame
LevelFinisherCanon.prototype.update = function (dt) {

    if (this.isTappingAllowed) {

        let fillDecrement = this.fillMask.element.width - this.emptySpeed;

        if (fillDecrement > this.minFill)
            this.fillMask.element.width -= this.emptySpeed;
        else {
            this.fillMask.element.width = this.minFill;
        }

    }

    if (this.isSequenceRunning) {

        if (this.detectPointsState[this.currentPointIndex]) {

            if (!this.detectPointsState[this.currentPointIndex].isDetected) {


                for (this.index1 = 0; this.index1 < this.headFinishers[this.currentPointIndex].script.headFinisherController.gums.length; this.index1++) {

                    if (Math.abs(this.headFinishers[this.currentPointIndex].script.headFinisherController
                        .gums[this.index1].script.gumManager.gumDetectionPoint.getPosition().z - this.canonBall.getPosition().z) < 1) {

                        for (this.index2 = 0; this.index2 < 2; this.index2++) {

                            this.headFinishers[this.currentPointIndex].script.headFinisherController
                                .gums[this.index1].script.gumManager.dirtyGums[this.index2].enabled = false;

                        }

                    }


                }


                if (this.canonBall.getPosition().distance(this.detectPointsState[this.currentPointIndex].point.getPosition()) < 1) {

                    this.multiplier += 0.1;
                    this.detectPointsState[this.currentPointIndex].isDetected = true;
                    this.app.fire("setCanonBonusTxt", true, LocalizationManager.getInstance().getLocalizedText('BONUS X1.0').replace('X1.0', `X${this.multiplier.toFixed(1)}`));
                    this.currentPointIndex++;

                }

            }
        }

    }


};

// dirtyTeeth.js
var DirtyTeeth = pc.createScript('dirtyTeeth');

DirtyTeeth.attributes.add('teethData', {
    type: 'json',
    schema: [{
        name: 'toothClean',
        type: 'entity',
    }, {
        name: 'dirt',
        type: 'entity',
        array: true
    }, {
        name: 'particleEffect',
        type: 'entity',
    }, {
        name: 'text',
        type: 'entity',
    }, {
        name: 'collisionEnt',
        type: 'entity',
    }]
});

// initialize code called once per entity
DirtyTeeth.prototype.initialize = function () {

    // Vars
    this.isTouchDown = false;
    this.isMouseDown = false;
    this.isFingerDown = false;
    this.tutorialHandState = true;
    this.cameraTransitionComplete = false;
    this.currentTeethCleanProgress = 0;
    this.areTweensStarted = false;
    this.areTweensPaused = false;
    this.isTimerFinished = false;
    this.isTeethTextEnabled = false;

    // Tweens rock
    this.rock_0Tween = this.teethData.dirt[0].tween(this.teethData.dirt[0].getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.3, pc.SineOut);
    this.rock_1Tween = this.teethData.dirt[1].tween(this.teethData.dirt[1].getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.15, pc.SineOut);
    this.rock_2Tween = this.teethData.dirt[2].tween(this.teethData.dirt[2].getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.4, pc.SineOut);
    this.rock_3Tween = this.teethData.dirt[3].tween(this.teethData.dirt[3].getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.2, pc.SineOut);
    this.rock_4Tween = this.teethData.dirt[4].tween(this.teethData.dirt[4].getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.1, pc.SineOut);

    // Tween teeth
    this.cleanTween = null;

    // Text Tween
    this.textTween = null;

    this.setupCleanTeethTween();

    // Setup Text Tween and Color
    this.setupMultiplerText();

    this.app.on("LevelFinisher:CameraTransitionComplete", this.cameraTransitionComplete, this);
    this.app.on("levelFinisher:TimerFinished", this.timerFinished, this);
    this.app.on("LevelFinisherTeethClean:resetTextScales", this.resetTextScales, this);
    this.on("destroy", this.onDestroy, this);

    this.setupRandomMultiplier();
};

DirtyTeeth.prototype.onDestroy = function () {

    this.app.off("LevelFinisher:CameraTransitionComplete", this.cameraTransitionComplete, this);
    this.app.off("levelFinisher:TimerFinished", this.timerFinished, this);
    this.app.off("LevelFinisherTeethClean:resetTextScales", this.resetTextScales, this);

};

DirtyTeeth.prototype.resetTextScales = function () {
    if (this.isTeethTextEnabled)
        this.teethData.text.setLocalScale(1, 1, 1);
};

DirtyTeeth.prototype.setupRandomMultiplier = function () {

    this.randomMultiplier = getRandomInt(2, 6);
    this.teethData.text.element.text = "X" + this.randomMultiplier;
    let randomColor = getRandomColor();
    this.teethData.text.element.color = new pc.Color().fromString(randomColor);

};

DirtyTeeth.prototype.timerFinished = function () {

    this.isTimerFinished = true;
    this.cleanTeethsAnim(false);

};

DirtyTeeth.prototype.setupMultiplerText = function () {

    this.teethData.text.setLocalScale(0, 0, 0);
    this.teethData.text.enabled = true;
    this.textTween = this.teethData.text.tween(this.teethData.text.getLocalScale()).to(new pc.Vec3(1, 1, 1), 0.1, pc.SineOut)
        .onComplete( () => {
            this.app.fire("LevelFinisherTeethClean:changeMultiplier", this.randomMultiplier, this.teethData.text);
            this.isTeethTextEnabled = true;
        });

};

DirtyTeeth.prototype.setupCleanTeethTween = function () {

    this.cacheVec = new pc.Vec2(0, 0.73);

    for (let i = 0; i < this.teethData.toothClean.render.meshInstances.length; i++) {
        this.teethData.toothClean.render.meshInstances[i].material.opacityMapOffset = this.cacheVec;
        this.teethData.toothClean.render.meshInstances[i].material.update();
    }

    this.opacityTeeth = { value: 0.73 };

    this.cleanTween = this.teethData.toothClean
        .tween(this.opacityTeeth)
        .to({ value: 0.82 }, 1.5, pc.Linear)
       .onUpdate( function () {
            this.cacheVec.set(0, this.opacityTeeth.value);

            for (let i = 0; i < this.teethData.toothClean.render.meshInstances.length; i++) {
                this.teethData.toothClean.render.meshInstances[i].material.opacityMapOffset = this.cacheVec;
                this.teethData.toothClean.render.meshInstances[i].material.update();
            }

        }.bind(this))
        .onComplete( () => {
            this.textTween.start();
            this.runParticleEffect();
        });

};

DirtyTeeth.prototype.runParticleEffect = function () {

    for (let i = 0; i < this.teethData.particleEffect.children.length; i++) {
        this.teethData.particleEffect.children[i].enabled = true;
        this.teethData.particleEffect.children[i].particlesystem.reset();
        this.teethData.particleEffect.children[i].particlesystem.play();
    }

};

DirtyTeeth.prototype.cameraTransitionComplete = function () {

    this.cameraTransitionComplete = true;

};

// DirtyTeeth.prototype.onMouseEnter = function () {

//     if (this.isFingerDown) {
//         this.startCleaningAnimation(true);
//     }
// };

// DirtyTeeth.prototype.onMouseLeave = function () {

//     this.startCleaningAnimation(false);

// };

// DirtyTeeth.prototype.onMouseDown = function () {

//     this.startCleaningAnimation(true);

// };

// DirtyTeeth.prototype.onMouseUp = function () {

//     this.startCleaningAnimation(false);

// };

// DirtyTeeth.prototype.onTouchStart = function () {

//     this.isTouchDown = true;

// };

// DirtyTeeth.prototype.onTouchEnd = function () {

//     this.isTouchDown = false;

// };

// DirtyTeeth.prototype.hoverstart = function () {

//     console.log(" Hover start ");

// };

DirtyTeeth.prototype.startCleaningAnimation = function (canStartAnim) {

    if (!this.isTimerFinished) {

        if (canStartAnim) {

            if (this.tutorialHandState === true) {
                this.tutorialHandState = false;
                this.app.fire("setTutorialHandState", this.tutorialHandState);
                this.app.fire("LevelFinisherTeethClean:StartTimer");
            }

            this.cleanTeethsAnim(true);

        } else {

            this.cleanTeethsAnim(false);

        }

    }

};

DirtyTeeth.prototype.cleanTeethsAnim = function (canAnimate) {

    if (canAnimate) {

        if (this.areTweensStarted === false) {
            this.areTweensStarted = true;
            this.areTweensPaused = false;
            this.rock_0Tween.start();
            this.rock_1Tween.start();
            this.rock_2Tween.start();
            this.rock_3Tween.start();
            this.rock_4Tween.start();

            // Tween teeth
            this.cleanTween.start();

        } else {
            if (this.areTweensPaused) {
                this.areTweensPaused = false;
                this.rock_0Tween.resume();
                this.rock_1Tween.resume();
                this.rock_2Tween.resume();
                this.rock_3Tween.resume();
                this.rock_4Tween.resume();

                // Tween teeth
                this.cleanTween.resume();
            }
        }
    } else {

        if (this.areTweensStarted) {
            if (this.areTweensPaused === false) {
                this.areTweensPaused = true;
                this.rock_0Tween.pause();
                this.rock_1Tween.pause();
                this.rock_2Tween.pause();
                this.rock_3Tween.pause();
                this.rock_4Tween.pause();

                // Tween teeth
                this.cleanTween.pause();
            }
        }

    }

};


// update code called every frame
DirtyTeeth.prototype.update = function (dt) {

    // this.isMouseDown = this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT);

    // if (this.isMouseDown || this.isTouchDown)
    //     this.isFingerDown = true;
    // else
    //     this.isFingerDown = false;

};

// UvAnimate.js
var UvAnimate = pc.createScript('uvAnimate');

UvAnimate.attributes.add('X', { type: 'number' });
UvAnimate.attributes.add('Y', { type: 'number' });
UvAnimate.attributes.add('Z', { type: 'number' });
UvAnimate.attributes.add('maxRange', { type: 'number' });
UvAnimate.attributes.add('originalXPos', { type: 'number' });

// initialize code called once per entity
UvAnimate.prototype.initialize = function () {

};

// update code called every frame
UvAnimate.prototype.update = function (dt) {

    this.entity.translateLocal(this.X, this.Y, this.Z);

    var pos = this.entity.getLocalPosition();

    if (pos.x < this.maxRange) {
        this.entity.setLocalPosition(this.originalXPos, 0, 0);
        // console.log(this.originalXPos);

    }

};

// AdsMenuEventListener.js
var AdsMenuEventListener = pc.createScript('adsMenuEventListener');

// initialize code called once per entity
AdsMenuEventListener.prototype.initialize = function() {

};

// update code called every frame
AdsMenuEventListener.prototype.update = function(dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// AdsMenuEventListener.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// MissionMenuEventListener.js
var MissionMenuEventListener = pc.createScript('missionMenuEventListener');

MissionMenuEventListener.attributes.add('timeTxt', { type: 'entity', title: 'Time Txt' });

MissionMenuEventListener.attributes.add('missionBtns', {
    type: 'json',
    title: 'Missons Buttons',
    schema: [
        { name: 'closeBtn', title: 'Close Missions Button', type: 'entity' },
    ],
});

MissionMenuEventListener.attributes.add('missionTiles', {
    type: 'json',
    title: 'Missons Tiles',
    schema: [
        { name: 'tile', title: 'Tile', type: 'entity' },
    ],
    array: true,
});

MissionMenuEventListener.attributes.add('bigMissionSettings', {
    type: 'json',
    title: 'Big Mission Settings',
    schema: [
        { name: 'progressTxt', title: 'Progress Txt', type: 'entity' },
        { name: 'fill', title: 'Fill', type: 'entity' },
        { name: 'fillWidth', title: 'Fill Width', type: 'number' },
        { name: 'progressContainer', title: 'Progress Container', type: 'entity' },
        { name: 'claimContainer', title: 'Claim Container', type: 'entity' },
        { name: 'claimBtn', title: 'Claim Button', type: 'entity' },
    ],
});

// initialize code called once per entity
MissionMenuEventListener.prototype.initialize = function () {
    this.preLabels = ['COLLECT', 'CLEAN', 'REACH', 'COMPLETE'];
    this.postLabels = ['', 'HEADS', 'FEVER', 'LEVELS'];
    this.initEvents();

    this.collectablesSpawnerGems = this.entity.findByName('CollectablesSpawner_Gems');
    this.iconGems = this.entity.findByName('GemsCounterIcon');


};

MissionMenuEventListener.prototype.postInitialize = function () {
    this.onEnable();
};

MissionMenuEventListener.prototype.initEvents = function () {

    this.missionBtns.closeBtn.button.on("click", this.onCloseBtnClicked, this);
    this.app.on('MissionMenu:ClaimBigReward', this.onClickClaimBigReward, this);
    this.app.on('MissionMenu:ClaimMissionReward', this.onClickClaimMissionReward, this);
    this.on("destroy", this.onDestroy, this);
    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    this.app.on('MissionManager:Timer', this.updateClock, this);
};

MissionMenuEventListener.prototype.onEnable = function () {
    let data = MissionsManager.Instant.getTodayMissions();
    Debug.log(data);

    // Set Big Mission
    let total = MissionsManager.Instant.missionsToUnlockBigMission;

    this.bigMissionSettings.claimContainer.enabled = data.completedMissions >= total;
    this.bigMissionSettings.claimBtn.button.active = data.completedMissions >= total;
    this.bigMissionSettings.progressContainer.enabled = data.completedMissions < total;

    // if (data.completedMissions >= total) {
    this.bigMissionSettings.progressTxt.element.text = `${data.completedMissions} / ${total}`;
    this.bigMissionSettings.fill.element.width = pc.math.clamp(data.completedMissions / total, 0, 1) * this.bigMissionSettings.fillWidth;
    // }

    // Set Missions
    let label, coins, status = 3, completedMissionsCount = 0;

    for (let i = 0; i < 3; i++) {
        if (data.tasks[i].type === MissionType.CollectXSoftCurrency) {
            label = this.preLabels[data.tasks[i].type];
            coins = data.tasks[i].value;
        }
        else {
            coins = undefined;
            const baseText = LocalizationManager.getInstance().getLocalizedText(`${this.preLabels[data.tasks[i].type]} # ${this.postLabels[data.tasks[i].type]}`).replace('#', `${data.tasks[i].value}`);

            label = baseText;//`${LocalizationManager.getInstance().getLocalizedText(this.preLabels[data.tasks[i].type])} ${data.tasks[i].value} ${LocalizationManager.getInstance().getLocalizedText(this.postLabels[data.tasks[i].type])}`;
        }

        Debug.log(data.tasks[i].progress, data.tasks[i].value);
        if (data.tasks[i].progress === -1) {
            status = 0;
            completedMissionsCount++;
        }
        else if (data.tasks[i].progress >= data.tasks[i].value)
            status = 1;
        else if (data.tasks[i].progress < data.tasks[i].value)
            status = 3;
        else
            status = 2;

        this.missionTiles[i].tile.fire('MissionTile:Set', label, coins, data.tasks[i].reward, data.tasks[i].progress, data.tasks[i].value, status);
    }

    // if (completedMissionsCount >= 3) {
    //     MissionsManager.Instant.createNewMissions();
    //     MissionsManager.Instant.save();
    //     this.onEnable();
    // }

    this.updateClock(MissionsManager.Instant.timer);
};

MissionMenuEventListener.prototype.onDestroy = function () {
    this.app.fire("sound:playSound", "BtnSound");
    this.missionBtns.closeBtn.button.off("click", this.onCloseBtnClicked, this);
};


MissionMenuEventListener.prototype.onDisable = function () {

};

MissionMenuEventListener.prototype.onCloseBtnClicked = async function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Missions:Quit"
    });
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.CloseOverlay);
};

MissionMenuEventListener.prototype.onClickClaimBigReward = async function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Missions:ClaimBigReward"
    });
    let data = MissionsManager.Instant.getTodayMissions();
    const rewardValue = MissionsManager.Instant.bigRewardValue;
    // give 5000 gems
    // this.app.fire("addGems", MissionsManager.Instant.bigRewardValue);
    Debug.log('onClickClaimBigReward: ');
    // GameAnalytics("addDesignEvent", "Mission:Big:Complete:Gems", data.tasks[index].reward);
    this.spawnAndPickupGems(this.entity.findByName('ChestTop').getPosition(), rewardValue, 1.5).then(() => {

    });

    this.bigMissionSettings.claimBtn.button.active = false;
    data.completedMissions = 0;
    MissionsManager.Instant.save();
    this.onEnable();


};

MissionMenuEventListener.prototype.onClickClaimMissionReward = function (index) {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Missions:ClaimReward"
    });
    let data = MissionsManager.Instant.getTodayMissions();
    // give data.tasks[index].reward gems 
    data.tasks[index].progress = -1;
    data.completedMissions++;
    this.app.fire("addGems", data.tasks[index].reward);

    Debug.log('onClickClaimMissionReward: ', index);
    // GameAnalytics("addDesignEvent", "Mission:Complete:Gems", data.tasks[index].reward);

    MissionsManager.Instant.save();
    this.onEnable(); // to refresh page
};

MissionMenuEventListener.prototype.updateClock = function (sec) {
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) hours = "0" + hours.toFixed(0);
    else hours = hours.toFixed(0);

    if (minutes < 10) minutes = "0" + minutes.toFixed(0);
    else minutes = minutes.toFixed(0);

    if (seconds < 10) seconds = "0" + seconds.toFixed(0);
    else seconds = seconds.toFixed(0);

    this.timeTxt.element.text = `${hours}:${minutes}:${seconds}`;
};

// update code called every frame
MissionMenuEventListener.prototype.update = function (dt) {

};

MissionMenuEventListener.prototype.spawnAndPickupGems = async function (_fromWorldPosition, amount, duration = 1.25) {
    if (!amount) return Promise.resolve();
    if (this.tweenValues) {
        const delay = Math.max(duration - this.tweenDuration / 2);
        Utils.wait(delay * 1000).then(() => {
            this.app.fire("addGems", parseInt(amount), this.tweenDuration);
        });
    } else {
        this.app.fire("addGems", parseInt(amount), this.tweenDuration);
    }
    this.app.fire(EventTypes.PLAY_SFX, 'pickupGems');
    return this.collectablesSpawnerGems.collect(_fromWorldPosition, this.iconGems.getPosition(), amount, duration);
};


// ShopMenuEventListener.js
var ShopMenuEventListener = pc.createScript('shopMenuEventListener');

ShopMenuEventListener.attributes.add('shopBtns', {
    type: 'json',
    title: 'Shop Buttons',
    schema: [
        { name: 'closeBtn', title: 'Close Shop Button', type: 'entity' },
        { name: 'shopPreviewBrush', title: 'Preview 3D preview', type: 'entity' },
        { name: 'shopPreviewCanon', title: 'Preview 3D preview', type: 'entity' },
        { name: 'shopPreviewMonster', title: 'Preview 3D preview', type: 'entity' },
        { name: 'buyBtn', title: 'Buy Button', type: 'entity' },
        { name: 'brushShopBtn', title: 'Brush Shop Button', type: 'entity' },
        { name: 'canonShopBtn', title: 'Canon Shop Button', type: 'entity' },
        { name: 'monsterShopBtn', title: 'Monster Shop Button', type: 'entity' },

    ],
});

ShopMenuEventListener.attributes.add('shopTabs', {
    type: 'json',
    title: 'Shop Tabs',
    schema: [
        { name: 'brushTab', type: 'entity' },
        { name: 'canonTab', type: 'entity' },
        { name: 'monsterTab', type: 'entity' },
    ],
});

ShopMenuEventListener.attributes.add('gemsText', { type: 'entity' });


// initialize code called once per entity
ShopMenuEventListener.prototype.initialize = function () {

    this.initEvents();
    this.shopBtns.shopPreviewBrush.enabled = true;
    this.onBrushShopBtnClicked();
    this.gemsText.element.text = EconomyManager.Instance.totalGems;

    this.on("enable", this.onEnableEntity, this);
    this.on("disable", this.onDisableEntity, this);
    this.app.on('hideShopPriceButton', this.onHidePriceButton, this);
};

ShopMenuEventListener.prototype.onHidePriceButton = function () {
    this.shopBtns.buyBtn.enabled = false;
};

ShopMenuEventListener.prototype.onEnableEntity = function () {

    this.gemsText.element.text = EconomyManager.Instance.totalGems;
    this.closeAllTabs();
    this.onBrushShopBtnClicked();
    this.shopBtns.shopPreviewBrush.enabled = true;
    this.app.root.findByTag("mainPlayerCamera")[0].enabled = false;

};

ShopMenuEventListener.prototype.onUpdateShopGems = function () {

    this.gemsText.element.text = EconomyManager.Instance.totalGems;

};

ShopMenuEventListener.prototype.onDisableEntity = function () {

    this.shopBtns.shopPreviewBrush.enabled = false;
    this.shopBtns.shopPreviewCanon.enabled = false;
    this.shopBtns.shopPreviewMonster.enabled = false;
    this.app.root.findByTag("mainPlayerCamera")[0].enabled = true;

};

ShopMenuEventListener.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.shopBtns.closeBtn.button.on("click", this.onCloseBtnClicked, this);
    this.shopBtns.buyBtn.button.on("click", this.onBuyBtnClicked, this);
    this.shopBtns.brushShopBtn.button.on("click", this.onBrushShopBtnClicked, this);
    this.shopBtns.canonShopBtn.button.on("click", this.onCanonShopBtnClicked, this);
    this.shopBtns.monsterShopBtn.button.on("click", this.onmonsterShopBtnClicked, this);
    this.app.on("updateShopGems", this.onUpdateShopGems, this);

};

ShopMenuEventListener.prototype.onDestroy = function () {

    this.shopBtns.closeBtn.button.off("click", this.onCloseBtnClicked, this);
    this.shopBtns.buyBtn.button.off("click", this.onBuyBtnClicked, this);
    this.shopBtns.brushShopBtn.button.off("click", this.onBrushShopBtnClicked, this);
    this.shopBtns.canonShopBtn.button.off("click", this.onCanonShopBtnClicked, this);
    this.shopBtns.monsterShopBtn.button.off("click", this.onmonsterShopBtnClicked, this);
    this.app.off("updateShopGems", this.onUpdateShopGems, this);

};

ShopMenuEventListener.prototype.onCloseBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:Quit"
    });
    this.app.fire("sound:playSound", "BtnSound");
    if(ShopManager.instance.isRestartNeeded()) {
       LevelManager.getInstance().restartLevel();
    } else {
        this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Main);
    }
    this.app.fire("displayBanner", "home", false);

};

ShopMenuEventListener.prototype.onBuyBtnClicked = function () {

};

ShopMenuEventListener.prototype.onBrushShopBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:SwitchCategory"
    });
    this.app.fire("sound:playSound", "BtnSound");
    this.onTopTabBtnClicked(this.shopTabs.brushTab, this.shopBtns.brushShopBtn);
    this.reparentToBottom(this.shopBtns.brushShopBtn);
    this.shopBtns.shopPreviewBrush.enabled = true;

};

ShopMenuEventListener.prototype.onCanonShopBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:SwitchCategory"
    });
    this.app.fire("sound:playSound", "BtnSound");
    this.onTopTabBtnClicked(this.shopTabs.canonTab, this.shopBtns.canonShopBtn);
    this.reparentToBottom(this.shopBtns.canonShopBtn);
    this.shopBtns.shopPreviewCanon.enabled = true;

};

ShopMenuEventListener.prototype.onmonsterShopBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:SwitchCategory"
    });
    this.app.fire("sound:playSound", "BtnSound");
    this.onTopTabBtnClicked(this.shopTabs.monsterTab, this.shopBtns.monsterShopBtn);
    this.reparentToBottom(this.shopBtns.monsterShopBtn);
    this.shopBtns.shopPreviewMonster.enabled = true;

};

ShopMenuEventListener.prototype.onTopTabBtnClicked = function (tab, btn) {
    this.app.fire('hideShopPriceButton');
    this.closeAllTabs();
    tab.enabled = true;
    btn.parent.children[0].enabled = true;
    btn.parent.children[1].enabled = false;

};

ShopMenuEventListener.prototype.closeAllTabs = function () {

    this.shopTabs.brushTab.enabled = false;
    this.shopBtns.brushShopBtn.parent.children[0].enabled = false;
    this.shopBtns.brushShopBtn.parent.children[1].enabled = true;

    this.shopTabs.canonTab.enabled = false;
    this.shopBtns.canonShopBtn.parent.children[0].enabled = false;
    this.shopBtns.canonShopBtn.parent.children[1].enabled = true;

    this.shopTabs.monsterTab.enabled = false;
    this.shopBtns.monsterShopBtn.parent.children[0].enabled = false;
    this.shopBtns.monsterShopBtn.parent.children[1].enabled = true;


    this.shopBtns.shopPreviewBrush.enabled = false;
    this.shopBtns.shopPreviewCanon.enabled = false;
    this.shopBtns.shopPreviewMonster.enabled = false;


};

ShopMenuEventListener.prototype.reparentToBottom = function (btn) {

    // let shopTabBtn = btn.parent;
    // let tabContainer = btn.parent.parent;
    // shopTabBtn.reparent(tabContainer, 2);

};

// update code called every frame
ShopMenuEventListener.prototype.update = function (dt) {

};

// SettingsMenuEventListener.js
var SettingsMenuEventListener = pc.createScript('settingsMenuEventListener');


SettingsMenuEventListener.attributes.add('settingsBtns', {
    type: 'json',
    title: 'Settings Buttons',
    schema: [
        { name: 'closeBtn', title: 'Close Settings Button', type: 'entity' },
        { name: 'vibrationBtn', title: 'Vibration Button', type: 'entity' },
        { name: 'soundToggleButton', title: 'Sound Toggle Button', type: 'entity' },
        { name: 'soundCheckbox', title: 'Sound Checkbox', type: 'entity' },
        { name: 'soundSpriteCheck', title: 'Sound Sprite Check', type: 'asset' },
        { name: 'soundSpriteUncheck', title: 'Sound Sprite Uncheck', type: 'asset' },
        { name: 'musicToggleButton', title: 'Music Toggle Button', type: 'entity' },
        { name: 'musicCheckbox', title: 'Music Checkbox', type: 'entity' },
        { name: 'musicSpriteCheck', title: 'Music Sprite Check', type: 'asset' },
        { name: 'musicSpriteUncheck', title: 'Music Sprite Uncheck', type: 'asset' },

    ],
});

// initialize code called once per entity
SettingsMenuEventListener.prototype.initialize = function () {
    this.initEvents();
};

SettingsMenuEventListener.prototype.postInitialize = function () {
    this.updateSoundButtons();
    this.updateMusicButtons();
};

SettingsMenuEventListener.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.settingsBtns.closeBtn.button.on("click", this.onCloseBtnClicked, this);
    this.settingsBtns.vibrationBtn.button.on("click", this.onVibrationBtnClicked, this);
    this.settingsBtns.soundToggleButton.button.on("click", this.onSoundBtnClick, this);
    this.settingsBtns.musicToggleButton.button.on("click", this.onMusicBtnClick, this);

    this.app.on(EventTypes.SOUND_STATE_CHANGED, this.updateSoundButtons, this);
    this.app.on(EventTypes.MUSIC_STATE_CHANGED, this.updateMusicButtons, this);

};

SettingsMenuEventListener.prototype.onDestroy = function () {

    this.settingsBtns.closeBtn.button.off("click", this.onCloseBtnClicked, this);
    this.settingsBtns.vibrationBtn.button.off("click", this.onVibrationBtnClicked, this);

};

SettingsMenuEventListener.prototype.onCloseBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Settings:Quit"
    });

    this.app.fire("sound:playSound", "BtnSound");
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.CloseOverlay);

};

SettingsMenuEventListener.prototype.onSoundBtnClick = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Settings:ToggleSFX"
    });


    if (SoundController.sfxEnabled) {
        this.app.fire(EventTypes.DISABLE_SFX);
    } else {
        this.app.fire(EventTypes.ENABLE_SFX);
    }
    this.app.fire("sound:playSound", "BtnSound");
};


SettingsMenuEventListener.prototype.onMusicBtnClick = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Settings:ToggleMusic"
    });


    if (SoundController.musicEnabled) {
        this.app.fire(EventTypes.DISABLE_MUSIC);
    } else {
        this.app.fire(EventTypes.ENABLE_MUSIC);
    }
    this.app.fire("sound:playSound", "BtnSound");
};


SettingsMenuEventListener.prototype.onVibrationBtnClicked = function () {

    // TODO: For android, iOS doesn't support vibrations

};

// update code called every frame
SettingsMenuEventListener.prototype.update = function (dt) {

};


SettingsMenuEventListener.prototype.updateSoundButtons = function () {
    if (SoundController.sfxEnabled) {
        this.settingsBtns.soundCheckbox.element.sprite = this.settingsBtns.soundSpriteCheck.resource;
    } else {
        this.settingsBtns.soundCheckbox.element.sprite = this.settingsBtns.soundSpriteUncheck.resource;
    }
};

SettingsMenuEventListener.prototype.updateMusicButtons = function () {
    if (SoundController.musicEnabled) {
        this.settingsBtns.musicCheckbox.element.sprite = this.settingsBtns.musicSpriteCheck.resource;
    } else {
        this.settingsBtns.musicCheckbox.element.sprite = this.settingsBtns.musicSpriteUncheck.resource;
    }
}

// _loading_.js
window._createLoadingScreen = window._createLoadingScreen || function () {

    pc.script.createLoadingScreen(function (app) {

        var showSplash = function () {

            // splash wrapper
            var wrapper = document.createElement('div');
            wrapper.id = 'application-splash-wrapper';
            document.body.appendChild(wrapper);

            // splash
            var splash = document.createElement('div');
            splash.id = 'application-splash';
            wrapper.appendChild(splash);
            splash.style.display = 'block';

            var logo = document.createElement('img');
            splash.appendChild(logo);
            logo.onload = function () {
                splash.style.display = 'block';
            };

            var container = document.createElement('div');
            container.id = 'progress-bar-container';
            splash.appendChild(container);

            var bar = document.createElement('div');
            bar.id = 'progress-bar';
            container.appendChild(bar);


            // image Top corner
            var gameLogo = document.createElement('img');
            gameLogo.id = 'game-logo';
            gameLogo.src = 'data:image/webp;base64,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';
            wrapper.appendChild(gameLogo);
            gameLogo.onload = function () {
                gameLogo.style.display = 'block';
            };

        };

        var hideSplash = function () {
            var splash = document.getElementById('application-splash-wrapper');
            splash.parentElement.removeChild(splash);

            APIMediator.sendPreloadProgress(100);
            APIMediator.initCallbacks();
            APIMediator.reportGameReady();
        };

        var setProgress = function (value) {

            var bar = document.getElementById('progress-bar');
            if (bar) {
                value = Math.min(1, Math.max(0, value));
                bar.style.width = value * 99 + '%';
            }

            value = Math.min(1, Math.max(0, value));
            APIMediator.sendPreloadProgress(value * 99);
        };

        var createCss = function () {
            var css = [
                'body {',
                '    background-color: #FFFFFF;',
                '}',
                '',
                '#application-splash-wrapper {',
                '    position: absolute;',
                '    top: 0;',
                '    left: 0;',
                '    height: 100%;',
                '    width: 100%;',
                '    background-color: #FFFFFF;',
                '}',
                '',
                '#application-splash {',
                '    position: absolute;',
                '    top: calc(50% - 28px);',
                '    width: 264px;',
                '    left: calc(50% - 132px);',
                '}',
                '#game-logo {',
                '    position: absolute;',
                '    top: calc(50% - 237px);',
                '    width: 310px;',
                '    left: calc(50% - 155px);',
                '}',
                '',
                '#application-splash img {',
                '    width: 100%;',
                '}',
                '',
                '#progress-bar-container {',
                '    margin: 20px auto 0 auto;',
                '    height: 10px;',
                '    width: 100%;',
                '    background-color: #bbbbbb;',
                '    border-radius: 5px;',
                '}',
                '',
                '#progress-bar {',
                '    width: 0%;',
                '    height: 100%;',
                '    background-color: #35B2FF;',
                '    border-radius: 5px;',
                '}',
                '',
                '@media (max-width: 480px) {',
                '    #application-splash {',
                '        width: 170px;',
                '        left: calc(50% - 85px);',
                '    }',
                '    #game-logo {',
                '        top: calc(50% - 125px);',
                '        width: 200px;',
                '        left: calc(50% - 100px);',
                '    }',
                '}',
                `@media (max-height: 480px) {
                    #application-splash {
                        top: calc(50% + 50px);
                        width: 264px;
                        left: calc(50% - 132px);
                    }
                    #game-logo {
                        top: calc(50% - 130px);
                        width: 310px;
                        left: calc(50% - 155px);
                    }
                }`
            ].join('\n');

            var style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.head.appendChild(style);
        };

        createCss();
        showSplash();
        app.on('preload:end', function () {
            app.off('preload:progress');
        });
        app.on('preload:progress', setProgress);
        app.on('start', () => {
            const inputBlocker = app.root.findByName('InputBlocker');
            inputBlocker.element.enabled = true;
            app.once('OnEnvironmentReady', () => {
                inputBlocker.element.enabled = false;
                hideSplash();
            });
        });
    });
};

if (APIMediator.isPlaycanvasEnvironment() && typeof GameInterface === 'undefined') {

    const gameInterfaceScript = document.createElement('script');
    gameInterfaceScript.setAttribute('src', 'https://api.h5games.com/v/game-interface.js');
    document.head.appendChild(gameInterfaceScript);

    gameInterfaceScript.onload = () => {
        window.GameInterface.init([], {
            "features": {
                "rewarded": true,
                "audio": true,
                "tutorial": true,
                "copyright": true,
                "credits": true,
                "privacy": true,
                "pause": true,
                "score": true,
                "progress": false,
                "visibilitychange": false
            }
        }).then(() => {
            window._createLoadingScreen();
        });
    };
} else {
    window._createLoadingScreen();
}


// DeviceChecker.js
var DeviceChecker = pc.createScript('deviceChecker');

DeviceChecker.attributes.add('graphicSetting', {
    type: 'json',
    title: 'Graphic Settings',
    schema: [
        { name: 'low', type: 'entity' },
        { name: 'med', type: 'entity' },
        { name: 'high', type: 'entity' },
        { name: 'checkbox', type: 'asset' },
        { name: 'unCheckbox', type: 'asset' },
    ],
});

// initialize code called once per entity
DeviceChecker.prototype.initialize = function () {

    this.app.deviceType = {
        Low: "Low",
        Mid: "Mid",
        High: "High",
    };

    this.graphicSetting.low.button.on("click", this.onLowSetting, this);
    this.graphicSetting.med.button.on("click", this.onMedSetting, this);
    this.graphicSetting.high.button.on("click", this.onHighSetting, this);

};

DeviceChecker.prototype.onLowSetting = function () {

    this.setSettings(this.app.deviceType.Low);
    this.app.fire("sound:playSound", "BtnSound");

};

DeviceChecker.prototype.onMedSetting = function () {

    this.setSettings(this.app.deviceType.Mid);
    this.app.fire("sound:playSound", "BtnSound");

};

DeviceChecker.prototype.onHighSetting = function () {

    this.setSettings(this.app.deviceType.High);
    this.app.fire("sound:playSound", "BtnSound");

};

DeviceChecker.prototype.postInitialize = function () {
    let deviceType = this.getDeviceType();

    if (APIMediator.getStorageItem("TR_GRAPHIC") === null) {

        // Set the pixel ratio according to the GPU detected
        if (pc.platform.mobile) {
            this.setSettings(deviceType);
        } else { // Desktop Default as high
            APIMediator.setStorageItem("TR_GRAPHIC", JSON.stringify(this.app.deviceType.High));
        }

    } else {
        let jsonData = APIMediator.getStorageItem("TR_GRAPHIC");
        graphic = JSON.parse(jsonData);
        Debug.log(graphic);
        this.setSettings(graphic);
    }
};

DeviceChecker.prototype.resetSettings = function () {
    this.graphicSetting.low.element.sprite = this.graphicSetting.unCheckbox.resource;
    this.graphicSetting.med.element.sprite = this.graphicSetting.unCheckbox.resource;
    this.graphicSetting.high.element.sprite = this.graphicSetting.unCheckbox.resource;
};

DeviceChecker.prototype.setSettings = function (deviceType) {

    APIMediator.setStorageItem("TR_GRAPHIC", JSON.stringify(deviceType));

    let currentDevicePixelRatio = window.devicePixelRatio;

    if (deviceType === this.app.deviceType.Low) {
        this.app.paste.spawnDelayMin = 0.01;
        this.app.paste.spawnDelayMax = 0.06;
        this.app.graphicsDevice.maxPixelRatio = Math.min(currentDevicePixelRatio, 1);
        this.resetSettings();
        this.graphicSetting.low.element.sprite = this.graphicSetting.checkbox.resource;
    }
    else if (deviceType === this.app.deviceType.Mid) {
        this.app.paste.spawnDelayMin = 0.01;
        this.app.paste.spawnDelayMax = 0.05;
        this.app.graphicsDevice.maxPixelRatio = Math.min(currentDevicePixelRatio, 1.5);
        this.resetSettings();
        this.graphicSetting.med.element.sprite = this.graphicSetting.checkbox.resource;
    }
    else {
        this.app.paste.spawnDelayMin = 0.01;
        this.app.paste.spawnDelayMax = 0.03;
        this.app.graphicsDevice.maxPixelRatio = Math.min(currentDevicePixelRatio, 2);
        this.resetSettings();
        this.graphicSetting.high.element.sprite = this.graphicSetting.checkbox.resource;
    }

};

DeviceChecker.prototype.update = function (dt) {

};

DeviceChecker.prototype.getDeviceType = function () {
    var renderer = pc.Application.getApplication().graphicsDevice.unmaskedRenderer;

    // Adreno:
    // 6xx series are High End Ref: https://en.wikipedia.org/wiki/Adreno, 605 is the first in the series
    // 5xx series are mostly low end but some like 540 and 530 are used in mid range phones
    // 4xx and 3xx series are low end GPU's

    // Mali:
    // Ref: https://en.wikipedia.org/wiki/Mali_(GPU) for GPU and release date

    // Only check the GPU if we are on mobile
    if (renderer && pc.platform.mobile) {
        // low level GPU's
        if (renderer.search(/Adreno\D*3/) !== -1 ||
            renderer.search(/Adreno\D*4/) !== -1 ||
            renderer.search(/Adreno\D*505/) !== -1 ||
            renderer.search(/Adreno\D*506/) !== -1 ||
            renderer.search(/Mali\D*2/) !== -1 ||
            renderer.search(/Mali\D*3/) !== -1 ||
            renderer.search(/Mali\D*4/) !== -1 ||
            renderer.search(/Mali\D*5/) !== -1 ||
            renderer.search(/Mali\D*6/) !== -1 ||
            renderer.search(/Mali\D*T6/) !== -1 ||
            renderer.search(/Mali\D*T7/) !== -1 ||
            renderer.search(/Mali\D*T82/) !== -1 ||
            renderer.search(/Mali\D*T83/) !== -1 ||
            renderer.search(/Mali\D*T86/) !== -1 ||
            renderer.search(/Adreno\D*508/) !== -1 ||
            renderer.search(/Adreno\D*512/) !== -1 ||
            renderer.search(/Adreno\D*510/) !== -1 ||
            renderer.search(/Adreno\D*509/) !== -1

        ) {
            return this.app.deviceType.Low;
        } else
            if (renderer.search(/Adreno\D*540/) !== -1 ||
                renderer.search(/Adreno\D*530/) !== -1 ||
                renderer.search(/Adreno\D*530/) !== -1 ||
                renderer.search(/Mali\D*T88/) !== -1 ||
                renderer.search(/Mali\D*G71/) !== -1 ||
                renderer.search(/Mali\D*G52/) !== -1 ||
                renderer.search(/Mali\D*G72/) !== -1

            ) {
                return this.app.deviceType.Mid;
            }
    }

    return this.app.deviceType.High;
};

// MaterialScroller.js
var MaterialScroller = pc.createScript('materialScroller');

MaterialScroller.attributes.add('offsetYLimit', { type: 'number', });
MaterialScroller.attributes.add('offsetYSpeed', { type: 'number', });

// initialize code called once per entity
MaterialScroller.prototype.initialize = function () {
    this.mat = this.entity.element.material;
    this.offsetY = 0;

};
// update code called every frame
MaterialScroller.prototype.update = function (dt) {
    this.entity.element.material.diffuseMapOffset.set(0, this.offsetY);
    this.entity.element.material.emissiveMapOffset.set(0, this.offsetY);
    this.entity.element.material.update();

    this.offsetY += dt * this.offsetYSpeed;
    if (this.offsetY > this.offsetYLimit)
        this.offsetY = 0;
};


// PoolElement.js
var PoolElement = pc.createScript('poolElement');

PoolElement.attributes.add('lifeTime', { type: 'number' });
PoolElement.attributes.add('restoreEvent', { type: 'string' });

// initialize code called once per entity
PoolElement.prototype.initialize = function () {
    // this.timer = 0;
};

PoolElement.prototype.set = function () {
    this.timer = this.lifeTime;
};

// update code called every frame
PoolElement.prototype.update = function (dt) {
    if (this.timer <= 0) return;

    this.timer -= dt;
    if (this.timer <= 0) {
        this.app.fire(this.restoreEvent, this.entity);
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// PoolElement.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// TeethCleanFinisher.js
var TeethCleanFinisher = pc.createScript('teethCleanFinisher');

// initialize code called once per entity
TeethCleanFinisher.prototype.initialize = function() {

};

// update code called every frame
TeethCleanFinisher.prototype.update = function(dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// TeethCleanFinisher.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// PS_Brush.js
var PsBrust = pc.createScript('PsBrust');

PsBrust.attributes.add('radius', { type: 'number' });
PsBrust.attributes.add('countRange', { type: 'vec2' });
PsBrust.attributes.add('pool', { type: 'entity' });
PsBrust.attributes.add('position', { type: 'entity' });

// initialize code called once per entity
PsBrust.prototype.initialize = function () {
    this.ps = this.pool.script.PoolController;
    this.pos = this.position.getLocalPosition();

    this.app.on(this.app.events.vfx.economyStars, this.play, this);
    this.on("destroy", this.onDestroy, this);

};

PsBrust.prototype.onDestroy = function () {

    this.app.o(this.app.events.vfx.economyStars, this.play, this);

};

// update code called every frame
PsBrust.prototype.update = function (dt) {

};

PsBrust.prototype.play = function () {
    let count = parseInt(pc.math.random(this.countRange.x, this.countRange.y));
    for (let i = 0; i < count; i++) {
        let x = pc.math.random(-this.radius, this.radius);
        let y = pc.math.random(-this.radius, this.radius);
        let star = this.ps.get();
        star.script.poolElement.set();
        star.setLocalPosition(this.pos.x + x, this.pos.y + y, 0);
        star.enabled = true;
    }
};

// FeverCubemapHandler.js
var FeverCubemapHandler = pc.createScript('feverCubemapHandler');

FeverCubemapHandler.attributes.add('cubemapPink', { type: 'asset' });
FeverCubemapHandler.attributes.add('cubemapPinkNon', { type: 'asset' });

// initialize code called once per entity
FeverCubemapHandler.prototype.initialize = function () {

    this.app.on(this.app.events.fever.start, this.startFever, this);
    this.app.on(this.app.events.fever.finish, this.finishFever, this);
    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.on("destroy", this.onDestroy, this);

    this.feverColor = new pc.Color(225 / 255, 73 / 255, 206 / 255, 1);
    this.defaultColor = new pc.Color(128 / 255, 199 / 255, 234 / 255, 1);

    this.isFeverStarted = false;
    this.camera = this.app.root.findByTag("mainPlayerCamera")[0];

};

FeverCubemapHandler.prototype.onDestroy = function () {

    this.app.off(this.app.events.fever.start, this.startFever, this);
    this.app.off(this.app.events.fever.finish, this.finishFever, this);
    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);

};

FeverCubemapHandler.prototype.onEnvConfigRcv = function () {

    // this.app.scene.skybox = EnvironmentConfig.instance.config.defaultSkyBox.resource;
    this.camera.camera.clearColor.r = EnvironmentConfig.instance.config.nonFeverCubemapColor.r;
    this.camera.camera.clearColor.g = EnvironmentConfig.instance.config.nonFeverCubemapColor.g;
    this.camera.camera.clearColor.b = EnvironmentConfig.instance.config.nonFeverCubemapColor.b;

    this.feverColor = EnvironmentConfig.instance.config.feverCubemapColor;
    this.defaultColor = EnvironmentConfig.instance.config.nonFeverCubemapColor;
    this.cubemapPink = EnvironmentConfig.instance.config.feverCubemap;
    this.cubemapPinkNon = EnvironmentConfig.instance.config.feverCubemapNon;

};

FeverCubemapHandler.prototype.startFever = function () {

    this.isFeverStarted = true;
    this.app.scene.skybox = this.cubemapPinkNon.resource;
    // const envAtlas = pc.EnvLighting.generatePrefilteredAtlas(this.cubemapPink.resources.slice(1));
    // this.app.scene.envAtlas = envAtlas;
    this.tweenColor(this.entity, this.defaultColor, this.feverColor, 0.4, null, false, false);

};

FeverCubemapHandler.prototype.finishFever = function () {

    if (this.isFeverStarted) {
        this.isFeverStarted = false;
        this.app.scene.envAtlas = null;
        this.tweenColor(this.entity, this.feverColor, this.defaultColor, 0.4, null, false, false);
    }

};

FeverCubemapHandler.prototype.tweenColor = function (entity, from, to, time, onComplete, canLoop, canYoyo) {

    var color = { r: from.r, g: from.g, b: from.b };

    entity
        .tween(color)
        .to({ r: to.r, g: to.g, b: to.b }, time, pc.Linear)
        .loop(canLoop)
        .yoyo(canYoyo)
       .onUpdate( function () {

            this.camera.camera.clearColor.r = color.r;
            this.camera.camera.clearColor.g = color.g;
            this.camera.camera.clearColor.b = color.b;

        }.bind(this))
        .onComplete( function () { if (onComplete) onComplete(); }.bind(this))
        .start();
};


// update code called every frame
FeverCubemapHandler.prototype.update = function (dt) {

};

// LevelEndRewardMenuEventListener.js
var LevelEndRewardMenuEventListener = pc.createScript('levelEndRewardMenuEventListener');

LevelEndRewardMenuEventListener.attributes.add('adGuageSettings', {
    type: 'json',
    title: 'Ad Gauge Settings',
    schema: [
        { name: 'container', type: 'entity', title: 'Container' },
        { name: 'cursor', type: 'entity', title: 'Cursor' },
        { name: 'xBounds', type: 'vec2', title: 'X bounds' },
        { name: 'yBounds', type: 'vec2', title: 'Y bounds' },
        { name: 'rotBounds', type: 'vec2', title: 'Rotation Bound' },
        { name: 'speed', type: 'vec2', title: 'Speed' },
        { name: 'rewardTxt', type: 'entity', title: 'Reward' },
        { name: 'stopButton', type: 'entity', title: 'Stop Button' },
        { name: 'mulPoints', type: 'entity', title: 'Multiplication Points', array: true },
    ],
});

LevelEndRewardMenuEventListener.attributes.add('otherSettings', {
    type: 'json',
    title: 'Other Settings',
    schema: [
        { name: 'mul', type: 'entity', title: 'Multiplier Txt' },
        { name: 'gemsCount', type: 'entity', title: 'Gems Count Txt' },
        { name: 'continueBtn', type: 'entity', title: 'Continue Button' },
    ],
});

LevelEndRewardMenuEventListener.attributes.add('cardsRewardSettings', {
    type: 'json',
    title: 'Cards Reward Settings',
    schema: [
        { name: 'container', type: 'entity', title: 'Container' },
        { name: 'revealingCards', type: 'entity', title: 'Revealing Card' },
        { name: 'revealingCardBlur', type: 'entity', title: 'Revealing Card Blur' },
        { name: 'cards', type: 'entity', title: 'Cards', array: true },
    ],
});

LevelEndRewardMenuEventListener.attributes.add('gemsText', { type: 'entity' });
LevelEndRewardMenuEventListener.attributes.add('inGameLevelGemsText', { type: 'entity' });
LevelEndRewardMenuEventListener.attributes.add('skipBtn', { type: 'entity' });


// initialize code called once per entity
LevelEndRewardMenuEventListener.prototype.initialize = function () {

    LevelEndRewardMenuEventListener.instance = this;

    this.cursorLerp = {
        x: 0,
        y: 0,
        mulX: 1,
        mulY: 1
    };

    this.tweenValues = true;
    this.tweenDuration = 0.75;
    this.loadingAdScreen = this.app.root.findByName("Loading Ad Screen");
    this.collectablesSpawnerGems = this.entity.findByName('CollectablesSpawner_Gems');
    this.iconGems = this.entity.findByName('GemsCounterIcon');

    this.currentPoint = -1;
    this.cursorStopped = true;
    this.gems = 15;
    this.freeMultiplier = 7;
    this.adMultiplier = 1;
    this.multipliersVal = [2, 3, 4, 5, 4, 3, 2];

    try {
        const loadedLevel = +APIMediator.getStorageItem("TR_LEVEL") || 1;
        this.currentLevel = parseInt(loadedLevel);
    } catch (e) {
        this.currentLevel = 1;
        console.error(e);
    }

    this.currentGemsAmount = 0;
    this.currentCardIdClicked = 0;

    this.gemsText.element.text = EconomyManager.Instance.totalGems;
    this.onEnable();
    this.on('enable', this.onEnable, this);

    this.adGuageSettings.stopButton.button.on('click', this.onClickStopAdCursorButton, this);
    this.app.on('LevelEndRewardMenu:OnClickCard', this.onClickRewardCard, this);
    this.app.on('LevelEndRewardMenu:Continue', this.onClickContinueButton, this);
    this.app.on('LevelEndRewardMenu:Reward', this.onClickGetRewardBtn, this);
    this.skipBtn.button.on("click", this.onSkipBtnClick, this);
    this.on("destroy", this.onDestroy, this);

    this.adGuageSettings.stopButton.button.active = true;
    this.skipBtn.button.active = true;


    // this.app.on('game:resume', this.onResume, this);
    // this.app.on('game:pause', this.onPause, this);
    // Ads
    // this.app.on("game:pause", this.pauseGame, this);
    // this.app.on("giveReward:resume", this.resumeGiveReward, this);
    // this.app.on("game:resume", this.resumeNoReward, this);
    // this.app.on("rewardedAd:notAvailable", this.adNotAvailable, this);

    this.firstRewardCardClicked = false;

};

LevelEndRewardMenuEventListener.prototype.onDestroy = function () {

    this.adGuageSettings.stopButton.button.off('click', this.onClickStopAdCursorButton, this);
    this.app.off('LevelEndRewardMenu:OnClickCard', this.onClickRewardCard, this);
    this.app.off('LevelEndRewardMenu:Continue', this.onClickContinueButton, this);
    this.app.off('LevelEndRewardMenu:Reward', this.onClickGetRewardBtn, this);
    this.skipBtn.button.off("click", this.onSkipBtnClick, this);
    // this.app.off('game:resume', this.onResume, this);
    // this.app.off('game:pause', this.onPause, this);
    // Ads
    // this.app.off("game:pause", this.pauseGame, this);
    // this.app.off("giveReward:resume", this.resumeGiveReward, this);
    // this.app.off("game:resume", this.resumeNoReward, this);
    // this.app.off("rewardedAd:notAvailable", this.adNotAvailable, this);

};

LevelEndRewardMenuEventListener.prototype.showButtons = function () {
    const hasRewardedVideo = APIMediator.isRewardedAdAvailable('button:results:doublereward');
    if (hasRewardedVideo) {
        this._buttonsReady = true;
        this.adGuageSettings.stopButton.button.active = true;
        this.skipBtn.button.active = true;

        this.adGuageSettings.container.setLocalScale(0.5, 0.5, 0.5);
        Utils.tweenScale(this.adGuageSettings.container, pc.Vec3.ONE, 0.5, pc.BackOut);

        this.skipBtn.setLocalScale(pc.Vec3.ZERO);
        Utils.tweenScale(this.skipBtn, pc.Vec3.ONE, 0.5, pc.BackOut, 0.5);

        this.updateButtonsVisibility();
    } else {
        this.giveGemsAndAnimate(true);
    }
};

LevelEndRewardMenuEventListener.prototype.hideButons = function (delay = 0) {
    this._buttonsReady = false;

    this.adGuageSettings.stopButton.button.active = false;
    this.skipBtn.button.active = false;

    Utils.tweenScale(this.adGuageSettings.container, pc.Vec3.ZERO, 0.35, pc.BackIn, delay).then(() => {
        this.adGuageSettings.container.enabled = false;
    });
    Utils.tweenScale(this.skipBtn, pc.Vec3.ZERO, 0.35, pc.BackIn, delay).then(() => {
        this.skipBtn.enabled = false;
    });
};

LevelEndRewardMenuEventListener.prototype.updateButtonsVisibility = function () {
    if (this._buttonsReady) {
        const hasRewardedVideo = APIMediator.isRewardedAdAvailable('button:results:doublereward');

        this.adGuageSettings.container.enabled = hasRewardedVideo;
        this.skipBtn.enabled = true;
    }
}

LevelEndRewardMenuEventListener.prototype.onEnable = function () {
    this._buttonsReady = false;
    this.adGuageSettings.container.enabled = false;
    this.skipBtn.enabled = false;

    this.app.fire(EventTypes.PLAY_SFX, 'victory');


    pc.AppBase.getApplication().root.delayedCall(500, () => {
        APIMediator.showInterstitialAd('break:result').then(() => {
            this.showButtons();
        });
    });

    this.gemsText.element.text = EconomyManager.Instance.totalGems;
    let mul = EconomyManager.Instance.levelEndMul;
    let gems = EconomyManager.Instance.levelGems;

    this.gems = gems * mul;
    this.otherSettings.mul.element.text = "X" + mul.toFixed(1);
    this.otherSettings.gemsCount.element.text = '' + Math.floor(this.gems);
    this.cursorStopped = false;
    this.rewardedCardSelected = false;
    this.firstRewardCardClicked = false;
    this.cardsOpened = 0;

    // Reseting UI
    this.cardsRewardSettings.container.enabled = false;
    this.otherSettings.continueBtn.enabled = false;
    // this.adGuageSettings.container.enabled = true;
    // this.skipBtn.enabled = true;
    this.adGuageSettings.stopButton.button.active = true;
    this.skipBtn.button.active = true;

    let titles = ['Gems', 'New Item', 'Gems'];
    let amounts = [parseInt(pc.math.random(7, 20)) * 100, parseInt(pc.math.random(7, 20)) * 100, parseInt(pc.math.random(7, 20)) * 100];
    let types = [0, 0, 0];
    let imgs = [undefined, SpritesManager.Instance.getRewardSprite(0), undefined];

    for (let i = 0; i < this.cardsRewardSettings.cards.length; i++) {
        this.cardsRewardSettings.cards[i].setLocalEulerAngles(0, 0, 0);
        this.cardsRewardSettings.cards[i].enabled = true;
        this.cardsRewardSettings.cards[i].script.levelRewardCardHandler.registerEvent();
        this.cardsRewardSettings.cards[i].fire('reset');
        this.cardsRewardSettings.cards[i].fire('setInfo', titles[i], types[i], amounts[i], imgs[i]);
        this.cardsRewardSettings.cards[i].fire('showGetBtn', false, false);
        this.cardsRewardSettings.cards[i].fire('showVideoBtn', false);
        this.cardsRewardSettings.cards[i].button.active = true;
    }

    this.cardsRewardSettings.revealingCards.enabled = false;
    this.cardsRewardSettings.revealingCards.script.levelRewardCardHandler.registerEvent();
    this.cardsRewardSettings.revealingCards.fire('reset');
    this.cardsRewardSettings.revealingCards.fire('showGetBtn', false, false);
    this.firstRewardCardClicked = false;

    Utils.wait(0).then(() => {
        this.collectablesSpawnerGems.clear();
    })
};

LevelEndRewardMenuEventListener.prototype.onSkipBtnClick = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "button:results:continue"
    });
    this.loadingAdScreen.enabled = false;
    this.app.fire("sound:playSound", "BtnSound");
    this.giveGemsAndAnimate(true);
};

LevelEndRewardMenuEventListener.prototype.onAdSkippedCallback = function () {
    this.adGuageSettings.stopButton.button.active = true;
    this.skipBtn.button.active = true;
    this.cursorStopped = false;
};

LevelEndRewardMenuEventListener.prototype.onClickStopAdCursorButton = function () {

    APIMediator.track({
        event: "GA:Design",
        eventId: "button:results:doublereward"
    });

    this.app.fire("sound:playSound", "BtnSound");
    this.cursorStopped = true;
    this.adGuageSettings.stopButton.button.active = false;
    this.skipBtn.button.active = false;

    const rewardedAdAvailable = APIMediator.isRewardedAdAvailable('button:results:doublereward');
    if (rewardedAdAvailable) {
        const resumeGiveRewardCallback = LevelEndRewardMenuEventListener.instance.giveGaugeMultiplierReward.bind(this);
        const pauseCallback = LevelEndRewardMenuEventListener.instance.pauseRewardGame.bind(this);
        const resumeCallback = LevelEndRewardMenuEventListener.instance.onAdSkippedCallback.bind(this);
        const noADAvailableCallack = LevelEndRewardMenuEventListener.instance.adNotAvailable.bind(this);
        this.app.fire("showRewardedAD", resumeGiveRewardCallback, pauseCallback, resumeCallback, noADAvailableCallack, "button:results:doublereward");
    } else {
        this.onAdSkippedCallback();
    }
};

LevelEndRewardMenuEventListener.prototype.giveGaugeMultiplierReward = function () {
    this.loadingAdScreen.enabled = false;
    this.giveGemsAndAnimate(false);
};

LevelEndRewardMenuEventListener.prototype.giveGemsAndAnimate = function (onSkip = false) {

    this.cursorStopped = true;
    this.adGuageSettings.stopButton.button.active = false;
    this.skipBtn.button.active = false;

    this.hideButons(0.25);

    if (!onSkip) {
        // GameAnalytics("addResourceEvent", "Source", "Gems", parseInt((this.adMultiplier * this.gems).toFixed(1)), "Gameplay", "LevelEnd");
        this.spawnAndPickupGems(this.adGuageSettings.stopButton.getPosition(), parseInt((this.adMultiplier * this.gems).toFixed(1)), 1.5).then(() => {

        });
    }
    else {
        // GameAnalytics("addResourceEvent", "Source", "Gems", parseInt((1 * this.gems).toFixed(1)), "Gameplay", "LevelEnd");
        this.spawnAndPickupGems(this.adGuageSettings.stopButton.getPosition(), parseInt((1 * this.gems).toFixed(1)), 1.5).then(() => {

        });
    }

    this.gemsText.element.text = EconomyManager.Instance.totalGems;
    EconomyManager.Instance.levelGems = 0;
    this.inGameLevelGemsText.element.text = EconomyManager.Instance.levelGems;

    CustomCoroutine.Instance.set(() => {
        this.cardsRewardSettings.container.enabled = true;
        this.cardsRewardSettings.container.setLocalScale(1, 0, 1);
        TweenWrapper.Tween(this.cardsRewardSettings.container, this.cardsRewardSettings.container.getLocalScale(), pc.Vec3.ONE, 0.5, () => { }, pc.BackOut);
    }, 0.5);
};

LevelEndRewardMenuEventListener.prototype.onResume = function () {

    // this.app.timeScale = 1;
    this.resumeLevelLoadingAfterAd();
    this.loadingAdScreen.enabled = false;

};

LevelEndRewardMenuEventListener.prototype.onPause = function () {

    // this.app.timeScale = 0;
    this.loadingAdScreen.enabled = true;

};

LevelEndRewardMenuEventListener.prototype.onClickContinueButton = function () {
    this.currentLevel++;
    this.loadingAdScreen.enabled = true;
    this.onResume();
};

LevelEndRewardMenuEventListener.prototype.resumeLevelLoadingAfterAd = function () {

    LevelManager.getInstance().setCurrentLevel(this.currentLevel);

    setTimeout(() => {
        this.app.fire("LevelManager:LoadLevel");
        this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Main);
    }, 100);

    this.app.fire("displayBanner", "home");
};

LevelEndRewardMenuEventListener.prototype.pauseRewardGame = function () {
    Debug.log("pauseRewardGame");
    this.loadingAdScreen.enabled = true;
};

LevelEndRewardMenuEventListener.prototype.resumeGiveReward = function () {
    this.loadingAdScreen.enabled = false;
    this.hideButons();
    this.giveReward();
};

LevelEndRewardMenuEventListener.prototype.resumeNoReward = function () {
    this.loadingAdScreen.enabled = false;
    this.onAdSkippedCallback();
};

LevelEndRewardMenuEventListener.prototype.adNotAvailable = function () {
    Debug.log("adNotAvailable");
    this.app.fire("showNoAdPopup");
    this.onSkipBtnClick();
};

LevelEndRewardMenuEventListener.prototype.onClickRewardCard = function (id) {
    this.firstRewardCardClicked = false;

    APIMediator.track({
        event: "GA:Design",
        eventId: "button:results:revealcard"
    });

    if (!this.firstRewardCardClicked) {
        this.firstRewardCardClicked = true;
        for (let i = 0; i < this.cardsRewardSettings.cards.length; i++) {
            this.cardsRewardSettings.cards[i].button.active = false;
        }
    }

    this.currentGemsAmount = 0;
    const rewardedAdAvailable = APIMediator.isRewardedAdAvailable('button:reward:get');

    if (this.rewardedCardSelected && rewardedAdAvailable) {
        // show rewarded Video
        this.currentCardIdClicked = id;

        const resumeGiveRewardCallback = LevelEndRewardMenuEventListener.instance.resumeGiveReward.bind(this);
        const pauseCallback = LevelEndRewardMenuEventListener.instance.pauseRewardGame.bind(this);
        const resumeCallback = LevelEndRewardMenuEventListener.instance.resumeNoReward.bind(this);
        const noADAvailableCallack = LevelEndRewardMenuEventListener.instance.adNotAvailable.bind(this);
        this.app.fire("showRewardedAD", resumeGiveRewardCallback, pauseCallback, resumeCallback, noADAvailableCallack, "button:reward:get");

    }
    else {
        // First one selected: Dont play ads
        let info;
        this.cardsRewardSettings.cards[id].fire('getInfo', (_info) => { info = _info; Debug.log("info: ", info); });
        this.currentGemsAmount = info.amount;
        //firebaseLogger(firebaseAnalytics, "Gems Rewarded " + parseInt(info.amount));
        this.rewardCardHelper(id);
    }

};

LevelEndRewardMenuEventListener.prototype.giveReward = function () {
    let info;
    this.cardsRewardSettings.cards[this.currentCardIdClicked].fire('getInfo', (_info) => { info = _info; Debug.log("info: ", info); });
    this.currentGemsAmount = info.amount;
    // GameAnalytics("addResourceEvent", "Source", "Gems", parseInt(info.amount), "Rewarded", "Rewarded");
    this.rewardCardHelper(this.currentCardIdClicked);
};


LevelEndRewardMenuEventListener.prototype.rewardCardHelper = function (id) {
    let index = parseInt(id);
    // Debug.log("index: ", index);
    // Debug.log("card: ", this.cardsRewardSettings.cards[index]);

    for (let i = 0; i < this.cardsRewardSettings.cards.length; i++) {
        // stop animation on all cards
        this.cardsRewardSettings.cards[i].fire('animate', false);

        // reveal remaining cards
        if (i !== index && !this.rewardedCardSelected) {
            this.cardsRewardSettings.cards[i].setLocalEulerAngles(0, 0, 0);
            let rot = new pc.Quat().setFromEulerAngles(0, 180, 0);
            TweenWrapper.Tween(this.cardsRewardSettings.cards[i], this.cardsRewardSettings.cards[i].getLocalRotation(), rot, 0.5);
        }
    }

    // expand clicked card after reveal animation
    CustomCoroutine.Instance.set(() => {
        let info;

        this.cardsRewardSettings.cards[index].enabled = false;
        let pos = this.cardsRewardSettings.cards[index].getLocalPosition();

        this.cardsRewardSettings.cards[index].fire('getInfo', (_info) => { info = _info; Debug.log("info: ", info); });
        Debug.log("info: ", info);
        this.cardsRewardSettings.revealingCards.fire('setInfo', info.title, info.type, info.amount, info.img);
        this.cardsRewardSettings.revealingCards.setLocalPosition(pos.x, pos.y, pos.z);
        if (!this.rewardedCardSelected)
            this.cardsRewardSettings.revealingCards.setLocalEulerAngles(0, 0, 0);
        this.cardsRewardSettings.revealingCards.setLocalScale(1, 1, 1);
        this.cardsRewardSettings.revealingCards.enabled = true;
        this.cardsRewardSettings.revealingCardBlur.enabled = true;

        this.app.fire(EventTypes.PLAY_SFX, 'success');

        TweenWrapper.TweenOpacity(
            this.cardsRewardSettings.revealingCardBlur.element, 0, 0.5, 0.5
        );

        let scale = new pc.Vec3(3, 3, 3);
        TweenWrapper.Tween(
            this.cardsRewardSettings.revealingCards,
            this.cardsRewardSettings.revealingCards.getLocalScale(),
            scale, 0.5, () => {
                if (!this.rewardedCardSelected) {
                    this.rewardedCardSelected = true;
                    let rot = new pc.Quat().setFromEulerAngles(0, 180, 0);
                    TweenWrapper.Tween(this.cardsRewardSettings.revealingCards, this.cardsRewardSettings.revealingCards.getLocalRotation(), rot, 0.5);
                }
                this.cardsRewardSettings.revealingCards.fire('showGetBtn', true, true);
            }, pc.SineOut
        );

        TweenWrapper.Tween(
            this.cardsRewardSettings.revealingCards,
            this.cardsRewardSettings.revealingCards.getLocalPosition(),
            pc.Vec3.ZERO, 0.5
        );

        // this.otherSettings.continueBtn.enabled = true;
    }, 0.5);

    this.adGuageSettings.container.enabled = false;
    this.skipBtn.enabled = false;
};

LevelEndRewardMenuEventListener.prototype.onClickGetRewardBtn = async function () {
    // this.app.fire("addGems", this.currentGemsAmount);

    APIMediator.track({
        event: "GA:Design",
        eventId: "button:reward:get"
    });

    this.spawnAndPickupGems(this.entity.findByName('GetCardGemsBtn').getPosition(), this.currentGemsAmount, 1.5).then(() => {

    });

    this.otherSettings.continueBtn.enabled = true;

    this.cardsRewardSettings.revealingCards.fire('showGetBtn', false, true);
    TweenWrapper.Tween(
        this.cardsRewardSettings.revealingCards,
        this.cardsRewardSettings.revealingCards.getLocalPosition(),
        new pc.Vec3(0, 1500, 0), 0.5
    );

    TweenWrapper.TweenOpacity(
        this.cardsRewardSettings.revealingCardBlur.element, 0.5, 0, 0.5,
        () => { this.cardsRewardSettings.revealingCardBlur.enabled = false; }
    );

    const rewardedAdAvailable = APIMediator.isRewardedAdAvailable('button:reward:get');

    this.cardsOpened += 1;
    if (this.cardsOpened >= 3 || !rewardedAdAvailable) {
        for (let i = 0; i < this.cardsRewardSettings.cards.length; i++) {
            this.cardsRewardSettings.cards[i].fire('showGetBtn', false, false);
            this.cardsRewardSettings.cards[i].fire('showVideoBtn', false);
        };
        CustomCoroutine.Instance.set(() => {
            this.onClickContinueButton();
        }, 0.5);
    } else {
        for (let i = 0; i < this.cardsRewardSettings.cards.length; i++) {
            this.cardsRewardSettings.cards[i].fire('showGetBtn', true, true);
            this.cardsRewardSettings.cards[i].fire('showVideoBtn', true);
        }
    }
};

// update code called every frame
LevelEndRewardMenuEventListener.prototype.update = function (dt) {
    this.manageGaugeCursor(dt);
    this.updateButtonsVisibility();
};

LevelEndRewardMenuEventListener.prototype.manageGaugeCursor = function (dt) {
    if (this.cursorStopped) return;

    this.manageCursorPosRot(dt);
    this.detectCursorRegion();
};

LevelEndRewardMenuEventListener.prototype.manageCursorPosRot = function (dt) {
    if (this.cursorLerp.x >= 1) this.cursorLerp.mulX = -1;
    if (this.cursorLerp.x <= 0) this.cursorLerp.mulX = 1;

    if (this.cursorLerp.y >= 1) this.cursorLerp.mulY = -1;
    if (this.cursorLerp.y <= 0) this.cursorLerp.mulY = 1;

    this.cursorLerp.x += dt * this.cursorLerp.mulX * this.adGuageSettings.speed.x;
    this.cursorLerp.y += dt * this.cursorLerp.mulY * this.adGuageSettings.speed.y;

    this.cursorLerp.x = pc.math.clamp(this.cursorLerp.x, 0, 1);
    this.cursorLerp.y = pc.math.clamp(this.cursorLerp.y, 0, 1);

    let x = pc.math.lerp(this.adGuageSettings.xBounds.x, this.adGuageSettings.xBounds.y, this.cursorLerp.x);
    let y = this.adGuageSettings.yBounds.x + Math.sin(this.cursorLerp.y * Math.PI) * this.adGuageSettings.yBounds.y;
    let zAngle = pc.math.lerp(this.adGuageSettings.rotBounds.x, this.adGuageSettings.rotBounds.y, this.cursorLerp.x);

    this.adGuageSettings.cursor.setLocalPosition(x, y, 0);
    this.adGuageSettings.cursor.setLocalEulerAngles(0, 0, zAngle);
};

LevelEndRewardMenuEventListener.prototype.detectCursorRegion = function () {
    let x = this.adGuageSettings.cursor.getLocalPosition().x;
    if (x < this.getPoint(0)) {
        this.setCurrentPoint(0);
    }
    else if (x < this.getPoint(1)) {
        this.setCurrentPoint(1);
        // x3
    }
    else if (x < this.getPoint(2)) {
        this.setCurrentPoint(2);
        // x4
    }
    else if (x < this.getPoint(3)) {
        this.setCurrentPoint(3);
        // x5
    }
    else if (x < this.getPoint(4)) {
        this.setCurrentPoint(4);
        // x4
    }
    else if (x < this.getPoint(5)) {
        this.setCurrentPoint(5);
        // x3
    }
    else {
        this.setCurrentPoint(6);
        // x2
    }
};

LevelEndRewardMenuEventListener.prototype.getPoint = function (i) {
    return this.adGuageSettings.mulPoints[i].getLocalPosition().x;
};

LevelEndRewardMenuEventListener.prototype.setCurrentPoint = function (point) {
    if (this.currentPoint !== point) {
        this.adMultiplier = this.multipliersVal[point];
        this.adGuageSettings.rewardTxt.element.text = parseInt((this.adMultiplier * this.gems).toFixed(1));

    }
    this.currentPoint = point;
};

LevelEndRewardMenuEventListener.prototype.spawnAndPickupGems = async function (_fromWorldPosition, amount, duration = 1.25) {
    if (!amount) return Promise.resolve();
    if (this.tweenValues) {
        const delay = Math.max(duration - this.tweenDuration / 2);
        Utils.wait(delay * 1000).then(() => {
            this.app.fire("addGems", parseInt(amount), this.tweenDuration);
        });
    } else {
        this.app.fire("addGems", parseInt(amount), this.tweenDuration);
    }
    this.app.fire(EventTypes.PLAY_SFX, 'pickupGems');
    return this.collectablesSpawnerGems.collect(_fromWorldPosition, this.iconGems.getPosition(), amount, duration);
};

// canonBallFollow.js
var CanonBallFollow = pc.createScript('canonBallFollow');


CanonBallFollow.attributes.add('followX', { type: 'boolean', title: 'Follow X' });
CanonBallFollow.attributes.add('followY', { type: 'boolean', title: 'Follow Y' });
CanonBallFollow.attributes.add('followZ', { type: 'boolean', title: 'Follow Z' });

CanonBallFollow.attributes.add('followSpeed', { type: 'vec3', title: 'Follow Speed' });
CanonBallFollow.attributes.add('followOffset', { type: 'vec3', title: 'Follow Offset' });
CanonBallFollow.attributes.add('target', { type: 'entity', title: 'Follow Target' });

// initialize code called once per entity
CanonBallFollow.prototype.initialize = function () {

    this.app.on("onCanonFollowCamera", this.onCanonFollowCamera, this);
    this.on("destroy", this.onDestroy, this);
    this.canFollow = false;

};

CanonBallFollow.prototype.onDestroy = function () {

    this.app.off("onCanonFollowCamera", this.onCanonFollowCamera, this);

};

CanonBallFollow.prototype.onCanonFollowCamera = function (follow) {

    this.canFollow = follow;

};

// update code called every frame
CanonBallFollow.prototype.postUpdate = function (dt) {

    if (this.canFollow) {
        let pos = this.entity.getLocalPosition();
        let target = this.target.getLocalPosition();

        let x = this.followX ? pc.math.lerp(pos.x, target.x + this.followOffset.x, dt * this.followSpeed.x) : pos.x;
        let y = this.followY ? pc.math.lerp(pos.y, target.y + this.followOffset.y, dt * this.followSpeed.y) : pos.y;
        let z = this.followZ ? pc.math.lerp(pos.z, target.z + this.followOffset.z, dt * this.followSpeed.z) : pos.z;

        this.entity.setLocalPosition(x, y, z);
    }
};

// ribbon.js
var Ribbon = pc.createScript('ribbon');

Ribbon.attributes.add("lifetime", { type: "number", default: 0.5 });
Ribbon.attributes.add("xoffset", { type: "number", default: -0.8 });
Ribbon.attributes.add("yoffset", { type: "number", default: 1 });
Ribbon.attributes.add("height", { type: "number", default: 0.4 });


var MAX_VERTICES = 600;
var VERTEX_SIZE = 4;


Ribbon.prototype.initialize = function () {
    var shaderDefinition = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION
        },
        vshader: [
            "attribute vec4 aPositionAge;",
            "",
            "uniform mat4 matrix_viewProjection;",
            "uniform float trail_time;",
            "",
            "varying float vAge;",
            "",
            "void main(void)",
            "{",
            "    vAge = trail_time - aPositionAge.w;",
            "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
            "}"
        ].join("\n"),
        fshader: [
            "precision mediump float;",
            "",
            "varying float vAge;",
            "",
            "uniform float trail_lifetime;",
            "",
            "vec3 rainbow(float x)",
            "{",
            "float level = floor(x * 6.0);",
            "float r = float(level <= 2.0) + float(level > 4.0) * 0.5;",
            "float g = max(1.0 - abs(level - 2.0) * 0.5, 0.0);",
            "float b = (1.0 - (level - 4.0) * 0.5) * float(level >= 4.0);",
            "return vec3(r, g, b);",
            "}",
            "void main(void)",
            "{",
            "    gl_FragColor = vec4(rainbow(vAge / trail_lifetime), (1.0 - (vAge / trail_lifetime)) * 0.5);",
            "}"
        ].join("\n")
    };

    var shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);

    this.material = new pc.Material();
    this.material.shader = shader;
    this.material.setParameter('trail_time', 0);
    this.material.setParameter('trail_lifetime', this.lifetime);
    this.material.cull = pc.CULLFACE_NONE;
    this.material.blend = true;
    this.material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
    this.material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    this.material.blendEquation = pc.BLENDEQUATION_ADD;
    this.material.depthWrite = false;

    this.timer = 0;

    // The generated ribbon vertices data
    this.vertices = [];

    // Vertex array to use with Mesh API and update the mesh
    this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_SIZE);

    // Create the array for the vertex positions
    this.vertexIndexArray = [];
    for (var i = 0; i < this.vertexData.length; ++i) {
        this.vertexIndexArray.push(i);
    }

    // Prepare the mesh to be created into a mesh instance
    this.mesh = new pc.Mesh(this.app.graphicsDevice);
    this.mesh.clear(true, false);
    this.mesh.setPositions(this.vertexData, VERTEX_SIZE, MAX_VERTICES);
    this.mesh.setIndices(this.vertexIndexArray, MAX_VERTICES);
    this.mesh.update(pc.PRIMITIVE_TRISTRIP);

    // Create the mesh instance
    var meshInstance = new pc.MeshInstance(this.mesh, this.material);

    this.entity.addComponent('render', {
        meshInstances: [meshInstance],
        layers: [this.app.scene.layers.getLayerByName('Particles').id]
    });

    this.entity.render.enabled = false;
};


Ribbon.prototype.reset = function () {
    this.timer = 0;
    this.vertices = [];
};


Ribbon.prototype.spawnNewVertices = function () {
    var node = this.entity;
    var pos = node.getPosition();
    var yaxis = node.up.clone().scale(this.height);

    var s = this.xoffset;
    var e = this.yoffset;

    var spawnTime = this.timer;
    var vertexPair = [
        pos.x + yaxis.x * s, pos.y + yaxis.y * s, pos.z + yaxis.z * s,
        pos.x + yaxis.x * e, pos.y + yaxis.y * e, pos.z + yaxis.z * e
    ];

    this.vertices.unshift({ spawnTime, vertexPair });
};


Ribbon.prototype.clearOldVertices = function () {
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        var vp = this.vertices[i];
        if (this.timer - vp.spawnTime >= this.lifetime) {
            this.vertices.pop();
        } else {
            break;
        }
    }
};


Ribbon.prototype.prepareVertexData = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;

        if (this.vertexData.length === i) {
            break;
        }
    }
};


Ribbon.prototype.update = function (dt) {
    this.timer += dt;
    this.material.setParameter('trail_time', this.timer);

    // Remove any old vertices at the end of the trail based on the timer value
    this.clearOldVertices();

    // Create new vertices on the updated position of the beginning of the trail
    this.spawnNewVertices();

    // Update the mesh
    if (this.vertices.length > 1) {
        this.prepareVertexData();
        var currentLength = this.vertices.length * 2;
        var limit = MAX_VERTICES;

        if (currentLength < limit) {
            limit = currentLength;
        }

        this.mesh.setPositions(this.vertexData, VERTEX_SIZE, limit);
        this.mesh.setIndices(this.vertexIndexArray, limit);
        this.mesh.update(pc.PRIMITIVE_TRISTRIP);
        this.entity.render.enabled = true;
    }
};


// CustomCoroutine.js
var CustomCoroutine = pc.createScript('customCoroutine');

CustomCoroutine.prototype.initialize = function() {

    CustomCoroutine.Instance = this;
    
    this.coroutines = [];
    this.id = 0;
    
    this.abandonedCoroutines = [];
    this.abandonAll = false;
};

CustomCoroutine.prototype.update = function(dt) {
    this.coroutineTick(dt);
};

CustomCoroutine.prototype.set = function(func, delay) {

    this.coroutines.push({ 
        func: func, 
        delay : delay, 
        timer: 0,
        id: this.getId()
    });
    
    return this.coroutines[this.coroutines.length - 1].id;
};

CustomCoroutine.prototype.coroutineTick = function(dt) {

    for(let i = 0; i < this.coroutines.length; i++)
    {
        this.coroutines[i].timer += dt;
        if(this.coroutines[i].timer >= this.coroutines[i].delay)
        {
            this.coroutines[i].func();
            this.coroutines.splice(i, 1);
            i--;
        }
    }
    
    this.implementClear();
};

CustomCoroutine.prototype.clear = function(id) {
    
    this.abandonedCoroutines.push(id);
};

CustomCoroutine.prototype.clearAll = function() {
    
    this.abandonAll = true;
};

CustomCoroutine.prototype.implementClear = function(){
   
    if(this.abandonAll)
    {
        this.abandonAll = false;
        this.coroutines = [];
    }
    else
    {
        for(let i = 0; i < this.abandonedCoroutines.length; i++)
        {
            let index = this.coroutines.indexOf(this.abandonedCoroutines[i]);
            
            if(index === -1)
            {
                this.abandonedCoroutines.splice(i, 1);
                i--;
            }
            else
                this.coroutines.splice(this.abandonedCoroutines[i], 1);
        }
    }
};

CustomCoroutine.prototype.getId = function() {
    
    this.id++;
    if(this.id > 1000)
        this.id = 0;
    
    return this.id;
};

// buttonController.js
var ButtonController = pc.createScript('buttonController');

ButtonController.attributes.add('eventName', { title: 'Click Event', type: 'string', default: 'LevelsController:Btn:Object' });
ButtonController.attributes.add('onPointerDownEventName', { title: 'Point Down Event', type: 'string' });
ButtonController.attributes.add('onPointerUpEventName', { title: 'Pointer Up Event', type: 'string' });

ButtonController.attributes.add('doubleTapSpeed', { title: 'Double tap speed', type: 'number', description: 'If value is 0 simple click will be used' });
ButtonController.attributes.add('labelTxt', { title: 'Button Label', type: 'entity', description: 'Call setText Function to set value of this text' });

ButtonController.attributes.add('includeSenderNameInArgs', { title: 'Include Sender Name', type: 'boolean' });
ButtonController.attributes.add('sendAsSeperateArgs', { title: 'Send As Params', type: 'boolean' });

ButtonController.attributes.add('args', {
    type: 'json',
    title: 'Arguments',
    schema: [
        { name: 'value', type: 'string' },
    ],
    array: true
});

ButtonController.attributes.add('animationSettings', {
    type: 'json',
    title: 'Animation Settings',
    schema: [
        {
            name: 'type',
            type: 'number',
            enum:
                [
                    { 'Bounce': 0 },
                    { 'ScaleOutIn': 1 },
                    { 'None': 2 },
                    { 'LeftRight': 3 },

                ],
            default: 0
        },
        { name: 'duration', type: 'number' },
        { name: 'animValue', type: 'vec3', default: [0.9, 1, 1.2], description: 'x: min animValue | y: base animValue | z: max animValue' },
        { name: 'delegate', type: 'entity', description: 'If no delegate is given, entity having this script will be animated. Otherwise delegate will be animated.' },
    ],
});

ButtonController.attributes.add('enabledSettings', {
    type: 'json',
    title: 'Enabled Settings',
    schema: [
        {
            name: 'animType',
            type: 'number',
            enum:
                [
                    { 'Bounce': 0 },
                    { 'ScaleOutIn': 1 },
                    { 'None': 2 },
                    { 'LeftRight': 3 },
                ],
            default: 3
        },
        { name: 'isEnabled', type: 'boolean', default: true },
        { name: 'animDuration', type: 'number', default: 0.15 },
        { name: 'animValue', type: 'vec3', default: [-15, 7.5, 7.5], description: 'x: min animValue | y: base animValue | z: max animValue' },
        { name: 'delegate', type: 'entity', description: 'Assign delegate to change this.entity Image to deligate Image.' },
    ],
});

ButtonController.AnimType = {
    Bounce: 0,
    ScaleOutIn: 1,
    None: 2,
    LeftRight: 3,
};

// initialize code called once per entity
ButtonController.prototype.initialize = function () {

    this.initialized = false;
    // // console.log("------------------------");

    // // console.log("initialize: " + this.entity.name);
    this.onEnable();

    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    this.on('destroy', this.onDisable, this);
};

ButtonController.prototype.onEnable = function () {
    if (this.initialized) return;
    this.initialized = true;
    // // console.log("onEnable: " + this.entity.name);

    this.timeSinceLastTap = 0;
    this.entity.button.on("click", this.onClick, this);

    if (this.app.touch) {
        this.entity.element.on('touchStart', this.onPointerDown, this);
        this.entity.element.on('touchEnd', this.onPointerUp, this);
    }
    else {
        this.entity.element.on('mouseDown', this.onPointerDown, this);
        this.entity.element.on('mouseUp', this.onPointerUp, this);
    }

    if (this.animationSettings.type === ButtonController.AnimType.None)
        return;

    let entity = this.animationSettings.delegate === null ? this.entity : this.animationSettings.delegate;
    let baseScale = this.animationSettings.animValue.y;
    entity.setLocalScale(baseScale, baseScale, baseScale);
};

ButtonController.prototype.onDisable = function () {
    if (!this.initialized) return;
    this.initialized = false;
    // // console.log("onDisable: " + this.entity.name);
    this.entity.button.off("click", this.onClick, this);
    if (this.app.touch) {
        this.entity.element.off('touchStart', this.onPointerDown, this);
        this.entity.element.off('touchEnd', this.onPointerUp, this);
    }
    else {
        this.entity.element.off('mouseDown', this.onPointerDown, this);
        this.entity.element.off('mouseUp', this.onPointerUp, this);
    }
};

// update code called every frame
ButtonController.prototype.update = function (dt) {

    if (this.timeSinceLastTap > 0)
        this.timeSinceLastTap -= dt;
    else if (this.timeSinceLastTap < 0)
        this.timeSinceLastTap = 0;
};

ButtonController.prototype.manageDoubleTap = function () {

    if (this.doubleTapSpeed > 0) {
        if (this.timeSinceLastTap <= 0) {
            this.timeSinceLastTap = this.doubleTapSpeed;
            return false;
        }

        this.timeSinceLastTap = 0;

        // // console.log('double tapped');
    }

    return true;
};

ButtonController.prototype.onPointerDown = function () {
    // // console.log(`${this.entity.name} -> onPointerDown:`);

    this.raiseEvent(this.onPointerDownEventName);
};

ButtonController.prototype.onPointerUp = function () {
    // // console.log(`${this.entity.name} -> onPointerUp`);

    this.raiseEvent(this.onPointerUpEventName);
};

ButtonController.prototype.onClick = function () {

    // // console.log(`${this.entity.name} -> onClick`);

    if (!this.manageDoubleTap())
        return;

    if (!this.enabledSettings.isEnabled) {
        this.animateButton(this.enabledSettings.animType);
        return;
    }


    this.app.fire("sound:playSound", "BtnSound");
    this.animateButton(this.animationSettings.type);

    this.raiseEvent(this.eventName);
};

ButtonController.prototype.raiseEvent = function (eventName) {

    if (eventName.lenght <= 0) return;

    let args = [];

    for (let i = 0; i < this.args.length; i++)
        args.push(this.args[i].value);

    if (this.includeSenderNameInArgs) args.push(this.entity.name);

    // // console.log(`Button: ${eventName}`);
    if (!this.sendAsSeperateArgs)
        this.app.fire(eventName, args);
    else
        this.app.fire(eventName, ...args);
};

ButtonController.prototype.addArgs = function (args) {
    for (let i = 0; i < args.length; i++)
        this.args.push({ value: args[i] });
};

ButtonController.prototype.clearArgs = function () {
    this.args = [];
};

ButtonController.prototype.setText = function (label) {
    this.labelTxt.element.text = label;
};

ButtonController.prototype.animateButton = function (animType) {

    let entity = this.animationSettings.delegate || this.entity;
    // // console.log("entity: " + entity.name);

    switch (animType) {
        case ButtonController.AnimType.Bounce:
            TweenWrapper.TweenNumber(this.animationSettings.animValue.x, this.animationSettings.animValue.y, this.animationSettings.duration, function (obj) {
                entity.setLocalScale(obj.number, obj.number, obj.number);
            }.bind(this), null, pc.BounceOut);
            break;
        case ButtonController.AnimType.ScaleOutIn:
            let updateScale = function (obj) {
                entity.setLocalScale(obj.number, obj.number, obj.number);
            }.bind(this);

            TweenWrapper.TweenNumber(this.animationSettings.animValue.y, this.animationSettings.animValue.z, this.animationSettings.duration, updateScale, function () {
                TweenWrapper.TweenNumber(this.animationSettings.animValue.z, this.animationSettings.animValue.y, this.animationSettings.duration, updateScale);
            }.bind(this));
            break;
        case ButtonController.AnimType.LeftRight:
            let axis = [this.enabledSettings.animValue.z, this.enabledSettings.animValue.x, this.enabledSettings.animValue.y];
            let animateHelper = function (index) {
                animate(index + 1);
            };

            let animate = function (index) {
                if (index > 2) return;

                // // console.log("Animate: " + index);
                let start = entity.getLocalPosition();
                // // console.log("start: " + start);

                let end = entity.getLocalPosition().clone();
                end.x += axis[index];
                // // console.log("end: " + end);


                TweenWrapper.Tween(entity, entity.getLocalPosition(), end, this.enabledSettings.animDuration, function () { animate(index + 1); });
            }.bind(this);
            animate(0);
            break;
    }
};
// image params = { type, resize, resource }
ButtonController.prototype.setEnabled = function (enable, image) {

    let entity = this.enabledSettings.delegate || this.entity;
    // // console.log(image);
    // // console.log(entity.element.texture);

    this.enabledSettings.isEnabled = enable;

    // if (entity.element.texture !== undefined && entity.element.texture !== null)
    //     // console.log(entity.element.texture);

    if (image === undefined)
        return;

    if (image.type === "Texture") {
        // // console.log("image: " + image.resource);
        entity.element.texture = image.resource;
    }
    else
        entity.element.sprite = image.resource;

    if (image.resize) {
        // // console.log(`${image.width}x${image.height}`);
        entity.element.width = image.width;
        entity.element.height = image.height;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// ButtonController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// teethDetector.js
var TeethDetector = pc.createScript('teethDetector');

TeethDetector.attributes.add('animScript', { type: 'entity' });

TeethDetector.prototype.initialize = function () {

};


TeethDetector.prototype.update = function (dt) {

};


// brushTween.js
var BrushTween = pc.createScript('brushTween');

BrushTween.attributes.add('rotVal', { type: 'vec3', default: [1.5, 0, 0] });


BrushTween.prototype.initialize = function () {

};

BrushTween.prototype.update = function (dt) {
    this.entity.rotateLocal(this.rotVal.x, this.rotVal.y, this.rotVal.z);
};


// LevelManager.js
var LevelManager = pc.createScript('levelManager');

// -1 to run procedural level
//  0 to run the default sequence
//  1-24 to run any other level

LevelManager.attributes.add('levelNumber', { type: 'number', default: 0 });

LevelManager.getInstance = function () {
    if (!LevelManager._instance) throw new Error('LevelManager is not initialized yet');
    return LevelManager._instance;
};

LevelManager.prototype.getCurrentLevel = function() {
    // return this.level;
    try {
        const loadedLevel = +APIMediator.getStorageItem("TR_LEVEL") || 1;
        this.level = parseInt(loadedLevel) || 1;
    } catch (e) {
        this.level = 1;
    }

    return this.level;
}

LevelManager.prototype.setCurrentLevel = function(level) {
    this.level = level;
    APIMediator.setStorageItem("TR_LEVEL", "" + this.level);
    this._updateLevelNumberView(level);
}

LevelManager.prototype._updateLevelNumberView = function(level) {
    this.app.root.findByName("Current Level").element.text = LocalizationManager.getInstance().getLocalizedText('LEVEL #').replace('#', '' + level);
    this.app.root.findByName("Lvl Txt").element.text = LocalizationManager.getInstance().getLocalizedText('LEVEL #').replace('#', '' + level);
};

LevelManager.prototype.initialize = function () {
    LevelManager._app = this.app;
    if (!LevelManager._instance) {
        LevelManager._instance = this;
    }

    if (this.levelNumber === 0) {
        this.level = 1;
    } else if (this.levelNumber > 0) {
        this.level = this.levelNumber;
    } else {
        this.level = -5;
    }


    if (APIMediator.getStorageItem("TR_LEVEL") === null) {
        APIMediator.setStorageItem("TR_LEVEL", 1);
        this.level = 1;
    } else {
        let jsonData = +APIMediator.getStorageItem("TR_LEVEL");
        this.level =  +jsonData || 1; 
    }

    // if (this.level > 25)
    //     this.level = -1;

    this._updateLevelNumberView(this.level);

    this.loadingScreen = this.app.root.findByName("Loading Menu");
    this.loadingScreen.enabled = true;


    this.currentLevelJson = null;
    this.isProceduralLoaded = false;
    this.loadLevel();
    this.app.on("LevelManager:LoadLevel", this.loadLevel, this);
    this.app.on("Game:OnCompleted", this.onGameCompletedEnv, this);
    this.app.on('OnLevelLoaded', this.onLevelLoaded, this);
    this.app.on('OnEnvironmentReady', this.onEnvironmentReady, this);
    this.on("destroy", this.onDestroy, this);
};

LevelManager.prototype.onDestroy = function () {
    this.app.off('OnLevelLoaded', this.onLevelLoaded, this);
    this.app.off('OnEnvironmentReady', this.onEnvironmentReady, this);
    this.app.off("LevelManager:LoadLevel", this.loadLevel, this);
    this.app.off("Game:OnCompleted", this.onGameCompletedEnv, this);
};

LevelManager.prototype.loadNextLevel = function() {
    LevelManager.getInstance().setCurrentLevel(LevelManager.getInstance().getCurrentLevel() + 1);
    this.resetGameplay();
};


LevelManager.prototype.loadCustomLevel = function(level) {
    LevelManager.getInstance().setCurrentLevel(level);
    this.resetGameplay();
};

LevelManager.prototype.restartLevel = function() {
    this.resetGameplay();
};

LevelManager.prototype.resetGameplay = function() {
    this.app.fire(this.app.events.game.start, false);
    this.app.fire('LevelManager:LoadLevel');
    this.app.fire(this.app.events.menuManager.changeState, MenuManager.States.Main, true);
}

LevelManager.prototype.onGameCompletedEnv = function () {
    this.app.fire('Missions:ProgressLevelCount', 1);

    // Unload the scene data to free resources
    if (this.currentLevelJson !== null && !this.isProceduralLoaded)
        this.app.scenes.unloadSceneData(this.currentLevelJson);

    //Find the Scene Registry Item by the name of the scene
    var sceneItem = this.app.scenes.find("Level " + this.level);

    if (sceneItem) { // If next level is found, download it now to load later
        // Load the scene data with a callback when it has finished
        this.app.scenes.loadSceneData(sceneItem, (err, sceneItem) => {
            if (err) {
                console.error(err);
            } else {
                this.currentLevelJson = sceneItem;
                // console.warn(this.currentLevelJson);
            }
        });

    } else if (!this.isProceduralLoaded) {
        var sceneItem = this.app.scenes.find("Procedural Level");
        this.app.scenes.loadSceneData(sceneItem, (err, sceneItem) => {
            if (err) {
                console.error(err);
            } else {
                this.isProceduralLoaded = true;
                this.currentLevelJson = sceneItem;
                Debug.log("SET TR LEVEL Prod" + this.isProceduralLoaded);
            }
        });
    }
};

LevelManager.prototype.loadLevel = function () {

    // this.app.root.findByName("Loading Menu").enabled = true;
    this.loadingScreen.fire('fade', true, true);

    this.app.fire(this.app.events.fever.addPoint, -1); // Reset speed and fever

    if (this.entity.children.length > 0) {
        this.entity.children[0].destroy();
    }

    if (this.currentLevelJson === null) {
        if (this.level > 0) {
            var scene = this.app.scenes.find("Level " + this.level);
            if(!scene) scene = this.app.scenes.find("Procedural Level");
            this.loadScene(scene);
        } else {
            var scene = this.app.scenes.find("Procedural Level");
            this.loadScene(scene);
        }

    } else {

        var self = this;

        this.app.scenes.loadSceneHierarchy(this.currentLevelJson, (err, loadedSceneRootEntity) => {
            if (err) {
                console.error(err);
            } else {
                loadedSceneRootEntity.reparent(self.entity);
                if (!self.isProceduralLoaded) {
                    Debug.log("SET TR LEVEL" + self.isProceduralLoaded);
                    //APIMediator.setStorageItem("TR_LEVEL", JSON.stringify(self.level));
                    self.level++;
                }

                AssetsLoader.getInstance().loadPendingAssets().then(result => {
                    this.app.fire('OnLevelLoaded');
                });
            }
        });

    }

};

LevelManager.prototype.loadScene = function (scene) {
    var self = this;
    this.app.scenes.loadSceneData(scene, (err, sceneItem) => {
        if (err) {
            console.error(err);
        } else {
            this.currentLevelJson = sceneItem;
            this.app.scenes.loadSceneHierarchy(sceneItem, (err, loadedSceneRootEntity) => {
                if (err) {
                    console.error(err);
                } else {
                    loadedSceneRootEntity.reparent(self.entity);
                    self.level++;
                }

                AssetsLoader.getInstance().loadPendingAssets().then(result => {
                    this.app.fire('OnLevelLoaded');
                });

            });
        }
    });

};

LevelManager.prototype.onLevelLoaded = function () {
    // this.app.root.findByName("Loading Menu").enabled = false;
}

LevelManager.prototype.onEnvironmentReady = function () {
    // console.log('Level ready');
    setTimeout(() => {
        this.loadingScreen.fire('fade', false);
    }, 100);
}

LevelManager.prototype.update = function (dt) {

};


// TweenRotation.js
var TweenRotation = pc.createScript('tweenRotation');

TweenRotation.attributes.add('RotationSpeed', {type: 'number'});

TweenRotation.prototype.initialize = function() {
    
};

TweenRotation.prototype.update = function(dt) {
    var x = this.entity.getLocalEulerAngles().x;
    var y = this.entity.getLocalEulerAngles().y;
    var z = this.entity.getLocalEulerAngles().z - this.RotationSpeed * dt;
    
    this.entity.setLocalEulerAngles(x,y,z);
};


// ProceduralLevelGenerator.js
var ProceduralLevelGenerator = pc.createScript('proceduralLevelGenerator');

ProceduralLevelGenerator.attributes.add('m_firstPosToInstantiateHead', { type: 'entity', title: 'First Head Position' });

ProceduralLevelGenerator.attributes.add('m_elementToInstantiateCount', { type: 'number', title: 'Elements to Instantiate', default: 15 });
ProceduralLevelGenerator.attributes.add('m_minSpaceBetweenToothPast', { type: 'number', title: 'Min Space Between ToothPaste', default: 5 });
ProceduralLevelGenerator.attributes.add('m_maxSpaceBetweenToothPast', { type: 'number', title: 'Max Space Between ToothPaste', default: 8 });
ProceduralLevelGenerator.attributes.add('m_minTongueOutCount', { type: 'number', title: '', default: 1 });
ProceduralLevelGenerator.attributes.add('m_maxTongueOutCount', { type: 'number', title: '', default: 3 });

ProceduralLevelGenerator.attributes.add('m_luckHumanWithWhiteToothpaste', { type: 'number', title: 'Luck Human with paste', min: 0, max: 1, default: 0.5, description: 'Luck to have Human with toothpaste between 0 and 1. --- 0.5 = 50% luck' });
ProceduralLevelGenerator.attributes.add('m_luckZombieWithShit', { type: 'number', title: 'Luck Zombie with shit', min: 0, max: 1, default: 0.5, description: 'Luck to have Zombie with shit between 0 and 1. --- 0.5 = 50% luck' });
ProceduralLevelGenerator.attributes.add('m_luckHeadWithObstacle', { type: 'number', title: 'Luck Head with Obstacle', min: 0, max: 1, default: 0.5, description: 'Luck to have Head instead of obstacle between 0 and 1. --- 0.5 = 50% luck' });
// ProceduralLevelGenerator.attributes.add('m_luckToHaveBigSpaceBetweenHeads', { type: 'number', title: '', default: 0.5 });

ProceduralLevelGenerator.attributes.add('templates', {
    title: 'Templates',
    type: 'json',
    schema: [
        { name: 'paste', title: 'Paste', type: 'asset', assetType: 'template' },
        { name: 'poop', title: 'Poop', type: 'asset', assetType: 'template' },
        { name: 'head', title: 'Head', type: 'asset', assetType: 'template' },
        { name: 'monsterHead', title: 'Monster Head', type: 'asset', assetType: 'template' },
        { name: 'airObstacle', title: 'Air Obstacle', type: 'asset', assetType: 'template' },
        { name: 'groundObstacle', title: 'Ground Obstacle', type: 'asset', assetType: 'template' },
    ],
});

ProceduralLevelGenerator.attributes.add('references', {
    title: 'References',
    type: 'json',
    schema: [
        { name: 'environmentGenerator', type: 'entity', title: 'Environment Generator' },
        { name: 'facesContainer', type: 'entity', title: 'Faces Container' },
        { name: 'obstaclesContainer', type: 'entity', title: 'Obstacles Container' },
    ],
});

GpeType = {
    paste: 0,
    head: 1,
    monsterHead: 2,
    poop: 3,
    obstacle: 4,
};

// initialize code called once per entity
ProceduralLevelGenerator.prototype.initialize = function () {
    this.m_currentSpaceBetweenHeads = 0;
    this.m_listGpeElement = [];
    this.instancesCount = {
        paste: 0,
        poop: 0,
        head: 0,
        mHead: 0,
    };
    this.initLevel();
};

ProceduralLevelGenerator.prototype.update = function (dt) {

};

ProceduralLevelGenerator.prototype.initLevel = function () {
    let posToInstantiate = this.m_firstPosToInstantiateHead.getLocalPosition();
    let lastIndexToothPast = 0;

    let isLuck = false;
    let isTongueIn = false;
    let indexsTongueInBetweenToothPaste = [];
    let indexBigSpace = 0;
    let name;

    for (let i = 0; i < this.m_elementToInstantiateCount; i++) {
        let gpeInstantiate = {};
        if ((this.m_currentSpaceBetweenHeads < 0 || i == 0) && i < (this.m_elementToInstantiateCount - 5)) {
            lastIndexToothPast = i;
            gpeInstantiate = this.getToothPaste(posToInstantiate, true, this.references.facesContainer);
            this.m_currentSpaceBetweenHeads = parseInt(pc.math.random(this.m_minSpaceBetweenToothPast, this.m_maxSpaceBetweenToothPast + 1));
            indexBigSpace = parseInt(pc.math.random(i, i + this.m_currentSpaceBetweenHeads));
        }
        else if (this.m_listGpeElement[lastIndexToothPast].type == GpeType.paste) {
            if (pc.math.random(0, 1) > this.m_luckHeadWithObstacle) {
                let p = {};
                let isAirObs = pc.math.random(0, 1) < 0.5;
                p.x = isAirObs ? -3.6 : 0;
                p.y = isAirObs ? 4.5 : -0.13;
                p.z = posToInstantiate.z;
                let name = '';
                let obstacle = isAirObs ? this.templates.airObstacle : this.templates.groundObstacle;
                gpeInstantiate.obj = this.instantiateTemplate(obstacle, p, this.references.facesContainer, name);
                gpeInstantiate.type = GpeType.obstacle;
            }
            else if (pc.math.random(0, 1) > this.m_luckHumanWithWhiteToothpaste) {
                name = "MonsterHead " + this.instancesCount.mHead++;
                gpeInstantiate.obj = this.instantiateTemplate(this.templates.monsterHead, posToInstantiate, this.references.facesContainer, name);
                gpeInstantiate.type = GpeType.monsterHead;
                isLuck = false;
            }
            else {
                name = "Head " + this.instancesCount.head++;
                gpeInstantiate.obj = this.instantiateTemplate(this.templates.head, posToInstantiate, this.references.facesContainer, name);
                gpeInstantiate.type = GpeType.head;
                isLuck = true;
            }
        }
        else if (this.m_listGpeElement[lastIndexToothPast].type == GpeType.poop) {
            if (pc.math.random(0, 1) > this.m_luckHeadWithObstacle) {
                // obstacle
                let p = {};
                let isAirObs = pc.math.random(0, 1) < 0.5;
                p.x = isAirObs ? -3.6 : 0;
                p.y = isAirObs ? 4.5 : -0.13;
                p.z = posToInstantiate.z;
                let name = '';
                let obstacle = isAirObs ? this.templates.airObstacle : this.templates.groundObstacle;
                gpeInstantiate.obj = this.instantiateTemplate(obstacle, p, this.references.obstaclesContainer, name);
                gpeInstantiate.type = GpeType.obstacle;
            }
            else if (pc.math.random(0, 1) > this.m_luckZombieWithShit) {
                name = "Head " + this.instancesCount.head++;
                gpeInstantiate.obj = this.instantiateTemplate(this.templates.head, posToInstantiate, this.references.facesContainer, name);
                gpeInstantiate.type = GpeType.head;
                isLuck = false;
            }
            else {
                name = "MonsterHead " + this.instancesCount.mHead++;
                gpeInstantiate.obj = this.instantiateTemplate(this.templates.monsterHead, posToInstantiate, this.references.facesContainer, name);
                gpeInstantiate.type = GpeType.monsterHead;
                isLuck = true;
            }
        }
        this.m_listGpeElement.push(gpeInstantiate);

        let offsetBetweenElement = 4;
        if (this.m_listGpeElement[i].type == GpeType.paste || this.m_listGpeElement[i].type == GpeType.poop || i == i + this.m_currentSpaceBetweenHeads)
            offsetBetweenElement = 7; // -7

        posToInstantiate.z -= offsetBetweenElement;
        this.m_currentSpaceBetweenHeads--;
    }

    let random = parseInt(pc.math.random(0, 5)) % 5;
    this.references.environmentGenerator.script.enviornmentGenerator.setType(random);
    this.references.environmentGenerator.enabled = true;
};

ProceduralLevelGenerator.prototype.getToothPaste = function (pos, isRandom, isWhite = true) {

    if (isRandom) {
        let p = {};
        p.x = 0;
        p.y = 0;
        p.z = pos.z;
        let name;

        let randomPowerUp = (Math.floor(Math.random() * 2) == 0);
        if (randomPowerUp) {
            p.x = 0.703;
            p.y = 0.515;
            name = "Paste " + this.instancesCount.paste++;
            return { obj: this.instantiateTemplate(this.templates.paste, p, this.references.facesContainer), type: GpeType.paste, name };
        } else {
            name = "Poop " + this.instancesCount.poop++;
            return { obj: this.instantiateTemplate(this.templates.poop, p, this.references.facesContainer), type: GpeType.poop, name };
        }
    }

};

ProceduralLevelGenerator.prototype.getListIndexTongueIn = function (tongueOutCount, lastIndexToothPast, headCount) {

    let tonguesInIndexs = [];

    for (let i = lastIndexToothPast + 1; i <= lastIndexToothPast + headCount; i++)
        tonguesInIndexs.push(i);

    for (let i = 0; i < tongueOutCount; i++)
        tonguesInIndexs.splice(pc.math.random(0, tonguesInIndexs.length), 1);

    return tonguesInIndexs;

};

ProceduralLevelGenerator.prototype.instantiateTemplate = function (template, pos, parent, name) {

    let entity = template.resource.instantiate();
    // entity.name = name;
    this.app.root.addChild(entity);
    entity.reparent(parent);
    entity.setLocalPosition(pos.x, pos.y, pos.z);
    return entity;

};


// HeadFinisherController.js
var HeadFinisherController = pc.createScript('headFinisherController');

HeadFinisherController.attributes.add('multiDetectionPoint', { title: 'multiDetectionPoint', type: 'entity' });
HeadFinisherController.attributes.add('gums', { title: 'gums', type: 'entity', array: true });


// initialize code called once per entity
HeadFinisherController.prototype.initialize = function () {

};

// update code called every frame
HeadFinisherController.prototype.update = function (dt) {

};

// GumManager.js
var GumManager = pc.createScript('gumManager');

GumManager.attributes.add('gumDetectionPoint', { title: 'gumDetectionPoint', type: 'entity' });
GumManager.attributes.add('cleanGums', { title: 'cleanGums', type: 'entity', array: true });
GumManager.attributes.add('dirtyGums', { title: 'dirtyGums', type: 'entity', array: true });
GumManager.attributes.add('offsetFrom', { title: 'offsetFrom', type: 'number', default: 1 });
GumManager.attributes.add('offsetTo', { title: 'offsetTo', type: 'number', default: 0.9 });

// initialize code called once per entity
GumManager.prototype.initialize = function () {

};

// update code called every frame
GumManager.prototype.update = function (dt) {

};

// progressionManager.js
var ProgressionManager = pc.createScript('progressionManager');

// initialize code called once per entity
ProgressionManager.prototype.initialize = function () {

    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.on("destroy", this.onDestroy, this);

};

ProgressionManager.prototype.onDestroy = function () {

    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);

};

ProgressionManager.prototype.onEnvConfigRcv = function () {

};

// update code called every frame
ProgressionManager.prototype.update = function (dt) {

};

// randomFacesManager.js
var RandomFacesManager = pc.createScript('randomFacesManager');

RandomFacesManager.attributes.add('randomFaces', { type: 'entity' });

// initialize code called once per entity
RandomFacesManager.prototype.initialize = function () {

    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.app.on('UpdateMonsterModel', this.onUpdateMonsterHeads, this);
    this.on("destroy", this.onDestroy, this);

};

RandomFacesManager.prototype.onDestroy = function () {

    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.app.off('UpdateMonsterModel', this.onUpdateMonsterHeads, this);


};

RandomFacesManager.prototype.onEnvConfigRcv = function () {

    for (let i = 0; i < this.entity.children.length; i++) {

        let name = this.entity.children[i].name;
        let pos = this.entity.children[i].getPosition().clone();

        if (name === "ToothPaste_New") {
            //console.log("Paste");
            let prefab = EnvironmentConfig.instance.config.whiteToothPaste.resource.instantiate();
            this.randomFaces.addChild(prefab);
            prefab.setPosition(0.703, pos.y, pos.z);

        } else if (name === "Head") {
            //console.log("Head");
            let randHead = EnvironmentConfig.instance.config.heads[Math.floor(Math.random() * EnvironmentConfig.instance.config.heads.length)];
            let prefab = randHead.resource.instantiate();
            this.randomFaces.addChild(prefab);
            prefab.setPosition(pos);

        } else if (name === "Monster Head") {
            //console.log("Monster Head");
            let randMHead = this.getRandomMonsterHeadTemplate();
            let prefab = randMHead.resource.instantiate();
            this.randomFaces.addChild(prefab);
            prefab.setPosition(pos);

        } else if (name === "Poop") {
            //console.log("Poop");
            let prefab = EnvironmentConfig.instance.config.greenToothPaste.resource.instantiate();
            this.randomFaces.addChild(prefab);
            prefab.setLocalPosition(0.3, pos.y, pos.z);
            // console.log(pos);

        }

    }

    for (let i = this.entity.children.length - 1; i >= 0; i--) {
        this.entity.children[i].destroy();
    }

    this.app.fire("setupCleanTeethMaterial");
    this.app.fire('OnEnvironmentReady');
};

RandomFacesManager.prototype.getRandomMonsterHeadTemplate = function () {
    const availableTemplates = ShopManager.instance.getUnlockedMonsterTemplates();
    const selectedTemplate = ShopManager.instance.getSelectedZombieTemplate();

    if (Math.random() < 0.6) {
        if (Math.random() < 0.5) {
            return selectedTemplate;
        } else {
            return Utils.getRandomItem(availableTemplates);
        }
    } else {
        return EnvironmentConfig.instance.config.monsterHeads[Math.floor(Math.random() * EnvironmentConfig.instance.config.monsterHeads.length)];
    }
};

RandomFacesManager.prototype.onUpdateMonsterHeads = async function () {

};

// update code called every frame
RandomFacesManager.prototype.update = function (dt) {

};

// environmentSetter.js
var EnvironmentSetter = pc.createScript('environmentSetter');

EnvironmentSetter.attributes.add('ground', { type: 'entity' });
EnvironmentSetter.attributes.add('borderLeft', { type: 'entity' });
EnvironmentSetter.attributes.add('borderRight', { type: 'entity' });
EnvironmentSetter.attributes.add('defaultEnv', { type: 'entity' });
EnvironmentSetter.attributes.add('playerCamera', { type: 'entity' });
EnvironmentSetter.attributes.add('ballFinisherCamera', { type: 'entity' });

EnvironmentSetter.attributes.add('canonEndLevel', { type: 'entity' });
EnvironmentSetter.attributes.add('teethCleanEndLevel', { type: 'entity' });


// initialize code called once per entity
EnvironmentSetter.prototype.initialize = function () {

    this.app.on("setupEnvironmentConfig", this.onEnvConfigRcv, this);
    this.entity.findByName("Road Collision").collision.halfExtents.set(1, 0.1, 200);
    this.on("destroy", this.onDestroy, this);

};

EnvironmentSetter.prototype.onDestroy = function () {

    this.app.off("setupEnvironmentConfig", this.onEnvConfigRcv, this);

};

EnvironmentSetter.prototype.onEnvConfigRcv = function () {

    this.ground.render.material.diffuse.set(EnvironmentConfig.instance.config.groundColor.r, EnvironmentConfig.instance.config.groundColor.g, EnvironmentConfig.instance.config.groundColor.b);
    this.ground.render.material.update();

    this.borderLeft.render.material.diffuse.set(EnvironmentConfig.instance.config.borderColor.r, EnvironmentConfig.instance.config.borderColor.g, EnvironmentConfig.instance.config.borderColor.b);
    this.borderLeft.render.material.update();

    this.borderRight.render.material.diffuse.set(EnvironmentConfig.instance.config.borderColor.r, EnvironmentConfig.instance.config.borderColor.g, EnvironmentConfig.instance.config.borderColor.b);
    this.borderRight.render.material.update();

    let envGlobe = EnvironmentConfig.instance.config.envDecor.resource.instantiate();
    this.playerCamera.addChild(envGlobe);

    let newGlobe = EnvironmentConfig.instance.config.envDecor.resource.instantiate();
    this.ballFinisherCamera.addChild(newGlobe);


    let randomPowerUp = (Math.floor(Math.random() * 2) == 0);
    //let randomPowerUp = false;

    if (randomPowerUp) {

        this.canonEndLevel.enabled = false;
        this.teethCleanEndLevel.enabled = true;
        let levelFinisher = this.teethCleanEndLevel.findByName("Level Finisher");
        this.app.fire("Ref:levelFinisher", levelFinisher);

    } else {

        if (pc.platform.android) {

            this.canonEndLevel.enabled = false;
            this.teethCleanEndLevel.enabled = true;
            let levelFinisher = this.teethCleanEndLevel.findByName("Level Finisher");
            this.app.fire("Ref:levelFinisher", levelFinisher);

        } else {

            this.canonEndLevel.enabled = true;
            this.teethCleanEndLevel.enabled = false;
            let levelFinisher = this.canonEndLevel.findByName("Level Finisher");
            this.app.fire("Ref:levelFinisher", levelFinisher);

        }


    }

    this.teethCleanEndLevel.findByName("Level Finisher").fire("setupEnvironmentConfig");
    this.canonEndLevel.findByName("Level Finisher").fire("setupEnvironmentConfig");

};

// update code called every frame
EnvironmentSetter.prototype.update = function (dt) {

};

// movementController.js
var MovementController = pc.createScript('movementController');

MovementController.attributes.add('start', { title: 'Start', type: 'vec3' });
MovementController.attributes.add('endOffset', { title: 'End Offset', type: 'vec3' });
MovementController.attributes.add('speed', { title: 'Speed', type: 'vec3' });
MovementController.attributes.add('setSpeed', { title: 'Set Speed', type: 'string', default: 'Player:SetSpeed' });
MovementController.attributes.add('onComplete', { title: 'onComplete', type: 'string', default: 'Game:OnCompleted' });

// initialize code called once per entity
MovementController.prototype.initialize = function () {
    this.isStarted = false;
    this.lerpValues = new pc.Vec3(0, 0, 0);
    this.onCompletedEventRaised = false;
    // this.entity.setLocalPosition(this.start.x, this.start.y, this.start.z);
    // console.log("FAIQ: speed init: ", this.speed);

    this.app.on(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.on(this.setSpeed, this.onSetSpeed, this);
    this.app.on("Ref:levelFinisher", this.levelFinisherUpdate, this);

    this.on("destroy", this.onDestroy, this);
};

MovementController.prototype.onDestroy = function () {

    this.app.off(this.app.events.game.start, this.onGameStartEnv, this);
    this.app.off(this.setSpeed, this.onSetSpeed, this);
    this.app.off("Ref:levelFinisher", this.levelFinisherUpdate, this);
};

MovementController.prototype.levelFinisherUpdate = function (levelFinisher) {
    this.end = levelFinisher.getLocalPosition().clone();
    this.end.z += levelFinisher.parent.getLocalPosition().z;
    // console.log(this.entity.name, " FAIQ1: ", this.end.z);
    // this.speed.z = 5.25 / this.end.z;
};

MovementController.prototype.onGameStartEnv = function (isStarted) {
    this.isStarted = isStarted;
    this.onCompletedEventRaised = false;
};

MovementController.prototype.onSetSpeed = function (speed) {
    // console.log("FAIQ: onSetSpeed: ", speed);
    this.speed.set(speed.x, speed.y, speed.z);
};

// update code called every frame
MovementController.prototype.update = function (dt) {
    if (!this.isStarted && !this.onCompletedEventRaised) return;

    // this.lerpValues.x += this.speed.x * dt;
    // this.lerpValues.y += this.speed.y * dt;
    // this.lerpValues.z += this.speed.z * dt;

    // let x = this.speed.x != 0 ? pc.math.lerp(this.start.x, this.end.x + this.endOffset.x, this.lerpValues.x) : this.entity.getLocalPosition().x;
    // let y = this.speed.y != 0 ? pc.math.lerp(this.start.y, this.end.y + this.endOffset.y, this.lerpValues.y) : this.entity.getLocalPosition().y;
    // let z = this.speed.z != 0 ? pc.math.lerp(this.start.z, this.end.z + this.endOffset.z, this.lerpValues.z) : this.entity.getLocalPosition().z;

    let pos = this.entity.getLocalPosition();

    pos.x += this.speed.x * dt;
    pos.y += this.speed.y * dt;
    pos.z += this.speed.z * dt;

    this.entity.setLocalPosition(pos.x, pos.y, pos.z);
    // console.log("FAIQ: POS: ", pos.z);

    if (!this.end) return;

    let xCompleted = this.speed.x != 0 ? pos.x < this.end.x + this.endOffset.x : true;
    let yCompleted = this.speed.y != 0 ? pos.y < this.end.y + this.endOffset.y : true;
    let zCompleted = this.speed.z != 0 ? pos.z < this.end.z + this.endOffset.z : true;

    if (this.onComplete) {
        const levelProgress = pc.math.clamp(pos.z / (this.end.z + this.endOffset.z));
        APIMediator.sendProgress(Math.floor(levelProgress * 100));
    }

    if (xCompleted && yCompleted && zCompleted && !this.onCompletedEventRaised) {
        this.onCompletedEventRaised = true;
        if (this.onComplete.length > 0) {
            this._fireCompleteEvent();
        }
    }
};

MovementController.prototype._fireCompleteEvent = async function () {
    await APIMediator.gameComplete();
    
    /* tracking */
    APIMediator.track({
        event: "GA:Progression",
        progressionStatus: "Complete",
        progression01: "Level" + LevelManager.getInstance().getCurrentLevel()
    });

    this.app.fire(this.onComplete);
};

// Logger_Manager.js
var LoggerManager = pc.createScript('loggerManager');

LoggerManager.prototype.initialize = function () {
    this.app.on(this.app.events.configManager.initialized, this.onConfigInitialized, this);
};

// update code called every frame
LoggerManager.prototype.onConfigInitialized = function () {
    this.isDebug = ConfigManager.instance.devMode === 0; // Global debug state
    this.isDebugOnMobile = false;

    if (this.isDebugOnMobile) {
        let vConsole = new VConsole();
    }

    var Debugger = function (gState, str) {
        this.debug = {};
        if (!window.console) return function () { };
        if (gState && str.isDebug) {
            for (let m in console)
                if (typeof console[m] == 'function')
                    this.debug[m] = console[m].bind(str.toString() + ": ");
        } else {
            for (let m in console)
                if (typeof console[m] == 'function')
                    this.debug[m] = function () { };
        }
        return this.debug;
    };



    Debug = Debugger(this.isDebug, this);
};

// configManager.js
var ConfigManager = pc.createScript('configManager');

ConfigManager.EnvTypes = {
    'None': -1,
    'Famobi': 4
};

ConfigManager.Mode = {
    'Development': 0,
    'Production': 1,
};

ConfigManager.attributes.add('version', {
    type: 'string',
    title: 'Version'
});

ConfigManager.attributes.add('devMode', {
    type: 'number',
    enum: [
        { 'Development': ConfigManager.Mode.Development },
        { 'Production': ConfigManager.Mode.Production },
    ],
    title: "BuildType"
});

ConfigManager.attributes.add('environmentType', {
    type: 'number',
    enum: [
        { 'None': ConfigManager.EnvTypes.None },
        { 'Famobi': ConfigManager.EnvTypes.Famobi },
    ],
    title: "EnvType"
});

ConfigManager.instance = null;

ConfigManager.prototype.initialize = function () {
    ConfigManager.instance = this;

    this.app.fire(this.app.events.configManager.initialized);
};

// EnvManager.js
var EnvManager = pc.createScript('envManager');

EnvManager.attributes.add('levelProgressDots', { type: 'entity', array: true });

EnvManager.instance = null;

// initialize code called once per entity
EnvManager.prototype.initialize = function () {

    EnvManager.instance = this;
    this.envArr = [

        {
            envType: "Default"
        },
        {
            envType: "Default"
        },
        {
            envType: "Default"
        },
        {
            envType: "Default"
        },

        {
            envType: "Mexican"
        },
        {
            envType: "Mexican"
        },
        {
            envType: "Mexican"
        },
        {
            envType: "Mexican"
        },

        {
            envType: "French"
        },
        {
            envType: "French"
        },
        {
            envType: "French"
        },
        {
            envType: "French"
        },

        {
            envType: "Farm"
        },
        {
            envType: "Farm"
        },
        {
            envType: "Farm"
        },
        {
            envType: "Farm"
        },

        {
            envType: "Vampire"
        },
        {
            envType: "Vampire"
        },
        {
            envType: "Vampire"
        },
        {
            envType: "Vampire"
        }

    ];

    this.currentEnv = 0;
    this.greenColor = new pc.Color(32 / 255, 255 / 255, 0);
    this.orangeColor = new pc.Color(255 / 255, 170 / 255, 0);

    this.tweenArr = [];

    for (let i = 0; i < this.levelProgressDots.length; i++) {

        let col = this.tweenColor(this.levelProgressDots[i], { r: 255 / 255, g: 170 / 255, b: 0 }, 1, { r: 255 / 255, g: 223 / 255, b: 0 });
        this.tweenArr.push(col);

    }

};

EnvManager.prototype.tweenColor = function (entity, to, time, color) {

    return entity
        .tween(color)
        .to({ value: to }, time, pc.Linear)
       .onUpdate( () => {
            entity.element.color.set(color.r, color.g, color.b);
        })
        .loop(true)
        .yoyo(true);
};


EnvManager.prototype.getEnvType = function () {

    if (this.envArr[this.currentEnv]) {

        this.disableAllDots();
        this.enableCurrentDots();
        let currEnv = this.envArr[this.currentEnv];
        this.currentEnv++;
        return currEnv;

    } else {

        this.disableAllDots();
        this.currentEnv = 0;
        this.enableCurrentDots();
        return this.envArr[this.currentEnv];

    }

};

EnvManager.prototype.disableAllDots = function () {

    for (let i = 0; i < this.levelProgressDots.length; i++) {

        this.levelProgressDots[i].enabled = false;

    }

};

EnvManager.prototype.enableCurrentDots = function () {

    let iterate = this.currentEnv % 4;

    for (let i = 0; i < iterate; i++) {

        this.levelProgressDots[i].element.color = this.greenColor;
        this.levelProgressDots[i].enabled = true;
        this.tweenArr[i].stop();

    }

    this.levelProgressDots[iterate].element.color = this.orangeColor;
    Debug.log(this.tweenArr[iterate]);
    this.tweenArr[iterate].start();
    this.levelProgressDots[iterate].enabled = true;
};

// update code called every frame
EnvManager.prototype.update = function (dt) {

};

// HeartBeatAnim.js
var HeartBeatAnim = pc.createScript('heartBeatAnim');

HeartBeatAnim.attributes.add('beginOnStart', { type: 'boolean', title: 'Begin On Start', default: true});
HeartBeatAnim.attributes.add('beatLimit', { type: 'vec3', title: 'Beat Limit', default: [1.1, 1.1, 1.1]});
HeartBeatAnim.attributes.add('time', { type: 'number', title: 'Time', default: 0.1});
HeartBeatAnim.attributes.add('delayTime', { type: 'number', title: 'Delay Time', default: 0.1});

// initialize code called once per entity
HeartBeatAnim.prototype.initialize = function () {

    this.onEnable();
    this.on('enable', this.onEnable, this);
    this.on('animate', this.animate, this);
};

HeartBeatAnim.prototype.onEnable = function() {
    if (this.beginOnStart)
    this.animate(true, this.delayTime);
};

// update code called every frame
HeartBeatAnim.prototype.update = function(dt) {

};

HeartBeatAnim.prototype.animate = function (enable, delayTime) {
    if (enable) {
        this.tween = TweenWrapper.Tween(
            this.entity, this.entity.getLocalScale(), this.beatLimit, this.time,
            undefined, pc.SineOut, true, true, undefined, delayTime
        );
    }
    else if (this.tween) TweenWrapper.StopTween(this.tween);
};

// swap method called for script hot-reloading
// inherit your script state here
// HeartBeatAnim.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// LevelRewardCardHandler.js
var LevelRewardCardHandler = pc.createScript('levelRewardCardHandler');

LevelRewardCardHandler.Type = {
    'Gems': 0,
    'Reward': 1,
};

LevelRewardCardHandler.attributes.add('cardType', {
    type: 'number',
    enum: [
        { 'Gems': LevelRewardCardHandler.Type.Gems },
        { 'Reward': LevelRewardCardHandler.Type.Reward },
    ],
    title: "Card Type"

});

LevelRewardCardHandler.attributes.add('title', { type: 'entity', title: 'Title' });
LevelRewardCardHandler.attributes.add('amountTxt', { type: 'entity', title: 'Amount' });
LevelRewardCardHandler.attributes.add('bg', { type: 'entity', title: 'Background' });
LevelRewardCardHandler.attributes.add('frontImage', { type: 'entity', title: 'Front Image' });
LevelRewardCardHandler.attributes.add('getBtn', { type: 'entity', title: 'Get Button' });
LevelRewardCardHandler.attributes.add('visibleGetBtnPos', { type: 'vec3', title: 'Get Btn Position' });
LevelRewardCardHandler.attributes.add('rewardedAdIcon', { type: 'entity', title: 'Rewarded Ad Icon' });

LevelRewardCardHandler.attributes.add('typeInfos', {

    title: "Type infos",
    type: 'json',
    schema: [
        { name: 'group', title: 'Group', type: 'entity' },
        { name: 'color', title: 'Color', type: 'rgba' },
    ],
    array: true,
});

// initialize code called once per entity
LevelRewardCardHandler.prototype.initialize = function () {


    // this.onEnable();
    // this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    this.on('destroy', this.onDestroy, this);
};

LevelRewardCardHandler.prototype.onDisable = function () {

};

LevelRewardCardHandler.prototype.reset = function () {
    this.prevType = 0;
    this.amount = 0;

    for (let i = 0; i < this.typeInfos.length; i++) {
        this.typeInfos[i].group.enabled = false;
    }
};

LevelRewardCardHandler.prototype.registerEvent = function () {
    this.entity.on('setTitle', this.setTitle, this);
    this.entity.on('setType', this.setType, this);
    this.entity.on('setAmount', this.setAmount, this);
    this.entity.on('setInfo', this.setInfo, this);
    this.entity.on('getInfo', this.getInfo, this);
    this.entity.on('reset', this.reset, this);
    this.entity.on("showGetBtn", this.showGetBtn, this);
    this.entity.on('showVideoBtn', this.showVideoBtn, this);
};

LevelRewardCardHandler.prototype.onDestroy = function () {
    this.entity.off('setTitle', this.setTitle, this);
    this.entity.off('setType', this.setFrontImage, this);
    this.entity.off('setAmount', this.setFrontImage, this);
    this.entity.off('setInfo', this.setInfo, this);
    this.entity.off('getInfo', this.getInfo, this);
    this.entity.off("showGetBtn", this.showGetBtn, this);
    this.entity.off('showVideoBtn', this.showVideoBtn, this);
};

// update code called every frame
LevelRewardCardHandler.prototype.update = function (dt) {

};

LevelRewardCardHandler.prototype.setTitle = function (title) {
    Debug.log("setTitle: ", title);
    this.title.element.text = LocalizationManager.getInstance().getLocalizedText(title.toUpperCase());
};

LevelRewardCardHandler.prototype.setType = function (type, img) {
    Debug.log("setType: ", type, img);
    this.cardType = type;

    this.typeInfos[this.prevType].group.enabled = false;
    this.typeInfos[this.cardType].group.enabled = true;

    this.bg.element.color = this.typeInfos[this.cardType].color;
    this.setFrontImage(img);
};

LevelRewardCardHandler.prototype.setAmount = function (amount) {
    Debug.log("setAmount: ", amount);
    this.amount = amount;
    this.amountTxt.element.text = `+${amount}`;
};

LevelRewardCardHandler.prototype.setInfo = function (title, type, amount, img) {
    Debug.log("setInfo: ", title, type, amount, img);
    this.setTitle(title);
    this.setType(type, img);
    this.setAmount(amount);
};

LevelRewardCardHandler.prototype.showVideoBtn = function (enbale) {
    this.rewardedAdIcon.enabled = enbale;
};

LevelRewardCardHandler.prototype.getInfo = function (onComplete) {
    let info = {};

    info.title = this.title.element.text;
    info.type = this.cardType;

    if (this.frontImage)
        info.img = this.frontImage.element.texture;

    info.amount = this.amount;

    onComplete(info);
};

LevelRewardCardHandler.prototype.setFrontImage = function (img) {
    this.frontImage.element.texture = img;
};

LevelRewardCardHandler.prototype.showGetBtn = function (show, animate) {

    if (animate) {
        if (show) {
            TweenWrapper.Tween(this.getBtn, this.getBtn.getLocalPosition(), this.visibleGetBtnPos, 0.5);
        }
        else {
            TweenWrapper.Tween(this.getBtn, this.getBtn.getLocalPosition(), pc.Vec3.ZERO, 0.5);
        }
    }
    else {
        if (show) {
            this.getBtn.setLocalPosition(this.visibleGetBtnPos.x, this.visibleGetBtnPos.y, this.visibleGetBtnPos.z);
        }
        else {
            this.getBtn.setLocalPosition(0, 0, 0);
        }
    }
};

// MissionsManager.js
var MissionsManager = pc.createScript('missionsManager');

MissionType = {
    CollectXSoftCurrency: 0,
    HeadCleanCount: 1,
    FeverCount: 2,
    LevelCount: 3
};

MissionsManager.attributes.add('completedMissions', { type: 'number', title: 'Completed Missions' });

MissionsManager.attributes.add('levelsToUnlockMissions', { title: 'Levels To Unlock Missions', type: 'number' });
MissionsManager.attributes.add('missionsToUnlockBigMission', { title: 'Missions To Unlock Big Missions', type: 'number' });
MissionsManager.attributes.add('bigRewardValue', { title: 'Big Reward Value', type: 'number' });

MissionsManager.attributes.add('missionsData', {
    title: 'Missions Data',
    type: 'json',
    schema: [
        {
            name: 'type', type: 'number', title: 'Reward Type', enum: [
                { 'Collect X Soft Currency': MissionType.CollectXSoftCurrency },
                { 'Head Clean Count': MissionType.HeadCleanCount },
                { 'Fever Count': MissionType.FeverCount },
                { 'Level Count': MissionType.LevelCount },
            ]
        },
        { name: 'rewardIsRndItem', type: 'boolean', title: 'Reward Random Item' },
        { name: 'value', type: 'number', title: 'Value' },
        { name: 'reward', type: 'number', title: 'Reward' },
        { name: 'progress', type: 'number', title: 'Progress' },
    ],
    array: true,
});

// initialize code called once per entity
MissionsManager.prototype.initialize = function () {
    MissionsManager.Instant = this;
    this.storageName = 'MissionsManager:Data';

    this.data = {
        availibleIndeces: [0, 3, 6, 9, 12], // possible elements : 0, 3, 6, 9, 12
        startingIndex: -1, // posible constants: 0, 3, 6, 9, 12
        tasks: [], // progress of current three missions
        currentTime: new Date(),
        completedMissions: 0,
    };

    this.timer = 0;

    // var today = new Date();
    // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    // var dateTime = date + ' ' + time;


    // if data is available in local storage
    if (APIMediator.getStorageItem(this.storageName) === null) {
        Debug.log("No Missions Data found, start new missions set");
        this.createNewMissions();
        this.save();
    }
    else { // if no data found in local storage
        Debug.log('mission data found');
        this.data = this.load();
    }

    Debug.log('MissionsManager:initialize -> ', this.data);
    this.app.on('Missions:ProgressCoins', this.progressCoins, this);
    this.app.on('Missions:ProgressCleanCount', this.progressCleanCount, this);
    this.app.on('Missions:ProgressFeverCount', this.progressFeverCount, this);
    this.app.on('Missions:ProgressLevelCount', this.progressLevelCount, this);

    this.timer = (new Date() - this.data.currentTime) / 1000;
    this.timer = 12 * 60 * 60 - this.timer;

    if (this.timer <= 0) {
        this.timer = 12 * 60 * 60;
        this.createNewMissions();
    }

    this.tickMissionsTime();
};

// update code called every frame
MissionsManager.prototype.update = function (dt) {

};

MissionsManager.prototype.createNewMissions = function () {
    if (this.data.availibleIndeces.length <= 0)
        this.data.availibleIndeces = [0, 3, 6, 9, 12];
    let randomIndex = parseInt(pc.math.random(0, this.data.availibleIndeces.length));
    // let randomIndex = 0;
    this.data.startingIndex = this.data.availibleIndeces[randomIndex];
    this.data.availibleIndeces.splice(randomIndex, 1);

    this.data.tasks = [];
    for (let i = this.data.startingIndex; i < this.data.startingIndex + 3; i++) {
        this.data.tasks.push({ ...this.missionsData[i] });
    }
};

MissionsManager.prototype.getTodayMissions = function () {
    return this.data;
};

MissionsManager.prototype.progressCoins = function (count) {
    this.progressMission(MissionType.CollectXSoftCurrency, count);
};

MissionsManager.prototype.progressCleanCount = function (count) {
    this.progressMission(MissionType.HeadCleanCount, count);

};

MissionsManager.prototype.progressFeverCount = function (count) {
    this.progressMission(MissionType.FeverCount, count);

};

MissionsManager.prototype.progressLevelCount = function (count) {
    this.progressMission(MissionType.LevelCount, count);

};

MissionsManager.prototype.progressMission = function (type, count) {
    let valueChanged = false;
    for (let i = 0; i < 3; i++) {
        if (this.data.tasks[i].type === type && this.data.tasks[i].progress !== -1) {
            this.data.tasks[i].progress += count;
            valueChanged = true;
        }
    }
    if (valueChanged)
        this.save();
};

MissionsManager.prototype.tickMissionsTime = function () {
    var self = this;

    this.timerInterval = setInterval(function () {
        self.timer--;
        this.app.fire('MissionManager:Timer', self.timer);

        if (self.timer % 60 === 0) {
            self.data.currentTime = new Date();
        }
    }, 1000);
};

MissionsManager.prototype.save = function () {
    let toSave = JSON.stringify(this.data);
    APIMediator.setStorageItem(this.storageName, toSave);
};

MissionsManager.prototype.load = function () {
    let toLoad = JSON.parse(APIMediator.getStorageItem(this.storageName));
    toLoad.currentTime = new Date(toLoad.currentTime);

    return toLoad;
};


// SpritesManager.js
var SpritesManager = pc.createScript('spritesManager');

SpritesManager.attributes.add('rewardSprites', {
    type: 'json',
    title: 'Reward Sprites',
    schema: [
        { name: 'img', type: 'asset', assetType: 'sprite'},
    ],
    array: true
});

SpritesManager.ButtonType = {
    special  : 0,
    normal   : 1,
    music    : 2,
    sfx      : 3,
    vibration: 4
};

// initialize code called once per entity
SpritesManager.prototype.initialize = function() {
    SpritesManager.Instance = this;
};

SpritesManager.prototype.getRewardSprite = function(index) {
    // console.log("GetCharacter: " + index + "," + state + ", " + this.characterSprites[index][state].resource);
    return this.rewardSprites[index].resource;
};

// swap method called for script hot-reloading
// inherit your script state here
// SpritesManager.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/

// MissionTile.js
var MissionTile = pc.createScript('missionTile');

MissionTile.attributes.add('coinContainer', { type: 'entity', title: 'Coin Container' });
MissionTile.attributes.add('collectTxt', { type: 'entity', title: 'Collect Txt' });
MissionTile.attributes.add('coinTxt', { type: 'entity', title: 'Coin Txt' });
MissionTile.attributes.add('normalContainer', { type: 'entity', title: 'Normal Container' });
MissionTile.attributes.add('normalLabel', { type: 'entity', title: 'Normal Label' });
MissionTile.attributes.add('valueTxt', { type: 'entity', title: 'Value Txt' });

MissionTile.attributes.add('completed', { type: 'entity', title: 'Completed' });
MissionTile.attributes.add('claimBtn', { type: 'entity', title: 'Claim Btn' });
MissionTile.attributes.add('claimRV', { type: 'entity', title: 'Claim RV Btn' });

MissionTile.attributes.add('progressSettings', {
    title: 'Value Txt',
    type: 'json',
    schema: [
        { name: 'txt', type: 'entity', title: 'Text' },
        { name: 'fill', type: 'entity', title: 'Fill' },
        { name: 'fillWidth', type: 'number', title: 'Fill Width' },
        { name: 'container', type: 'entity', title: 'Container' },
    ],
});

// initialize code called once per entity
MissionTile.prototype.initialize = function () {
    this.entity.on('MissionTile:Set', this.setTile, this);
};

// update code called every frame
MissionTile.prototype.update = function (dt) {

};

MissionTile.prototype.setTile = function (collect, coins, reward, progress, total, status) {
    this.normalContainer.enabled = coins === undefined;
    this.coinContainer.enabled = coins !== undefined;

    if (coins !== undefined) {
        this.collectTxt.element.text = collect;
        this.coinTxt.element.text = coins;
    }
    else this.normalLabel.element.text = collect;
    
    this.valueTxt.element.text = reward;

    this.completed.enabled = status === 0;
    this.claimBtn.enabled = status === 1;
    this.claimRV.enabled = status === 2;
    this.progressSettings.container.enabled = status === 3;

    if (status === 3) {
        this.progressSettings.txt.element.text = `${progress} / ${total}`;
        this.progressSettings.fill.element.width = pc.math.clamp(progress / total, 0, 1) * this.progressSettings.fillWidth;
    }
};

// FadeController.js
var FadeController = pc.createScript('fadeController');

FadeController.attributes.add('fadeTime', { type: 'number' });
FadeController.attributes.add('fadeAllChildren', { type: 'boolean' });

FadeController.attributes.add('elements', {
    title: 'Elements',
    type: 'json',
    schema: [
        { name: 'obj', type: 'entity', title: 'Object' },
        { name: 'fromTo', type: 'vec2', title: 'From To' },
    ],
    array: true
});


// initialize code called once per entity
FadeController.prototype.initialize = function () {
    this.entity.on('fade', this.fade, this);
};

// update code called every frame
FadeController.prototype.update = function (dt) {

};

FadeController.prototype.fade = function (enable, instantly = false) {
    var self = this;

    if (this.fadeTime === 0 || instantly) {
        self.entity.enabled = enable;
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].obj.element.opacity = enable ? this.elements[i].fromTo.y : this.elements[i].fromTo.x;
        }

    } else {
        for (let i = 0; i < this.elements.length; i++) {
            TweenWrapper.TweenOpacity(
                this.elements[i].obj.element,
                enable ? this.elements[i].fromTo.x : this.elements[i].fromTo.y,
                enable ? this.elements[i].fromTo.y : this.elements[i].fromTo.x,
                this.fadeTime
            );
        }

        if (!enable) {
            if (this.fadeTime === 0 || instantly)
                self.entity.enabled = false;
            else {
                CustomCoroutine.Instance.set(function () {
                    self.entity.enabled = false;
                }, this.fadeTime);
            }
        }
    }
};

// shopTabEventListerner.js
var ShopTabEventListerner = pc.createScript('shopTabEventListerner');

ShopTabEventListerner.attributes.add('shopTabBtns', {
    type: 'json',
    title: 'Shop Tab Buttons',
    schema: [
        { name: 'NextBtn', type: 'entity' },
        { name: 'PreviousBtn', type: 'entity' },
    ],
});

ShopTabEventListerner.attributes.add('tab', { type: 'entity' });

// initialize code called once per entity
ShopTabEventListerner.prototype.initialize = function () {

    this.initEvents();

};

ShopTabEventListerner.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.shopTabBtns.NextBtn.button.on("click", this.onNextBtnClicked, this);
    this.shopTabBtns.PreviousBtn.button.on("click", this.onPreviousBtnClicked, this);

};

ShopTabEventListerner.prototype.onDestroy = function () {

    this.shopTabBtns.NextBtn.button.off("click", this.onNextBtnClicked, this);
    this.shopTabBtns.PreviousBtn.button.off("click", this.onPreviousBtnClicked, this);

};

ShopTabEventListerner.prototype.onNextBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:NextTab"
    });
    this.app.fire('hideShopPriceButton');
    this.app.fire("sound:playSound", "BtnSound");
    this.tab.fire("changeTab", 1);

};

ShopTabEventListerner.prototype.onPreviousBtnClicked = function () {
    APIMediator.track({
        event: "GA:Design",
        eventId: "Button:Shop:PreviousTab"
    });

    this.app.fire('hideShopPriceButton');
    this.app.fire("sound:playSound", "BtnSound");
    this.tab.fire("changeTab", -1);

};

// update code called every frame
ShopTabEventListerner.prototype.update = function (dt) {

};

// ShopTabManager.js
var ShopTabManager = pc.createScript('shopTabManager');

ShopTabManager.attributes.add('grids', { type: 'entity', array: true });

// initialize code called once per entity
ShopTabManager.prototype.initialize = function () {

    this.currentTab = 0;
    this.initEvents();

};

ShopTabManager.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.entity.on("changeTab", this.onChangeTab, this);

};

ShopTabManager.prototype.onDestroy = function () {

    this.entity.off("changeTab", this.onChangeTab, this);

};

ShopTabManager.prototype.onChangeTab = function (num) {

    let tempIndex = this.currentTab + num;
    
    this.app.fire('hideShopPriceButton');

    if (this.grids[tempIndex]) {
        this.grids[this.currentTab].enabled = false;
        this.grids[tempIndex].enabled = true;
        this.currentTab = tempIndex;
    }

};

// update code called every frame
ShopTabManager.prototype.update = function (dt) {

};

// shopBtn.js
var ShopBtn = pc.createScript('shopBtn');

ShopBtn.attributes.add('btnId', { type: 'string' });
ShopBtn.attributes.add('category', { type: 'string' });
ShopBtn.attributes.add('isRewarded', { type: 'boolean', default: false });

// initialize code called once per entity
ShopBtn.prototype.initialize = function () {

    this.initEvents();

};

ShopBtn.prototype.initEvents = function () {

    this.on("destroy", this.onDestroy, this);
    this.entity.button.on("click", this.onBtnClick, this);

};

ShopBtn.prototype.onDestroy = function () {

    this.entity.button.off("click", this.onBtnClick, this);

};

ShopBtn.prototype.onBtnClick = function () {

    this.app.fire("sound:playSound", "BtnSound");
    this.app.fire("btnId", this.btnId, this.entity, this.isRewarded, this.category);

};

// update code called every frame
ShopBtn.prototype.update = function (dt) {

};

// ui.js
var Ui = pc.createScript('ui');

Ui.attributes.add('css', { type: 'asset', assetType: 'css', title: 'CSS Asset' });
Ui.attributes.add('html', { type: 'asset', assetType: 'html', title: 'HTML Asset' });

Ui.prototype.initialize = function () {
    // create STYLE element
    var style = document.createElement('style');

    // append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';

    // Add the HTML
    this.div = document.createElement('div');
    this.div.classList.add('container');
    this.div.innerHTML = this.html.resource || '';

    // append to body
    // can be appended somewhere else
    // it is recommended to have some container element
    // to prevent iOS problems of overfloating elements off the screen
    document.body.appendChild(this.div);

    this.counter = 0;

    this.bindEvents();
};

Ui.prototype.bindEvents = function () {
    var self = this;
    // example
    //
    // get button element by class
    var button = this.div.querySelector('.button');
    var counter = this.div.querySelector('.counter');
    // if found
    if (button) {
        // add event listener on `click`
        button.addEventListener('click', function () {
            ++self.counter;
            if (counter)
                counter.textContent = self.counter;

            Debug.log('button clicked');

            // try to find object and change its material diffuse color
            // just for fun purposes
            var obj = pc.app.root.findByName('box');
            if (obj && obj.render) {
                var material = obj.render.meshInstances[0].material;
                if (material) {
                    material.diffuse.set(Math.random(), Math.random(), Math.random());
                    material.update();
                }
            }
        }, false);
    }

    if (counter)
        counter.textContent = self.counter;
};

// versionLabel.js
var VersionLabel = pc.createScript('versionLabel');

VersionLabel.attributes.add('versionText', { type: 'entity' });

VersionLabel.prototype.initialize = function() {
    this.app.on(this.app.events.configManager.initialized, this.onConfigInitialized, this);
};

// update code called every frame
VersionLabel.prototype.onConfigInitialized = function() {
    this.versionText.element.text = '';//ConfigManager.instance.version;
    this.versionText.enabled = false;
};

// tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.AppBase} app - The AppBase instance.
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                for (let i = 0; i < this._add.length; i++) {
                    if (this._tweens.indexOf(this._add[i]) > -1) continue;
                    this._tweens.push(this._add[i]);
                }
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {object} target - The target property that will be tweened
     * @param {pc.TweenManager} manager - The tween manager
     * @param {pc.Entity} entity - The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    };
    Tween.prototype = {
        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;

                    if (this._properties.w !== undefined) {
                        this._fromQuat.copy(this.target);
                        this._toQuat.set(_x, _y, _z, this._properties.w);
                    } else {
                        this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);
                        this._toQuat.setFromEulerAngles(_x, _y, _z);
                    }
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            this.fire("start");

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while (n--) {
                if (n > 0) {
                    arguments[n - 1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        onStart: function (callback) {
            this.on('start', callback);
            return this;
        },

        onUpdate: function (callback) {
            this.on('update', callback);
            return this;
        },

        onComplete: function (callback) {
            this.on('complete', callback);
            return this;
        },

        onLoop: function (callback) {
            this.on('loop', callback);
            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;

            if (!this._reverse || this.pending) {
                this.time += dt * this.timeScale;
            } else {
                this.time -= dt * this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time -= this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)) {
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s, e;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        }

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);
    };

    var QuarticIn = function (k) {
        return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - (--k * k * k * k);
    };

    var QuarticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2) * k * k * k - 2);
    };

    var QuinticIn = function (k) {
        return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
        return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos(k * Math.PI / 2);
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin(k * Math.PI / 2);
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    };

    var ExponentialInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };

    var CircularOut = function (k) {
        return Math.sqrt(1 - (--k * k));
    };

    var CircularInOut = function (k) {
        if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    };

    var BackIn = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };

    var BounceOut = function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

    };

    var BounceIn = function (k) {
        return 1 - BounceOut(1 - k);
    };

    var BounceInOut = function (k) {
        if (k < 0.5) return BounceIn(k * 2) * 0.5;
        return BounceOut(k * 2 - 1) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the AppBase
(function () {
    // Add pc.AppBase#addTweenManager method
    pc.AppBase.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    pc.AppBase.prototype.stopAllTweens = function (target) {
        for (var i = this._tweenManager._tweens.length - 1; i > -1; i--) {
            if (this._tweenManager._tweens[i].entity === target) {
                this._tweenManager._tweens[i].stop();
            }
        }
    };

    // Add pc.AppBase#tween method
    pc.AppBase.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };

    // Create a default tween manager on the AppBase
    var AppBase = pc.AppBase.getApplication();
    if (AppBase) {
        AppBase.addTweenManager();
    }
})();   

// noAdpopUp.js
var NoAdpopUp = pc.createScript('noAdpopUp');

NoAdpopUp.attributes.add('adblockerPopup', { type: 'entity' });
NoAdpopUp.attributes.add('resumeBtn', { type: 'entity' });


NoAdpopUp.prototype.initialize = function () {

    this.app.on("showNoAdPopup", this.adblockerDetected, this);
    this.resumeBtn.button.on("click", this.resumeBtnClicked, this);

};


NoAdpopUp.prototype.adblockerDetected = function () {
    this.adblockerPopup.enabled = true;
};

NoAdpopUp.prototype.resumeBtnClicked = function () {
    this.adblockerPopup.enabled = false;
    this.app.fire("sound:playSound", "BtnSound");
};


NoAdpopUp.prototype.update = function (dt) {

};

// genericPopupManager.js
var GenericPopupManager = pc.createScript('genericPopupManager');

GenericPopupManager.attributes.add('popupMenu', { type: 'entity' });
GenericPopupManager.attributes.add('popupMenuMsg', { type: 'entity' });
GenericPopupManager.attributes.add('resumeBtn', { type: 'entity' });

// initialize code called once per entity
GenericPopupManager.prototype.initialize = function () {

    this.app.on("showGenericPopup", this.onShowPopup, this);
    this.resumeBtn.button.on("click", this.resumeBtnClicked, this);
    this.eventToTrigger = null;

};

GenericPopupManager.prototype.onShowPopup = function (msg = null, eventToTrigger = null) {

    this.popupMenu.enabled = true;

    if (msg)
        this.popupMenuMsg.element.text = msg;

    this.eventToTrigger = eventToTrigger;

};

GenericPopupManager.prototype.resumeBtnClicked = function () {

    if (this.eventToTrigger)
        this.app.fire(this.eventToTrigger);

    this.eventToTrigger = null;
    this.popupMenu.enabled = false;
    this.app.fire("sound:playSound", "BtnSound");

};

// update code called every frame
GenericPopupManager.prototype.update = function (dt) {

};

// LayersHelper.js
class LayersHelper {

    static getInstance() {
        if (!LayersHelper._instance) LayersHelper._instance = new LayersHelper();
        return LayersHelper._instance;
    }

    constructor() {
        this.app = pc.AppBase.getApplication();
    }


    addLayer(layerName, entity, recursively = true) {
        if (entity.render) {
            const layers = entity.render.layers;
            const targetLayer = this.app.scene.layers.getLayerByName(layerName);
            if(!targetLayer) return;
            if (layers.indexOf(targetLayer.id) === -1) {
                layers.push(targetLayer.id);
                entity.render.layers = [...layers];
            }
        }
        if (recursively && entity.name !== 'metarig') entity.children.forEach(child => this.addLayer(layerName, child, recursively));

    }

    removeLayer(layerName, entity, recursively = true) {
        if (entity.render) {
            const layers = entity.render.layers;
            const targetLayer = this.app.scene.layers.getLayerByName(layerName);
            if(!targetLayer) return;
            const layerIndex = layers.indexOf(targetLayer.id);
            if (layerIndex !== -1) {
                // entity.render.layers = [targetLayer.id]; // hack?
                entity.render.layers = layers.filter(id => id !== targetLayer.id);
            }
        }
        if (recursively && entity.name !== 'metarig') entity.children.forEach(child => this.removeLayer(layerName, child, recursively));
    }
   
}

// PauseOverlay.js
var PauseOverlay = pc.createScript('pauseOverlay');

PauseOverlay.prototype.initialize = function () {

};

PauseOverlay.prototype.postInitialize = function () {
    this.setPaused(APIMediator.isPaused());
    APIMediator.onPauseStateChange(isPaused => {
        this.setPaused(isPaused);
    });
};

PauseOverlay.prototype.setPaused = function (isPaused) {
    this.entity.element.enabled = isPaused;
    this.app.timeScale = isPaused ? 0 : 1;
    this.app.fire('setAudioPaused', isPaused);
};


PauseOverlay.prototype.update = function (dt) {

};



// InputBlocker.js
var InputBlocker = pc.createScript('inputBlocker');

InputBlocker.prototype.initialize = function() {

};

InputBlocker.prototype.update = function(dt) {

};

// localizationManager.js
var LocalizationManager = pc.createScript('localizationManager');


LocalizationManager.attributes.add('autoDetectLanguage', {
    type: 'boolean',
    default: true
});

LocalizationManager._currentLocale = "en-US";

LocalizationManager.getInstance = function () {
    if (!LocalizationManager._instance) throw new Error('LocalizationManager is not initialized yet');
    return LocalizationManager._instance;
};


LocalizationManager.prototype.initialize = function () {
    LocalizationManager._app = this.app;
    if (!LocalizationManager._instance) {
        LocalizationManager._instance = this;
    }

    this.detectAndSetBrowserLanguage();

};

LocalizationManager.prototype.postInitialize = function () {

};


LocalizationManager.prototype.addJSON = function (json) {
    if (json) {
        this.app.i18n.addData(json);
    }
};

LocalizationManager.prototype.detectAndSetBrowserLanguage = function () {
    if (this.autoDetectLanguage) {
        const browserLanguage = LocalizationManager.getClientLanguage();
        this._setCurrentLocale(this.app.i18n.findAvailableLocale(browserLanguage));
    }
};


LocalizationManager.prototype.update = function (dt) {

};

LocalizationManager.prototype.changeLocale = function (locale) {
    const closestLocale = this.app.i18n.findAvailableLocale(locale);
    if (closestLocale !== this.app.i18n.locale) {
        this._setCurrentLocale(closestLocale, true);
    }
}


LocalizationManager.prototype._setCurrentLocale = async function (locale, showLoadingOverlay = false) {
    LocalizationManager._currentLocale = locale;
    this.app.i18n.locale = LocalizationManager._currentLocale;
    this.app.fire('app:changeLocale', this.app.i18n.locale);
};

LocalizationManager.prototype.getCurrentLocale = function () {
    return LocalizationManager._currentLocale;
};


LocalizationManager.prototype.getCountryCode = function () {
    return this.getCurrentLocale().substr(0, 2);
};

LocalizationManager.prototype.getLocalizedText = function (textKey, ...replaceParams) {
    let text = this.app.i18n.getText(textKey, this.getCurrentLocale());
    for (let i = 0; i < replaceParams.length; i++) {
        text = text.replace(`{${i}}`, replaceParams[i]);
    }
    return text;
};

LocalizationManager.prototype.getCharactersList = function (...locales) {
    const baseChars = `!"#\$%&'()*+,-0123456789:;<=>?@Z[\]^_\`~{|}xX`; // + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYАБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯЇабвгдеєжзиіїйклмнопрстуфхцчшщьюяїЁё¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'
    const allCharacters = new Set(baseChars.split(''));
    locales.forEach(locale => {
        const localeFileName = this.app.i18n.findAvailableLocale(locale);
        const localeFile = this.app.assets.find(localeFileName, 'json');
        if (!localeFile) {
            Debug.warn('No locale file for ' + locale);
            return;
        }

        localeFile.resource.data.forEach(item => {
            Object.keys(item.messages).forEach(key => {
                const string = item.messages[key];
                string.split('').forEach(char => allCharacters.add(char));
            });
        });

        console.log('File for ' + localeFileName + ': ', localeFile);
    });

    return Array.from(allCharacters).sort().join('');
};

/* Static */

LocalizationManager.getClientLanguage = function () {
    return APIMediator.getCurrentLanguage();
};

// scaleManager.js
/* jshint esversion: 6 */
var ScaleManager = pc.createScript('scaleManager');

ScaleManager.attributes.add('minPortraitScreenRatio', {
    type: 'number',
    default: 0.5625
});

ScaleManager.attributes.add('landscapeBlend', {
    type: 'number',
    default: 0.75
});

ScaleManager.attributes.add('portraitBlend', {
    type: 'number',
    default: 0
});


ScaleManager.getInstance = function () {
    if (!ScaleManager._instance) console.error('ScaleManager is not initialized yet');
    return ScaleManager._instance;
};

ScaleManager.prototype.initialize = function () {
    ScaleManager._app = this.app;
    if (!ScaleManager._instance) {
        ScaleManager._instance = this;
    }

    this.app.graphicsDevice.on('resizecanvas', this.onCanvasResized, this);
    this.on('attr:landscapeBlend', this.refresh, this);
    this.on('attr:portraitBlend', this.refresh, this);
    this.on('attr:mainLight', this.refresh, this);
    
    this.onCanvasResized(this.app.graphicsDevice.canvas.width, this.app.graphicsDevice.canvas.height);
};

ScaleManager.prototype.update = function(dt) {
    
};

ScaleManager.prototype.refresh = function() {
    this.onCanvasResized(this.app.graphicsDevice.canvas.width, this.app.graphicsDevice.canvas.height);
};


ScaleManager.prototype.onCanvasResized = function(width, height) {
    const isLandscape = this.isLandscape();
    const scaleBlend = isLandscape ? this.landscapeBlend : this.portraitBlend;
    const fireResizedEvent = () => {
        this.app.fire(EventTypes.Screen.RESIZED, width, height, isLandscape);
        this.app.fire(EventTypes.Screen.SET_SCALE_BLEND, scaleBlend);
    };
    
    setTimeout(() => fireResizedEvent(), 0);
    
    if(pc.platform.ios) {
        setTimeout(() => fireResizedEvent(), 500);
    }
};


ScaleManager.prototype.isLandscape = function() {
    return (this.app.graphicsDevice.canvas.width / this.app.graphicsDevice.canvas.height) >= this.minPortraitScreenRatio;    
};


ScaleManager.prototype.isPortrait = function() {
    return !this.isLandscape();
};

ScaleManager.prototype.getWidth = function() {
    return this.app.graphicsDevice.canvas.width * this.app.graphicsDevice.maxPixelRatio;
};


ScaleManager.prototype.getHeight = function() {
    return this.app.graphicsDevice.canvas.height * this.app.graphicsDevice.maxPixelRatio;
};


// performanceMonitor.js
var PerformanceMonitor = pc.createScript('performanceMonitor');

PerformanceMonitor.attributes.add('autoAdjustQuality', {
    type: 'boolean',
    default: true
});

PerformanceMonitor.attributes.add('autoShadows', {
    title: "Auto shadows",
    type: 'boolean',
    deafult: false
});

PerformanceMonitor.attributes.add('shadowLights', {
    title: "Shadow lights",
    type: 'entity',
    array: true
});

PerformanceMonitor.attributes.add('debugOutput', {
    type: 'boolean',
    default: false
});


PerformanceMonitor.attributes.add('maxDevicePixelRatio', {
    type: 'number',
    default: 3
});

PerformanceMonitor.attributes.add('minDevicePixelRatio', {
    type: 'number',
    default: 1.0
});

PerformanceMonitor.attributes.add('pixelRatioStep', {
    type: 'number',
    default: 0.25,
    min: 0,
    max: 1
});

PerformanceMonitor.attributes.add('targetFPS', {
    type: 'number',
    default: 60
});

PerformanceMonitor.attributes.add('acceptableFPS', {
    type: 'number',
    default: 45
});

PerformanceMonitor.attributes.add('minAcceptableFPS', {
    type: 'number',
    default: 30
});

PerformanceMonitor.attributes.add('fpsCheckInterval', {
    type: 'number',
    default: 1.5
});

PerformanceMonitor.attributes.add('sampleFrames', {
    type: 'number',
    default: 100
});

PerformanceMonitor.attributes.add('confidenceInterval', {
    type: 'number',
    default: 0.8,
    min: 0.4,
    max: 1
});




PerformanceMonitor.prototype.initialize = function () {
    this._shadowsTurnOffCounter = 0;
    this.maxSupportedPixelRatio = window.devicePixelRatio || 1;

    /* set initial pixel ratio */
    /* for MacBookPro and desktops with retina displays */
    if (pc.platform.desktop && this.app.graphicsDevice.maxPixelRatio > 1.99) {
        this.setPixelRatio(this.getDeviceOptimalDPR());
    } else {
        this.setPixelRatio(this.getDeviceOptimalDPR());
    }

    this.startPerformanceMonitoring(2000);
};


PerformanceMonitor.prototype.update = function (dt) {
    if (document.hidden) {
        return;
    }
    this.updatePerformanceMonitor(dt);
};

PerformanceMonitor.prototype.swap = function (old) {
    this.initialize();
};

PerformanceMonitor.prototype.updateShadowsSettings = function(shadowsEnabled, forced = false) {
    if(this.shadowLights.length > 0 && (this.autoShadows || forced)) {
        this.shadowLights.forEach(light => {
            if(!shadowsEnabled) {
                this._shadowsTurnOffCounter += 1;
            } else if(this._shadowsTurnOffCounter > 1) return;
            if(light.enabled && light.light.castShadows !== shadowsEnabled) {
                light.light.castShadows = shadowsEnabled;
            }
        });
    }
};

PerformanceMonitor.prototype.startPerformanceMonitoring = function (delay) {
    setTimeout(() => {
        this.performanceMonitoringStarted = true;
        this.performanceMonitoringCounter = 0;
        this.elapsedTime = 0;
        this.frameTimes = [];
        this.lastFPSMeasurements = [];
    }, delay);
};

PerformanceMonitor.prototype.updatePerformanceMonitor = function (dt) {
    if (this.performanceMonitoringStarted) {
        /* increase the counter */
        this.performanceMonitoringCounter += 1;
        this.elapsedTime += dt;

        const frameTime = dt;

        if (this.autoAdjustQuality) {
            this.frameTimes.push(frameTime);
            if (this.frameTimes.length >= this.sampleFrames || this.elapsedTime >= this.fpsCheckInterval) {
                this.elapsedTime = 0;
                this.calculateAverageFPS();
            }
        }

    }
};

PerformanceMonitor.prototype.calculateAverageFPS = function () {
    if (this.frameTimes.length < 12) return;
    const sortedTimes = this.frameTimes.slice().sort((a, b) => a - b);
    const lowerBoundFrames = Math.floor(sortedTimes.length * (1 - this.confidenceInterval) / 2);
    const upperBoundFrames = Math.floor(sortedTimes.length * (0.5 + this.confidenceInterval / 2));
    const effectiveFrameTimes = sortedTimes.slice(lowerBoundFrames, upperBoundFrames);
    const totalTime = effectiveFrameTimes.reduce((sum, current) => sum + current, 0);

    const averageFPS = (effectiveFrameTimes.length / totalTime);

    this.lastFPSMeasurements.push(averageFPS);
    while (this.lastFPSMeasurements.length > 20) {
        this.lastFPSMeasurements.shift();
    }

    this.adjustRendererScale(averageFPS);

    this.frameTimes.splice(0, this.frameTimes.length);
};

PerformanceMonitor.prototype.adjustRendererScale = function (averageFPS) {
    if (averageFPS < this.minAcceptableFPS) {
        this.decreaseQuality();
    } else if (averageFPS <= this.acceptableFPS) {
        this.setMediumQuality();
    } else if (averageFPS > this.targetFPS * 0.95) {
        this.increaseQuality();
    }

    this.calculateShadowSettings();

    if (this.debugOutput) {
        console.log(`${averageFPS.toFixed(1)} / ${this.app.graphicsDevice.maxPixelRatio.toFixed(3)} of ${this.maxDevicePixelRatio}, frames ${this.frameTimes.length}, fps-samples ${this.lastFPSMeasurements.length}`);
    }
};

PerformanceMonitor.prototype.calculateShadowSettings = function () {
    const currentPixelRatio = this.app.graphicsDevice.maxPixelRatio;
    if (/*currentPixelRatio <= this.minDevicePixelRatio && */this.lastFPSMeasurements.length > 3 && this.lastFPSMeasurements.slice(this.lastFPSMeasurements.length - 3).every(fpsValue => fpsValue < this.minAcceptableFPS)) {
        this.updateShadowsSettings(false);
    } else if (currentPixelRatio >= this.getDeviceOptimalDPR() && this.lastFPSMeasurements.length > 3 && this.lastFPSMeasurements.slice(this.lastFPSMeasurements.length - 3).every(fpsValue => fpsValue >= this.acceptableFPS)) {
        this.updateShadowsSettings(true);
    }
};

PerformanceMonitor.prototype.decreaseQuality = function () {
    const targetRatio = pc.math.clamp(this.app.graphicsDevice.maxPixelRatio - this.pixelRatioStep, this.getMinDPR(), this.getMaxDPR());
    this.setPixelRatio(targetRatio);
};

PerformanceMonitor.prototype.increaseQuality = function () {
    const targetRatio = pc.math.clamp(this.app.graphicsDevice.maxPixelRatio + this.pixelRatioStep, this.getMinDPR(), this.getMaxDPR());
    this.setPixelRatio(targetRatio);
};

PerformanceMonitor.prototype.setMediumQuality = function () {
    this.setPixelRatio(this.getDeviceOptimalDPR());
};

/* private */

PerformanceMonitor.prototype.setPixelRatio = function (value) {
    if (value !== this.app.graphicsDevice.maxPixelRatio) {
        //console.log('Pixel ratio set to ', value);
        this.app.graphicsDevice.maxPixelRatio = value;
    }
};

PerformanceMonitor.prototype.getDeviceOptimalDPR = function () {
    const minDPR = this.getMinDPR();
    const maxDPR = this.getMaxDPR();
    return pc.math.clamp(minDPR + (maxDPR - minDPR) / 2, minDPR, maxDPR);
};

PerformanceMonitor.prototype.getMinDPR = function () {
    return Math.min(window.devicePixelRatio || 1, this.minDevicePixelRatio);
};

PerformanceMonitor.prototype.getMaxDPR = function () {
    return Math.min(this.maxSupportedPixelRatio, this.maxDevicePixelRatio);
};

// famobiSafeArea.js
/**
 * A script that automatically adds required gaps & resizes game canvas to fit Famobi interstitial banner.
 * 
 * How to use: just attach that script to the Root component of your Playcanvas app.
 * To test how it works, please use 'Debug / Testing Mode' attribute of the script. Don't forget to disable debug mode before publising a build! :)
 * 
 *  If you are using Window Resize API (window.onresize(...) or window.addEventListener('resize', ....)),
 *  please get rid of these. Instead , please listen to 'famobi:resizeCanvas' in-app event. For example: 
 * 
 *      this.app.on('famobi:resizeCanvas', function(canvasWidth, canvasHeight) {
 *          console.log('Adjusted canvas size is ', canvasWidth, canvasHeight);
 *      })
 * 
 * 
 * @author Igor Parada / ©Famobi 2023
 */

var FamobiSafeArea = pc.createScript('famobiSafeArea');

FamobiSafeArea.attributes.add('resizeOnInput', {
    type: 'boolean',
    title: 'Resize when input received',
    description: "Resize the canvas every time an input event is received? This may help if the game reports incorrect input positions due to Famobi offsets but may cause slight CPU overhead in some games.",
    default: true
});

FamobiSafeArea.attributes.add('forceBodyBackgroundColor', {
    type: 'boolean',
    default: true,
    title: 'Change <body> background',
    default: true
});

FamobiSafeArea.attributes.add('bodyBackgroundColor', {
    type: 'rgba',
    title: 'Body Background Color',
    description: "Background color of body element (where the banner should be displayed). Make sure the checkbox above is checked!",
    default: [0, 0, 0, 1.0]
})

FamobiSafeArea.attributes.add('debugConfig', {
    type: 'json',
    title: 'Debug / Testing Mode',
    description: 'Force safe areas to be applied to the UI. Useful testing layouts without a device.',
    schema: [{
        name: 'active',
        type: 'boolean',
        default: false
    }, {
        name: 'top',
        type: 'number',
        default: 0
    }, {
        name: 'bottom',
        type: 'number',
        default: 0
    }, {
        name: 'left',
        type: 'number',
        default: 0
    }, {
        name: 'right',
        type: 'number',
        default: 0
    }]
});



FamobiSafeArea.prototype.initialize = function () {
    this.app.graphicsDevice.on('resizecanvas', this._onCanvasResize, this);

    this.on('attr:debugConfig', function (value, prev) {
        this._updateCanvasSizeAndPosition();
    }, this);

    this.on('attr:bodyBackgroundColor', function (value, prev) {
        this._backgroundColorUpdate();
    }, this);

    this.on('destroy', function () {
        this.app.graphicsDevice.off('resizecanvas', this._onCanvasResize, this);
    }, this);


    if (window.GameInterface && typeof window.GameInterface.onOffsetChange === 'function') {
        window.GameInterface.onOffsetChange(offsets => this._onCanvasResize());
    } else if (window.famobi && typeof window.famobi.onOffsetChange === 'function') {
        window.famobi.onOffsetChange(offsets => this._onCanvasResize());
    }


    /** viewport resize handling **/
    if (window.visualViewport) {
        this.useVisualViewport = true;
        window.visualViewport.addEventListener('resize', this._onCanvasResize.bind(this));
    } else {
        this.useVisualViewport = false;
        window.addEventListener('resize', this._onCanvasResize.bind(this), true);
    }

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this._dispatchInputEvent, this);
    } 
    if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this._dispatchInputEvent, this);
    } 

    this._onCanvasResize();

    this.app.getFamobiAdjustedCanvasSize = () => {
        return {
            width: this._currentCanvasWidth,
            height: this._currentCanvasHeight
        }
    }

};

FamobiSafeArea.prototype._dispatchInputEvent = function() {
    if(this.resizeOnInput) {
        this._updateCanvasSizeAndPosition();
    } else {
        if(!this._firstInputEventReceived) {
            this._firstInputEventReceived = true;
            this._onCanvasResize();
        }
    }
}

FamobiSafeArea.prototype._onCanvasResize = function () {
    this._updateCanvasSizeAndPosition();

    /* known issue on iOS - window.resize may report incorrect window size, so we slightly delay the resize logic */
    if (pc.platform.ios || pc.platform.mobile) {
        setTimeout(() => this._updateCanvasSizeAndPosition(), 1500);
    }
};


FamobiSafeArea.prototype._updateCanvasSizeAndPosition = function () {

    let topPixels = 0;
    let bottomPixels = 0;
    let leftPixels = 0;
    let rightPixels = 0;

    if (this.debugConfig.active) {
        topPixels = this.debugConfig.top;
        bottomPixels = this.debugConfig.bottom;
        leftPixels = this.debugConfig.left;
        rightPixels = this.debugConfig.right;
    } else {
        let famobiOffsets = { left: 0, top: 0, right: 0, bottom: 0 };
        if (window.GameInterface && window.GameInterface.getOffsets) {
            famobiOffsets = window.GameInterface.getOffsets();
        } else if (window.famobi && window.famobi.getOffsets) {
            famobiOffsets = window.famobi.getOffsets();
        }

        topPixels = famobiOffsets.top;
        bottomPixels = famobiOffsets.bottom;
        leftPixels = famobiOffsets.left;
        rightPixels = famobiOffsets.right;
    }

    const screenResHeight = this.useVisualViewport ? window.visualViewport.height : window.innerHeight;
    const screenResWidth = this.useVisualViewport ? window.visualViewport.width : window.innerWidth;

    leftPixels = Math.min(screenResWidth * 0.9, leftPixels);
    rightPixels = Math.min(screenResWidth * 0.9, rightPixels);
    topPixels = Math.min(screenResHeight * 0.9, topPixels);
    bottomPixels = Math.min(screenResHeight * 0.9, bottomPixels);

    const availableWidth = screenResWidth - leftPixels - rightPixels;
    const availableHeight = screenResHeight - topPixels - bottomPixels;

    this._currentCanvasWidth = availableWidth;
    this._currentCanvasHeight = availableHeight;

    this.app.setCanvasResolution(pc.RESOLUTION_FIXED, availableWidth, availableHeight);
    this.app.graphicsDevice.canvas.style.width = availableWidth + 'px';
    this.app.graphicsDevice.canvas.style.height = availableHeight + 'px';

    this.app.graphicsDevice.canvas.style.left = leftPixels + 'px';
    this.app.graphicsDevice.canvas.style.right = rightPixels + 'px';
    this.app.graphicsDevice.canvas.style.top = topPixels + 'px';
    this.app.graphicsDevice.canvas.style.bottom = bottomPixels + 'px';

    if (this.debugConfig.active) {
        console.log(`Canvas size set to ${availableWidth}x${availableHeight} (window ${window.innerWidth}x${window.innerHeight})`);
    }

    this.app.fire('famobi:resizeCanvas', availableWidth, availableHeight);

    this._backgroundColorUpdate();
};

FamobiSafeArea.prototype._backgroundColorUpdate = function () {
    if (!this.forceBodyBackgroundColor) return;
    const parentElement = this.app.graphicsDevice.canvas.parentElement;
    if (parentElement) {
        parentElement.style.background = this.bodyBackgroundColor.toString();
    }
}


FamobiSafeArea.prototype.update = function (dt) {

};


/** Fix for camera/input **/

pc.CameraComponent.prototype.screenToWorld = function (screenx, screeny, cameraz, worldCoord) {
    const device = this.system.app.graphicsDevice;
    const w = device.width / device.maxPixelRatio;
    const h = device.height / device.maxPixelRatio;
    return this._camera.screenToWorld(screenx, screeny, cameraz, w, h, worldCoord);
};


pc.CameraComponent.prototype.worldToScreen = function (worldCoord, screenCoord) {
    const device = this.system.app.graphicsDevice;
    const w = device.width / device.maxPixelRatio;
    const h = device.height / device.maxPixelRatio;
    return this._camera.worldToScreen(worldCoord, w, h, screenCoord);
};

// FamobiCopyright.js
var FamobiCopyright = pc.createScript('famobiCopyright');


FamobiCopyright.prototype.initialize = function () {
    if (APIMediator.hasFeature("copyright")) {
        this.entity.element.opacity = 0;
        const textureAsset = new pc.Asset('famobiLogoTexture', 'texture', { url: window.GameInterface.getCopyrightLogoURL() }, undefined, { crossOrigin: 'anonymous'});

        // Load the asset
        this.app.assets.add(textureAsset);
        textureAsset.once('load', (asset) => {
            
            const imageElement = this.entity.element;
            if (imageElement) {
                imageElement.texture = asset.resource;
                this.entity.element.opacity = 0.5;
            }
        });

        this.app.assets.load(textureAsset);
    } else {
        this.entity.enabled = false;
    }
};


FamobiCopyright.prototype.update = function (dt) {

};

// FamobiAdsHandler.js
var FamobiAdsHandler = pc.createScript('famobiAdsHandler');


FamobiAdsHandler.prototype.initialize = function() {
    this.inputBlocker = this.app.root.findByName('InputBlocker');
    this.app.on("showRewardedAD", this.onShowRewardedAD, this);
};


FamobiAdsHandler.prototype.onShowRewardedAD = async function(_resumeGiveRewardCallback, _pauseCallback, _resumeCallback, _noADAvailableCallback, eventID = 'button:rewarded:common') {
    this.inputBlocker.element.enabled = true;
    const result = await APIMediator.watchRewardedVideo(eventID);
    this.inputBlocker.element.enabled = false;

    if(result) {
        _resumeGiveRewardCallback();
    } else {
        _resumeCallback();
    }
};

FamobiAdsHandler.prototype.update = function(dt) {

};


// RewardedIcon.js
var RewardedIcon = pc.createScript('rewardedIcon');

RewardedIcon.attributes.add('rewardedEventId', {
    type: 'string'
});

RewardedIcon.attributes.add('rewardedIcon', {
    type: 'entity'
});


RewardedIcon.prototype.initialize = function() {
    
};

RewardedIcon.prototype.update = function(dt) {
    if(this.rewardedIcon) {
        this.rewardedIcon.enabled = APIMediator.isRewardedAdAvailable(this.rewardedEventId);
    }
};



// CollectablesSpawner.js
var CollectablesSpawner = pc.createScript('collectablesSpawner');

CollectablesSpawner.attributes.add('limitAmount', {
    type: 'vec2',
    default: [0, 25]
});


CollectablesSpawner.attributes.add('visualAmountModifier', {
    type: 'number',
    default: 0.5,
    min: 0.01,
    max: 1
});


CollectablesSpawner.attributes.add('spawnRadius', {
    type: 'number',
    default: 100
});

CollectablesSpawner.attributes.add('startAngle', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('randomizeStartAngle', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('endAngle', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('randomizeEndAngle', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('startScale', {
    type: 'number',
    default: 1.5
});

CollectablesSpawner.attributes.add('randomizeStartScale', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('endScale', {
    type: 'number',
    default: 0.5
});

CollectablesSpawner.attributes.add('randomizeEndScale', {
    type: 'number',
    default: 0
});

CollectablesSpawner.attributes.add('durationAppearDelayWeight', {
    type: 'number',
    default: 0.1
});

CollectablesSpawner.attributes.add('durationSpawnWeight', {
    type: 'number',
    default: 0.5
});

CollectablesSpawner.attributes.add('durationDelayWeight', {
    type: 'number',
    default: 0.1
});

CollectablesSpawner.attributes.add('durationMovementWeight', {
    type: 'number',
    default: 0.75
});

CollectablesSpawner.attributes.add('durationRandomWeight', {
    type: 'number',
    default: 0.1
});

CollectablesSpawner.prototype.initialize = function () {
    this.sampleIcon = this.entity.findByName('SampleIcon');
    this._iconInitialScale = this.sampleIcon.getLocalScale().clone();
    this._iconInitialAngles = this.sampleIcon.getLocalEulerAngles().clone();
    this._iconInitialPosition = this.sampleIcon.getLocalPosition().clone();
    this.sampleIcon.enabled = false;

    this.iconsCache = [this.sampleIcon];

    this.entity.collect = this._collect.bind(this);
    this.entity.clear = this._clear.bind(this);
};

CollectablesSpawner.prototype._clear = function() {
    this.entity.children.forEach(child => {
        if(child !== this.sampleIcon) this._disposeIcon(child);
    });
};

CollectablesSpawner.prototype._collect = function (_fromPosition, _toPosition, _amount, _duration) {
    return new Promise((resolve, reject) => {
        const amount = pc.math.clamp(_amount * this.visualAmountModifier, this.limitAmount.x, this.limitAmount.y);
        if (amount === 0) {
            resolve();
            return;
        }

        const durationWeigthSum = this.durationAppearDelayWeight + this.durationSpawnWeight + this.durationDelayWeight + this.durationMovementWeight + this.durationRandomWeight;

        let durationStart = _duration * this.durationAppearDelayWeight / durationWeigthSum;
        let durationSpawn = _duration * this.durationSpawnWeight / durationWeigthSum;
        let durationDelay = _duration * this.durationDelayWeight / durationWeigthSum;
        let durationMovement = _duration * this.durationMovementWeight / durationWeigthSum;
        let durationRandom = _duration * this.durationRandomWeight / durationWeigthSum;
        durationRandom *= 0.5;

        const promises = [];

        for (let i = 0; i < amount; i++) {
            const icon = this._instantiateIcon();
            icon.element.opacity = 0;
            icon.enabled = true;

            icon.setPosition(_fromPosition);
            const _spawnLocalPosition = icon.getLocalPosition();

            const _initialAngle = this.startAngle + pc.math.random(-this.randomizeStartAngle * 0.5, this.randomizeStartAngle * 0.5);
            icon.rotateLocal(0, 0, _initialAngle);

            const _initialScaleValue = this.startScale + pc.math.random(-this.randomizeStartScale * 0.5, this.randomizeStartScale * 0.5);
            icon.setLocalScale(_initialScaleValue * 0.5, _initialScaleValue * 0.5, _initialScaleValue * 0.5);

            /* calculate spawn position */
            const _randomAngle = pc.math.random(-Math.PI, Math.PI);
            const _randomRadius = pc.math.random(0, this.spawnRadius);
            const _randomSpawnPosition = new pc.Vec3(_spawnLocalPosition.x + Math.sin(_randomAngle) * _randomRadius, _spawnLocalPosition.y + Math.cos(_randomAngle) * _randomRadius, _spawnLocalPosition.z);

            /* calculate durations */
            const _spawnDelay = Math.max(0, durationStart + pc.math.random(0, 2 * durationRandom));
            const _durationSpawn = Math.max(0.001, durationSpawn + pc.math.random(-durationRandom, durationRandom));
            const _durationMovement = Math.max(0.001, durationMovement + pc.math.random(-durationRandom, durationRandom));
            const _flyingDelay = Math.max(0, durationDelay + pc.math.random(-durationRandom, durationRandom));
            const _flyingEndScale = this.endScale + pc.math.random(-this.randomizeEndScale * 0.5, this.randomizeEndScale * 0.5);
            const _flyingEndAngle = this.endAngle + pc.math.random(-this.randomizeEndAngle * 0.5, this.randomizeEndAngle * 0.5);

            /* calculate final position */
            const _targetLocalPosition = Utils.worldToLocalPosition(icon, _toPosition);

            /* opacity with initial delay */
            const promise = this._animateIconSpawning(icon, _spawnDelay, _durationSpawn, _initialScaleValue, _randomSpawnPosition)
                .then(async () => {
                    /* fly to final position */
                    await this._animateIconFlying(icon, _flyingDelay, _durationMovement, _flyingEndScale, _targetLocalPosition, _flyingEndAngle);
                    this.app.fire(EventTypes.PLAY_SFX, 'counting', 20);

                    this._disposeIcon(icon);
                });
            promises.push(promise);
        }

        Promise.all(promises).then(() => {
            resolve()
        });
    });
};


CollectablesSpawner.prototype._instantiateIcon = function() {
    if(this.iconsCache.length > 0) {
        return this.iconsCache.pop();
    } else {
        const clonedIcon = this.sampleIcon.clone();
        clonedIcon.reparent(this.sampleIcon.parent);
        clonedIcon.setLocalScale(this._iconInitialScale);
        clonedIcon.setLocalPosition(this._iconInitialPosition);
        clonedIcon.setLocalEulerAngles(this._iconInitialAngles);
        return clonedIcon;
    }
};


CollectablesSpawner.prototype._disposeIcon = function(icon) {
    if(this.iconsCache.indexOf(icon) === -1) {
        this.iconsCache.push(icon);
        icon.element.opacity = 0;
        this.app.stopAllTweens(icon);
        icon.enabled = false;
        icon.setLocalScale(this._iconInitialScale);
        icon.setLocalPosition(this._iconInitialPosition);
        icon.setLocalEulerAngles(this._iconInitialAngles);
    }
};

CollectablesSpawner.prototype._animateIconSpawning = function (icon, _spawnDelay, duration, _scale, _position) {
    return new Promise((resolve, reject) => {
        /* opacity */
        icon.tween(icon.element)
            .to({ opacity: 1 }, duration * 0.5, pc.Linear)
            .delay(_spawnDelay)
            .start();

        icon.tween(icon.getLocalScale())
            .to({ x: _scale, y: _scale, z: _scale }, duration, pc.BackOut)
            .delay(_spawnDelay)
            .start();

        icon.tween(icon.getLocalPosition())
            .to(_position, duration, pc.QuarticOut)
            .delay(_spawnDelay)
            .onComplete(() => resolve())
            .start();
    })
};


CollectablesSpawner.prototype._animateIconFlying = function (icon, _flyingDelay, duration, _scale, _position, _angle) {
    return new Promise((resolve, reject) => {
        /* opacity */
        icon.tween(icon.element)
            .to({ opacity: 1 }, duration * 0.5, pc.Linear)
            .delay(_flyingDelay)
            .start();

        icon.tween(icon.getLocalScale())
            .to({ x: _scale, y: _scale, z: _scale }, duration, pc.CubicIn)
            .delay(_flyingDelay)
            .start();

        icon.tween(icon.getLocalEulerAngles())
            .to({ x: 0, y: 0, z: _angle }, duration, pc.CubicIn)
            .delay(_flyingDelay)
            .start();

        icon.tween(icon.getLocalPosition())
            .to(_position, duration, pc.QuadraticIn)
            .delay(_flyingDelay)
            .onComplete(() => resolve())
            .start();
    })
};


CollectablesSpawner.prototype.update = function (dt) {

};


// soundController.js
/* jshint esversion: 6 */
var SoundController = pc.createScript('soundController');

SoundController.attributes.add('soundStorage', {
    title: "Sound storage entity",
    type: 'entity'
});

SoundController.attributes.add('preloadSoundAssets', {
    title: "Preload sounds",
    type: 'boolean',
    default: false
});

SoundController.attributes.add('sfxPreloadDelay', {
    title: "Sounds preload delay",
    type: 'number',
    default: 1000
});


SoundController.attributes.add('preloadMusicAssets', {
    title: "Preload music",
    type: 'boolean',
    default: false
});

SoundController.attributes.add('autoPlayMelodyKey', {
    title: "Auto play melody key",
    type: 'string',
    default: ''
});


SoundController.attributes.add('musicAssets', {
    title: "Music assets",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'asset',
        type: 'asset',
        assetType: 'audio'
    },
    {
        name: 'overlap',
        type: 'boolean',
        default: false
    },
    {
        name: 'volume',
        type: 'number',
        default: 1.0
    },
    {
        name: 'loop',
        type: 'boolean',
        default: true
    }],
    array: true
});

SoundController.attributes.add('soundAssets', {
    title: "Sound assets",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'asset',
        type: 'asset',
        assetType: 'audio'
    },
    {
        name: 'overlap',
        type: 'boolean',
        default: false
    },
    {
        name: 'volume',
        type: 'number',
        default: 1.0
    },
    {
        name: 'autoPlay',
        type: 'boolean',
        default: false
    },
    {
        name: 'loop',
        type: 'boolean',
        default: false
    }],
    array: true
});

SoundController.attributes.add('soundSeries', {
    title: "Sound series",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'startPitch',
        type: 'number',
        default: 1.0
    },
    {
        name: 'endPitch',
        type: 'number',
        default: 1.5
    },
    {
        name: 'steps',
        type: 'number',
        default: 10,
        min: 2,
        max: 25
    }, {
        name: 'timeout',
        type: 'number',
        default: 1000
    }],
    array: true
});


SoundController.sfxStateLoaded = false;
SoundController.sfxVolume = 0.5;
SoundController.musicStateLoaded = false;
SoundController.musicVolume = 0.5;

Object.defineProperty(SoundController, "musicEnabled", {
    get() {
        return SoundController.musicVolume > 0;
    },
    set(value) {
        if (!value) {
            SoundController._prevMusicVolume = SoundController.musicVolume;
            SoundController.musicVolume = 0;
        } else {
            SoundController.musicVolume = SoundController._prevMusicVolume || 0.5;
        }
        APIMediator.setStorageItem("MUSIC_VOLUME", SoundController.musicVolume);
        pc.AppBase.getApplication().fire(EventTypes.SET_MUSIC_VOLUME, SoundController.musicVolume);
    }
});


Object.defineProperty(SoundController, "sfxEnabled", {
    get() {
        return SoundController.sfxVolume > 0;
    },
    set(value) {
        if (!value) {
            SoundController._prevSFXVolume = SoundController.sfxVolume;
            SoundController.sfxVolume = 0;
        } else {
            SoundController.sfxVolume = SoundController._prevSFXVolume || 0.5;
        }
        APIMediator.setStorageItem("SFX_VOLUME", SoundController.sfxVolume);
        pc.AppBase.getApplication().fire(EventTypes.SET_SFX_VOLUME, SoundController.sfxVolume);
    }
});

SoundController.masterVolume = 1.0;
SoundController.apiVolumeMultiplier = 1.0;

SoundController.prototype.initialize = function () {
    /* music assets */
    this.musicSlotKeys = new Set();
    this.sfxSlotKeys = new Set();

    /* events handlung */
    this.app.on(EventTypes.PLAY_SFX, this.playSfx, this);
    this.app.on(EventTypes.PLAY_EXTERNAL_SFX, this.playExternalSfx, this);
    this.app.on(EventTypes.STOP_SFX, this.stopSfx, this);

    this.app.on(EventTypes.PLAY_MUSIC, this.playMusic, this);
    this.app.on(EventTypes.STOP_MUSIC, this.stopMusic, this);

    this.app.on(EventTypes.MUTE_SOUND, this.muteSound, this);
    this.app.on(EventTypes.UNMUTE_SOUND, this.unmuteSound, this);
    this.app.on(EventTypes.ENABLE_SFX, this.enableSfx, this);
    this.app.on(EventTypes.DISABLE_SFX, this.disableSfx, this);
    this.app.on(EventTypes.ENABLE_MUSIC, this.enableMusic, this);
    this.app.on(EventTypes.DISABLE_MUSIC, this.disableMusic, this);
    this.app.on(EventTypes.CHOKE_MUSIC, this.chokeMusic, this);
    this.app.on(EventTypes.UNCHOKE_MUSIC, this.unchokeMusic, this);
    this.app.on(EventTypes.SET_MUSIC_VOLUME, this.setMusicVolume, this);
    this.app.on(EventTypes.SET_SFX_VOLUME, this.setSFXVolume, this);
    this.app.on('postinitialize', this.onAppLoaded, this);
    this.app.on(EventTypes.SET_MASTER_VOLUME, this.setMasterVolume, this);
    this.app.on(EventTypes.SET_VOLUME_MULTIPLIER, this.setVolumeMultiplier, this);

    this.app.on('sound:playSound', (key) => {
        this.playSfx(key);
    })

    this.setMasterVolume(1);

    this.loadSavedValues();

    /* init sound series params */
    this.soundSeriesMap = new Map();
    this.soundSeries.forEach(soundConfig => {
        const keys = soundConfig.key.split(',');
        keys.forEach(key => this.soundSeriesMap.set(key, soundConfig));
    });

    /** ios suspended context fix */
    this._applyIOSAudioContextFix();

    /* API Events */
    APIMediator.onAudioStateChange((isMuted) => {
        SoundController.externalMuteStatus = isMuted;
        this.setVolumeMultiplier(SoundController.externalMuteStatus ? 0 : 1);
    });

    this.fireSoundStateChangedEvent();
    this.fireMusicStateChangedEvent();
};

SoundController.prototype.loadSavedValues = function () {

    let savedSFXVolume = APIMediator.getStorageItem("SFX_VOLUME");
    if (savedSFXVolume !== undefined && savedSFXVolume !== null) {
        this.setSFXVolume(+savedSFXVolume);
    } else {
        this.setSFXVolume(0.5);
    }
    SoundController.sfxStateLoaded = true;


    let savedMusicVolume = APIMediator.getStorageItem("MUSIC_VOLUME");
    if (savedMusicVolume !== undefined && savedMusicVolume !== null) {
        this.setMusicVolume(+savedMusicVolume);
    } else {
        this.setMusicVolume(0.5);
    }
    SoundController.musicStateLoaded = true;

    this.reportMuteStatus();

    /* override with external mute values */
    SoundController.externalMuteStatus = APIMediator.isMuted();
    this.setVolumeMultiplier(SoundController.externalMuteStatus ? 0 : 1);
}

SoundController.prototype.reportMuteStatus = function () {
    if (SoundController.musicStateLoaded && SoundController.sfxStateLoaded) {
        const muteStatus = !SoundController.sfxEnabled && !SoundController.musicEnabled;
        APIMediator.reportGameMuted(muteStatus);
    }
};

SoundController.prototype.update = function (dt) {

};

SoundController.prototype._applyIOSAudioContextFix = function () {
    if (pc.platform.ios) {
        this.app.touch.on(pc.EVENT_TOUCHEND, () => {
            if (this.app.soundManager.context.state === 'interrupted' || this.app.soundManager.context.state === 'suspended') {
                this.app.soundManager.context.resume().then(() => {
                    console.log('[iOS audio] Audio context restored')
                }).catch(e => {
                    console.log('[iOS audio] Can not resume audio context')
                });
            }
        });
    }
}

SoundController.prototype.playSfx = function (key, debounceDelay) {
    if (Array.isArray(key)) key = Utils.getRandomItem(key);

    const currentTimestamp = new Date().getTime();
    const soundSlot = this.soundStorage.sound.slot(key);
    if (!soundSlot) return console.warn('wrong sound slot ', key);
    const lastTimestamp = soundSlot.lastTimeStamp;

    if (debounceDelay) {
        const lastTimestamp = soundSlot.lastTimeStamp;
        if (lastTimestamp && currentTimestamp - lastTimestamp < debounceDelay) {
            return;
        }
    }

    if (this.soundSeriesMap.has(key)) {
        const seriesConfig = this.soundSeriesMap.get(key);
        const seriesIndex = seriesConfig._lastSeriesIndex || 0;
        const lastSeriesTimestamp = seriesConfig.lastTimeStamp || 0;
        if (currentTimestamp - lastSeriesTimestamp <= seriesConfig.timeout) {
            soundSlot.pitch = pc.math.clamp(seriesConfig.startPitch + seriesIndex * (seriesConfig.endPitch - seriesConfig.startPitch) / (seriesConfig.steps - 1), seriesConfig.startPitch, seriesConfig.endPitch);
            seriesConfig._lastSeriesIndex += 1;
        } else {
            soundSlot.pitch = seriesConfig.startPitch;
            seriesConfig._lastSeriesIndex = 0;
        }
        seriesConfig.lastTimeStamp = currentTimestamp;
    }

    /* remember current timestamp */
    soundSlot.lastTimeStamp = currentTimestamp;

    if (soundSlot) {
        this._loadAndPlayAsset(key);
    } else {
        console.warn("No sound with key '" + key + "' in storage!");
    }
};


SoundController.prototype.playExternalSfx = function (key, targetEntity, debounceDelay) {
    if (!targetEntity || !targetEntity.sound || !targetEntity.sound.slot(key)) {
        return;
    }

    if (SoundController.sfxEnabled) {
        targetEntity.sound.play(key);
    }
};

SoundController.prototype.stopSfx = function (key) {
    this.soundStorage.sound.stop(key);
};

SoundController.prototype.playMusic = function (key, stopOthers = true) {
    this.currentMusicKey = key;
    if (stopOthers) {
        this.musicAssets.forEach(asset => {
            const slot = this.soundStorage.sound.slot(asset.key);
            if (slot && slot.isPlaying) {
                slot.stop();
            }
        });
    }
    this._loadAndPlayAsset(key);
};

SoundController.prototype.stopMusic = function (key) {
    if (key) {
        this.soundStorage.sound.stop(key);
    } else {
        this.musicAssets.forEach(asset => {
            const slot = this.soundStorage.sound.slot(asset.key);
            if (slot && slot.isPlaying) {
                slot.stop();
            }
        });
    }
};


SoundController.prototype.muteSound = function (key) {
    this.soundStorage.sound.slot(key)._initialVolume = 0;
    this.soundStorage.sound.slot(key).volume = 0;
};

SoundController.prototype.unmuteSound = function (key, volume = 1.0) {
    const slot = this.soundStorage.sound.slot(key);
    if (!slot || !slot.isPlaying) slot.play();

    this.soundStorage.sound.slot(key)._initialVolume = volume * SoundController.sfxVolume;
    this.soundStorage.sound.slot(key).volume = volume * SoundController.sfxVolume;
};

SoundController.prototype.enableSfx = function (saveApp = true) {
    SoundController.sfxEnabled = true;
};

SoundController.prototype.disableSfx = function (saveApp = true) {
    SoundController.sfxEnabled = false;
};



SoundController.prototype.enableMusic = function (saveApp = true) {
    SoundController.musicEnabled = true;
    // if (this.currentMusicKey) {
    //     this.app.fire(EventTypes.PLAY_MUSIC, this.currentMusicKey);
    // }
};

SoundController.prototype.disableMusic = function (saveApp = true) {
    SoundController.musicEnabled = false;
};

SoundController.prototype.chokeMusic = function () {
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume * 0.2;
    });
};

SoundController.prototype.unchokeMusic = function () {
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume * 1.0;
    });
};


SoundController.prototype.fireSoundStateChangedEvent = function () {
    this.app.fire(EventTypes.SOUND_STATE_CHANGED, SoundController.sfxEnabled, SoundController.sfxVolume);
    this.reportMuteStatus();
};

SoundController.prototype.fireMusicStateChangedEvent = function () {
    this.app.fire(EventTypes.MUSIC_STATE_CHANGED, SoundController.musicEnabled, SoundController.musicVolume);
    this.reportMuteStatus();
};

SoundController.prototype.setMusicVolume = function (volume) {
    SoundController.musicVolume = volume;
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume;
    });
    this.fireMusicStateChangedEvent();
    // this.app.fire(EventTypes.SAVE_APP);
};

SoundController.prototype.setSFXVolume = function (volume) {
    SoundController.sfxVolume = volume;
    this.sfxSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.sfxVolume;
    });
    this.fireSoundStateChangedEvent();
    // this.app.fire(EventTypes.SAVE_APP);
};



SoundController.prototype.onAppLoaded = function () {
    this.createSoundsSlots();
    this.createMusicSlots();

    this.playNextMelody();


    // if (this.currentMusicKey) {
    //     this.playMusic(this.currentMusicKey);
    // }
    // this.app.fire(EventTypes.PLAY_MUSIC, Constants.AUDIO.MUSIC_MENU);
};

SoundController.prototype.createSoundsSlots = function () {
    if (this.preloadSoundAssets) APIMediator.log('Preloading ' + this.soundAssets.length + ' sfx...');

    this.soundAssets.forEach(asset => {
        const slot = this.soundStorage.sound.addSlot(asset.key, asset);
        slot._initialVolume = slot.volume;
        this.sfxSlotKeys.add(asset.key);
    });

    this.setSFXVolume(SoundController.sfxVolume);


    if (this.preloadSoundAssets) {
        setTimeout(() => {
            this.soundAssets.forEach(asset => {
                const slot = this.soundStorage.sound.slot(asset.key);
                if (slot && !slot.isLoaded) {
                    slot.load();
                }
            });
        }, this.sfxPreloadDelay);
    }
};

SoundController.prototype.createMusicSlots = function () {
    if (this.preloadMusicAssets) APIMediator.log('Preloading ' + this.musicAssets.length + ' melodies...');

    const playMusicTask = (key) => {
        if (this.autoPlayMelodyKey === key || this.currentMusicKey === key) {
            this.currentMusicKey = key;
            this.soundStorage.sound.slot(key).play();
        }
    };
    this.musicAssets.forEach(asset => {
        const slot = this.soundStorage.sound.addSlot(asset.key, asset);
        slot._initialVolume = slot.volume;
        this.musicSlotKeys.add(asset.key);

        slot.on('end', this.playNextMelody, this);

        if (this.preloadMusicAssets) {
            if (this.soundStorage.sound.slot(asset.key) && !this.soundStorage.sound.slot(asset.key).isLoaded) {
                this.soundStorage.sound.slot(asset.key).load();
                this.soundStorage.sound.slot(asset.key).once('load', () => {
                    playMusicTask(asset.key);
                });
            } else {
                if (this.soundStorage.sound.slot(asset.key).isLoaded) {
                    playMusicTask(asset.key);
                }
            }
        }
    });

    this.setMusicVolume(SoundController.musicVolume);
};

SoundController.prototype.playNextMelody = function() {
    const melodyKeys = this.musicAssets.map(asset => asset.key);
    const nextMelodyKey = Utils.getRandomItemBut(melodyKeys, this.currentMusicKey) || Utils.getRandomItem(melodyKeys);
    if(nextMelodyKey) {
        this.app.fire(EventTypes.PLAY_MUSIC, nextMelodyKey);
    }
};

SoundController.prototype._loadAndPlayAsset = function (key) {
    if (!this.soundStorage.sound.slot(key)) return console.warn('No sound with key ' + key);

    if (!this.soundStorage.sound.slot(key).isLoaded) {
        this.soundStorage.sound.slot(key).load();
        this.soundStorage.sound.slot(key).once('load', () => {
            this.soundStorage.sound.slot(key).play();
        });
    } else {
        this.soundStorage.sound.slot(key).play();
    }
};


/* volume control */

SoundController.prototype.updateVolume = function () {
    this.app.systems.sound.volume = SoundController.masterVolume * SoundController.apiVolumeMultiplier;
};

SoundController.prototype.setMasterVolume = function (volume) {
    SoundController.masterVolume = volume;
    this.updateVolume();
};

SoundController.prototype.setVolumeMultiplier = function (volume) {
    SoundController.apiVolumeMultiplier = volume;
    this.updateVolume();
};


// ScreenFlashEffect.js
var screenFlashEffect = pc.createScript('screenFlashEffect');


screenFlashEffect.attributes.add('triggerEvent', {
    type: 'string'
});

screenFlashEffect.attributes.add('flashStartEvent', {
    type: 'string'
});

screenFlashEffect.attributes.add('flashEndEvent', {
    type: 'string'
});

screenFlashEffect.attributes.add('flashingOpacity', {
    type: 'vec2',
    default: [0, 0.75]
});

screenFlashEffect.attributes.add('flashingPeriod', {
    type: 'number',
    default: 0.35
});

screenFlashEffect.attributes.add('targetOpacity', {
    type: 'number',
    default: 0.9
});


screenFlashEffect.attributes.add('appearingDelay', {
    type: 'number',
    default: 0.0
});

screenFlashEffect.attributes.add('appearingDuration', {
    type: 'number',
    default: 0.05
});

screenFlashEffect.attributes.add('disappearingDuration', {
    type: 'number',
    default: 0.45
});

screenFlashEffect.attributes.add('disappearingDelay', {
    type: 'number',
    default: 0.25
});

screenFlashEffect.attributes.add('disappearingEasing', {
    type: 'string',
    enum: [
        { "Linear": "Linear" },
        { "QuadraticIn": "QuadraticIn" },
        { "QuadraticOut": "QuadraticOut" },
        { "QuadraticInOut": "QuadraticInOut" },
        { "CubicIn": "CubicIn" },
        { "CubicOut": "CubicOut" },
        { "CubicInOut": "CubicInOut" },
        { "QuarticIn": "QuarticIn" },
        { "QuarticOut": "QuarticOut" },
        { "QuarticInOut": "QuarticInOut" },
        { "QuinticIn": "QuinticIn" },
        { "QuinticOut": "QuinticOut" },
        { "QuinticInOut": "QuinticInOut" },
        { "SineIn": "SineIn" },
        { "SineOut": "SineOut" },
        { "SineInOut": "SineInOut" },
        { "ExponentialIn": "ExponentialIn" },
        { "ExponentialOut": "ExponentialOut" },
        { "ExponentialInOut": "ExponentialInOut" },
        { "CircularIn": "CircularIn" },
        { "CircularOut": "CircularOut" },
        { "CircularInOut": "CircularInOut" },
        { "BackIn": "BackIn" },
        { "BackOut": "BackOut" },
        { "BackInOut": "BackInOut" },
        { "BounceIn": "BounceIn" },
        { "BounceOut": "BounceOut" },
        { "BounceInOut": "BounceInOut" },
        { "ElasticIn": "ElasticIn" },
        { "ElasticOut": "ElasticOut" },
        { "ElasticInOut": "ElasticInOut" }
    ],
    default: 'Linear'
});


screenFlashEffect.prototype.initialize = function() {
    this.entity.element.opacity = 0;

    if(this.triggerEvent) {
        this.app.on(this.triggerEvent, this.showFlashEffect, this);
    } else {
        console.error('Trigger event is not set for ' + this.entity.path);
    }

    if(this.flashStartEvent) {
        this.app.on(this.flashStartEvent, this._startFlashing, this);
    }

    if(this.flashEndEvent) {
        this.app.on(this.flashEndEvent, this._stopFlashing, this);
    }

    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
};

screenFlashEffect.prototype.showFlashEffect = function() {
    if(this._flashing) return;
    if (this.appearingTween && this.appearingTween.playing) this.appearingTween.stop();
    if (this.disappearingTween && this.disappearingTween.playing) this.disappearingTween.stop();

    this.appearingTween = this.entity.tween(this.entity.element)
        .to({ opacity: this.targetOpacity }, this.appearingDuration, pc.Linear);

    this.disappearingTween = this.entity.tween(this.entity.element)
        .to({ opacity: 0 }, this.disappearingDuration, pc[this.disappearingEasing])
        .delay(this.disappearingDelay);

    this.appearingTween.chain(this.disappearingTween).start();
};

screenFlashEffect.prototype.reset = function() {
   this._stopFlashing();
};

screenFlashEffect.prototype._startFlashing = function() {
    if(this._flashing) return;
    this._flashing = true;

    this.entity.element.opacity = this.flashingOpacity.x;
    this.flashingTween = this.entity.tween(this.entity.element)
        .to({ opacity: this.flashingOpacity.y }, this.flashingPeriod, pc.Linear)
        .delay(this.appearingDelay)
        .repeat(1000000)
        .yoyo(true)
        .start();
};

screenFlashEffect.prototype._stopFlashing = function() {
    if(!this._flashing) return;
    this._flashing = false;
    
    if(this.flashingTween) this.flashingTween.stop();
    this.entity.tween(this.entity.element)
        .to({ opacity: 0 }, this.flashingPeriod, pc.SineOut)
        .start();
};

screenFlashEffect.prototype.update = function(dt) {

};


