var CameraRotation = pc.createScript('cameraRotation');


CameraRotation.attributes.add("cam", {type: "entity"});
CameraRotation.attributes.add("cam_target", {type: "entity"});
CameraRotation.attributes.add("cam_collection_target", {type: "entity"});

CameraRotation.attributes.add("rotate_button", {type: "entity"});

CameraRotation.attributes.add("exclamation", {type: "entity"});

// initialize code called once per entity
CameraRotation.prototype.initialize = function() {

    CameraRotation.instance = this;

    this.angle = 0;

    this.rotate_flag = false;
    this.show_collection = false;
    this.delay_collection = 0;

    this.camera_end_position = this.cam.getLocalPosition().clone();

    this.cam.setPosition(this.cam.getLocalPosition().add(new pc.Vec3(0,0,20)));

    this.cont = { value: 0 };
    var tween = this.entity.tween(this.cont).to({ value: 1 }, 6, pc.QuarticOut);

    var currentPosition = this.cam.getLocalPosition().clone();

    tween.on("update", function (dt) {
        var newPosition = new pc.Vec3().lerp(currentPosition, this.camera_end_position, this.cont.value);
        this.cam.setLocalPosition(newPosition); 
    }.bind(this));

/*
    tween.on("complete", function () {

        Claw.instance.state = "aiming";
        
    }.bind(this));
*/

    tween.start();


    this.looking_ratio = 0;

    this.app.on("rotate_start", function(extra) {
        if(!this.show_collection)
        {
            this.rotate_flag = true;        
        }    
    }.bind(this));

    this.app.on("rotate_end", function(extra) {
        this.rotate_flag = false;
    }.bind(this));


    this.app.on("collection_down", function(extra) {
        if(this.delay_collection > 0) return;
        this.show_collection = !this.show_collection;

        //console.log("collection down " + this.show_collection);                    
        CoinBox.instance.show_button = false;

        if(!this.show_collection)
        {
            if(!AdsManager.instance.gameplay)
            {
                AdsManager.instance.gameplayStart();
            }
        }
        else
        {
            if(AdsManager.instance.gameplay)
            {
                AdsManager.instance.gameplayStop();
            }
        }

        this.delay_collection = 1.5;
        this.exclamation.enabled = false;
    }.bind(this));

};

// update code called every frame
CameraRotation.prototype.update = function(dt) {
    this.delay_collection -= dt;

    this.rotate_button.element.opacity = (!this.show_collection)?1:0.5;

    this.rotate_flag = this.rotate_flag && !this.show_collection;

    this.angle = pc.math.lerpAngle(this.angle,(this.rotate_flag)?-90:0,5*dt);

    this.entity.setEulerAngles(0,this.angle,0);

    this.looking_ratio = pc.math.lerp(this.looking_ratio,this.show_collection? 1: 0,2*dt);

    let look_at = new pc.Vec3().lerp(this.cam_target.getPosition(),this.cam_collection_target.getPosition(),this.looking_ratio)

    this.cam.lookAt(look_at);
};

// uncomment the swap method to enable hot-reloading for this script
// update the method body to copy state from the old instance
// CameraRotation.prototype.swap = function(old) { };

// learn more about scripting here:
// https://developer.playcanvas.com/user-manual/scripting/