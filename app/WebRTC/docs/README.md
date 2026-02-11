# Documentación WebRTC SFU

Bienvenido a la documentación completa del servidor WebRTC y librería cliente.

## 📚 Archivos de Documentación

### 1. 🔧 [SERVER_INTERNALS.md](./SERVER_INTERNALS.md)

**¿Qué es?**: Documentación técnica detallada del servidor en español.

**Contenido**:
- Arquitectura del servidor SFU (Selective Forwarding Unit)
- Componentes principales (Server, Room, Peer)
- Flujo completo de conexión paso a paso
- Protocolo de señalización JSON
- Gestión de sesiones y thread-safety
- WebRTC PeerConnections (publicadora y suscriptora)
- Flujo de medios (audio/video)
- Manejo de errores y reconexión
- Seguridad y validación de inputs
- Ejemplo completo: flujo de dos usuarios

**Para quién**: Desarrolladores que quieren entender cómo funciona internamente el servidor, arquitectos de sistemas, contribuidores.

**Tiempo de lectura**: ~30-40 minutos

---

### 2. 📖 [USAGE_GUIDE.md](./USAGE_GUIDE.md)

**¿Qué es?**: Guía práctica de uso de la librería cliente agnóstica de framework.

**Contenido**:
- Características de la librería
- Instalación en 3 formas diferentes
- API pública completa (métodos)
- Sistema de eventos (16+ eventos personalizados)
- Manejo de estado (getters)
- **Guía detallada para React** (hooks, ejemplos)
- Ejemplos para Vue 3, Solid.js
- Ejemplo vanilla JavaScript completo
- Patrones comunes (manejo de errores, renderizar video, speaker activo, screen share)
- Troubleshooting: soluciones a los problemas más comunes

**Para quién**: Desarrolladores frontend que quieren integrar la librería en su aplicación.

**Tiempo de lectura**: ~20-30 minutos (según tu framework)

---

### 3. 🔷 [Tipos TypeScript](../client/webrtc-client-framework-ready.d.ts)

**¿Qué es?**: Definiciones de tipos TypeScript completas para la librería.

**Contenido**:
- Interfaz `WebRTCClientOptions`
- Interfaz `PeerInfo`
- Interfaz `ClientState`
- Payloads para cada tipo de evento
- Tipos de eventos mapeados
- Métodos de la clase con tipos
- Getters tipados
- Métodos addEventListener fuertemente tipados

**Para quién**: Desarrolladores TypeScript que quieren autocompletar y verificación de tipos.

**Cómo usarlo**:
```typescript
import { WebRTCClient, WebRTCClientOptions, PeerInfo } from './client/webrtc-client-framework-ready';

const options: WebRTCClientOptions = {
    url: 'ws://localhost:8080',
    userId: 'alice',
    sessionId: 'room-1',
};

const client = new WebRTCClient(options);

client.addEventListener('peer-joined', (event) => {
    const peer: PeerInfo = event.detail;  // ✅ Autocompletado
    console.log(peer.audioEnabled);       // ✅ Sin errores
});
```

---

## 🚀 Flujo de Lectura Recomendado

