export interface Product {
  id: string;
  name: string;
  image: string;
  alt: string;
  description: string;
  price: number;
  priceFormatted: string;
  titleColor: string;
  borderColor: string;
  borderClass: string;
  hoverShadow: string;
  btnBg: string;
  btnHoverBg: string;
  themeColor: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'mango',
    name: 'Mango Splash',
    image: '/images/mangosoda.png',
    alt: 'FizzWhizz Mango Splash Soda',
    description: 'Tropical vibes in every sip.',
    price: 4.99,
    priceFormatted: '$4.99',
    titleColor: 'text-[#d97706]',
    borderColor: '#facc15',
    borderClass: 'border-2 border-[#facc15]/70 hover:border-[#eab308]',
    hoverShadow: 'hover:shadow-[0_12px_32px_rgba(245,158,11,0.2)]',
    btnBg: 'bg-[#f59e0b]',
    btnHoverBg: 'hover:bg-[#d97706]',
    themeColor: '#f59e0b',
  },
  {
    id: 'strawberry',
    name: 'Strawberry Splash',
    image: '/images/strawberrysoda.png',
    alt: 'FizzWhizz Strawberry Splash Soda',
    description: 'Sweet, bold, and refreshingly fruity.',
    price: 4.99,
    priceFormatted: '$4.99',
    titleColor: 'text-[#f43f5e]',
    borderColor: '#f43f5e',
    borderClass: 'border-2 border-[#f43f5e]/50 hover:border-[#f43f5e]',
    hoverShadow: 'hover:shadow-[0_12px_32px_rgba(244,63,94,0.2)]',
    btnBg: 'bg-[#f43f5e]',
    btnHoverBg: 'hover:bg-[#e11d48]',
    themeColor: '#f43f5e',
  },
  {
    id: 'grape',
    name: 'Grape Splash',
    image: '/images/grapesoda.png',
    alt: 'FizzWhizz Grape Splash Soda',
    description: 'A burst of juicy goodness.',
    price: 4.99,
    priceFormatted: '$4.99',
    titleColor: 'text-[#8b5cf6]',
    borderColor: '#8b5cf6',
    borderClass: 'border-2 border-[#8b5cf6]/50 hover:border-[#8b5cf6]',
    hoverShadow: 'hover:shadow-[0_12px_32px_rgba(139,92,246,0.2)]',
    btnBg: 'bg-[#8b5cf6]',
    btnHoverBg: 'hover:bg-[#7c3aed]',
    themeColor: '#8b5cf6',
  },
];

export const PRODUCTS_MAP: Record<string, Product> = PRODUCTS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, Product>
);

