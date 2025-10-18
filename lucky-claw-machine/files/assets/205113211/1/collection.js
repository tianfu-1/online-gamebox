var Collection = pc.createScript('collection');

Collection.attributes.add("toy_displays", {type: "entity",array:true});

// initialize code called once per entity
Collection.prototype.initialize = function() {
    Collection.instance = this;
    this.unlocked_toys = SaveManager.loadString("unlocked_toys","").split(",");
    this.updateToys();
};

Collection.prototype.checkToy = function(toy) {

    if(!this.unlocked_toys.includes(toy.id))
    {
        this.unlocked_toys.push(toy.id);
        NewPrizePopUp.instance.showNewPrize(toy);
        SaveManager.saveString("unlocked_toys",this.unlocked_toys.toString());
    }
    else
    {
        Toy.all_toys.splice(Toy.all_toys.indexOf(toy), 1);
        toy.entity.destroy();
        SoundManager.instance.playSound("win");
        Claw.instance.startMachine();
    }

    this.updateToys();
};

Collection.prototype.updateToys = function() {

    for(let i = 0; i < this.toy_displays.length; i ++)
    {
        for(let j = 0; j < this.unlocked_toys.length; j++)
        {
            if(this.toy_displays[i].script.displayToy.id == this.unlocked_toys[j])
            {
                this.toy_displays[i].enabled = true;
            }
        }
    }
};
