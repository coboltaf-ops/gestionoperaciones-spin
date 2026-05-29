const XLSX = require('xlsx');
const path = require('path');

// 100 productos de construcción de apartamentos
const productos = [
  // ===== ESTRUCTURA (1-15) =====
  { codigo: "PROD-00001", categoria: "Estructura", grupo: "Concreto", subgrupo: "Cemento", descripcion: "Cemento Portland Tipo I 42.5 kg", unidad: "Saco", costo: 350, maximo: 500, minimo: 50 },
  { codigo: "PROD-00002", categoria: "Estructura", grupo: "Concreto", subgrupo: "Cemento", descripcion: "Cemento Blanco 42.5 kg", unidad: "Saco", costo: 580, maximo: 100, minimo: 10 },
  { codigo: "PROD-00003", categoria: "Estructura", grupo: "Concreto", subgrupo: "Agregados", descripcion: "Arena Lavada de Río", unidad: "Metro Cúbico", costo: 1200, maximo: 200, minimo: 20 },
  { codigo: "PROD-00004", categoria: "Estructura", grupo: "Concreto", subgrupo: "Agregados", descripcion: "Gravilla 3/4 pulgada", unidad: "Metro Cúbico", costo: 1400, maximo: 200, minimo: 20 },
  { codigo: "PROD-00005", categoria: "Estructura", grupo: "Concreto", subgrupo: "Aditivos", descripcion: "Aditivo Plastificante para Concreto 20L", unidad: "Galón", costo: 2800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00006", categoria: "Estructura", grupo: "Acero", subgrupo: "Varillas", descripcion: "Varilla Corrugada 3/8\" (10mm) 6m", unidad: "Unidad", costo: 185, maximo: 2000, minimo: 200 },
  { codigo: "PROD-00007", categoria: "Estructura", grupo: "Acero", subgrupo: "Varillas", descripcion: "Varilla Corrugada 1/2\" (12mm) 6m", unidad: "Unidad", costo: 320, maximo: 2000, minimo: 200 },
  { codigo: "PROD-00008", categoria: "Estructura", grupo: "Acero", subgrupo: "Varillas", descripcion: "Varilla Corrugada 5/8\" (16mm) 6m", unidad: "Unidad", costo: 510, maximo: 1000, minimo: 100 },
  { codigo: "PROD-00009", categoria: "Estructura", grupo: "Acero", subgrupo: "Varillas", descripcion: "Varilla Corrugada 3/4\" (20mm) 6m", unidad: "Unidad", costo: 780, maximo: 500, minimo: 50 },
  { codigo: "PROD-00010", categoria: "Estructura", grupo: "Acero", subgrupo: "Alambre", descripcion: "Alambre de Amarre #18 (1kg)", unidad: "Kilogramo", costo: 65, maximo: 500, minimo: 50 },
  { codigo: "PROD-00011", categoria: "Estructura", grupo: "Bloques", subgrupo: "Bloques Cemento", descripcion: "Bloque de Cemento 6\" (15x20x40)", unidad: "Unidad", costo: 38, maximo: 5000, minimo: 500 },
  { codigo: "PROD-00012", categoria: "Estructura", grupo: "Bloques", subgrupo: "Bloques Cemento", descripcion: "Bloque de Cemento 8\" (20x20x40)", unidad: "Unidad", costo: 48, maximo: 5000, minimo: 500 },
  { codigo: "PROD-00013", categoria: "Estructura", grupo: "Bloques", subgrupo: "Ladrillos", descripcion: "Ladrillo Rojo Común 6x12x24", unidad: "Unidad", costo: 12, maximo: 10000, minimo: 1000 },
  { codigo: "PROD-00014", categoria: "Estructura", grupo: "Concreto", subgrupo: "Premezclado", descripcion: "Concreto Premezclado 3000 PSI", unidad: "Metro Cúbico", costo: 6500, maximo: 100, minimo: 10 },
  { codigo: "PROD-00015", categoria: "Estructura", grupo: "Acero", subgrupo: "Malla", descripcion: "Malla Electrosoldada 4mm 2.35x6m", unidad: "Unidad", costo: 1850, maximo: 200, minimo: 20 },

  // ===== ACABADOS - PISOS (16-28) =====
  { codigo: "PROD-00016", categoria: "Acabados", grupo: "Pisos", subgrupo: "Cerámica", descripcion: "Cerámica Piso 45x45 Beige", unidad: "Metro Cuadrado", costo: 280, maximo: 1000, minimo: 100 },
  { codigo: "PROD-00017", categoria: "Acabados", grupo: "Pisos", subgrupo: "Cerámica", descripcion: "Cerámica Piso 45x45 Gris", unidad: "Metro Cuadrado", costo: 280, maximo: 1000, minimo: 100 },
  { codigo: "PROD-00018", categoria: "Acabados", grupo: "Pisos", subgrupo: "Porcelanato", descripcion: "Porcelanato 60x60 Mármol Blanco", unidad: "Metro Cuadrado", costo: 650, maximo: 500, minimo: 50 },
  { codigo: "PROD-00019", categoria: "Acabados", grupo: "Pisos", subgrupo: "Porcelanato", descripcion: "Porcelanato 60x60 Madera Roble", unidad: "Metro Cuadrado", costo: 720, maximo: 500, minimo: 50 },
  { codigo: "PROD-00020", categoria: "Acabados", grupo: "Pisos", subgrupo: "Porcelanato", descripcion: "Porcelanato 80x80 Gris Pulido", unidad: "Metro Cuadrado", costo: 890, maximo: 300, minimo: 30 },
  { codigo: "PROD-00021", categoria: "Acabados", grupo: "Pisos", subgrupo: "Adhesivos", descripcion: "Pegamento para Cerámica 20kg", unidad: "Saco", costo: 220, maximo: 300, minimo: 30 },
  { codigo: "PROD-00022", categoria: "Acabados", grupo: "Pisos", subgrupo: "Adhesivos", descripcion: "Pegamento para Porcelanato 20kg", unidad: "Saco", costo: 380, maximo: 200, minimo: 20 },
  { codigo: "PROD-00023", categoria: "Acabados", grupo: "Pisos", subgrupo: "Juntas", descripcion: "Boquilla/Fragua Gris 2kg", unidad: "Unidad", costo: 85, maximo: 200, minimo: 20 },
  { codigo: "PROD-00024", categoria: "Acabados", grupo: "Pisos", subgrupo: "Juntas", descripcion: "Boquilla/Fragua Blanca 2kg", unidad: "Unidad", costo: 95, maximo: 200, minimo: 20 },

  // ===== ACABADOS - PAREDES (25-35) =====
  { codigo: "PROD-00025", categoria: "Acabados", grupo: "Paredes", subgrupo: "Cerámica", descripcion: "Cerámica Pared 25x40 Blanca Brillante", unidad: "Metro Cuadrado", costo: 240, maximo: 800, minimo: 80 },
  { codigo: "PROD-00026", categoria: "Acabados", grupo: "Paredes", subgrupo: "Cerámica", descripcion: "Cerámica Pared 25x40 Decorada Baño", unidad: "Metro Cuadrado", costo: 350, maximo: 400, minimo: 40 },
  { codigo: "PROD-00027", categoria: "Acabados", grupo: "Paredes", subgrupo: "Empañete", descripcion: "Empañete Fino Interior 40kg", unidad: "Saco", costo: 280, maximo: 300, minimo: 30 },
  { codigo: "PROD-00028", categoria: "Acabados", grupo: "Paredes", subgrupo: "Empañete", descripcion: "Empañete Grueso Exterior 40kg", unidad: "Saco", costo: 250, maximo: 300, minimo: 30 },
  { codigo: "PROD-00029", categoria: "Acabados", grupo: "Paredes", subgrupo: "Sheetrock", descripcion: "Placa de Yeso (Sheetrock) 4x8 pies", unidad: "Unidad", costo: 520, maximo: 300, minimo: 30 },
  { codigo: "PROD-00030", categoria: "Acabados", grupo: "Paredes", subgrupo: "Sheetrock", descripcion: "Perfil Metálico para Sheetrock 3m", unidad: "Unidad", costo: 145, maximo: 500, minimo: 50 },
  { codigo: "PROD-00031", categoria: "Acabados", grupo: "Paredes", subgrupo: "Sheetrock", descripcion: "Cinta para Juntas Sheetrock 75m", unidad: "Rollo", costo: 120, maximo: 100, minimo: 10 },

  // ===== ACABADOS - PINTURA (32-40) =====
  { codigo: "PROD-00032", categoria: "Acabados", grupo: "Pintura", subgrupo: "Interior", descripcion: "Pintura Latex Interior Blanca 5 Gal", unidad: "Cubeta", costo: 2200, maximo: 100, minimo: 10 },
  { codigo: "PROD-00033", categoria: "Acabados", grupo: "Pintura", subgrupo: "Interior", descripcion: "Pintura Latex Interior Beige 5 Gal", unidad: "Cubeta", costo: 2350, maximo: 80, minimo: 8 },
  { codigo: "PROD-00034", categoria: "Acabados", grupo: "Pintura", subgrupo: "Exterior", descripcion: "Pintura Acrílica Exterior Blanca 5 Gal", unidad: "Cubeta", costo: 3100, maximo: 60, minimo: 6 },
  { codigo: "PROD-00035", categoria: "Acabados", grupo: "Pintura", subgrupo: "Imprimación", descripcion: "Primer/Sellador Paredes 5 Gal", unidad: "Cubeta", costo: 1800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00036", categoria: "Acabados", grupo: "Pintura", subgrupo: "Imprimación", descripcion: "Impermeabilizante para Techos 5 Gal", unidad: "Cubeta", costo: 3500, maximo: 40, minimo: 4 },
  { codigo: "PROD-00037", categoria: "Acabados", grupo: "Pintura", subgrupo: "Accesorios", descripcion: "Rodillo de Pintura 9 pulgadas", unidad: "Unidad", costo: 180, maximo: 100, minimo: 10 },
  { codigo: "PROD-00038", categoria: "Acabados", grupo: "Pintura", subgrupo: "Accesorios", descripcion: "Brocha 4 pulgadas", unidad: "Unidad", costo: 120, maximo: 100, minimo: 10 },
  { codigo: "PROD-00039", categoria: "Acabados", grupo: "Pintura", subgrupo: "Accesorios", descripcion: "Masilla para Paredes 1 Gal", unidad: "Galón", costo: 450, maximo: 50, minimo: 5 },
  { codigo: "PROD-00040", categoria: "Acabados", grupo: "Pintura", subgrupo: "Accesorios", descripcion: "Lija de Agua #150 (pliego)", unidad: "Unidad", costo: 25, maximo: 500, minimo: 50 },

  // ===== INSTALACIONES ELÉCTRICAS (41-55) =====
  { codigo: "PROD-00041", categoria: "Instalaciones Eléctricas", grupo: "Cableado", subgrupo: "Cables", descripcion: "Cable THHN #12 AWG (rollo 100m)", unidad: "Rollo", costo: 3200, maximo: 50, minimo: 5 },
  { codigo: "PROD-00042", categoria: "Instalaciones Eléctricas", grupo: "Cableado", subgrupo: "Cables", descripcion: "Cable THHN #14 AWG (rollo 100m)", unidad: "Rollo", costo: 2100, maximo: 50, minimo: 5 },
  { codigo: "PROD-00043", categoria: "Instalaciones Eléctricas", grupo: "Cableado", subgrupo: "Cables", descripcion: "Cable THHN #10 AWG (rollo 100m)", unidad: "Rollo", costo: 4800, maximo: 30, minimo: 3 },
  { codigo: "PROD-00044", categoria: "Instalaciones Eléctricas", grupo: "Cableado", subgrupo: "Tubería", descripcion: "Tubo EMT 1/2\" x 3m", unidad: "Unidad", costo: 95, maximo: 500, minimo: 50 },
  { codigo: "PROD-00045", categoria: "Instalaciones Eléctricas", grupo: "Cableado", subgrupo: "Tubería", descripcion: "Tubo EMT 3/4\" x 3m", unidad: "Unidad", costo: 135, maximo: 300, minimo: 30 },
  { codigo: "PROD-00046", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Cajas", descripcion: "Caja Octagonal Metálica 4\"", unidad: "Unidad", costo: 28, maximo: 500, minimo: 50 },
  { codigo: "PROD-00047", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Cajas", descripcion: "Caja Rectangular 2x4 Metálica", unidad: "Unidad", costo: 22, maximo: 500, minimo: 50 },
  { codigo: "PROD-00048", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Interruptores", descripcion: "Interruptor Sencillo 15A", unidad: "Unidad", costo: 65, maximo: 200, minimo: 20 },
  { codigo: "PROD-00049", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Interruptores", descripcion: "Interruptor Doble 15A", unidad: "Unidad", costo: 95, maximo: 200, minimo: 20 },
  { codigo: "PROD-00050", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Tomacorrientes", descripcion: "Tomacorriente Doble 15A 120V", unidad: "Unidad", costo: 55, maximo: 300, minimo: 30 },
  { codigo: "PROD-00051", categoria: "Instalaciones Eléctricas", grupo: "Accesorios", subgrupo: "Tomacorrientes", descripcion: "Tomacorriente GFCI Baño/Cocina", unidad: "Unidad", costo: 380, maximo: 100, minimo: 10 },
  { codigo: "PROD-00052", categoria: "Instalaciones Eléctricas", grupo: "Paneles", subgrupo: "Breakers", descripcion: "Panel de Breakers 12 Espacios", unidad: "Unidad", costo: 2800, maximo: 30, minimo: 3 },
  { codigo: "PROD-00053", categoria: "Instalaciones Eléctricas", grupo: "Paneles", subgrupo: "Breakers", descripcion: "Breaker 1 Polo 20A", unidad: "Unidad", costo: 280, maximo: 100, minimo: 10 },
  { codigo: "PROD-00054", categoria: "Instalaciones Eléctricas", grupo: "Iluminación", subgrupo: "LED", descripcion: "Lámpara LED Empotrable 6\" 12W", unidad: "Unidad", costo: 350, maximo: 200, minimo: 20 },
  { codigo: "PROD-00055", categoria: "Instalaciones Eléctricas", grupo: "Iluminación", subgrupo: "LED", descripcion: "Panel LED 2x2 pies 40W", unidad: "Unidad", costo: 1200, maximo: 100, minimo: 10 },

  // ===== INSTALACIONES SANITARIAS (56-72) =====
  { codigo: "PROD-00056", categoria: "Instalaciones Sanitarias", grupo: "Tubería PVC", subgrupo: "Agua Potable", descripcion: "Tubo PVC 1/2\" Presión x 6m", unidad: "Unidad", costo: 85, maximo: 300, minimo: 30 },
  { codigo: "PROD-00057", categoria: "Instalaciones Sanitarias", grupo: "Tubería PVC", subgrupo: "Agua Potable", descripcion: "Tubo PVC 3/4\" Presión x 6m", unidad: "Unidad", costo: 120, maximo: 300, minimo: 30 },
  { codigo: "PROD-00058", categoria: "Instalaciones Sanitarias", grupo: "Tubería PVC", subgrupo: "Drenaje", descripcion: "Tubo PVC 2\" Drenaje x 6m", unidad: "Unidad", costo: 180, maximo: 200, minimo: 20 },
  { codigo: "PROD-00059", categoria: "Instalaciones Sanitarias", grupo: "Tubería PVC", subgrupo: "Drenaje", descripcion: "Tubo PVC 4\" Drenaje x 6m", unidad: "Unidad", costo: 380, maximo: 200, minimo: 20 },
  { codigo: "PROD-00060", categoria: "Instalaciones Sanitarias", grupo: "Accesorios PVC", subgrupo: "Codos", descripcion: "Codo PVC 1/2\" x 90°", unidad: "Unidad", costo: 8, maximo: 500, minimo: 50 },
  { codigo: "PROD-00061", categoria: "Instalaciones Sanitarias", grupo: "Accesorios PVC", subgrupo: "Codos", descripcion: "Codo PVC 4\" x 90° Drenaje", unidad: "Unidad", costo: 65, maximo: 200, minimo: 20 },
  { codigo: "PROD-00062", categoria: "Instalaciones Sanitarias", grupo: "Accesorios PVC", subgrupo: "Tees", descripcion: "Tee PVC 1/2\"", unidad: "Unidad", costo: 12, maximo: 500, minimo: 50 },
  { codigo: "PROD-00063", categoria: "Instalaciones Sanitarias", grupo: "Accesorios PVC", subgrupo: "Válvulas", descripcion: "Válvula de Bola PVC 1/2\"", unidad: "Unidad", costo: 85, maximo: 100, minimo: 10 },
  { codigo: "PROD-00064", categoria: "Instalaciones Sanitarias", grupo: "Piezas Sanitarias", subgrupo: "Inodoros", descripcion: "Inodoro Tanque Bajo Blanco", unidad: "Unidad", costo: 4500, maximo: 50, minimo: 5 },
  { codigo: "PROD-00065", categoria: "Instalaciones Sanitarias", grupo: "Piezas Sanitarias", subgrupo: "Lavamanos", descripcion: "Lavamanos Pedestal Blanco", unidad: "Unidad", costo: 2800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00066", categoria: "Instalaciones Sanitarias", grupo: "Piezas Sanitarias", subgrupo: "Lavamanos", descripcion: "Lavamanos Empotrar Ovalado Blanco", unidad: "Unidad", costo: 1800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00067", categoria: "Instalaciones Sanitarias", grupo: "Piezas Sanitarias", subgrupo: "Duchas", descripcion: "Ducha Cromada con Brazo y Flange", unidad: "Juego", costo: 950, maximo: 50, minimo: 5 },
  { codigo: "PROD-00068", categoria: "Instalaciones Sanitarias", grupo: "Griferías", subgrupo: "Lavamanos", descripcion: "Llave Monomando Lavamanos Cromada", unidad: "Unidad", costo: 1200, maximo: 50, minimo: 5 },
  { codigo: "PROD-00069", categoria: "Instalaciones Sanitarias", grupo: "Griferías", subgrupo: "Cocina", descripcion: "Llave Monomando Cocina Cuello Ganso", unidad: "Unidad", costo: 2200, maximo: 30, minimo: 3 },
  { codigo: "PROD-00070", categoria: "Instalaciones Sanitarias", grupo: "Piezas Sanitarias", subgrupo: "Fregaderos", descripcion: "Fregadero Acero Inoxidable Doble Tina", unidad: "Unidad", costo: 3500, maximo: 30, minimo: 3 },
  { codigo: "PROD-00071", categoria: "Instalaciones Sanitarias", grupo: "Accesorios", subgrupo: "Pegamento", descripcion: "Pegamento PVC 1/4 Galón", unidad: "Unidad", costo: 280, maximo: 50, minimo: 5 },
  { codigo: "PROD-00072", categoria: "Instalaciones Sanitarias", grupo: "Accesorios", subgrupo: "Teflón", descripcion: "Cinta Teflón 1/2\" x 10m", unidad: "Unidad", costo: 15, maximo: 200, minimo: 20 },

  // ===== CARPINTERÍA (73-82) =====
  { codigo: "PROD-00073", categoria: "Carpintería", grupo: "Puertas", subgrupo: "Interiores", descripcion: "Puerta Plywood Lisa 0.80x2.10m", unidad: "Unidad", costo: 3200, maximo: 50, minimo: 5 },
  { codigo: "PROD-00074", categoria: "Carpintería", grupo: "Puertas", subgrupo: "Interiores", descripcion: "Puerta Plywood Lisa 0.70x2.10m", unidad: "Unidad", costo: 2900, maximo: 50, minimo: 5 },
  { codigo: "PROD-00075", categoria: "Carpintería", grupo: "Puertas", subgrupo: "Principal", descripcion: "Puerta Principal Madera Sólida 0.90x2.10m", unidad: "Unidad", costo: 12000, maximo: 20, minimo: 2 },
  { codigo: "PROD-00076", categoria: "Carpintería", grupo: "Marcos", subgrupo: "Madera", descripcion: "Marco para Puerta Madera Pino 0.80x2.10", unidad: "Unidad", costo: 1800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00077", categoria: "Carpintería", grupo: "Closets", subgrupo: "Módulos", descripcion: "Closet Melamina Blanca 1.80x2.40m", unidad: "Unidad", costo: 18000, maximo: 20, minimo: 2 },
  { codigo: "PROD-00078", categoria: "Carpintería", grupo: "Cocina", subgrupo: "Gabinetes", descripcion: "Gabinete Superior Cocina 60cm Melamina", unidad: "Unidad", costo: 4500, maximo: 30, minimo: 3 },
  { codigo: "PROD-00079", categoria: "Carpintería", grupo: "Cocina", subgrupo: "Gabinetes", descripcion: "Gabinete Inferior Cocina 60cm Melamina", unidad: "Unidad", costo: 5200, maximo: 30, minimo: 3 },
  { codigo: "PROD-00080", categoria: "Carpintería", grupo: "Cocina", subgrupo: "Topes", descripcion: "Tope de Granito Natural Cocina (m lineal)", unidad: "Metro Lineal", costo: 4800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00081", categoria: "Carpintería", grupo: "Accesorios", subgrupo: "Cerraduras", descripcion: "Cerradura de Pomo Baño Cromada", unidad: "Unidad", costo: 650, maximo: 50, minimo: 5 },
  { codigo: "PROD-00082", categoria: "Carpintería", grupo: "Accesorios", subgrupo: "Cerraduras", descripcion: "Cerradura Principal Doble Cilindro", unidad: "Unidad", costo: 1800, maximo: 30, minimo: 3 },

  // ===== HERRERÍA / ALUMINIO (83-90) =====
  { codigo: "PROD-00083", categoria: "Herrería", grupo: "Ventanas", subgrupo: "Aluminio", descripcion: "Ventana Corrediza Aluminio 1.20x1.20m", unidad: "Unidad", costo: 4500, maximo: 50, minimo: 5 },
  { codigo: "PROD-00084", categoria: "Herrería", grupo: "Ventanas", subgrupo: "Aluminio", descripcion: "Ventana Corrediza Aluminio 1.50x1.20m", unidad: "Unidad", costo: 5800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00085", categoria: "Herrería", grupo: "Ventanas", subgrupo: "Aluminio", descripcion: "Ventana Celosía Aluminio 0.60x0.40m", unidad: "Unidad", costo: 1200, maximo: 100, minimo: 10 },
  { codigo: "PROD-00086", categoria: "Herrería", grupo: "Barandas", subgrupo: "Acero", descripcion: "Baranda Escalera Acero Inoxidable (m lineal)", unidad: "Metro Lineal", costo: 3500, maximo: 50, minimo: 5 },
  { codigo: "PROD-00087", categoria: "Herrería", grupo: "Barandas", subgrupo: "Acero", descripcion: "Baranda Balcón Acero y Vidrio (m lineal)", unidad: "Metro Lineal", costo: 5500, maximo: 30, minimo: 3 },
  { codigo: "PROD-00088", categoria: "Herrería", grupo: "Portones", subgrupo: "Metálico", descripcion: "Portón Vehicular Metálico 3.00x2.20m", unidad: "Unidad", costo: 35000, maximo: 5, minimo: 1 },
  { codigo: "PROD-00089", categoria: "Herrería", grupo: "Rejas", subgrupo: "Protección", descripcion: "Reja Protección Ventana 1.20x1.20m", unidad: "Unidad", costo: 2800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00090", categoria: "Herrería", grupo: "Vidrios", subgrupo: "Cristal", descripcion: "Vidrio Flotado Claro 6mm (m2)", unidad: "Metro Cuadrado", costo: 450, maximo: 200, minimo: 20 },

  // ===== IMPERMEABILIZACIÓN Y TECHOS (91-95) =====
  { codigo: "PROD-00091", categoria: "Impermeabilización", grupo: "Membranas", subgrupo: "Asfáltica", descripcion: "Membrana Asfáltica 3mm (rollo 10m2)", unidad: "Rollo", costo: 2800, maximo: 50, minimo: 5 },
  { codigo: "PROD-00092", categoria: "Impermeabilización", grupo: "Membranas", subgrupo: "Líquida", descripcion: "Impermeabilizante Líquido Acrílico 5 Gal", unidad: "Cubeta", costo: 3800, maximo: 30, minimo: 3 },
  { codigo: "PROD-00093", categoria: "Impermeabilización", grupo: "Aislamiento", subgrupo: "Térmico", descripcion: "Poliestireno Expandido 1\" (plancha 1.22x2.44)", unidad: "Unidad", costo: 320, maximo: 200, minimo: 20 },
  { codigo: "PROD-00094", categoria: "Impermeabilización", grupo: "Drenaje", subgrupo: "Canaletas", descripcion: "Canaleta PVC Lluvia 4\" x 3m", unidad: "Unidad", costo: 280, maximo: 100, minimo: 10 },
  { codigo: "PROD-00095", categoria: "Impermeabilización", grupo: "Drenaje", subgrupo: "Bajantes", descripcion: "Bajante PVC 3\" x 3m", unidad: "Unidad", costo: 220, maximo: 100, minimo: 10 },

  // ===== SEGURIDAD Y OTROS (96-100) =====
  { codigo: "PROD-00096", categoria: "Seguridad", grupo: "Equipos", subgrupo: "Protección Personal", descripcion: "Casco de Seguridad Industrial", unidad: "Unidad", costo: 350, maximo: 50, minimo: 5 },
  { codigo: "PROD-00097", categoria: "Seguridad", grupo: "Equipos", subgrupo: "Protección Personal", descripcion: "Guantes de Cuero para Construcción", unidad: "Par", costo: 180, maximo: 100, minimo: 10 },
  { codigo: "PROD-00098", categoria: "Seguridad", grupo: "Equipos", subgrupo: "Protección Personal", descripcion: "Botas de Seguridad Punta de Acero", unidad: "Par", costo: 1500, maximo: 30, minimo: 3 },
  { codigo: "PROD-00099", categoria: "Seguridad", grupo: "Señalización", subgrupo: "Cintas", descripcion: "Cinta de Peligro Amarilla 200m", unidad: "Rollo", costo: 120, maximo: 50, minimo: 5 },
  { codigo: "PROD-00100", categoria: "Seguridad", grupo: "Señalización", subgrupo: "Letreros", descripcion: "Letrero Señalización Obra 40x60cm", unidad: "Unidad", costo: 250, maximo: 20, minimo: 2 },
];

// Crear workbook
const wb = XLSX.utils.book_new();

// Convertir a formato de hoja
const data = productos.map(p => ({
  "Código": p.codigo,
  "Categoría": p.categoria,
  "Grupo": p.grupo,
  "Subgrupo": p.subgrupo,
  "Descripción": p.descripcion,
  "Unidad de Medida": p.unidad,
  "Costo en Pesos": p.costo,
  "Máximo": p.maximo,
  "Mínimo": p.minimo,
}));

const ws = XLSX.utils.json_to_sheet(data);

// Ajustar anchos de columna
ws['!cols'] = [
  { wch: 14 },  // Código
  { wch: 26 },  // Categoría
  { wch: 18 },  // Grupo
  { wch: 22 },  // Subgrupo
  { wch: 48 },  // Descripción
  { wch: 18 },  // Unidad de Medida
  { wch: 15 },  // Costo
  { wch: 10 },  // Máximo
  { wch: 10 },  // Mínimo
];

XLSX.utils.book_append_sheet(wb, ws, "Catálogo Productos");

// Guardar archivo
const outputPath = path.join(__dirname, '..', 'Catalogo_Productos_Construccion.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Archivo generado: ${outputPath}`);
console.log(`📦 Total productos: ${productos.length}`);
console.log(`📂 Categorías: ${[...new Set(productos.map(p => p.categoria))].join(', ')}`);
