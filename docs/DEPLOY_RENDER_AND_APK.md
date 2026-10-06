# 🚀 Guía de Despliegue en Render.com y Construcción de APK

Este documento detalla la configuración de variables de entorno y los pasos para compilar la APK de **WordHive** apuntando a tu backend en producción (`https://wordhive-api.onrender.com`).

---

## 1. Mapa de Variables de Entorno en Render.com

El archivo [`render.yaml`](file:///c:/Users/pc/Desktop/sopa-de-letras/render.yaml) ya incluye la configuración automática como Blueprint. Si configuras los servicios manualmente en el Dashboard de Render, utiliza los siguientes valores:

### A. Servicio Web: `wordhive-api` (Backend Fastify)
| Variable | Valor Recomendado | Descripción |
|---|---|---|
| `NODE_ENV` | `production` | Modo producción |
| `PORT` | `3000` | Puerto asignado por Render |
| `DATABASE_URL` | *(Asignado desde Database)* | URL de conexión de PostgreSQL |
| `REDIS_URL` | *(Asignado desde Key-Value)* | Conexión a Redis / Valkey |
| `JWT_SECRET` | *(Generar valor aleatorio 32+ caracteres)* | Firma criptográfica de JWT |
| `JWT_ACCESS_EXPIRY` | `7d` | Vigencia de token de acceso |
| `JWT_REFRESH_EXPIRY` | `30d` | Vigencia de token de refresco |
| `APP_URL` | `https://wordhive-api.onrender.com` | URL pública de la API |
| `FRONTEND_URL` | `https://wordhive-landing.onrender.com` | URL de la landing web (CORS) |
| `SMTP_HOST` | `smtp.gmail.com` | Servidor SMTP (Nodemailer) |
| `SMTP_PORT` | `587` | Puerto SMTP |
| `SMTP_USER` | `tu-correo@gmail.com` | Correo emisor de códigos OTP |
| `SMTP_PASS` | `tu-app-password-16-caracteres` | Contraseña de aplicación Gmail |
| `SMTP_FROM` | `WordHive <tu-correo@gmail.com>` | Remitente de correos |

### B. Sitio Estático: `wordhive-landing` (Web React)
| Variable | Valor | Descripción |
|---|---|---|
| `VITE_API_URL` | `https://wordhive-api.onrender.com/api/v1` | Endpoint base para la API REST |
| `VITE_SOCKET_URL` | `https://wordhive-api.onrender.com` | Servidor Socket.IO para tiempo real |

> **Nota:** La landing compila con `npm install && npm run build` y publica la carpeta `./dist`. Los encabezados y reescritura hacia `/index.html` ya están configurados en `render.yaml`.

---

## 2. Construcción de la APK (Android)

La aplicación móvil ya viene preconfigurada para apuntar por defecto a `https://wordhive-api.onrender.com/api/v1`.

### Opción 1: Usando el script automático (Recomendado)
Desde PowerShell en la carpeta raíz:
```powershell
cd app
.\build_apk.ps1
```

Si deseas apuntar temporalmente a otro servidor:
```powershell
.\build_apk.ps1 -ApiUrl "https://otro-backend.onrender.com/api/v1"
```

### Opción 2: Usando Flutter CLI directamente
Para compilar en modo **Release**:
```bash
cd app
flutter build apk --release --dart-define=API_URL=https://wordhive-api.onrender.com/api/v1 --dart-define=SOCKET_URL=https://wordhive-api.onrender.com
```

### Ubicación del archivo APK generado
Una vez finalizada la compilación, encontrarás el archivo listo para instalar en:
```
app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 3. Optimizaciones para Render Free Tier en la App Móvil

1. **Tolerancia a Cold-Starts (Despertar del servicio):**  
   Los servicios gratuitos de Render entran en suspensión tras 15 minutos de inactividad. Se ajustó el `connectTimeout` y `receiveTimeout` de Dio en [`api_client.dart`](file:///c:/Users/pc/Desktop/sopa-de-letras/app/lib/core/network/api_client.dart) a **30 segundos** para que la app no aborte la petición mientras Render inicializa el contenedor.
2. **Permisos de Red:**  
   En [`AndroidManifest.xml`](file:///c:/Users/pc/Desktop/sopa-de-letras/app/android/app/src/main/AndroidManifest.xml) se encuentra habilitado `android.permission.INTERNET` y `android:usesCleartextTraffic="true"`.
3. **CORS:**  
   En [`app.ts`](file:///c:/Users/pc/Desktop/sopa-de-letras/backend/src/app.ts), el middleware `@fastify/cors` acepta peticiones sin cabecera `Origin` (como las que emiten los clientes nativos Android y Dio), asegurando comunicación fluida.

---

## 4. Avisos push en la barra del teléfono (Firebase Cloud Messaging)

Las invitaciones a jugar y las solicitudes de amistad llegan a la barra de notificaciones aunque WordHive esté cerrada. Sin estas credenciales todo compila y funciona igual, solo que sin avisos con la app cerrada.

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto (por ejemplo `wordhive`). Analytics no es necesario.
2. **App Android:** en el proyecto, *Agregar app → Android* con el paquete `com.example.wordhive_app`. Descarga `google-services.json`.
3. **GitHub (APK):** en el repo, *Settings → Secrets and variables → Actions → New repository secret* con nombre `GOOGLE_SERVICES_JSON` y como valor el contenido completo del archivo. La siguiente APK de Actions ya trae Firebase.
   - Para compilar en local, copia el archivo a `app/android/app/google-services.json` (está en `.gitignore`).
4. **Render (backend):** en Firebase, *Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada*. En Render, servicio `wordhive-api` → *Environment*, crea `FIREBASE_SERVICE_ACCOUNT` y pega el JSON completo (también acepta base64). Al reiniciar, el log dice `[Push] FCM activo para el proyecto ...`.
5. Instala la APK nueva, inicia sesión y acepta "¡Sí, avísame!".

### ¿No llegan los avisos con la app cerrada? Revisa en este orden

1. **Backend:** abre `https://wordhive-api.onrender.com/health`. Debe decir `"push": "activo"`. Si dice `"sin credenciales de Firebase"`, falta o está mal `FIREBASE_SERVICE_ACCOUNT` en Render.
2. **APK:** en GitHub → Actions, abre la última compilación de `main`. Si aparece la advertencia *"APK sin avisos push"*, falta el secreto `GOOGLE_SERVICES_JSON`; agrégalo y vuelve a compilar (botón *Run workflow*). Hay que instalar esa APK nueva.
3. **Teléfono:** en *Ajustes → Apps → WordHive → Notificaciones* deben estar activadas, y el canal "Amigos e invitaciones" en *Alertas / Sonido*.
4. **Ahorro de batería (Xiaomi, Huawei, Oppo, Samsung):** si se cierra la app deslizándola, algunos teléfonos bloquean los avisos. En *Ajustes → Batería → WordHive* elige "Sin restricciones" y, en Xiaomi, activa "Inicio automático".
