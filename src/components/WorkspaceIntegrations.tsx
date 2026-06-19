import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Map, FileSpreadsheet, Calendar, StickyNote, Mail, Bell, 
  MapPin, Navigation, Compass, ShieldCheck, CheckCircle, Clock 
} from "lucide-react";
import { DirectTransaction } from "../types";

interface WorkspaceIntegrationsProps {
  transaction: DirectTransaction | null;
  onResetCheckout: () => void;
}

// Map vectors matching Congolese cities for gorgeous SVG overlays
interface MapCityData {
  city: string;
  paths: { d: string, stroke: string, width: number }[];
  landmarks: { name: string, x: number, y: number }[];
  courierPath: [number, number][]; // points on the visual grid
}

const CITY_MAPS: Record<string, MapCityData> = {
  Kinshasa: {
    city: "Kinshasa",
    paths: [
      { d: "M 20 40 Q 150 180 300 120 T 580 80", stroke: "#e5e7eb", width: 14 }, // Blvd du 30 Juin
      { d: "M 20 40 Q 150 180 300 120 T 580 80", stroke: "#fbbf24", width: 4 }, // Main Lane
      { d: "M 100 20 L 100 280", stroke: "#d1d5db", width: 3 }, // Avenue de la Justice
      { d: "M 250 80 L 450 350", stroke: "#d1d5db", width: 3 }, // Blvd Triomphal
      { d: "M 400 300 L 20 280", stroke: "#e5e7eb", width: 6 }, // Route de Matadi
    ],
    landmarks: [
      { name: "Gare Centrale", x: 420, y: 90 },
      { name: "Palais du Peuple", x: 310, y: 190 },
      { name: "Rond-point Kintambo", x: 120, y: 80 }
    ],
    courierPath: [
      [20, 40], [100, 110], [210, 140], [300, 120], [420, 100], [520, 85]
    ]
  },
  Goma: {
    city: "Goma",
    paths: [
      { d: "M 10 280 Q 200 150 400 200 T 590 280", stroke: "#e5e7eb", width: 12 }, // Blvd Kanyamuhanga
      { d: "M 10 280 Q 200 150 400 200 T 590 280", stroke: "#4f46e5", width: 4 }, // Active Line
      { d: "M 150 20 L 150 380", stroke: "#d1d5db", width: 4 }, // Route vers Saké
      { d: "M 150 180 L 480 80", stroke: "#d1d5db", width: 3 }, // Route Aéroport
    ],
    landmarks: [
      { name: "Rond-point Tchoutchou", x: 260, y: 175 },
      { name: "Aéroport de Goma", x: 430, y: 90 },
      { name: "Port de Goma (Lac Kivu)", x: 200, y: 320 }
    ],
    courierPath: [
      [150, 180], [220, 165], [300, 175], [380, 195], [450, 210], [550, 250]
    ]
  },
  Bukavu: {
    city: "Bukavu",
    paths: [
      { d: "M 40 20 Q 200 100 220 250 T 560 380", stroke: "#e5e7eb", width: 12 }, // Avenue Patrice Lumumba
      { d: "M 40 20 Q 200 100 220 250 T 560 380", stroke: "#ea580c", width: 4 },
      { d: "M 400 20 L 180 200", stroke: "#d1d5db", width: 3 }, // Avenue de la Cathédrale
      { d: "M 100 350 L 480 320", stroke: "#d1d5db", width: 3 },  // Ruzizi Bridge Road
    ],
    landmarks: [
      { name: "Place de l'Indépendance", x: 120, y: 60 },
      { name: "Collège Alfajiri", x: 215, y: 180 },
      { name: "Pont Ruzizi II", x: 440, y: 325 }
    ],
    courierPath: [
      [40, 20], [110, 55], [190, 105], [215, 185], [300, 290], [420, 330]
    ]
  },
  Lubumbashi: {
    city: "Lubumbashi",
    paths: [
      { d: "M 20 200 H 580", stroke: "#e5e7eb", width: 10 }, // Blvd M'Siri
      { d: "M 20 200 H 580", stroke: "#059669", width: 3 },
      { d: "M 300 20 V 380", stroke: "#d1d5db", width: 4 }, // Avenue Laurent Désiré Kabila
    ],
    landmarks: [
      { name: "Place de l'Identité", x: 300, y: 120 },
      { name: "Université de Lubumbashi", x: 420, y: 200 },
      { name: "Golf de Lubumbashi", x: 160, y: 250 }
    ],
    courierPath: [
      [300, 40], [300, 120], [300, 200], [420, 200], [500, 200]
    ]
  }
};

