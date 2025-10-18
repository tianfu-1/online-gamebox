/*
This plugin was sourced from:
https://phaser.discourse.group/t/matter-physics-in-phaser-v3-60-to-v3-80/13398/2
Problem with matter physics is that it depends on frame rate - physics is running much faster on high refresh rate displays,
which is a problem. We want physics to run framerate independent.
This plugin runs matter physics manually and simulates 60fps, regardless of actual fps.  
*/

const { DESTROY, SHUTDOWN, START, UPDATE } = Phaser.Scenes.Events;

export class MatterFixedStepPlugin extends Phaser.Plugins.ScenePlugin {
  accum = 0;

  boot() {
    console.debug("boot");

    if (!this.systems.matterPhysics) {
      throw new Error("Matter Physics must be enabled in this scene");
    }

    if (this.systems.matterPhysics.config.autoUpdate) {
      throw new Error("Matter Physics config must have `autoUpdate: false`");
    }

    this.systems.events
      .on(START, this.sceneStart, this)
      .on(SHUTDOWN, this.sceneShutdown, this)
      .on(DESTROY, this.sceneDestroy, this)
      .on(UPDATE, this.sceneUpdate, this);
  }

  sceneDestroy() {

    this.systems.events
      .off(START, this.sceneStart, this)
      .off(SHUTDOWN, this.sceneShutdown, this)
      .off(DESTROY, this.sceneDestroy, this)
      .off(UPDATE, this.sceneUpdate, this);
  }

  sceneStart() {
  }

  sceneShutdown() {
  }

  sceneUpdate(time, delta) {
    const { matterPhysics } = this.systems;
    const { deltaMin } = matterPhysics.world.runner;
    this.accum += delta;

    while (this.accum >= deltaMin) {
      matterPhysics.step(deltaMin);

      this.accum -= deltaMin;
    }
  }
}