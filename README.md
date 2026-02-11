<p align="center"><a href="https://laravel.com" target="_blank"><img src="public/assets/full-logo.svg" width="400" alt="ConnectED Logo"></a></p>

# ConnectED

Plataforma educativa en línea con capacidades de videollamadas en tiempo real utilizando WebRTC.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- **PHP** >= 8.2
- **Composer**
- **Node.js** >= 18.x
- **npm** o **yarn**
- **Go** >= 1.21 (para el servidor WebRTC)
- **MySQL** u otro motor de base de datos compatible
- **OpenSSL** (para generar certificados HTTPS)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto
```

### 2. Instalar Dependencias de PHP

```bash
composer install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Configura las variables de entorno en el archivo `.env`, especialmente:
- La configuración de la base de datos (`DB_*`)
- La URL de la aplicación (`APP_URL`)

### 4. Generar la Clave de la Aplicación

```bash
php artisan key:generate
```

### 5. Ejecutar Migraciones

```bash
php artisan migrate
```

### 6. Ejecutar Seeders (Opcional)

Si deseas poblar la base de datos con datos de prueba:

```bash
php artisan db:seed
```

### 7. Instalar Dependencias de Node.js

```bash
npm install
```

### 8. Generar Certificados HTTPS para WebRTC

El servidor WebRTC requiere certificados SSL para funcionar. Crea un directorio para los certificados y genera un certificado autofirmado:

```bash
mkdir -p ~/certs
openssl req -x509 -newkey rsa:4096 -keyout ~/certs/localhost.key -out ~/certs/localhost.crt -days 365 -nodes
```

Durante la generación, puedes dejar los campos en blanco o completarlos según prefieras. Lo importante es tener los archivos `localhost.key` y `localhost.crt` en `~/certs/`.

### 9. Compilar el Servidor WebRTC

```bash
cd app/WebRTC
go build -o webrtc-sfu
cd ../..
```

## Ejecución

### Desarrollo

Tienes dos opciones para ejecutar la aplicación en modo desarrollo:

#### Opción 1: Ejecutar todo con un solo comando

```bash
composer run dev
```

Este comando ejecuta automáticamente:
- Servidor Laravel (`php artisan serve`)
- Sistema de colas (`php artisan queue:listen`)
- Logs en tiempo real (`php artisan pail`)
- Servidor Vite para el frontend (`npm run dev`)

**Importante:** Este comando NO incluye el servidor WebRTC. Debes ejecutarlo por separado:

```bash
npm run webrtc
```

#### Opción 2: Ejecutar cada servicio manualmente

En terminales separadas, ejecuta:

**Terminal 1 - Backend Laravel:**
```bash
php artisan serve
```

**Terminal 2 - Frontend (Vite):**
```bash
npm run dev
```

**Terminal 3 - Servidor WebRTC:**
```bash
npm run webrtc
```

### Producción

#### 1. Construir el Frontend

```bash
npm run build
```

Este comando compila los assets de React/TypeScript optimizados para producción.

#### 2. Ejecutar el Backend

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

O configura un servidor web como **Nginx** o **Apache** para servir la aplicación.

#### 3. Ejecutar el Servidor WebRTC

```bash
npm run webrtc
```

O ejecuta directamente el binario compilado:

```bash
cd app/WebRTC
CERT_FILE=~/certs/localhost.crt KEY_FILE=~/certs/localhost.key ./webrtc-sfu
```

## Estructura del Proyecto

```
├── app/                    # Código PHP (Laravel)
│   ├── Http/              # Controladores y middleware
│   ├── Models/            # Modelos Eloquent
│   └── WebRTC/            # Servidor WebRTC (Go)
├── database/
│   ├── migrations/        # Migraciones de base de datos
│   └── seeders/           # Seeders
├── resources/
│   ├── js/                # Frontend (React + TypeScript)
│   └── views/             # Vistas Blade
├── routes/                # Rutas de la aplicación
└── public/                # Assets públicos
```

## Tecnologías

- **Backend:** Laravel 12, PHP 8.2
- **Frontend:** React 19, TypeScript, Vite, Redux Toolkit
- **WebRTC:** Go, Pion WebRTC
- **Estilos:** SCSS, Framer Motion
- **Base de datos:** MySQL

## Notas Importantes

- El servidor WebRTC escucha en el puerto **8080** por defecto
- El backend de Laravel escucha en el puerto **8000** por defecto
- El servidor Vite (desarrollo) escucha en el puerto **5173** por defecto
- Los certificados HTTPS son necesarios para que WebRTC funcione correctamente en navegadores modernos
