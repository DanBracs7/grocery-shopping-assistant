// Entry point of Stage 1. Order matters: A-Frame first, then the components that use it.
import 'aframe';
import './components/hint-card.js';
import './components/face-camera.js';
import './components/lazy-follow.js';
import './components/debug-grid.js';
import './components/position-label.js';
import './components/thumbstick-move.js';
import './components/xr-buttons.js';
