# Pato al rescate

**Pato al rescate** es un juego web infanto-juvenil hecho con Django y JavaScript. Acompañá a Pipa, una mamá pato, a cruzar cinco carriles de río, rescatar patitos y llegar a la bahía sin chocar con los obstáculos.

## Características

- Dos modos de juego: **Rescate**, con una meta de patitos según la dificultad, y **Contrarreloj**, con 60 segundos de juego.
- Tres niveles de dificultad y tres escenarios visuales: río alegre, atardecer y noche tibia.
- Controles con teclado y gestos táctiles, además de pausa durante la partida.
- Puntos, rachas, estrellas y burbujas protectoras.
- Ranking y estadísticas guardados localmente en el navegador; no se envían a un servidor.

## Requisitos

- Python 3.10 o superior.
- `pip`.

## Ejecutar en local

1. Creá y activá un entorno virtual:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

   En Windows PowerShell, activalo con:

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

2. Instalá las dependencias y configurá las variables de entorno:

   ```bash
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. Iniciá el servidor de desarrollo:

   ```bash
   python manage.py runserver
   ```

4. Abrí [http://127.0.0.1:8000/](http://127.0.0.1:8000/) en el navegador.

> Django no carga archivos `.env` por sí solo. Para usar valores distintos a los predeterminados durante el desarrollo, exportalos en la terminal o configurá tu entorno de ejecución. El archivo `.env.example` sirve como referencia y para despliegues que carguen ese archivo.

## Cómo jugar

1. Elegí un nombre, modo, escenario y dificultad en **Nueva partida**.
2. Mové a Pipa entre los cinco carriles con las flechas **←** y **→**, o deslizá hacia los costados sobre el juego en pantallas táctiles.
3. Rescatá patitos para sumar puntos; rescatarlos en cadena aumenta el multiplicador.
4. Juntá estrellas para obtener puntos extra y burbujas para bloquear un choque.
5. Evitá troncos, nenúfares, peces y botes. Tenés tres vidas.
6. Presioná **Espacio** o usá el botón de pausa para detener y reanudar la partida.

## Configuración

La aplicación lee estas variables de entorno:

| Variable | Valor local predeterminado | Uso |
| --- | --- | --- |
| `SECRET_KEY` | Clave de desarrollo incluida en el código | Clave criptográfica de Django. Usá una clave aleatoria y secreta en producción. |
| `DEBUG` | `False` | Activa las páginas de depuración solo si se establece en `true`. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.onrender.com` | Lista de hosts permitidos, separada por comas. |

Ejemplo para una sesión local con depuración activada:

```bash
export SECRET_KEY="una-clave-local-segura"
export DEBUG=True
export ALLOWED_HOSTS="localhost,127.0.0.1"
python manage.py runserver
```

## Verificaciones

Ejecutá las comprobaciones de Django antes de publicar cambios:

```bash
python manage.py check
python manage.py collectstatic --noinput
```

## Despliegue en Render

El archivo [`render.yaml`](render.yaml) define un servicio web de Render. Durante el build instala las dependencias y ejecuta `collectstatic`; luego inicia la aplicación con Gunicorn.

Al crear el servicio, Render genera `SECRET_KEY` automáticamente. Mantené `DEBUG=False` y ajustá `ALLOWED_HOSTS` si agregás un dominio propio.

## Estructura del proyecto

```text
paperduck/        Configuración, rutas y vista de Django
static/css/       Estilos de la interfaz
static/js/        Lógica del juego y almacenamiento local del ranking
static/img/       Recursos gráficos
templates/        Plantilla principal
render.yaml       Configuración de despliegue en Render
```

## Tecnologías

- Python y Django
- HTML, CSS y JavaScript
- WhiteNoise para servir archivos estáticos
- Gunicorn para producción

## Licencia

Este proyecto se distribuye bajo los términos incluidos en [License](License).
