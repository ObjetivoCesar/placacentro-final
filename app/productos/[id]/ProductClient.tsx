"use client";
import { useState } from 'react';
import FloatingChat from '@/components/floating-chat';
import ProductImage from '@/components/product-image';
import { AppShell } from '@/components/main-app';
import { useRouter } from 'next/navigation';

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
  reviews?: { user: string; rating: number; comment: string }[];
};

interface ProductClientProps {
  product: Product;
  related: Product[];
}

export default function ProductClient({ product, related }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'descripcion' | 'reseñas'>('descripcion');
  const router = useRouter();

  // Footer navigation handler
  const setActiveSection = (section: string) => {
    if (section === 'home') router.push('/');
    if (section === 'ecommerce') router.push('/');
    if (section === 'cart') router.push('/');
    if (section === 'optimization') router.push('/');
  };

  return (
    <AppShell activeSection="ecommerce" setActiveSection={setActiveSection}>
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center">
        {/* HERO tipo Amazon/eBay: imagen izquierda, info derecha */}
        <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-10 bg-white rounded-3xl shadow-2xl mt-10 p-8">
          {/* Imagen principal */}
          <div className="flex-1 flex flex-col items-center justify-start">
            <ProductImage
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              width={420}
              height={420}
              className="object-contain rounded-2xl max-h-[420px] w-full h-full bg-gray-100"
            />
          </div>
          {/* Info principal */}
          <div className="flex-1 flex flex-col gap-4 justify-start">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">{product.name}</h1>
            <span className="text-base text-orange-500 font-semibold uppercase mb-2 tracking-widest block">Categoría: {product.category || 'General'}</span>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xl text-gray-400 line-through">${product.oldPrice || (product.price * 1.2).toFixed(2)}</span>
              <span className="text-2xl text-orange-500 font-bold">${product.price}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400 text-xl">★★★★☆</span>
              <span className="text-gray-500 text-sm">(1 reseña de cliente)</span>
            </div>
            <ul className="list-disc pl-6 text-gray-700 mb-2">
              <li><span className="font-semibold">Stock:</span> {product.stock ?? 'N/A'}</li>
              <li><span className="font-semibold">Código:</span> {product.id}</li>
            </ul>
            {/* Input de cantidad y acciones */}
            <div className="flex items-center gap-4 mt-2">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-16 h-10 text-center border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
              />
              <span className="text-gray-500">unidades</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition">¡Comprar ahora!</button>
              <button className="flex-1 bg-white border border-orange-500 text-orange-500 font-bold py-3 px-6 rounded-lg text-lg hover:bg-orange-50 transition">Agregar al carrito</button>
              <button className="flex-1 bg-white border border-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-100 transition">♡ Favorito</button>
            </div>
            {/* Resumen corto/descripción clave */}
            <div className="mt-4 text-gray-700 text-base bg-gray-50 rounded-xl p-4 shadow-sm">
              {product.description}
            </div>
          </div>
        </section>
        {/* Tabs de descripción y reseñas debajo del hero */}
        <section className="w-full max-w-3xl mx-auto mt-10">
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button className={`py-2 px-4 font-semibold border-b-2 transition ${tab === 'descripcion' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`} onClick={() => setTab('descripcion')}>Descripción</button>
            <button className={`py-2 px-4 font-semibold border-b-2 transition ${tab === 'reseñas' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`} onClick={() => setTab('reseñas')}>Reseñas</button>
          </div>
          {tab === 'descripcion' && (
            <div className="text-gray-700 leading-relaxed text-lg bg-white rounded-xl shadow p-8">
              {product.longDescription ? (
                <>
                  {/* Si la descripción larga tiene saltos de línea o bullets, los formateamos */}
                  {product.longDescription.split('\n').map((line, idx) =>
                    line.trim().startsWith('-') ? (
                      <ul key={idx} className="list-disc pl-6 mb-2"><li>{line.replace(/^[-•]\s*/, '')}</li></ul>
                    ) : (
                      <p key={idx} className="mb-2">{line}</p>
                    )
                  )}
                </>
              ) : (
                <div className="text-gray-400 italic text-center">Este producto aún no tiene una descripción detallada.</div>
              )}
            </div>
          )}
          {tab === 'reseñas' && (
            <div className="bg-white rounded-xl shadow p-8">
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{review.user}</span>
                        <span className="text-yellow-400 text-lg">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base">{review.comment}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic text-center">Aún no hay reseñas para este producto.</div>
              )}
            </div>
          )}
        </section>
        {/* Productos relacionados: sección aparte, todo el ancho */}
        <section className="w-full max-w-6xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Productos relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {related.map((rel: Product) => (
              <div key={rel.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center h-full min-h-[340px]">
                <ProductImage
                  src={rel.image || '/placeholder.jpg'}
                  alt={rel.name}
                  width={180}
                  height={180}
                  className="object-contain rounded-xl max-h-[180px] w-full h-full mb-4"
                />
                <div className="font-semibold text-gray-800 text-lg mb-2 text-center line-clamp-2 min-h-[2.8em] max-h-[2.8em] leading-tight">
                  {rel.name}
                </div>
                <div className="text-orange-500 font-bold text-xl mb-4">${rel.price}</div>
                <div className="flex-1 w-full flex items-end">
                  <a href={`/productos/${rel.id}`} className="w-full inline-block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition mt-auto">Ver producto</a>
                </div>
              </div>
            ))}
          </div>
        </section>
        <FloatingChat />
      </div>
    </AppShell>
  );
} 