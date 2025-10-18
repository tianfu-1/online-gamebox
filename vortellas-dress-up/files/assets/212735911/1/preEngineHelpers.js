window.setVDynamic = function (entity, value) {
    entity.vDynamic = value;
    let children = entity.children;
    for (let i in children) {
        window.setVDynamic(children[i], value);
    }
};