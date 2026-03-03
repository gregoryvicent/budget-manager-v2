# Documento de Requisitos

## Introducción

El Manejador de Presupuestos es una aplicación web diseñada para proporcionar una interfaz visual clara, minimalista y amigable que permita a los usuarios gestionar sus presupuestos personales u organizacionales. Esta primera fase se enfoca exclusivamente en la creación de la interfaz gráfica (UI) sin funcionalidad backend, estableciendo las bases visuales y de experiencia de usuario para futuras iteraciones funcionales.

## Glosario

- **Sistema**: La aplicación web Budget Manager
- **Usuario**: Persona que interactúa con la interfaz del manejador de presupuestos
- **Presupuesto**: Entidad visual que representa un plan financiero con categorías e importes en dólares estadounidenses (USD)
- **Categoría**: Agrupación visual de gastos o ingresos dentro de un presupuesto
- **Dashboard**: Pantalla principal que muestra el resumen visual del presupuesto
- **Componente UI**: Elemento visual reutilizable de la interfaz (botón, tarjeta, formulario, etc.)
- **USD**: Dólar estadounidense, única moneda utilizada en esta iteración del sistema

## Requisitos

### Requisito 1

**Historia de Usuario:** Como usuario, quiero ver un dashboard principal limpio y organizado con métricas financieras clave, para que pueda comprender rápidamente el estado de mi presupuesto.

#### Criterios de Aceptación

