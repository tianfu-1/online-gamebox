var GameManager = pc.createScript('gameManager');

// initialize code called once per entity
GameManager.prototype.initialize = function() {
    GameManager.instance = this;
};