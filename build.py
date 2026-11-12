"""Genera landing.html (vista previa) e index.html (listo para el hosting) a partir de src/.

src/ se organiza por componentes: cada carpeta de src/components/<nombre>/ puede
tener <nombre>.html, <nombre>.css y <nombre>.js. Los que no existen se omiten.
landing.html lleva el <title>, <style>, el contenido y el <script>, sin
<html>/<head>/<body>, para poder publicarlo también como vista previa.
Uso: python3 build.py
"""
from pathlib import Path
from html import escape
import json
import re

base = Path(__file__).parent
src = base / "src"

ANTES_DEL_MAIN = ["hero"]
EN_EL_MAIN = ["vive", "formulario"]
DESPUES_DEL_MAIN = ["pie", "flotantes", "cookies"]

ESTILOS = ["tokens", "base", "botones", "pendiente", "marca"]
CORE = ["utils", "whatsapp", "contenido", "campana"]
CONFIG = ["config"]
ORDEN_CSS = ["carga", "hero", "vive", "formulario", "pase", "pie", "flotantes", "cookies"]
ORDEN_JS = ["hero", "vive", "formulario", "pase", "pie", "flotantes", "cookies"]


def leer(ruta):
    return ruta.read_text(encoding="utf-8") if ruta.exists() else ""


def componente(nombre, ext):
    return leer(src / "components" / nombre / f"{nombre}.{ext}")


def unir(partes):
    return "\n".join(p for p in partes if p)


css = unir(
    [leer(src / "styles" / f"{n}.css") for n in ESTILOS]
    + [componente(n, "css") for n in ORDEN_CSS]
)

principal = unir([componente(n, "html") for n in EN_EL_MAIN])
cuerpo = unir(
    [componente("carga", "html"), "<script>\n" + componente("carga", "js") + "</script>\n"]
    + [componente(n, "html") for n in ANTES_DEL_MAIN]
    + ["<main>\n" + principal + "</main>\n"]
    + [componente(n, "html") for n in DESPUES_DEL_MAIN]
)

interior = unir(
    [leer(src / "core" / f"{n}.js") for n in CORE]
    + [componente(n, "js") for n in ORDEN_JS]
)
js = unir(
    [leer(src / "config" / f"{n}.js") for n in CONFIG]
    + ["(function () {\n" + interior + "})();\n"]
)

cabecera = leer(src / "head.html") + "<style>\n" + css + "</style>\n\n"
cuerpo = cuerpo + "\n<script>\n" + js + "</script>\n"

(base / "landing.html").write_text(cabecera + cuerpo, encoding="utf-8")

html = (
    "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n"
    "<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
    "<meta name=\"theme-color\" content=\"#0D1B2E\">\n"
    + cabecera
    + "</head>\n<body>\n"
    + cuerpo
    + "\n</body>\n</html>\n"
)
(base / "index.html").write_text(html, encoding="utf-8")
print(f"index.html generado ({len(html):,} caracteres)")

# La página legal utiliza los mismos contactos que la landing.
configuracion = leer(src / "config" / "config.js")
datos_legales = {}
for clave in ["academia", "correo", "telefono", "direccion", "privacidadVersion"]:
    coincidencia = re.search(r'^\s*' + re.escape(clave) + r':\s*("(?:\\.|[^"\\])*")', configuracion, re.M)
    if not coincidencia:
        raise ValueError(f"Falta la configuración legal: {clave}")
    datos_legales[clave] = json.loads(coincidencia.group(1))
datos_legales["telefonoHref"] = re.sub(r"[^+0-9]", "", datos_legales["telefono"])
for pagina in ["privacidad", "terminos", "cookies"]:
    documento = leer(src / "legal" / f"{pagina}.html")
    for clave, valor in datos_legales.items():
        documento = documento.replace("{{" + clave + "}}", escape(valor, quote=True))
    if re.search(r"\{\{\w+\}\}", documento):
        raise ValueError(f"La página {pagina} contiene datos sin completar")
    destino = base / pagina
    destino.mkdir(exist_ok=True)
    (destino / "index.html").write_text(documento, encoding="utf-8")
    print(f"{pagina}/index.html generado")
