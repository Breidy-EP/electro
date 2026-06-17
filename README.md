# ElectroIngeniería FNI

Tienda virtual de comercio electrónico especializada en la comercialización de componentes electrónicos y herramientas básicas para estudiantes de ingeniería de la Facultad Nacional de Ingeniería.

## Tecnologías

- **Framework:** [Next.js](https://nextjs.org/) 16
- **Base de datos:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Imágenes:** [ImageKit](https://imagekit.io/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) v4 + CSS personalizado

## Requisitos previos

- Node.js 18+
- npm, yarn, pnpm o bun
- Cuenta en [Supabase](https://supabase.com/)
- Cuenta en [ImageKit](https://imagekit.io/)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/electronica.git
cd electronica

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
Editar .env con tus credenciales:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tu-id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=tu-public-key
# 4. Ejecutar el esquema de base de datos
# Ejecutar el contenido de supabase-schema.sql en el SQL Editor de Supabase

# 5. Iniciar servidor de desarrollo
npm run dev
Abrir http://localhost:3000 (http://localhost:3000) en el navegador.
Comandos
Comando
npm run dev
npm run build
npm run start
npm run lint
Estructura del proyecto
app/
├── (public)/          # Rutas públicas (catálogo, carrito, pago)
│   ├── page.tsx       # Página de inicio
│   ├── catalogo/      # Catálogo de productos
│   └── carrito/       # Carrito y pago con QR
├── admin/             # Panel administrativo
│   ├── productos/     # CRUD de productos
│   ├── categorias/    # CRUD de categorías
│   ├── pedidos/       # Gestión de pedidos
│   └── dashboard/     # Estadísticas
└── api/               # API routes (checkout, admin, upload)
components/            # Componentes compartidos
lib/                   # Utilidades y consultas Supabase
public/                # Archivos estáticos