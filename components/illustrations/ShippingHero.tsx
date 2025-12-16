// components/illustrations/ShippingHero.tsx
/**
 * Custom SVG Illustration for Landing Page Hero
 * Shipping/Logistics themed illustration
 */

export default function ShippingHeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Elements */}
      <circle cx="250" cy="200" r="180" fill="url(#bgGradient)" opacity="0.1" />
      <circle cx="400" cy="100" r="60" fill="#3B82F6" opacity="0.1" />
      <circle cx="80" cy="300" r="40" fill="#6366F1" opacity="0.1" />

      {/* Delivery Truck */}
      <g transform="translate(50, 180)">
        {/* Truck Body */}
        <rect x="80" y="60" width="120" height="80" rx="8" fill="#3B82F6" />
        <rect x="85" y="65" width="50" height="35" rx="4" fill="#93C5FD" />
        
        {/* Truck Cabin */}
        <path
          d="M200 60 H240 C250 60 260 70 260 80 V140 H200 V60Z"
          fill="#1E40AF"
        />
        <rect x="210" y="75" width="35" height="25" rx="4" fill="#BFDBFE" />
        
        {/* Wheels */}
        <circle cx="120" cy="145" r="20" fill="#1F2937" />
        <circle cx="120" cy="145" r="10" fill="#6B7280" />
        <circle cx="230" cy="145" r="20" fill="#1F2937" />
        <circle cx="230" cy="145" r="10" fill="#6B7280" />
        
        {/* Ground Line */}
        <line x1="60" y1="165" x2="280" y2="165" stroke="#E5E7EB" strokeWidth="3" />
      </g>

      {/* Flying Packages */}
      <g className="animate-bounce" style={{ animationDuration: '3s' }}>
        <rect x="320" y="80" width="50" height="50" rx="6" fill="#F59E0B" transform="rotate(-15 345 105)" />
        <rect x="325" y="85" width="40" height="3" rx="1" fill="#FCD34D" transform="rotate(-15 345 105)" />
        <rect x="340" y="80" width="3" height="50" rx="1" fill="#FCD34D" transform="rotate(-15 345 105)" />
      </g>

      <g className="animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
        <rect x="380" y="140" width="40" height="40" rx="5" fill="#10B981" transform="rotate(10 400 160)" />
        <rect x="385" y="145" width="30" height="2" rx="1" fill="#6EE7B7" transform="rotate(10 400 160)" />
        <rect x="397" y="140" width="2" height="40" rx="1" fill="#6EE7B7" transform="rotate(10 400 160)" />
      </g>

      {/* Location Pin */}
      <g transform="translate(420, 220)">
        <path
          d="M25 0 C38.8 0 50 11.2 50 25 C50 43.75 25 65 25 65 C25 65 0 43.75 0 25 C0 11.2 11.2 0 25 0Z"
          fill="#EF4444"
        />
        <circle cx="25" cy="25" r="12" fill="white" />
        <circle cx="25" cy="25" r="6" fill="#EF4444" />
      </g>

      {/* Route Dotted Line */}
      <path
        d="M270 280 Q350 200 420 245"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeDasharray="8 8"
        fill="none"
        opacity="0.6"
      />

      {/* Warehouse */}
      <g transform="translate(30, 50)">
        <rect x="0" y="40" width="100" height="70" fill="#6366F1" rx="4" />
        <polygon points="50,0 110,40 -10,40" fill="#4F46E5" />
        <rect x="35" y="60" width="30" height="50" fill="#A5B4FC" rx="2" />
        <rect x="10" y="55" width="15" height="15" fill="#C7D2FE" rx="2" />
        <rect x="75" y="55" width="15" height="15" fill="#C7D2FE" rx="2" />
      </g>

      {/* Speed Lines */}
      <g opacity="0.4">
        <line x1="30" y1="250" x2="60" y2="250" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="265" x2="70" y2="265" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="280" x2="55" y2="280" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Floating Elements */}
      <circle cx="150" cy="50" r="8" fill="#F59E0B" opacity="0.6" />
      <circle cx="300" cy="320" r="6" fill="#10B981" opacity="0.6" />
      <circle cx="450" cy="80" r="5" fill="#EF4444" opacity="0.6" />

      {/* Checkmark Badge */}
      <g transform="translate(350, 280)">
        <circle cx="25" cy="25" r="25" fill="#10B981" />
        <path
          d="M15 25 L22 32 L37 17"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
