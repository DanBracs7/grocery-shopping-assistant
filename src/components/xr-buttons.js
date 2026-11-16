// xr-buttons — shows BOTH the "VR" and the "AR" (passthrough, Quest 3) button.
//
// Concepts: A-Frame only adds the VR button by default (`xr-mode-ui` has XRMode "vr"), and it
// ignores later setting changes, so we recreate the component once the scene has loaded.
// The AR button only appears on devices that support `immersive-ar`.
//
// Use:  <a-scene xr-buttons> …
AFRAME.registerComponent('xr-buttons', {
  init() {
    const scene = this.el;
    const enable = () => {
      // Remove first: xr-mode-ui ignores setting changes once its buttons exist.
      scene.removeAttribute('xr-mode-ui');
      scene.setAttribute('xr-mode-ui', 'XRMode: xr');
    };
    scene.hasLoaded ? enable() : scene.addEventListener('loaded', enable);
  },
});
