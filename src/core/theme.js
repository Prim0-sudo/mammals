export function applyTheme(topic) {
  document.title = `${topic.title} — ${topic.subject || topic.subtitle}`;
  document.documentElement.lang = topic.locale;
  document.querySelector('meta[name="description"]').content =
    topic.description;
  for (const key of ["primary", "accent", "ink"])
    document.documentElement.style.setProperty("--" + key, topic.theme[key]);
  topic.theme.cardColors.forEach((c, i) =>
    document.documentElement.style.setProperty("--card-" + i, c),
  );
  document.documentElement.style.setProperty(
    "--background",
    `url("${new URL(topic.launch.backgroundImage, document.baseURI).href}")`,
  );
  document.getElementById("brand-image").src = topic.launch.logoImage;
  document.getElementById("brand-name").textContent = topic.title;
  document
    .getElementById("home")
    .setAttribute("aria-label", topic.title + " home");
}
const sceneAdapters = {
  floating: (scene, esc) =>
    `<div class="scene-floaters" aria-hidden="true">${scene.assets.map((src, i) => `<img src="${esc(src)}" alt="" class="floater floater-${i}">`).join("")}</div>`,
};
export function renderScene(scene, esc) {
  if (!scene) return "";
  if (!sceneAdapters[scene.id]) throw Error("Unknown scene adapter");
  return sceneAdapters[scene.id](scene, esc);
}