### Si eres **nuevo en este proyecto**:
1. ✅ Lee resumen en [README.md](../README.md)
2. ✅ **Luego**: [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Sección "Instalación"
3. ✅ **Luego**: Ejemplo para tu framework (React/Vue/Solid/Vanilla)
4. ✅ **Opcional**: [SERVER_INTERNALS.md](./SERVER_INTERNALS.md) si necesitas debug

### Si eres **arquitecto / DevOps**:
1. ✅ Lee [SERVER_INTERNALS.md](./SERVER_INTERNALS.md) - "Arquitectura General"
2. ✅ Luego "Seguridad y Validación"
3. ✅ Luego "Gestión de Sesiones"

### Si necesitas **debuggear un problema**:
1. ✅ [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Sección "Troubleshooting"
2. ✅ [SERVER_INTERNALS.md](./SERVER_INTERNALS.md) - "Flujo de Conexión"
3. ✅ Verificar logs del servidor: `go run .`

### Si usas **TypeScript**:
1. ✅ [Tipos TypeScript](../client/webrtc-client-framework-ready.d.ts)
2. ✅ [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Sección "React"

---

## 📋 Checklist de Integración

### Fase 1: Entender la Arquitectura
- [ ] Leer [README.md](../README.md) general
- [ ] Ver diagrama de arquitectura en [SERVER_INTERNALS.md](./SERVER_INTERNALS.md#arquitectura-general)

### Fase 2: Configurar el Servidor
- [ ] Descargar dependencias: `go mod tidy`
- [ ] Ejecutar servidor: `go run .`
- [ ] Verificar escucha en puerto 8080: `lsof -i :8080`

### Fase 3: Elegir Cliente
- [ ] Revisar [USAGE_GUIDE.md](./USAGE_GUIDE.md#instalación)
- [ ] Elegir entre vanilla JS o framework-ready
- [ ] Copiar archivo cliente a tu proyecto

### Fase 4: Integrar en tu Framework
- [ ] Para **React**: Seguir ejemplo en [USAGE_GUIDE.md](./USAGE_GUIDE.md#react--guía-detallada)
- [ ] Para **Vue**: Seguir ejemplo en [USAGE_GUIDE.md](./USAGE_GUIDE.md#vue-3-composition-api)
- [ ] Para **Solid**: Seguir ejemplo en [USAGE_GUIDE.md](./USAGE_GUIDE.md#solidjs)
- [ ] Para **Vanilla**: Seguir ejemplo en [USAGE_GUIDE.md](./USAGE_GUIDE.md#ejemplos-completos)

### Fase 5: TypeScript (si aplica)
- [ ] Copiar `webrtc-client-framework-ready.d.ts` junto al `.js`
- [ ] Importar con tipos: `import { WebRTCClient } from './client/webrtc-client-framework-ready'`

### Fase 6: Debug y Optimización
- [ ] Revisar [USAGE_GUIDE.md](./USAGE_GUIDE.md#troubleshooting)
- [ ] Verificar logs en console del navegador
- [ ] Revisar server logs: `go run .`

---

## 🔑 Conceptos Clave

### SFU (Selective Forwarding Unit)
El servidor **no mezcla** ni procesa audio/video. Solo reenvía selectivamente los streams publicados por cada cliente a los que quieren recibirlo. Esto permite:
- ✅ Bajo latency
- ✅ Bajo uso de CPU en servidor
- ✅ Control fino sobre quién publica/recibe

### Dos PeerConnections por Cliente

1. **pubPC (Publisher)**: Cliente ENVÍA audio/video
2. **subPC (Subscriber)**: Cliente RECIBE audio/video de otros

### Agnóstica de Framework

La librería cliente extiende `EventTarget` (API nativa del navegador) - cualquier framework puede escuchar eventos:

```javascript
// React
useEffect(() => {
    client.addEventListener('track', handleTrack);
}, []);

// Vue
onMounted(() => {
    client.addEventListener('track', handleTrack);
});

// Vanilla JS
client.addEventListener('track', handleTrack);

// Todos funcionan igual ✅
```

---

## 🎯 Preguntas Frecuentes

**P: ¿Qué diferencia hay entre `webrtc-client.js` y `webrtc-client-framework-ready.js`?**

A: El primero es callback-based (legacy), el segundo es event-driven. El segundo es recomendado para nuevos proyectos y frameworks modernos. Ver [USAGE_GUIDE.md](./USAGE_GUIDE.md#api-pública).

---

**P: ¿Puedo usar la librería sin Node.js?**

A: Sí, la librería es solo JavaScript cliente. El servidor está en Go. Ver [USAGE_GUIDE.md](./USAGE_GUIDE.md#instalación).

---

**P: ¿Soporta TypeScript?**

A: Completamente. Hay archivo `.d.ts` con tipos completos. Ver [webrtc-client-framework-ready.d.ts](../client/webrtc-client-framework-ready.d.ts).

---

**P: ¿Qué eventos emite?**

A: 16+ eventos: `connected`, `peer-joined`, `track`, `media-state`, `speaking`, `screen-stream`, y más. Ver lista completa en [USAGE_GUIDE.md](./USAGE_GUIDE.md#lista-de-eventos).

---

**P: ¿Funciona en producción?**

A: Sí, pero asegúrate de:
1. Usar HTTPS (no solo HTTP)
2. Configurar CORS whitelist en [sfu/server.go](../sfu/server.go)
3. Habilitar rate limiting
4. Monitorear logs

Ver [SERVER_INTERNALS.md](./SERVER_INTERNALS.md#seguridad-y-validación).

---

## 🐛 Reportar Problemas

Si encuentras un bug:

1. Revisa [USAGE_GUIDE.md](./USAGE_GUIDE.md#troubleshooting)
2. Revisa logs del servidor: `go run . 2>&1 | grep error`
3. Revisa console del navegador: `F12 → Console`
4. Revisa eventos emitidos:

```javascript
client.addEventListener('connection-error', (e) => {
    console.error('Error:', e.detail.error);
});
```

---

## 📊 Documentación Completa

| Archivo | Tipo | Audiencia | Tiempo | Español |
|---------|------|-----------|--------|---------|
| [SERVER_INTERNALS.md](./SERVER_INTERNALS.md) | Técnica | Arquitectos, desarrolladores Go | 30-40 min | ✅ |
| [USAGE_GUIDE.md](./USAGE_GUIDE.md) | Práctica | Desarrolladores frontend | 20-30 min | ✅ |
| [webrtc-client-framework-ready.d.ts](../client/webrtc-client-framework-ready.d.ts) | Referencia | Usuarios TypeScript | 5-10 min | ✅ (inline) |
| [README.md](../README.md) | Resumen | Todos | 5 min | ✅ |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Seguridad | DevOps, arquitectos | 15-20 min | ✅ |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Guía | Usuarios legacy | 10-15 min | ✅ |

---

## ✅ Validación

✅ Todas las rutas de aprendizaje cubiertas  
✅ Documentación en español  
✅ Tipos TypeScript incluidos  
✅ Ejemplos prácticos para React, Vue, Solid  
✅ Troubleshooting y FAQ  
✅ Seguridad documentada  

¡Listo para empezar! 🚀

---

**Última actualización**: Febrero 2026  
**Versión del cliente**: Framework-ready (Event-driven)  
**Versión del servidor**: Go SFU  
