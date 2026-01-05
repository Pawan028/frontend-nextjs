'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'How quickly can I start shipping?',
    answer: 'You can start shipping within minutes! Just sign up, connect your store (or add orders manually), and you\'re ready to compare rates and ship. No lengthy onboarding process.',
  },
  {
    question: 'What courier partners do you support?',
    answer: 'We support 10+ major courier partners including BlueDart, Delhivery, DTDC, Ecom Express, Xpressbees, Shadowfax, and more. New partners are added regularly.',
  },
  {
    question: 'How does pricing work?',
    answer: 'You only pay for what you ship - the actual courier charges plus a small platform fee. No monthly minimums on the Starter plan. Volume discounts available for Growth plan users.',
  },
  {
    question: 'Can I integrate with my existing store?',
    answer: 'Absolutely! We support direct integrations with Shopify, WooCommerce, Magento, and 50+ other platforms. We also provide APIs for custom integrations.',
  },
  {
    question: 'What is NDR management?',
    answer: 'NDR (Non-Delivery Report) management helps you handle failed deliveries automatically. Our system contacts customers via WhatsApp/SMS, collects updated addresses, and reschedules deliveries - reducing RTO by up to 15%.',
  },
  {
    question: 'How fast is COD remittance?',
    answer: 'COD remittance is processed within 2-7 days depending on the courier partner. You can track all your pending remittances in real-time from your dashboard.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked <span className="text-purple-600 dark:text-purple-400">Questions</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Everything you need to know about ShipMVP.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full bg-white dark:bg-slate-900 rounded-xl p-6 text-left border border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white pr-8">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
