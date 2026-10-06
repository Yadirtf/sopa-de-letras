# backend/

Contiene EXCLUSIVAMENTE la logica del servidor de WordHive.

## Tecnologias
- Node.js 20 LTS + TypeScript
- Fastify v4 (HTTP server)
- Socket.IO v4 (WebSocket server)
- Prisma v5 (ORM)
- PostgreSQL 15 + Redis 7
- Nodemailer + Zod + JWT + bcrypt

## Arquitectura Clean
1. domain/ - Entidades, Value Objects, contratos (SIN dependencias externas)
2. application/ - Casos de uso, orquestacion de dominio
3. infrastructure/ - Prisma, Redis, Socket.IO, Email (implementaciones concretas)
4. presentation/ - Controllers HTTP, Middlewares, DI container, Schemas Zod
