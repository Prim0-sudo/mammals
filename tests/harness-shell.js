// The side test pages (layout.html, homeward.html) carry only part of index.html. Before the
// engine starts, copy in every element with an id that the real page has and this page lacks
// (Teacher, Settings and Drawing dialogs and the like), so the pages keep working as the app grows.
const shell = new DOMParser().parseFromString(await (await fetch("/index.html")).text(), "text/html");
for (const el of shell.body.querySelectorAll("[id]")) {
  if (document.getElementById(el.id)) continue;
  let parent = el.parentElement;
  while (parent && parent !== shell.body && !(parent.id && document.getElementById(parent.id))) parent = parent.parentElement;
  const host = parent && parent !== shell.body ? document.getElementById(parent.id) : document.body;
  host.append(document.importNode(el, true));
}
