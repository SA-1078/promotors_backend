# Motors Backend - Deployment README

## 🚀 Estado del Proyecto

### ✅ Backend Desplegado
- **Plataforma**: Railway
- **URL**: `https://motorshop.up.railway.app` *(configurar después del deploy)*
- **Base de Datos**: PostgreSQL (Railway) + MongoDB Atlas

### 🔜 Frontend (Próximamente)
- Se integrará en **la misma URL** del backend
- Frontend servirá en `/`
- APIs en `/api/*`

---

## 📝 Para Revisión

### URL del Proyecto
```
https://motorshop.up.railway.app
```

### Credenciales de Prueba
```
Email: admin@test.com
Password: password123
```

### Postman Collection
Ver archivo: `Motors Backend API.postman_collection.json`
- Actualizar variable `base_url` con la URL de Railway

---

## 🔧 Tecnologías

- **Backend**: NestJS + TypeScript
- **Bases de Datos**: PostgreSQL + MongoDB
- **Autenticación**: JWT
- **Deploy**: Railway
- **CI/CD**: GitHub → Railway (auto-deploy)

---

## 📚 Documentación

- [Guía de Despliegue](./RAILWAY_DEPLOY.md)
- [Guía de Migración](./MIGRATION_GUIDE.md)
- [Variables de Entorno](./.env.example)

---

## 👨‍💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus valores locales

# Ejecutar en desarrollo
npm run start:dev

# Compilar
npm run build

# Ejecutar en producción
npm run start:prod
```

---

## 🎓 Proyecto Académico

**Materia**: Programación III  
**Semestre**: 3er Semestre  
**Año**: 2026

---

**Última actualización**: Enero 2026
