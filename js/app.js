// js/app.js
import { loadState } from './state.js';
import { render } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();
});
