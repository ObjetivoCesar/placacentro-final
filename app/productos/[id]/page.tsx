// Página de detalle de producto dinámica para Next.js App Router

import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import FloatingChat from '@/components/floating-chat';
import ProductImage from '@/components/product-image';
import ProductClient from './ProductClient';

// Tipos para los productos y props
type Product = {
  id: string | number;
  name: string;
  price: number;
  description: string;
  image?: string;
  oldPrice?: number;
  category?: string;
  stock?: number;
  longDescription?: string;
  reviews?: { user: string; rating: number; comment: string; }[];
};

type Params = {
  id: string;
};

// Lee los productos desde el archivo JSON
function getProducts(): Product[] {
  const filePath = path.join(process.cwd(), 'data', 'inventory.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.slice(0, 20).map((product: Product) => ({ id: String(product.id) }));
}

interface ProductPageProps {
  params: Params;
}

export default function ProductPage({ params }: ProductPageProps) {
  const products = getProducts();
  const product = products.find((p: Product) => String(p.id) === params.id);
  if (!product) return <div>Producto no encontrado</div>;

  // Selecciona productos relacionados (simples, los primeros 4 distintos al actual)
  const related = products.filter((p: Product) => p.id !== product.id).slice(0, 4);

  // Descripciones largas y reseñas dummy
  const dummyDescriptions = [
    'Ideal para proyectos de carpintería y muebles a medida.\n- Resistente a la humedad\n- Fácil de cortar y manipular\n- Acabado liso y uniforme',
    'Panel de alta calidad para uso interior.\n- Excelente durabilidad\n- Superficie lista para pintar\n- Disponible en varios grosores',
    'Tablero versátil para construcción y decoración.\n- Soporta peso moderado\n- Fácil de instalar\n- Compatible con diferentes herrajes',
    'Material ecológico y seguro.\n- Bajo contenido de formaldehído\n- Certificación ambiental\n- Recomendado para muebles infantiles',
  ];
  const dummyReviews = [
    [
      { user: 'Juan Pérez', rating: 5, comment: 'Excelente calidad, muy fácil de trabajar.' },
      { user: 'María López', rating: 4, comment: 'Buen precio y entrega rápida. Lo recomiendo.' },
    ],
    [
      { user: 'Carlos Ruiz', rating: 5, comment: 'Perfecto para mis proyectos de carpintería.' },
      { user: 'Ana Torres', rating: 4, comment: 'La superficie es muy lisa, ideal para pintar.' },
    ],
    [
      { user: 'Luis Gómez', rating: 5, comment: 'Muy resistente y fácil de instalar.' },
      { user: 'Sofía Martínez', rating: 4, comment: 'Me gustó el acabado, volveré a comprar.' },
    ],
    [
      { user: 'Pedro Sánchez', rating: 5, comment: 'Material ecológico, justo lo que buscaba.' },
      { user: 'Lucía Fernández', rating: 4, comment: 'Ideal para muebles de niños, muy seguro.' },
    ],
  ];
  // Asignar descripción y reseñas dummy a cada producto
  products.forEach((p, idx) => {
    p.longDescription = dummyDescriptions[idx % dummyDescriptions.length];
    p.reviews = dummyReviews[idx % dummyReviews.length];
  });

  return <ProductClient product={product} related={related} />;
}

/**
 * DOCUMENTACIÓN:
 * - Esta página usa rutas dinámicas de Next.js App Router ("/app/productos/[id]/page.tsx").
 * - Lee los productos desde "data/inventory.json".
 * - Muestra el detalle del producto, productos relacionados y el chat flotante.
 * - Para más productos, solo agrega al JSON y se generarán automáticamente.
 */
