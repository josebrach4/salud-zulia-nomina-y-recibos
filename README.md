# 📋 Sistema de Recibos de Pago de Utilidades - Plan Médico Salud Zulia, C.A.

Aplicación web profesional para la emisión, consulta e impresión de **Recibos de Pago de Utilidades** para el personal de **Plan Médico Salud Zulia, C.A.**

---

## 🌟 Características Principales

1. **Formato Exacto y Oficial**:
   - Encabezado con datos fiscales (RIF `J 29767801-8`, dirección en Sabaneta, Maracaibo).
   - Recuadro de datos del trabajador (Cédula, Cargo, Departamento, Fecha de Ingreso, Salario Mensual, Salario Diario, Período).
   - Tabla detallada de conceptos: Asignación por **45 días de Utilidades**, Deducción legal **INCES 0.5%**, Total Asignaciones, Total Deducciones y **Neto a Cobrar en Bs.**
   - Espacio legal de recibí conforme y firma del trabajador.

2. **Acceso Universal en Cualquier Dispositivo**:
   - Totalmente responsive: funciona en computadoras, laptops, tablets y teléfonos móviles.
   - Búsqueda en tiempo real por nombre, número de cédula o cargo.
   - Filtro por departamento (Hospitalización, Emergencia, Quirófano, Laboratorio, Imagenología, etc.).

3. **Impresión Optimizada y Descarga en PDF**:
   - **Impresión Individual**: Con un solo clic se imprime el recibo actual o se guarda en PDF sin márgenes rotos ni menús de la web.
   - **Impresión Masiva (Lote)**: Permite seleccionar toda la nómina o un grupo específico e imprimir todos los recibos con salto de página automático entre cada uno.

4. **Enlaces Directos por Cédula**:
   - Cada empleado puede ver su recibo directamente usando su cédula en el enlace:
     `https://tu-app.vercel.app/?ci=22174172`
   - O usando el botón "Compartir Enlace" en la interfaz.

5. **Sincronización con Google Sheets**:
   - Viene con los 304 trabajadores precargados.
   - Incluye botón para refrescar en vivo con el Google Sheet de nómina o subir un archivo `.csv` nuevo.

---

## 🚀 Despliegue en Vercel (Paso a Paso)

### Opción 1: Conectar con GitHub (Recomendado y más fácil)
1. Sube este proyecto a tu repositorio de **GitHub**.
2. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Selecciona el repositorio de la aplicación.
5. Vercel detectará la configuración automáticamente (`Vite`).
6. Haz clic en **"Deploy"**. En 1 minuto tendrás la aplicación en internet accesible por cualquier persona.

### Opción 2: Despliegue directo con Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 💻 Ejecución Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
