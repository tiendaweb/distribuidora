# Checklist visual mínima (Admin)

Plantilla base adoptada: **Flowbite Dashboard** (MIT), usada como referencia para estructura simple con sidebar, topbar, cards, tablas y formularios.

## Facturación (`admin/facturacion.php`)
- [ ] Botones primarios/secundarios con mismo radio, peso tipográfico y altura visual.
- [ ] Inputs de cliente y búsqueda con foco visible (`focus:ring`) y contraste AA.
- [ ] Tabla/listado de productos conserva hover consistente en filas o ítems.
- [ ] Botones de acción (`Guardar`, `Imprimir`) muestran estados `hover`, `focus` y `disabled` distinguibles.
- [ ] El total de caja mantiene contraste alto en desktop y móvil.

## Pedidos (`admin/pedidos.php`)
- [ ] Encabezado de sección alineado con el shell (título/subtítulo/acciones).
- [ ] Tabla con espaciado homogéneo en `th/td` y jerarquía visual de cabecera.
- [ ] Filas con hover uniforme y legibilidad en pantallas chicas (scroll horizontal controlado).
- [ ] Botones o enlaces de acción con estilo consistente con el resto del admin.
- [ ] Estados vacíos/cargando/error mantienen contraste y tipografía consistente.

## Stock (`admin/stock.php`)
- [ ] CTA `+ Nuevo producto` usa tokens globales (color, radio, sombra, foco).
- [ ] Inputs numéricos y de texto conservan la misma altura y borde.
- [ ] Tabla de inventario respeta mismas reglas de hover, padding y alineación que Pedidos.
- [ ] Acciones por fila presentan feedback de interacción (`hover/focus/disabled`).
- [ ] Columna de precios y stock mantiene legibilidad y contraste en todos los breakpoints.
