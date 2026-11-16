// xr-buttons — shows BOTH the "VR" and the "AR" (passthrough, Quest 3) button.
//
// Concepts: A-Frame only adds the VR button by default (`xr-mode-ui` has XRMode "vr"), and it
// resets that setting while the scene starts up, so we set it once the scene has loaded.
// The AR button only appears on devices that support `immersive-ar`.
//
// Use:  <a-scene xr-buttons> …
AFRAME.registerComponent('xr-buttons', {
  init() {
    const scene = this.el;
    const enable = () => scene.setAttribute('xr-mode-ui', 'XRMode', 'xr');
    scene.hasLoaded ? enable() : scene.addEventListener('loaded', enable);
  },
});
