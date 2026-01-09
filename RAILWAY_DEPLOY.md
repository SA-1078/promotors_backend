# 🚂 Guía de Despliegue en Railway - Motors Backend

## 📋 FASE 1: Backend Solo (Para presentación del lunes)

### 1️⃣ Preparar Bases de Datos

#### PostgreSQL en Railway
Railway incluye PostgreSQL gratis. Se configurará automáticamente.

#### MongoDB Atlas (Externo - Gratis)
1. Ir a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta gratuita
3. Crear cluster (FREE Tier - M0)
4. En "Database Access": Crear usuario y contraseña
5. En "Network Access": Agregar IP `0.0.0.0/0` (permitir desde cualquier lugar)
6. Obtener connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/motors_history
   ```

---

### 2️⃣ Desplegar en Railway

#### Paso 1: Crear cuenta en Railway
1. Ir a [railway.app](https://railway.app)
2. Click en "Start a New Project"
3. Login con GitHub

#### Paso 2: Conectar Repositorio
1. Click "Deploy from GitHub repo"
2. Seleccionar tu repositorio: `promotors_backend`
3. Click "Deploy Now"

#### Paso 3: Agregar PostgreSQL
1. En tu proyecto, click "+ New"
2. Seleccionar "Database" → "Add PostgreSQL"
3. Railway creará la base de datos automáticamente

#### Paso 4: Configurar Variables de Entorno
1. Click en tu servicio backend
2. Ir a pestaña "Variables"
3. Agregar TODAS estas variables:

```env
# PostgreSQL (Railway las genera automáticamente, solo verifica)
DATABASE_URL=postgresql://... (se genera automáticamente)

# Agregar manualmente estas:
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_USER=${{PGUSER}}
DB_PASS=${{PGPASSWORD}}
DB_NAME=${{PGDATABASE}}

# MongoDB (De Atlas)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/motors_history

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# Environment
NODE_ENV=production

# CORS - Por ahora permite todos (luego cambiar)
FRONTEND_URL=*

# Admin
ADMIN_SECRET_CODE=codigo_secreto_admin
```

**Tip**: Railway auto-completa variables de PostgreSQL con `${{PGHOST}}`, etc.

#### Paso 5: Deploy
1. Railway detecta que es NestJS
2. Build automático: `npm install && npm run build`
3. Start automático: `npm run start:prod`
4. Esperar 2-3 minutos

---

### 3️⃣ Verificar Despliegue

#### Obtener URL
1. En Railway, click en tu servicio
2. Pestaña "Settings"
3. Sección "Domains"
4. Generar dominio: `motors-backend.up.railway.app`

#### Probar API
```bash
# Health check
curl https://motors-backend.up.railway.app

# Login test
curl -X POST https://motors-backend.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

#### Ver Logs
1. En Railway, pestaña "Deployments"
2. Click en el deployment activo
3. Ver logs en tiempo real

---

### 4️⃣ Crear Datos Iniciales (Opcional)

Si necesitas usuarios de prueba, usa Postman con tu URL de Railway:

```
POST https://motors-backend.up.railway.app/auth/register
{
  "nombre": "Admin Test",
  "email": "admin@test.com",
  "telefono": "0987654321",
  "password": "password123",
  "rol": "admin",
  "codigo_secreto": "tu_codigo_secreto_admin"
}
```

---

## 📝 Para Presentación del Lunes

### Entregar al profesor:
1. ✅ URL del backend: `https://motors-backend.up.railway.app`
2. ✅ Postman Collection (actualizada con URL de Railway)
3. ✅ Credenciales de prueba:
   - Email: `admin@test.com`
   - Password: `password123`

### Demostrar:
- ✅ Registro de usuarios
- ✅ Login (obtener token)
- ✅ CRUD de motocicletas (con token)
- ✅ CRUD de categorías
- ✅ Crear venta
- ✅ Historial de vistas

---

## 🔄 FASE 2: Agregar Frontend (En unas semanas)

No hagas nada de esto ahora. Cuando tengas el frontend:

### Modificaciones al Backend
1. Agregar servicio de archivos estáticos
2. Prefijo `/api` a todas las rutas
3. Manejo de routing SPA

### Deploy Conjunto
1. Frontend se builda en `client/dist`
2. Backend sirve frontend + APIs
3. **MISMA URL** para todo: `https://motors-backend.up.railway.app`
   - `/` → Frontend
   - `/api/*` → Backend APIs

---

## 🆘 Troubleshooting

### Error: "Application failed to respond"
- Verificar variables de entorno
- Ver logs en Railway
- Verificar que PORT no esté hardcodeado

### Error: "Database connection failed"
- Verificar MONGO_URI en variables
- Verificar IP whitelist en MongoDB Atlas
- Verificar PostgreSQL está corriendo

### Error: "Build failed"
- Verificar que `package.json` tenga `start:prod`
- Ver logs de build en Railway

---

## 📞 Soporte

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- MongoDB Atlas Docs: [docs.mongodb.com](https://docs.mongodb.com)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

---

**Última actualización**: Enero 2026  
**Preparado para**: Presentación del lunes + Integración futura de frontend
