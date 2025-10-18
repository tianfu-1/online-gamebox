var CreateGrassMaterial = pc.createScript('createGrassMaterial');


CreateGrassMaterial.attributes.add('materialAsset', { type: 'asset', assetType: 'material' });

CreateGrassMaterial.attributes.add('vs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Vertex Shader'
});

CreateGrassMaterial.attributes.add('fs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Fragment Shader'
});

CreateGrassMaterial.attributes.add('diffuseMap', {
    type: 'asset',
    assetType: 'texture',
    title: 'Diffuse Map'
});

// initialize code called once per entity
CreateGrassMaterial.prototype.initialize = function () {
    var fragmentShader = this.fs.resource;

    var vertexShader = this.vs.resource;
    var graphicsDevice = this.app.graphicsDevice;
    var shader = new pc.Shader(graphicsDevice, {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        },
        vshader: vertexShader,
        fshader: fragmentShader
    });
    this.time = Math.random();

    var colorCode = new pc.Color(214 / 255, 1, 7 / 255);
    this.material = new pc.Material();
    //  this.material = this.materialAsset.resource;
    this.material.setParameter('time', this.time);
    this.material.setParameter('uColor', [colorCode.r, colorCode.g, colorCode.b, colorCode.a]);
    this.material.setParameter('uTexture', this.diffuseMap.resource);
    this.material.shader = shader;
    this.material.update();

};


CreateGrassMaterial.prototype.update = function (dt) {
    this.time += dt;
    this.material.setParameter('time', this.time);
    this.material.update();

};
