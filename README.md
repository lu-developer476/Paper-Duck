# Pato al rescate

Juego web infanto-juvenil construido con Django. Acompañá a Pipa, una mamá pato, por cinco carriles de río para recuperar a su patito-patrulla sin chocar con obstáculos.

## Ejecutar en local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py runserver
```

## Variables de entorno para Render

| Variable | Valor recomendado | Uso |
| --- | --- | --- |
| `SECRET_KEY` | Generar un valor aleatorio en Render | Clave criptográfica de Django. Nunca usar la clave de desarrollo en producción. |
| `DEBUG` | `False` | Desactiva las páginas de depuración en producción. |
| `ALLOWED_HOSTS` | `.onrender.com` | Permite requests al dominio público de Render. Agregá tu dominio propio separado por comas si corresponde. |

El archivo [`render.yaml`](render.yaml) ya define el servicio web, instala dependencias, reúne archivos estáticos y configura los valores iniciales de Render.
