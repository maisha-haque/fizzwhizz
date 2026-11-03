'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, PRODUCTS_MAP, Product } from '../data/products';

const CART_STORAGE_KEY = 'fizzwhizz_cart';
const COUPON_STORAGE_KEY = 'fizzwhizz_coupon';

export default function CheckoutPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Customer Details state
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod', // 'cod' | 'card'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    orderId: string;
    total: number;
    discount: number;
    customerName: string;
    deliveryAddress: string;
    paymentMethod: string;
    items: { product: Product; qty: number; subtotal: number }[];
  } | null>(null);

  // Initialize cart from localStorage & URL parameters
  useEffect(() => {
    let initialCart: Record<string, number> = {};
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        initialCart = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const addId = urlParams.get('add');
      if (addId && PRODUCTS_MAP[addId]) {
        initialCart[addId] = (initialCart[addId] || 0) + 1;
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(initialCart));
        } catch (e) {
          console.error(e);
        }
        window.history.replaceState({}, '', window.location.pathname);
      }

      try {
        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (savedCoupon === 'FIZZ10') {
          setAppliedCoupon('FIZZ10');
        }
      } catch (e) {
        console.error(e);
      }
    }

    setCart(initialCart);
    setIsLoaded(true);
  }, []);

  // Persist cart changes
  useEffect(() => {
    if (!isLoaded || isOrderPlaced) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isLoaded, isOrderPlaced]);

  // Persist coupon changes
  useEffect(() => {
    if (!isLoaded || isOrderPlaced) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon, isLoaded, isOrderPlaced]);

  // Cart operations
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 1) return prev;
      return { ...prev, [id]: next };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const quickAddProduct = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Calculations
  const cartEntries = Object.entries(cart)
    .filter(([id, qty]) => PRODUCTS_MAP[id] && qty > 0)
    .map(([id, qty]) => ({
      product: PRODUCTS_MAP[id],
      qty,
      subtotal: PRODUCTS_MAP[id].price * qty,
    }));

  const totalItemsCount = cartEntries.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartEntries.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = appliedCoupon === 'FIZZ10' ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  // Coupon handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    if (appliedCoupon === cleanCode) {
      setCouponMessage({
        type: 'error',
        text: 'This coupon is already applied.',
      });
      return;
    }

    if (cleanCode === 'FIZZ10') {
      setAppliedCoupon('FIZZ10');
      setCouponMessage({
        type: 'success',
        text: 'FIZZ10 applied: 10% discount added!',
      });
      setCouponInput('');
    } else {
      setCouponMessage({
        type: 'error',
        text: 'Invalid coupon code. Try FIZZ10.',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    setCouponInput('');
  };

  // Validation
  const validateCustomerDetails = () => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = 'Full name is required';
    if (!customer.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = 'Valid email is required';
    }
    if (!customer.phone.trim()) errs.phone = 'Phone number is required';
    if (!customer.address.trim()) errs.address = 'Delivery address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Place Order handler
  const handlePlaceOrder = () => {
    if (cartEntries.length === 0) return;

    if (!validateCustomerDetails()) {
      return;
    }

    const orderId = `FW-${Math.floor(10000 + Math.random() * 90000)}`;
    setPlacedOrderDetails({
      orderId,
      total: finalTotal,
      discount,
      customerName: customer.name,
      deliveryAddress: customer.address,
      paymentMethod:
        customer.paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : 'Credit / Debit Card (On Delivery)',
      items: cartEntries,
    });
    setIsOrderPlaced(true);
    setCart({});
    setAppliedCoupon(null);

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const unselectedProducts = PRODUCTS.filter((p) => !cart[p.id]);

  return (
    <main
      className="relative min-h-screen lg:min-h-[100dvh] w-full pt-20 sm:pt-22 pb-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-x-hidden"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, #fff9e6 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, #fff0f5 0%, transparent 55%),
          radial-gradient(circle at 50% 85%, #f5eeff 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 70%)
        `,
      }}
    >
      {/* Button & Accent Gradient Styles */}
      <style>{`
        .fizz-btn {
          background: linear-gradient(#ffffff, #ffffff) padding-box,
                      linear-gradient(135deg, #ffee7d 0%, #ff9696 50%, #d492ce 100%) border-box;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }
        .fizz-btn:hover:not(:disabled) {
          box-shadow: 0 4px 14px rgba(255, 150, 150, 0.25);
          transform: translateY(-1px);
        }
        .fizz-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .fizz-gradient-text {
          background: linear-gradient(135deg, #eab308 0%, #f43f5e 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Shared SVG Linear Gradient Definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fizzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffee7d" />
            <stop offset="50%" stopColor="#ff9696" />
            <stop offset="100%" stopColor="#d492ce" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-6xl xl:max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Navigation */}
        <div className="mb-2.5 sm:mb-3 shrink-0">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-neutral-600 hover:text-neutral-900 transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to Shop
          </Link>
        </div>

        {/* ORDER CONFIRMATION STATE */}
        {isOrderPlaced && placedOrderDetails ? (
          <div className="max-w-2xl mx-auto w-full rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-md p-8 sm:p-12 text-center shadow-lg my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full fizz-btn p-1 flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10"
                fill="none"
                stroke="url(#fizzGrad)"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#ffee7d] via-[#ff9696] to-[#d492ce] bg-clip-text text-transparent mb-2"
              style={{ WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.7)' }}
            >
              Order Confirmed! 🎉
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base max-w-md mx-auto mb-6">
              Thank you, <span className="font-bold text-neutral-900">{placedOrderDetails.customerName}</span>! Your sodas will be delivered cold to{' '}
              <span className="font-semibold text-neutral-800">{placedOrderDetails.deliveryAddress}</span>.
            </p>

            <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-700 font-mono text-sm font-bold mb-6">
              Order ID: {placedOrderDetails.orderId} • {placedOrderDetails.paymentMethod}
            </div>

            {/* Order Items Recap */}
            <div className="border-t border-b border-neutral-200/80 py-4 mb-6 text-left space-y-2 max-h-[180px] overflow-y-auto">
              {placedOrderDetails.items.map(({ product, qty, subtotal }) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium text-neutral-800">
                    {qty}x {product.name}
                  </span>
                  <span className="font-semibold text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
              {placedOrderDetails.discount > 0 && (
                <div className="flex justify-between items-center text-sm text-[#f43f5e]">
                  <span>Coupon Discount (FIZZ10)</span>
                  <span>-${placedOrderDetails.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base font-extrabold text-neutral-900 pt-2 border-t border-neutral-200/60">
                <span>Total Paid</span>
                <span>${placedOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/shop"
                onClick={() => setIsOrderPlaced(false)}
                className="fizz-btn py-3 px-8 rounded-full font-bold text-sm sm:text-base"
              >
                <span className="fizz-gradient-text">Shop More Flavors</span>
              </Link>
              <Link
                href="/"
                className="fizz-btn py-3 px-8 rounded-full font-bold text-sm sm:text-base"
              >
                <span className="text-neutral-700">Back to Home</span>
              </Link>
            </div>
          </div>
        ) : isLoaded && cartEntries.length === 0 ? (
          /* EMPTY CART STATE - COMPACT & NATURAL FIT */
          <div className="max-w-xl sm:max-w-2xl mx-auto w-full rounded-3xl border border-neutral-200/80 bg-white/60 backdrop-blur-md p-5 sm:p-7 text-center shadow-md my-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-2.5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-1 sm:mb-1.5">
              Your cart is empty
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm max-w-sm mx-auto mb-4">
              Add some crisp, refreshing FizzWhizz sodas to get the bubbles flowing!
            </p>

            {/* Quick Add Pills */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => quickAddProduct(p.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl border ${p.borderClass} bg-white/70 hover:bg-white text-center transition-all group flex flex-col items-center cursor-pointer shadow-xs`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-9 h-13 sm:w-11 sm:h-16 object-contain group-hover:scale-105 transition-transform mb-1.5"
                  />
                  <div className={`font-bold text-xs sm:text-sm truncate w-full ${p.titleColor}`}>
                    {p.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">+ $4.99</div>
                </button>
              ))}
            </div>

            <Link
              href="/shop"
              className="fizz-btn inline-flex py-2.5 sm:py-3 px-6 sm:px-8 rounded-full font-bold text-xs sm:text-sm"
            >
              <span className="fizz-gradient-text">Explore All Flavors</span>
            </Link>
          </div>
        ) : (
          /* ACTIVE CHECKOUT: 3-COLUMN SCALED UP LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {/* COLUMN 1: ORDER ITEMS */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white/40 backdrop-blur-md p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    Order Items
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                    {totalItemsCount} {totalItemsCount === 1 ? 'can' : 'cans'}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[320px] lg:max-h-[360px] overflow-y-auto pr-1">
                  {cartEntries.map(({ product, qty, subtotal }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-200/60 bg-white/70 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-16 sm:w-14 sm:h-18 shrink-0 rounded-xl border p-1.5 flex items-center justify-center bg-white ${product.borderClass}`}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-auto object-contain select-none"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`text-sm sm:text-base font-bold truncate ${product.titleColor}`}
                          >
                            {product.name}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            $4.99 • Sub: ${subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                          className="fizz-btn w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="url(#fizzGrad)"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 12h-15"
                            />
                          </svg>
                        </button>

                        <span className="w-6 text-center font-bold text-neutral-800 text-sm sm:text-base select-none">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          aria-label="Increase quantity"
                          className="fizz-btn w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="url(#fizzGrad)"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Suggestions */}
              {unselectedProducts.length > 0 && (
                <div className="pt-3 border-t border-neutral-200/60 mt-3">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">
                    Add another flavor:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unselectedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => quickAddProduct(p.id)}
                        className="fizz-btn py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer"
                      >
                        <span className="fizz-gradient-text">+ {p.name}</span>
                        <span className="text-neutral-400 font-normal ml-1.5">($4.99)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 2: CUSTOMER DETAILS */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white/40 backdrop-blur-md p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    Customer Details
                  </h2>
                  <span className="text-xs text-neutral-400 font-medium">
                    Required for delivery
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-neutral-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => {
                        setCustomer({ ...customer, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Name"
                      className={`w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-sm sm:text-base bg-white/90 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff9696] ${
                        errors.name ? 'border-rose-400 bg-rose-50/40' : 'border-neutral-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-neutral-700 block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => {
                          setCustomer({ ...customer, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder="Your Email"
                        className={`w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-sm sm:text-base bg-white/90 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff9696] ${
                          errors.email ? 'border-rose-400 bg-rose-50/40' : 'border-neutral-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-500 mt-1 truncate">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-neutral-700 block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => {
                          setCustomer({ ...customer, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="Phone Number"
                        className={`w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-sm sm:text-base bg-white/90 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff9696] ${
                          errors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-neutral-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-rose-500 mt-1 truncate">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-neutral-700 block mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      value={customer.address}
                      onChange={(e) => {
                        setCustomer({ ...customer, address: e.target.value });
                        if (errors.address) setErrors({ ...errors, address: '' });
                      }}
                      placeholder="Address"
                      className={`w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-sm sm:text-base bg-white/90 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff9696] ${
                        errors.address ? 'border-rose-400 bg-rose-50/40' : 'border-neutral-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-rose-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-neutral-700 block mb-1.5">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                          customer.paymentMethod === 'cod'
                            ? 'border-[#f59e0b] bg-amber-50/70 font-bold text-neutral-900 shadow-xs'
                            : 'border-neutral-200 bg-white/70 text-neutral-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={customer.paymentMethod === 'cod'}
                          onChange={() =>
                            setCustomer({ ...customer, paymentMethod: 'cod' })
                          }
                          className="accent-[#f59e0b] w-3.5 h-3.5"
                        />
                        <span>Cash on Delivery</span>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                          customer.paymentMethod === 'card'
                            ? 'border-[#8b5cf6] bg-purple-50/70 font-bold text-neutral-900 shadow-xs'
                            : 'border-neutral-200 bg-white/70 text-neutral-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={customer.paymentMethod === 'card'}
                          onChange={() =>
                            setCustomer({ ...customer, paymentMethod: 'card' })
                          }
                          className="accent-[#8b5cf6] w-3.5 h-3.5"
                        />
                        <span>Card (On Delivery)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-400 pt-3 border-t border-neutral-200/60 mt-3">
                🔒 No card details collected online. Pay safely upon arrival.
              </div>
            </div>

            {/* COLUMN 3: COUPON & ORDER SUMMARY */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white/40 backdrop-blur-md p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                {/* Coupon Section */}
                <div className="pb-4 border-b border-neutral-200/60 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-[#f59e0b]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                        />
                      </svg>
                      Have a coupon?
                    </span>
                    <span className="text-xs text-neutral-400">Code: FIZZ10</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-800">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        {appliedCoupon} (10% Off)
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-semibold text-neutral-500 hover:text-rose-600 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Code (FIZZ10)"
                          className="flex-1 py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border border-neutral-300 bg-white/90 text-sm font-semibold uppercase tracking-wider text-neutral-800 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                        />
                        <button
                          type="submit"
                          className="fizz-btn py-2.5 sm:py-3 px-5 rounded-xl text-sm font-bold cursor-pointer shrink-0"
                        >
                          <span className="fizz-gradient-text">Apply</span>
                        </button>
                      </div>

                      {couponMessage && (
                        <div
                          className={`text-xs font-medium ${
                            couponMessage.type === 'success'
                              ? 'text-emerald-600'
                              : 'text-rose-500'
                          }`}
                        >
                          {couponMessage.text}
                        </div>
                      )}
                    </form>
                  )}
                </div>

                {/* Summary Rows */}
                <div className="space-y-2.5 text-sm sm:text-base">
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-[#f43f5e] font-semibold">
                      <span>Coupon Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Carbonation Delivery</span>
                    <span className="font-semibold text-emerald-700">Free</span>
                  </div>

                  <div className="border-t border-neutral-200/80 pt-3 mt-3 flex justify-between items-baseline">
                    <span className="text-base sm:text-lg font-extrabold text-neutral-900">
                      Total
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="fizz-btn w-full py-3.5 sm:py-4 px-6 rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer"
                >
                  <span className="fizz-gradient-text">
                    Place Order • ${finalTotal.toFixed(2)}
                  </span>
                </button>
                <div className="text-xs text-neutral-400 text-center mt-1.5">
                  100% Guaranteed Crisp & Fizzy Delivery
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: CONTACT EMAIL */}
      <footer className="mt-4 text-center text-xs sm:text-sm text-neutral-400 flex items-center justify-center gap-2 shrink-0">
        <svg
          className="w-4 h-4 text-neutral-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        <span>
          Questions? Contact us at{' '}
          <a
            href="mailto:hello@fizzwhizz.com"
            className="text-neutral-500 hover:text-neutral-700 underline underline-offset-2 transition-colors"
          >
            hello@fizzwhizz.com
          </a>
        </span>
      </footer>
    </main>
  );
}
