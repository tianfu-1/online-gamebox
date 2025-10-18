var Glow = pc.createScript('glow');

// initialize code called once per entity
Glow.prototype.initialize = function () {
    this.entity.tween(this.entity.element).to({ opacity: 0.3 }, 0.5, pc.SineInOut).yoyo(true).repeat(2).loop(true).start();

};
