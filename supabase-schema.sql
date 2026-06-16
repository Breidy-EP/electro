-- ============================================================
-- ELECTRO_CORE - Esquema de Base de Datos para Supabase
-- Todos los nombres en español
-- ============================================================

-- 1. CATEGORÍAS
create table categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  descripcion text,
  icono       text,
  creado_en   timestamptz not null default now()
);

-- 2. PRODUCTOS
create table productos (
  id                uuid primary key default gen_random_uuid(),
  sku               text not null unique,
  nombre            text not null,
  slug              text not null unique,
  descripcion       text,
  categoria_id      uuid not null references categorias(id),
  precio            numeric(10,2) not null check (precio >= 0),
  precio_original   numeric(10,2) check (precio_original >= 0),
  costo             numeric(10,2) check (costo >= 0),
  stock             integer not null default 0 check (stock >= 0),
  stock_minimo      integer not null default 5,
  visible           boolean not null default true,
  destacado         boolean not null default false,
  meta_titulo       text,
  meta_descripcion  text,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

-- 3. IMÁGENES DE PRODUCTOS
create table imagenes_producto (
  id            uuid primary key default gen_random_uuid(),
  producto_id   uuid not null references productos(id) on delete cascade,
  url           text not null,
  texto_alt     text,
  orden         integer not null default 0,
  creado_en     timestamptz not null default now()
);

-- 4. ESPECIFICACIONES TÉCNICAS
create table especificaciones (
  id            uuid primary key default gen_random_uuid(),
  producto_id   uuid not null references productos(id) on delete cascade,
  atributo      text not null,
  valor         text not null,
  orden         integer not null default 0
);

-- 5. ETIQUETAS
create table etiquetas (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null unique,
  slug    text not null unique,
  color   text not null default '#4d8eff'
);

-- 6. RELACIÓN PRODUCTO-ETIQUETA
create table productos_etiquetas (
  producto_id uuid not null references productos(id) on delete cascade,
  etiqueta_id uuid not null references etiquetas(id) on delete cascade,
  primary key (producto_id, etiqueta_id)
);

-- 7. CLIENTES
create table clientes (
  id                uuid primary key default gen_random_uuid(),
  usuario_auth_id   uuid unique references auth.users(id) on delete cascade,
  email             text not null unique,
  nombre_completo   text not null,
  telefono          text,
  es_admin          boolean not null default false,
  creado_en         timestamptz not null default now()
);

-- 8. DIRECCIONES
create table direcciones (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references clientes(id) on delete cascade,
  etiqueta        text not null default 'Principal',
  calle           text not null,
  ciudad          text not null,
  departamento    text,
  codigo_postal   text,
  pais            text not null default 'Bolivia',
  es_principal    boolean not null default false,
  creado_en       timestamptz not null default now()
);

-- 9. ÓRDENES
create table ordenes (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references clientes(id),
  estado              text not null default 'pendiente'
                      check (estado in ('pendiente','confirmada','procesando','enviada','entregada','cancelada')),
  subtotal            numeric(10,2) not null,
  impuesto            numeric(10,2) not null,
  costo_envio         numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  metodo_envio        text not null default 'estandar',
  direccion_id        uuid references direcciones(id),
  notas               text,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

-- 10. DETALLE DE ÓRDENES
create table detalle_orden (
  id              uuid primary key default gen_random_uuid(),
  orden_id        uuid not null references ordenes(id) on delete cascade,
  producto_id     uuid not null references productos(id),
  producto_nombre text not null,
  producto_sku    text not null,
  precio_unitario numeric(10,2) not null,
  cantidad        integer not null check (cantidad > 0),
  subtotal        numeric(10,2) not null
);

-- 11. CARRITO
create table carrito (
  id              uuid primary key default gen_random_uuid(),
  sesion_id       text,
  cliente_id      uuid references clientes(id) on delete cascade,
  producto_id     uuid not null references productos(id) on delete cascade,
  cantidad        integer not null default 1 check (cantidad > 0),
  creado_en       timestamptz not null default now(),
  constraint dueño_check check (
    (sesion_id is not null and cliente_id is null)
    or (sesion_id is null and cliente_id is not null)
  )
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_productos_categoria on productos(categoria_id);
create index idx_productos_slug on productos(slug);
create index idx_productos_sku on productos(sku);
create index idx_imagenes_producto on imagenes_producto(producto_id);
create index idx_especificaciones_producto on especificaciones(producto_id);
create index idx_ordenes_cliente on ordenes(cliente_id);
create index idx_ordenes_estado on ordenes(estado);
create index idx_detalle_orden on detalle_orden(orden_id);
create index idx_carrito_sesion on carrito(sesion_id);
create index idx_carrito_cliente on carrito(cliente_id);

-- ============================================================
-- TRIGGER: actualizado_en automático
-- ============================================================
create or replace function actualizar_timestamp()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_productos_actualizado
  before update on productos
  for each row execute function actualizar_timestamp();

create trigger trg_ordenes_actualizado
  before update on ordenes
  for each row execute function actualizar_timestamp();

-- ============================================================
-- DATOS INICIALES
-- ============================================================
insert into categorias (nombre, slug, descripcion, icono) values
  ('Microcontroladores', 'microcontroladores', 'Placas de desarrollo, microcontroladores y módulos de computación', '🔵'),
  ('Sensores', 'sensores', 'Sensores de temperatura, distancia, movimiento y más', '📡'),
  ('Pantallas OLED/LCD', 'pantallas', 'Pantallas OLED, LCD, TFT para visualización de datos', '🖥️'),
  ('Motores y Drivers', 'motores', 'Motores paso a paso, servomotores y controladores', '⚙️'),
  ('Inalámbricos', 'inalambricos', 'Módulos WiFi, Bluetooth, RF y comunicación inalámbrica', '📟'),
  ('Pasivos', 'pasivos', 'Resistencias, condensadores, transistores, LEDs y componentes básicos', '🔧');

insert into etiquetas (nombre, slug, color) values
  ('NUEVO', 'nuevo', '#4d8eff'),
  ('OFERTA', 'oferta', '#ff6b6b'),
  ('BAJO STOCK', 'bajo-stock', '#fbbf24');

insert into productos (sku, nombre, slug, descripcion, categoria_id, precio, precio_original, stock, stock_minimo, destacado) values
  ('MCU-ARD-U3', 'Arduino Uno R3 Original', 'arduino-uno-r3-original', 'La placa de desarrollo estándar de la industria, ideal para prototipado rápido y aprendizaje electrónico.', (select id from categorias where slug = 'microcontroladores'), 24.95, null, 50, 10, true),
  ('SNR-US-04', 'Sensor Ultrasónico HC-SR04', 'sensor-ultrasonico-hc-sr04', 'Sensor de proximidad de alta precisión para medición de distancia de 2cm a 400cm.', (select id from categorias where slug = 'sensores'), 4.50, null, 100, 20, true),
  ('DSP-OL-96', 'Pantalla OLED 0.96" I2C', 'pantalla-oled-096-i2c', 'Pantalla monocromática de alto contraste (128x64 píxeles) perfecta para interfaces compactas.', (select id from categorias where slug = 'pantallas'), 8.90, null, 40, 10, true),
  ('MOT-NM-17', 'Motor Paso a Paso NEMA 17', 'motor-paso-a-paso-nema-17', 'Motor de alta torsión ideal para impresoras 3D, máquinas CNC y robótica de precisión.', (select id from categorias where slug = 'motores'), 18.25, null, 8, 10, true),
  ('PAS-RES-KIT', 'Pack Resistencias 1% (200u)', 'pack-resistencias-1-200u', 'Surtido de resistencias de película metálica de precisión con tolerancia del 1%.', (select id from categorias where slug = 'pasivos'), 10.20, 12.00, 75, 15, true),
  ('MCU-ESP-32D', 'ESP32 DevKit V1 Wi-Fi + BT', 'esp32-devkit-v1-wifi-bt', 'Potente microcontrolador con conectividad integrada para proyectos IoT avanzados.', (select id from categorias where slug = 'inalambricos'), 12.50, null, 60, 10, true),
  ('PRO-BB-830', 'Breadboard 830 Puntos', 'breadboard-830-puntos', 'Base de prototipado sin soldadura con 830 puntos de conexión para montajes rápidos.', (select id from categorias where slug = 'microcontroladores'), 6.75, null, 90, 15, false),
  ('SNR-DHT-22', 'Sensor DHT22 Temperatura/Humedad', 'sensor-dht22-temperatura-humedad', 'Sensor digital de alta precisión para temperatura (±0.5°C) y humedad relativa (±2%).', (select id from categorias where slug = 'sensores'), 7.20, null, 45, 10, false),
  ('PWR-XL-6019', 'Convertidor Step-Down XL6019 5A', 'convertidor-step-down-xl6019-5a', 'Regulador DC-DC ajustable de alta eficiencia con protección contra sobrecorriente.', (select id from categorias where slug = 'motores'), 9.00, 11.25, 30, 10, false),
  ('PAS-JMP-KIT', 'Kit Cables Jumper Premium (120u)', 'kit-cables-jumper-premium-120u', 'Surtido de cables dupont macho-hembra, macho-macho y hembra-hembra en varios colores.', (select id from categorias where slug = 'pasivos'), 5.50, null, 120, 20, false),
  ('PAS-LED-5MM', 'LEDs 5mm Surtido (100u)', 'leds-5mm-surtido-100u', 'Pack de 100 LEDs de 5mm en colores rojo, verde, amarillo, azul y blanco.', (select id from categorias where slug = 'pasivos'), 3.80, null, 15, 20, false),
  ('PAS-POT-10K', 'Potenciómetro 10KΩ Lineal (5u)', 'potenciometro-10k-lineal-5u', 'Potenciómetros lineares de precisión para ajuste de voltaje y control de señales analógicas.', (select id from categorias where slug = 'pasivos'), 2.40, null, 200, 30, false),
  ('MOT-SR-MG95', 'Servo Motor MG995 Metal Gear', 'servo-motor-mg995-metal-gear', 'Servo motor de metal de alta torsión (10kg·cm) para robótica, brazos mecánicos y proyectos DIY.', (select id from categorias where slug = 'motores'), 14.90, null, 25, 10, false),
  ('PAS-BC-547', 'Transistor BC547 NPN (10u)', 'transistor-bc547-npn-10u', 'Transistores bipolares NPN de propósito general ideales para amplificación y conmutación.', (select id from categorias where slug = 'pasivos'), 1.50, null, 500, 50, false);

insert into imagenes_producto (producto_id, url, orden) values
  ((select id from productos where sku = 'MCU-ARD-U3'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/arduino-uno-r3.png', 0),
  ((select id from productos where sku = 'SNR-US-04'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/hc-sr04-ultrasonic.png', 0),
  ((select id from productos where sku = 'DSP-OL-96'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/oled-display-096.png', 0),
  ((select id from productos where sku = 'MOT-NM-17'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/nema17-stepper.png', 0),
  ((select id from productos where sku = 'PAS-RES-KIT'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/resistor-kit.png', 0),
  ((select id from productos where sku = 'MCU-ESP-32D'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/esp32-devkit-v1.png', 0),
  ((select id from productos where sku = 'PRO-BB-830'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/breadboard-830.png', 0),
  ((select id from productos where sku = 'SNR-DHT-22'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/dht22-sensor.png', 0),
  ((select id from productos where sku = 'PWR-XL-6019'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/battery-9v.png', 0),
  ((select id from productos where sku = 'PAS-JMP-KIT'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/kit-arduino.png', 0),
  ((select id from productos where sku = 'PAS-LED-5MM'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/led-5mm-assorted.png', 0),
  ((select id from productos where sku = 'PAS-POT-10K'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/potentiometer-10k.png', 0),
  ((select id from productos where sku = 'MOT-SR-MG95'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/servo-mg995.png', 0),
  ((select id from productos where sku = 'PAS-BC-547'), 'https://ik.imagekit.io/uix3ndxd4r/tr:w-400,h-260,q-80,fo-auto/products/transistor-bc547.png', 0);

insert into productos_etiquetas (producto_id, etiqueta_id)
select p.id, e.id
from productos p, etiquetas e
where (p.sku = 'MCU-ARD-U3' and e.slug = 'nuevo')
   or (p.sku = 'PAS-RES-KIT' and e.slug = 'oferta')
   or (p.sku = 'PWR-XL-6019' and e.slug = 'oferta')
   or (p.sku = 'MOT-NM-17' and e.slug = 'bajo-stock')
   or (p.sku = 'PAS-LED-5MM' and e.slug = 'bajo-stock')
   or (p.sku = 'MOT-SR-MG95' and e.slug = 'nuevo');

-- ============================================================
-- SEGURIDAD (ROW LEVEL SECURITY)
-- ============================================================
alter table categorias enable row level security;
alter table productos enable row level security;
alter table imagenes_producto enable row level security;
alter table especificaciones enable row level security;
alter table etiquetas enable row level security;
alter table productos_etiquetas enable row level security;
alter table clientes enable row level security;
alter table direcciones enable row level security;
alter table ordenes enable row level security;
alter table detalle_orden enable row level security;
alter table carrito enable row level security;

create policy "Productos visibles para todos"
  on productos for select
  using (visible = true);

create policy "Categorías visibles para todos"
  on categorias for select
  using (true);

create policy "Imágenes visibles para todos"
  on imagenes_producto for select
  using (true);

create policy "Especificaciones visibles para todos"
  on especificaciones for select
  using (true);

create policy "Etiquetas visibles para todos"
  on etiquetas for select
  using (true);

create policy "Relación producto-etiqueta visible para todos"
  on productos_etiquetas for select
  using (true);

create policy "Cliente ve solo sus datos"
  on clientes for select
  using (auth.uid() = usuario_auth_id);

-- Create admin check function (bypasses RLS via SECURITY DEFINER)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.clientes
    where usuario_auth_id = auth.uid() and es_admin = true
  );
$$;

-- Drop recursive policy
drop policy if exists "Admin ve todos los clientes" on public.clientes;

-- Recreate using the security definer function
create policy "Admin ve todos los clientes"
  on public.clientes for select
  using (public.is_admin());

-- Ensure admin@gmail.com exists in clientes table
insert into public.clientes (usuario_auth_id, email, nombre_completo, es_admin)
select id, 'admin@gmail.com', 'Admin', true
from auth.users
where email = 'admin@gmail.com'
  and not exists (select 1 from public.clientes where email = 'admin@gmail.com')
on conflict (email) do update set es_admin = true;

create policy "Cliente ve sus direcciones"
  on direcciones for select
  using (
    cliente_id in (select id from clientes where usuario_auth_id = auth.uid())
    or exists (select 1 from clientes where usuario_auth_id = auth.uid() and es_admin = true)
  );

create policy "Cliente ve sus órdenes"
  on ordenes for select
  using (
    cliente_id in (select id from clientes where usuario_auth_id = auth.uid())
    or exists (select 1 from clientes where usuario_auth_id = auth.uid() and es_admin = true)
  );

create policy "Cliente ve detalle de sus órdenes"
  on detalle_orden for select
  using (
    orden_id in (select id from ordenes where cliente_id in (select id from clientes where usuario_auth_id = auth.uid()))
    or exists (select 1 from clientes where usuario_auth_id = auth.uid() and es_admin = true)
  );

-- ============================================================
-- ADMIN RLS POLICIES (INSERT/UPDATE/DELETE)
-- ============================================================

create policy "Admin gestiona productos"
  on productos for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona categorías"
  on categorias for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona imágenes"
  on imagenes_producto for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona especificaciones"
  on especificaciones for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona etiquetas"
  on etiquetas for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona relación producto-etiqueta"
  on productos_etiquetas for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona clientes"
  on clientes for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona direcciones"
  on direcciones for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona órdenes"
  on ordenes for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona detalle de órdenes"
  on detalle_orden for all using (public.is_admin()) with check (public.is_admin());

create policy "Admin gestiona carrito"
  on carrito for all using (public.is_admin()) with check (public.is_admin());

-- Admin can see all productos (not just visible)
drop policy if exists "Admin ve todos los productos" on productos;
create policy "Admin ve todos los productos"
  on productos for select using (public.is_admin());
