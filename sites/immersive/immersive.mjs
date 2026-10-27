const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const perspectives = {
 sre: [-20, -28, 'Design for failure. Make recovery a capability.'],
 cloud: [-20, -118, 'Build foundations that survive a failure domain.'],
 ai: [-20, -208, 'Connect evidence. Automate within clear boundaries.'],
 platform: [-20, 62, 'Give engineering teams a paved road worth using.']
};
let paused = reducedMotion.matches;
const stage = $('.core-stage');
function syncMotion() {
 stage.classList.toggle('motion-paused', paused);
 $('#core-motion').textContent = paused ? 'Resume motion ▷' : 'Pause motion ⏸';
 $('#core-motion').setAttribute('aria-label', paused ? 'Resume core motion' : 'Pause core motion');
}
$('#core-motion').addEventListener('click', () => { paused = !paused; syncMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
$$('[data-core]').forEach(button => button.addEventListener('click', () => {
 const [x, y, description] = perspectives[button.dataset.core];
 $('.core-space').style.setProperty('--core-x', x + 'deg');
 $('.core-space').style.setProperty('--core-y', y + 'deg');
 $('#core-description').textContent = description;
 $$('[data-core]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
}));
// The object rests when outside the viewport; no animation loop or rendering dependency.
new IntersectionObserver(entries => {
 stage.classList.toggle('core-offscreen', !entries[0].isIntersecting);
}).observe(stage);
syncMotion();

// Content stays visible if observers or scripts are unavailable.
if (!reducedMotion.matches) {
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
 }), {threshold:0.08});
 $$('.section-heading,.mission-brief,.principles article,.project-card').forEach(element => {
  element.classList.add('reveal-ready'); observer.observe(element);
 });
 reducedMotion.addEventListener('change', event => {
  if (event.matches) $$('.reveal-ready').forEach(element => element.classList.add('is-visible'));
 });
}
