'use client';

// Placeholder list of integration names - in a real app, these would be logos
const INTEGRATIONS = [
    'Shopify',
    'WooCommerce',
    'Magento',
    'Amazon',
    'Flipkart',
    'Myntra',
    'Zoho',
    'Wix',
    'Instamojo',
    'OpenCart',
    'BigCommerce',
    'PrestaShop',
];

export default function IntegrationMarquee() {
    return (
        <div className="w-full py-8 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-gray-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Seamlessly integrates with 50+ platforms
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-12 px-6">
                    {/* First set of logos */}
                    {INTEGRATIONS.map((name) => (
                        <div
                            key={name}
                            className="text-xl font-bold text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors cursor-default"
                        >
                            {name}
                        </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {INTEGRATIONS.map((name) => (
                        <div
                            key={`${name}-duplicate`}
                            className="text-xl font-bold text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors cursor-default"
                        >
                            {name}
                        </div>
                    ))}
                </div>

                {/* Fading edges for smooth look */}
                <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
            </div>
        </div>
    );
}
