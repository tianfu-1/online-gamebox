var FollowMouse = pc.createScript('followMouse');

// initialize code called once per entity
FollowMouse.prototype.initialize = function () {
    this.pos = new pc.Vec3();

    this.camera = this.app.root.findByName('Camera');
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
};


FollowMouse.prototype.onMouseMove = function (event) {
    // Use the camera component's screenToWorld function to convert the
    // position of the mouse into a position in 3D space

    var cameraEntity = this.camera;
    cameraEntity.camera.screenToWorld(event.x, event.y, 100, this.pos);
    // Finally update the cube's world-space position
    this.entity.setPosition(this.pos);
};