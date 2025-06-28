// Página de detalle de producto dinámica para Next.js App Router

import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import FloatingChat from '@/components/floating-chat';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 pb-20">
      {/* HERO tipo slide pantalla completa */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
        {/* Slide de imágenes (solo una por ahora, pero preparado para varias) */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Image
            src={product.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&q=80'}
            alt={product.name}
            fill
            className="object-contain object-center opacity-80 drop-shadow-2xl"
            priority
          />
        </div>
        {/* Overlay oscuro para contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-zinc-900/80 to-black/60 z-10" />
        {/* Flechas slide (dummy, solo UI) */}
        <button className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition-all">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
        {/* Contenido principal hero */}
        <div className="relative z-20 flex flex-col items-start justify-center max-w-3xl px-8">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-2 drop-shadow-lg leading-tight tracking-tight">
            {product.name}
          </h1>
          <span className="text-xl text-amber-400 font-semibold tracking-widest uppercase mb-4">COFFEE FOR HOT DAYS</span>
          <p className="text-lg md:text-2xl text-zinc-200 mb-8 max-w-2xl">
            {product.longDescription || 'Descubre la mejor calidad en insumos y accesorios para carpintería de aluminio y vidrio. ¡Optimiza tu trabajo con productos premium!'}
          </p>
          <div className="flex flex-row gap-4 mb-8">
            <button className="bg-zinc-800 border border-zinc-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-zinc-700 transition text-lg">Recetas</button>
            <span className="text-zinc-400 text-base flex items-center">Click para más información detallada.</span>
          </div>
          <div className="flex flex-row gap-8 items-end mt-auto">
            <div className="text-zinc-300 text-base">
              <div className="mb-1">Brewed over hours, not minutes, cold brew offers a smoother taste than traditional iced coffee.</div>
              <div className="flex gap-4 mt-2">
                <span>12-24h</span>
                <span>One Cup</span>
                <span>Four Cups</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl text-white font-bold mb-1">${product.price}</span>
              <span className="text-base text-zinc-400">BLACK MATTE MUG<br />BRONZE EDITION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detalle del producto */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10 -mt-16 z-10 relative">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl text-gray-400 line-through">${product.oldPrice || (product.price * 1.2).toFixed(2)}</span>
              <span className="text-3xl text-green-600 font-bold underline">${product.price}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 text-xl">★★★★☆</span>
              <span className="text-gray-500 text-sm">(1 reseña de cliente)</span>
            </div>
            <p className="mb-4 text-gray-700 text-lg">{product.description}</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <span className="font-semibold text-gray-700">Categoría:</span> <span className="text-gray-600">{product.category || 'General'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Stock:</span> <span className="text-gray-600">{product.stock ?? 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <input type="number" min={1} max={product.stock || 99} defaultValue={1} className="w-16 border rounded px-2 py-1 text-lg" />
              <button className="bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-600 transition-colors">Agregar al carrito</button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs de descripción y reseñas */}
      <section className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow p-8">
        <div className="flex gap-8 border-b mb-4">
          <button className="text-green-600 font-bold border-b-2 border-green-600 pb-2 px-2">Descripción</button>
          <button className="text-gray-500 font-semibold pb-2 px-2">Reseñas (1)</button>
        </div>
        <div>
          <h3 className="font-bold mb-2">Descripción</h3>
          <p className="text-gray-700 text-base">{product.longDescription || 'Este producto es ideal para profesionales y aficionados que buscan calidad y durabilidad en cada proyecto.'}</p>
        </div>
      </section>

      {/* Productos relacionados */}
      <section className="max-w-6xl mx-auto mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-white">Productos relacionados</h2>
          <Link href="/" className="text-green-400 font-semibold flex items-center gap-1 hover:underline">
            Ver todo <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {related.map((rel: Product) => (
            <div key={rel.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
              <div className="aspect-square relative mb-2 bg-gray-50 rounded-lg overflow-hidden w-full flex items-center justify-center">
                <Image src={rel.image || '/placeholder.jpg'} alt={rel.name} width={140} height={140} className="rounded-lg object-contain" />
              </div>
              <div className="text-center font-semibold text-gray-900 mb-1">{rel.name}</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-yellow-400 text-base">★★★★☆</span>
                <span className="text-gray-500 text-xs">$ {(rel.price).toFixed(2)}</span>
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold mt-1">Agregar al carrito</button>
            </div>
          ))}
        </div>
      </section>
      <FloatingChat />
    </div>
  );
}

/**
 * DOCUMENTACIÓN:
 * - Esta página usa rutas dinámicas de Next.js App Router ("/app/productos/[id]/page.tsx").
 * - Lee los productos desde "data/inventory.json".
 * - Muestra el detalle del producto, productos relacionados y el chat flotante.
 * - Para más productos, solo agrega al JSON y se generarán automáticamente.
 */