export default function WorkspaceIntegrations({ transaction, onResetCheckout }: WorkspaceIntegrationsProps) {
  // Use active transaction or mock data
  const tx = transaction || {
    id: "TX-KUF-89736",
    productId: "prod-mwinda-solar",
    productTitle: "MWINDA Solar Lantern v3 (x2)",
    price: 98,
    currency: "USD" as const,
    buyerName: "MWANZA MUKENDI SAMUEL",
    buyerEmail: "samuel.mwanza@yopmail.com",
    paymentMethod: "M-PESA" as const,
    phoneNumber: "+243 821 908 678",
    escrowStatus: "SECURED" as const,
    kycRequiredScore: 98.5,
    kycPassed: true,
    deliveryAddress: "72, Avenue de la République, Quartier Royal",
    city: "Kinshasa" as const,
    sheetLogged: true,
    calendarBooked: true,
    keepNoteCreated: true,
    timestamp: new Date().toISOString()
  };

  const selectedCityData = CITY_MAPS[tx.city] || CITY_MAPS.Kinshasa;

  // Courier path animation indexes
  const [pathIndex, setPathIndex] = useState(0);
  const [courierDot, setCourierDot] = useState<[number, number]>([100, 100]);
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Animate courier along route with real-time updates
  useEffect(() => {
    const route = selectedCityData.courierPath;
    setCourierDot(route[0]);
    setPathIndex(0);
    setEtaMinutes(12);

    const interval = setInterval(() => {
      setPathIndex((prevIndex) => {
        const nextIdx = prevIndex + 1;
        if (nextIdx < route.length) {
          setCourierDot(route[nextIdx]);
          setEtaMinutes(Math.max(2, 12 - nextIdx * 2));
          return nextIdx;
        } else {
          return prevIndex; // Hold delivery delivered position
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [tx.city]);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 font-sans p-6 text-zinc-900 dark:text-zinc-50 space-y-8">
      {/* Overview logistics banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 dark:bg-zinc-800 text-green-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-sans tracking-tight">ENCOURS LOGISTIQUE SÉCURISÉ</h2>
            <p className="text-xs text-zinc-405 leading-relaxed mt-0.5 max-w-md">
              Transaction <strong>{tx.id}</strong> en cours. Fonds isolés de façon sécurisée par Kufulula Escrow. Livraison en main propre active à {tx.city}.
            </p>
          </div>
        </div>

        <button
          onClick={onResetCheckout}
          className="px-5 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-medium rounded-xl shadow-lg hover:shadow-xl transition-all font-mono"
        >
          Retourner sur la Boutique
        </button>
      </div>

      {/* Grid Dashboard structure: Left Maps, Right Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP MODULE */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[520px]">
          {/* Map metadata bar */}
          <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Map className="w-4 h-4 text-zinc-500" />
              <span>LOGISTICS MAP // CONGO ROUTE</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <Navigation className="w-3 h-3 text-indigo-505 shrink-0" />
              <span className="uppercase tracking-wider">Itinéraire Établi ({tx.city})</span>
            </div>
          </div>

          {/* Interactive SVG dynamic congo map canvas */}
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex items-center justify-center">
            {/* Compass rose layout visual decorators */}
            <div className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-800 flex items-center gap-1.5 font-mono text-[9px]">
              <Compass className="w-5 h-5 animate-spin-slow" />
              <span>OUEST-EST</span>
            </div>

            <svg className="w-full h-full min-h-[300px] select-none" viewBox="0 0 600 400">
              {/* Backing structural paths */}
              {selectedCityData.paths.map((p, idx) => (
                <path 
                  key={idx} 
                  d={p.d} 
                  fill="none" 
                  stroke={p.stroke} 
                  strokeWidth={p.width} 
                  strokeLinecap="round" 
                  className="transition-all duration-700"
                />
              ))}

              {/* Courier dynamic dot tracking line path */}
              <polyline
                points={selectedCityData.courierPath.slice(0, pathIndex + 1).map(p => p.join(",")).join(" ")}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="transition-all duration-300"
              />

              {/* Landmarks text */}
              {selectedCityData.landmarks.map((mark, idx) => (
                <g key={idx} transform={`translate(${mark.x}, ${mark.y})`}>
                  <circle r="3" fill="#6b7280" />
                  <text 
                    y="14" 
                    textAnchor="middle" 
                    className="font-sans text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-white"
                  >
                    {mark.name}
                  </text>
                </g>
              ))}

              {/* Dynamic Animated Courier Package Icon */}
              <motion.g
                animate={{ x: courierDot[0], y: courierDot[1] }}
                transition={{ type: "spring", damping: 15 }}
              >
                {/* Visual ripple effect radius */}
                <circle r="16" fill="#4f46e5" className="animate-ping opacity-15" />
                <circle r="10" fill="#4f46e5" className="shadow-lg stroke-white stroke-2" />
                
                {/* Courier motorcycle package mini box */}
                <rect x="-4" y="-4" width="8" height="8" fill="#ffffff" rx="1.5" />
              </motion.g>
            </svg>

            {/* Float logistics card panel overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 p-4 rounded-2xl flex justify-between items-center text-xs shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-605 dark:text-indigo-400 rounded-xl">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Heure d'arrivée estimée (ETA)</span>
                  <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white font-mono mt-0.5">
                    {pathIndex + 1 === selectedCityData.courierPath.length 
                      ? "✓ Livré en main propre" 
                      : `~ ${etaMinutes} minutes restantes - Trafic Modéré`}
                  </p>
                </div>
              </div>

              <div className="text-right border-l pl-4 font-mono text-[10px] text-zinc-550 leading-relaxed">
                Courier: MBO LUKAS<br />
                ID: +243 998 726 150
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE LOG STACKS SERVICES */}
        <div className="space-y-6">
          
          {/* GOOGLE SHEETS SERVICES PANEL */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-semibold text-xs font-mono">
              <FileSpreadsheet className="w-4 h-4" />
              <span>GOOGLE SHEETS API AUDIT REGISTER</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 leading-normal">
              La transaction a été instantanément comptabilisée sur le registre financier auditable partagé.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850 font-mono text-[9px] text-zinc-600 dark:text-zinc-400 space-y-1.5 overflow-x-auto">
              <div className="grid grid-cols-4 gap-2 font-bold border-b pb-1 mb-1.5 text-zinc-400">
                <span>TX_ID</span>
                <span>ACHETEUR</span>
                <span>MONTANT</span>
                <span>ESCROW</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <span className="text-zinc-900 dark:text-white font-semibold">{tx.id}</span>
                <span className="truncate">{tx.buyerName.split(" ")[0]}</span>
                <span className="font-bold">{tx.price} {tx.currency}</span>
                <span className="text-green-600 font-semibold">{tx.escrowStatus}</span>
              </div>
            </div>
          </div>

          {/* GOOGLE CALENDAR SERVICES PANEL */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-500 font-semibold text-xs font-mono">
              <Calendar className="w-4 h-4" />
              <span>GOOGLE CALENDAR LOGISTICS SCHEDULE</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 leading-normal">
              Créneau horaire de livraison programmé et bloqué dans l'agenda du coursier de {tx.city}.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 flex gap-3 text-xs">
              <div className="bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded text-center text-red-650 font-mono select-none h-fit">
                <span className="text-[10px] block uppercase text-red-550">MER</span>
                <span className="text-lg font-bold">03</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Session de Livraison</span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">KUFULULA Delivery Appointment</p>
                <p className="text-[10px] text-zinc-500 font-mono">15:00 - 15:30 (Heure Locale)</p>
              </div>
            </div>
          </div>

          {/* GOOGLE KEEP INSTRUCTIONS PANEL */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs font-mono">
              <StickyNote className="w-4 h-4" />
              <span>GOOGLE KEEP CHIEF LOG BRIEF</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 leading-normal">
              Note partagée générée automatiquement contenant le briefing de livraison et l'itinéraire d'accès.
            </p>

            <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/40 p-3.5 rounded-xl font-sans text-xs text-amber-900 dark:text-amber-400 leading-normal">
              <span className="font-bold block mb-1">Briefing Coursier #{tx.id}</span>
              <p className="text-[11px] leading-relaxed">
                Remettre au client à l'adresse : "{tx.deliveryAddress} ({tx.city})".<br />
                Vérifier impérativement le justificatif physique. Signature séquestre requise pour libérer le mobile money. Contact client: {tx.phoneNumber}.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
