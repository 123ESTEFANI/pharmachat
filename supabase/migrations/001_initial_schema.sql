-- PharmaChat Database Schema
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de usuarios (perfiles)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'user' CHECK (rol IN ('admin', 'user')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  principio_activo TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT '',
  presentacion TEXT NOT NULL DEFAULT '',
  dosis_adulta TEXT NOT NULL DEFAULT '',
  dosis_pediatrica TEXT NOT NULL DEFAULT '',
  contraindicaciones TEXT NOT NULL DEFAULT '',
  efectos_secundarios TEXT NOT NULL DEFAULT '',
  interacciones TEXT NOT NULL DEFAULT '',
  indicaciones TEXT NOT NULL DEFAULT '',
  imagen_url TEXT NOT NULL DEFAULT '',
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Tabla de version de la app
CREATE TABLE IF NOT EXISTS app_version (
  id INTEGER PRIMARY KEY DEFAULT 1,
  version TEXT NOT NULL DEFAULT '1.0.0',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar version inicial
INSERT INTO app_version (id, version, updated_at) VALUES (1, '1.0.0', now())
ON CONFLICT (id) DO NOTHING;

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_medicamentos_nombre ON medicamentos(nombre);
CREATE INDEX IF NOT EXISTS idx_medicamentos_categoria ON medicamentos(categoria);
CREATE INDEX IF NOT EXISTS idx_medicamentos_activo ON medicamentos(activo);
CREATE INDEX IF NOT EXISTS idx_medicamentos_principio ON medicamentos(principio_activo);

-- Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_version ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Admins pueden actualizar usuarios" ON usuarios
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas para medicamentos (todos los autenticados pueden leer)
CREATE POLICY "Usuarios autenticados pueden leer medicamentos" ON medicamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden insertar medicamentos" ON medicamentos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Solo admins pueden actualizar medicamentos" ON medicamentos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas para version (todos pueden leer, solo admins actualizar)
CREATE POLICY "Todos pueden leer la version" ON app_version
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden actualizar version" ON app_version
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Solo admins pueden insertar version" ON app_version
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Función para crear perfil de usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol, activo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'user'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
