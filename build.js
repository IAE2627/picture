// Reconstruit index.html à partir de src/ : node build.js
// Compile le CSS (Tailwind 3) et le JSX (esbuild), puis remplace le <style> et
// le script de l'application dans index.html. Nécessite Node et un accès réseau (npx).
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const src = path.join(__dirname, "src");
const css = execSync("npx -y tailwindcss@3.4.17 -c tailwind.config.js -i input.css --minify", { cwd: src, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
// Images : les marqueurs "__X__" de data.jsx sont remplacés par les fichiers .b64
const IMG = { __JACKET_IMG__: "jacket.b64", __V34__: "coloris/v34.b64", __VBACK__: "coloris/vback.b64", __MAST_BG__: "fond-montagne.b64" };
for (let i = 0; i < 6; i++) IMG["__COL_" + i + "__"] = "coloris/c" + i + ".b64";
let data = fs.readFileSync(path.join(src, "data.jsx"), "utf8");
for (const [k, f] of Object.entries(IMG)) data = data.split('"' + k + '"').join(JSON.stringify(fs.readFileSync(path.join(src, f), "utf8").trim()));
const jsx = data + "\n" + fs.readFileSync(path.join(src, "app.jsx"), "utf8");
const js = execSync("npx -y esbuild@0.24.0 --loader=jsx --jsx=transform --charset=utf8", { input: jsx, stdio: ["pipe", "pipe", "inherit"] }).toString().replace(/<\/script/gi, "<\\/script");

const file = path.join(__dirname, "index.html");
let html = fs.readFileSync(file, "utf8");
const styleStart = html.indexOf("<style>") + 7, styleEnd = html.indexOf("</style>");
html = html.slice(0, styleStart) + css + html.slice(styleEnd);
const appStart = html.lastIndexOf("<script>") + 8, appEnd = html.lastIndexOf("</script>");
html = html.slice(0, appStart) + js + html.slice(appEnd);
fs.writeFileSync(file, html);
console.log("index.html reconstruit (" + Math.round(html.length / 1024) + " Ko)");