1. CUANDO el Usuario accede a la página principal, ENTONCES el Sistema DEBERÁ mostrar un dashboard con diseño minimalista usando la paleta de colores (#F6F0D7, #C5D89D, #9CAB84, #89986D)
2. CUANDO el dashboard se renderiza, ENTONCES el Sistema DEBERÁ mostrar las siguientes métricas principales en tarjetas destacadas:
   - Total de Ingresos del Mes
   - Total de Gastos del Mes
   - Porcentaje del Ingreso Mensual Usado
   - Porcentaje del Ingreso Mensual Destinado a Gastos Fijos
   - Porcentaje del Ingreso Mensual Destinado a Gastos Totales (Fijos + Variables)
3. CUANDO el Usuario visualiza el dashboard en diferentes tamaños de pantalla, ENTONCES el Sistema DEBERÁ adaptar el diseño de forma responsiva manteniendo la legibilidad
4. CUANDO el dashboard muestra información, ENTONCES el Sistema DEBERÁ organizar los elementos usando una jerarquía visual clara con tipografía legible y espaciado generoso

### Requisito 2

**Historia de Usuario:** Como usuario, quiero ver secciones organizadas de fuentes de ingresos, gastos mensuales y gastos variables, para que pueda identificar rápidamente cada área financiera.

#### Criterios de Aceptación

1. CUANDO el dashboard muestra categorías, ENTONCES el Sistema DEBERÁ organizar la información en tres secciones principales:
   - **Fuentes de Ingresos**: Lista de fuentes con nombre y monto en dólares estadounidenses (USD)
   - **Gastos Mensuales Fijos**: Lista de gastos recurrentes con nombre y monto en dólares estadounidenses (USD)
   - **Gastos Variables del Mes**: Lista de gastos no recurrentes con nombre y monto en dólares estadounidenses (USD)
2. CUANDO una sección se muestra, ENTONCES el Sistema DEBERÁ renderizarla como una tarjeta con fondo suave (#F6F0D7 o #C5D89D), bordes redondeados y sombras sutiles
3. CUANDO el Usuario visualiza una lista de items, ENTONCES el Sistema DEBERÁ mostrar cada item con su nombre y valor en dólares estadounidenses (formato: $X,XXX.XX) alineados claramente
4. CUANDO múltiples secciones se muestran, ENTONCES el Sistema DEBERÁ organizarlas en una cuadrícula responsiva con espaciado uniforme y totales claramente visibles

### Requisito 3

**Historia de Usuario:** Como usuario, quiero ver representaciones visuales de datos mediante tarjetas de métricas destacadas, para que pueda entender mejor el estado financiero de un vistazo.

#### Criterios de Aceptación

1. CUANDO el dashboard incluye métricas principales, ENTONCES el Sistema DEBERÁ mostrar tarjetas destacadas con:
   - Título descriptivo de la métrica
   - Valor principal en tamaño grande y legible
   - Valor secundario o comparativo cuando aplique
   - Código de color según el tipo de métrica (ingresos: #C5D89D, gastos: tonos neutros, ahorros: #9CAB84, alertas: derivados de #89986D)
2. CUANDO una tarjeta de métrica se renderiza, ENTONCES el Sistema DEBERÁ usar fondos diferenciados con la paleta de colores para facilitar la identificación visual rápida
3. CUANDO el Usuario visualiza métricas de porcentaje, ENTONCES el Sistema DEBERÁ incluir indicadores visuales (barras de progreso o círculos) además del valor numérico
4. CUANDO las tarjetas se muestran en dispositivos móviles, ENTONCES el Sistema DEBERÁ reorganizarlas en una columna manteniendo la jerarquía visual y legibilidad

### Requisito 4

**Historia de Usuario:** Como usuario, quiero ver una sección de variables adicionales con información complementaria, para que pueda tener acceso rápido a datos auxiliares del presupuesto.

#### Criterios de Aceptación

1. CUANDO el dashboard incluye variables adicionales, ENTONCES el Sistema DEBERÁ mostrar una sección separada con formato de tabla o lista que incluya variables auxiliares del presupuesto
2. CUANDO la sección de variables se renderiza, ENTONCES el Sistema DEBERÁ usar un fondo diferenciado (ej: #F6F0D7) con bordes sutiles
3. CUANDO los valores se muestran, ENTONCES el Sistema DEBERÁ formatear los números apropiadamente según su tipo (moneda USD, porcentaje, número entero)
4. CUANDO el Usuario visualiza esta sección, ENTONCES el Sistema DEBERÁ posicionarla de manera accesible sin interferir con las métricas principales del dashboard

### Requisito 5

**Historia de Usuario:** Como usuario, quiero que la información esté organizada en un layout claro con secciones bien definidas, para que pueda explorar todas las áreas del presupuesto de manera intuitiva.

#### Criterios de Aceptación

1. CUANDO el Usuario accede al dashboard, ENTONCES el Sistema DEBERÁ organizar la información en las siguientes áreas:
   - **Área superior**: Métricas principales (Total Ingresos, Total Gastos, Porcentajes clave)
   - **Área izquierda**: Listas detalladas (Fuentes de Ingresos, Gastos Mensuales Fijos, Gastos Variables)
   - **Área derecha**: Métricas de ahorro (Fondo de Emergencia, Capital de Inversión, Total de Ahorros)
   - **Área inferior**: Variables adicionales y datos complementarios
2. CUANDO cada área se renderiza, ENTONCES el Sistema DEBERÁ usar separadores visuales sutiles (espaciado, bordes ligeros, o cambios de fondo) para delimitar secciones
3. CUANDO el layout se muestra en dispositivos móviles, ENTONCES el Sistema DEBERÁ reorganizar las áreas en una columna vertical manteniendo el orden de prioridad
4. CUANDO el Usuario navega por el dashboard, ENTONCES el Sistema DEBERÁ mantener la coherencia visual y espaciado consistente entre todas las secciones

### Requisito 6

**Historia de Usuario:** Como usuario, quiero ver indicadores visuales de progreso o estado con métricas de ahorro y capital, para que pueda entender visualmente el uso del presupuesto y mi capacidad de ahorro.

#### Criterios de Aceptación

1. CUANDO el dashboard muestra información de progreso, ENTONCES el Sistema DEBERÁ incluir las siguientes métricas financieras en dólares estadounidenses (USD):
   - **Fondo de Emergencia**: Monto actual en USD, meta en USD, porcentaje de ahorro para el fondo, y porcentaje de ahorro para el fondo de emergencias
   - **Capital de Inversión**: Monto actual en USD, meta en USD, porcentaje de ahorro para capital de inversión, y porcentaje de ahorro para capital de inversión
   - **Total de Ahorros**: Monto total acumulado en USD
2. CUANDO un indicador de progreso se renderiza, ENTONCES el Sistema DEBERÁ usar colores de la paleta que representen diferentes estados:
   - Normal: #C5D89D o #9CAB84
   - Advertencia: tonos cálidos derivados de #C5D89D
   - Crítico o destacado: #89986D o tonos más oscuros
3. CUANDO el indicador muestra porcentajes, ENTONCES el Sistema DEBERÁ incluir etiquetas numéricas legibles junto a la representación visual con formato decimal (ej: 11.80, 43.41%)
4. CUANDO múltiples indicadores se muestran, ENTONCES el Sistema DEBERÁ organizarlos en tarjetas con fondos diferenciados y mantener un tamaño y estilo consistente

### Requisito 7

**Historia de Usuario:** Como usuario, quiero que la interfaz use una paleta de colores armoniosa y profesional, para que pueda usar la aplicación cómodamente con un diseño visualmente atractivo.

#### Criterios de Aceptación

1. CUANDO el Usuario accede a la aplicación, ENTONCES el Sistema DEBERÁ aplicar la siguiente paleta de colores principal:
   - **#F6F0D7**: Color base claro para fondos y áreas principales
   - **#C5D89D**: Color secundario para tarjetas y elementos destacados
   - **#9CAB84**: Color de acento para elementos interactivos y estados hover
   - **#89986D**: Color oscuro para textos, bordes y elementos de contraste
2. CUANDO elementos interactivos se muestran, ENTONCES el Sistema DEBERÁ usar transiciones suaves entre los tonos de la paleta para estados hover y activo
3. CUANDO se necesita indicar estados (normal, advertencia, éxito), ENTONCES el Sistema DEBERÁ derivar variaciones de la paleta base manteniendo la armonía visual
4. CUANDO el texto se muestra sobre fondos de color, ENTONCES el Sistema DEBERÁ garantizar suficiente contraste para cumplir con estándares de accesibilidad (WCAG AA mínimo)

### Requisito 8

**Historia de Usuario:** Como usuario, quiero ver datos de ejemplo realistas en la interfaz basados en un presupuesto real, para que pueda visualizar cómo se verá la aplicación con información real.

#### Criterios de Aceptación

1. CUANDO la interfaz se renderiza, ENTONCES el Sistema DEBERÁ mostrar datos de ejemplo que incluyan:
   - **Fuentes de Ingresos**: Salario (ENCU), Aguinaldo, Bono, Ingreso 1, Ingreso 2, Ingreso 3, Ingreso 4, Ingreso 5, Ingreso 6, Ingreso 7, Ingreso 8, Ingreso 9, Ingreso 10, Otros
   - **Gastos Mensuales Fijos**: Renta (Apartamento), Electricidad, Internet, Comida para la casa, Donación, Proyecciones para calefón de la vivienda
   - **Gastos Variables**: Herramientas para equipo de voleibol, Pago al instructor de VB, etc.
2. CUANDO los datos de ejemplo se muestran, ENTONCES el Sistema DEBERÁ incluir valores numéricos realistas en formato de moneda USD con el formato $X,XXX.XX (ej: $850.00, $1,416.00, $2,265.66)
3. CUANDO las tarjetas muestran información, ENTONCES el Sistema DEBERÁ mostrar cada item con su nombre y valor en dólares estadounidenses únicamente
4. CUANDO los totales se calculan, ENTONCES el Sistema DEBERÁ mostrar sumas precisas en formato USD (ej: Total Ingresos: $1,416.00; Total Gastos Fijos: $509.22; Total Gastos Variables: $75.00)
