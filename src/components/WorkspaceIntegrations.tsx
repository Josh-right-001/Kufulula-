import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Map, FileSpreadsheet, Calendar, StickyNote, Mail, Bell, 
  MapPin, Navigation, Compass, ShieldCheck, CheckCircle, Clock,
  Send, User, Folder, Plus, Trash, Search, FileText, Phone,
  ShieldAlert, LogIn, RefreshCw, ChevronRight, CheckCircle2,
  ExternalLink, ArrowLeft, Download, PlusCircle, PenTool, AlertTriangle, Sparkles
} from "lucide-react";
import { DirectTransaction } from "../types";
import { getAccessToken, KAuth } from "../lib/firebase";

interface WorkspaceIntegrationsProps {
  transaction: DirectTransaction | null;
  onResetCheckout: () => void;
  activeTheme?: any;
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

export default function WorkspaceIntegrations({ transaction, onResetCheckout, activeTheme }: WorkspaceIntegrationsProps) {
  // Navigation tabs switcher state
  const [subTab, setSubTab] = useState<'logistics' | 'workspace'>('workspace');

  // Unified dynamic transaction setup
  const [tx, setTx] = useState<DirectTransaction>(() => transaction || {
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
  });

  const selectedCityData = CITY_MAPS[tx.city] || CITY_MAPS.Kinshasa;

  // Active Google OAuth in-memory token state
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isConnecting, setIsConnecting] = useState(false);

  // Sub-tabs for the Workspace integrations
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'gmail' | 'calendar' | 'contacts' | 'drive'>('gmail');

  // Google APIs loading states
  const [gmailLoading, setGmailLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);

  // Connected APIs states
  const [emails, setEmails] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);

  // Selected details drawer states
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  // Error logging state
  const [apiError, setApiError] = useState<string | null>(null);

  // New Email Composer Inputs
  const [emailTo, setEmailTo] = useState(tx.buyerEmail);
  const [emailSubject, setEmailSubject] = useState(`Confirmation de votre commande Kufulula - ${tx.id}`);
  const [emailBody, setEmailBody] = useState(`Bonjour ${tx.buyerName},\n\nNous confirmons que votre paiement de ${tx.price} ${tx.currency} via ${tx.paymentMethod} a été correctement placé sous séquestre sécurisé.\n\nContenu : ${tx.productTitle}\nLieu de livraison : ${tx.deliveryAddress} (${tx.city})\nOption : Livraison sécurisée main propre.\n\nMerci de faire confiance à KUFULULA.cd !`);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // New Event Planner Inputs
  const [eventSummary, setEventSummary] = useState(`Livraison KUFULULA - ${tx.buyerName}`);
  const [eventDate, setEventDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().substring(0, 10);
  });
  const [eventTime, setEventTime] = useState("14:00");
  const [eventDuration, setEventDuration] = useState("30"); // minutes
  const [eventDescription, setEventDescription] = useState(`Livraison de l'article : ${tx.productTitle}\nCode de vérification séquestre requis.\nTéléphone acheteur : ${tx.phoneNumber}\nAdresse de livraison : ${tx.deliveryAddress}`);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);

  // File Creator Input
  const [fileName, setFileName] = useState(`REPAUDIT_KUFULULA_${tx.id}.txt`);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [fileSuccess, setFileSuccess] = useState(false);

  // Search filter for contacts
  const [contactsQuery, setContactsQuery] = useState("");

  // Courier map animation indexes
  const [pathIndex, setPathIndex] = useState(0);
  const [courierDot, setCourierDot] = useState<[number, number]>([100, 100]);
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Handle Google authentic
  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      setApiError(null);
      await KAuth.signInWithGoogleReal();
      const loadedToken = getAccessToken();
      setToken(loadedToken);
    } catch (err: any) {
      console.error("SignIn failed", err);
      setApiError("Échec de connexion avec Google. " + (err.message || ""));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await KAuth.signOut();
    setToken(null);
    setEmails([]);
    setCalendarEvents([]);
    setContacts([]);
    setDriveFiles([]);
  };

  // Courier simulation triggers
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
          return prevIndex;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [tx.city]);

  // Loading datastreams depending on sub-tab
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setApiError(null);
      try {
        if (workspaceSubTab === 'gmail') {
          setGmailLoading(true);
          const messagesListResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!messagesListResponse.ok) {
            if (messagesListResponse.status === 401) {
              setToken(null); // token expired
              return;
            }
            throw new Error("Impossible d'obtenir la boîte de réception.");
          }
          const listJson = await messagesListResponse.json();
          if (listJson.messages && listJson.messages.length > 0) {
            const richEmails = await Promise.all(
              listJson.messages.map(async (msg: any) => {
                try {
                  const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const detail = await detailResponse.json();
                  const headers = detail.payload?.headers || [];
                  const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "Sans objet";
                  const sender = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Inconnu";
                  const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";
                  return {
                    id: msg.id,
                    subject,
                    sender,
                    date,
                    snippet: detail.snippet || ""
                  };
                } catch (e) {
                  return { id: msg.id, subject: "Message protégé ", sender: "Google Secure", date: "", snippet: "Contenu restreint." };
                }
              })
            );
            setEmails(richEmails);
          } else {
            setEmails([]);
          }
        } 
        else if (workspaceSubTab === 'calendar') {
          setCalendarLoading(true);
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Impossible d'accéder au calendrier.");
          const calendarJson = await res.json();
          setCalendarEvents(calendarJson.items || []);
        } 
        else if (workspaceSubTab === 'contacts') {
          setContactsLoading(true);
          const res = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=30", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Impossible d'accéder aux contacts.");
          const contactsJson = await res.json();
          const mapped = (contactsJson.connections || []).map((c: any) => {
            const name = c.names?.[0]?.displayName || "Contact sans nom";
            const email = c.emailAddresses?.[0]?.value || "Pas d'adresse email";
            const phone = c.phoneNumbers?.[0]?.value || "Pas de numéro";
            const photo = c.photos?.[0]?.url || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;
            return { name, email, phone, photo };
          });
          setContacts(mapped);
        } 
        else if (workspaceSubTab === 'drive') {
          setDriveLoading(true);
          const res = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,thumbnailLink,webViewLink,createdTime)", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Impossible d'accéder à Google Drive.");
          const driveJson = await res.json();
          setDriveFiles(driveJson.files || []);
        }
      } catch (err: any) {
        console.error("Workspace Fetch API error:", err);
        setApiError(err.message || "Erreur de chargement de l'API Google.");
      } finally {
        setGmailLoading(false);
        setCalendarLoading(false);
        setContactsLoading(false);
        setDriveLoading(false);
      }
    };

    loadData();
  }, [token, workspaceSubTab]);

  // MUTATING ACTIONS WITH STRICT MANDATORY CONFIRMATIONS

  // Send an actual email to Gmail API (Safe base64)
  const handleSendEmail = async () => {
    if (!token) return;
    
    // Mandated rule: MUST ask for explicit confirmation before mutative operation
    const confirmed = window.confirm(
      `Voulez-vous envoyer un e-mail réel depuis votre compte Google à "${emailTo}" ?\n\nSujet: ${emailSubject}`
    );
    if (!confirmed) return;

    setIsSendingEmail(true);
    setApiError(null);
    setEmailSuccess(false);

    try {
      const emailContent = [
        `To: ${emailTo}`,
        `Subject: ${emailSubject}`,
        `Content-type: text/plain; charset=utf-8`,
        ``,
        emailBody
      ].join('\r\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!response.ok) {
        throw new Error("L'envoi de l'email par l'API Gmail a échoué.");
      }

      setEmailSuccess(true);
      // Reload inbox to see if sent
      setWorkspaceSubTab('gmail');
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (e: any) {
      console.error(e);
      setApiError(e.message || "Impossible d'envoyer l'e-mail.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Create an actual schedule event on Calendar primary
  const handleCreateCalendarEvent = async () => {
    if (!token) return;

    // Mandated rule: MUST ask for explicit confirmation before schedule creation
    const dateTimeStart = `${eventDate}T${eventTime}:00`;
    const durationMin = parseInt(eventDuration, 10) || 30;
    const startObj = new Date(dateTimeStart);
    const endObj = new Date(startObj.getTime() + durationMin * 60000);
    const dateTimeEnd = endObj.toISOString();

    const confirmed = window.confirm(
      `Confirmez-vous l'ajout de cet événement de livraison réel dans votre agenda Google ?\n\nActivité: ${eventSummary}\nDate: ${eventDate} à ${eventTime}`
    );
    if (!confirmed) return;

    setIsCreatingEvent(true);
    setApiError(null);
    setEventSuccess(false);

    try {
      const bodyPayload = {
        summary: eventSummary,
        description: eventDescription,
        location: `${tx.deliveryAddress}, ${tx.city}, RDC`,
        start: {
          dateTime: startObj.toISOString(),
          timeZone: "Africa/Kinshasa"
        },
        end: {
          dateTime: endObj.toISOString(),
          timeZone: "Africa/Kinshasa"
        }
      };

      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        throw new Error("L'ajout de l'agenda par l'API Google Calendar a échoué.");
      }

      setEventSuccess(true);
      // Force reload calendar events
      setWorkspaceSubTab('calendar');
      setTimeout(() => setEventSuccess(false), 5000);
    } catch (e: any) {
      console.error(e);
      setApiError(e.message || "Échec d'ajout au Calendrier.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Generate audit file receipt in Google Drive
  const handleUploadDriveFile = async () => {
    if (!token) return;

    // Mandated rule: MUST ask for explicit confirmation before uploading/creating a file
    const confirmed = window.confirm(
      `Voulez-vous générer et enregistrer le fichier d'audit de transaction "${fileName}" dans votre espace Google Drive ?`
    );
    if (!confirmed) return;

    setIsCreatingFile(true);
    setApiError(null);
    setFileSuccess(false);

    try {
      const fileContent = `================================================
KUFULULA.cd SAFE ESCROW TRANSACTION LOG
================================================
ID TRANSACTION : ${tx.id}
DATE : ${tx.timestamp}
ARTICLE : ${tx.productTitle}
MONTANT : ${tx.price} ${tx.currency}
ACHETEUR : ${tx.buyerName}
EMAIL ACHETEUR : ${tx.buyerEmail}
MODE DE PAIEMENT : ${tx.paymentMethod}
SÉQUESTRE STATUT : ${tx.escrowStatus}
ADRESSE DE LIVRAISON : ${tx.deliveryAddress}
VILLE : ${tx.city}
KYC SCORE FIDÉLITÉ: ${tx.kycRequiredScore}%
SÉQUENCE COMPTABILISÉE : Google Sheets Real-time Registre
================================================
RÉCAPITULATIF SÉCURISÉ DRC TRUST SERVICE
`;

      // Step 1: Create metadata to set the name and type
      const metaRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: fileName,
          mimeType: "text/plain"
        })
      });

      if (!metaRes.ok) {
        throw new Error("La création de métadonnées du fichier a échoué.");
      }

      const metaData = await metaRes.json();
      const fileId = metaData.id;

      // Step 2: Upload content using PATCH tool
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain"
        },
        body: fileContent
      });

      if (!uploadRes.ok) {
        throw new Error("L'envoi du contenu du fichier dans Drive a échoué.");
      }

      setFileSuccess(true);
      // Reload Drive list
      setWorkspaceSubTab('drive');
      setTimeout(() => setFileSuccess(false), 5000);
    } catch (e: any) {
      console.error(e);
      setApiError(e.message || "Échec d'exportation vers Google Drive.");
    } finally {
      setIsCreatingFile(false);
    }
  };

  // Helper utility to import contacts as transaction data
  const handleSelectContactForTransaction = (contact: any) => {
    const updatedTx = {
      ...tx,
      buyerName: contact.name.toUpperCase(),
      buyerEmail: contact.email !== "Pas d'email" ? contact.email : tx.buyerEmail,
      phoneNumber: contact.phone !== "Pas de numéro" ? contact.phone : tx.phoneNumber
    };
    setTx(updatedTx);
    setEmailTo(updatedTx.buyerEmail);
    setEventSummary(`Livraison KUFULULA - ${updatedTx.buyerName}`);
    setEventDescription(`Livraison de l'article : ${updatedTx.productTitle}\nTéléphone acheteur : ${updatedTx.phoneNumber}\nAdresse de livraison : ${updatedTx.deliveryAddress}`);
    alert(`Données de l'acheteur importées avec succès pour : ${contact.name}`);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 font-sans p-4 md:p-6 text-zinc-900 dark:text-zinc-100 space-y-6">
      
      {/* HEADER CONTROLS AREA WITH MODE CONTROLLER */}
      <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded-3xl p-4 md:p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF8C00] uppercase font-black">HISTORIQUE DES TRANSACTIONS & COMMUNIQUÉ</span>
          <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-white flex items-center gap-2">
            <CheckCircle className="text-[#FF8C00] w-6 h-6 animate-pulse" />
            Portail de Suivi Logistique RDC
          </h2>
          <p className="text-xs text-zinc-400 leading-normal max-w-xl">
            Suivez l'état de votre paquet en RDC ou connectez vos services de bureautique <strong className="text-amber-400">Google Workspace Connect (Intégré)</strong> pour organiser des livraisons réelles.
          </p>
        </div>

        {/* Dynamic Dual Tab Swapper */}
        <div className="flex gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-white/5 h-fit text-xs font-mono self-start md:self-center">
          <button
            onClick={() => setSubTab('logistics')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'logistics' 
                ? "bg-zinc-950 text-white border border-white/10" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" /> Carte de Suivi (RDC)
          </button>
          <button
            onClick={() => setSubTab('workspace')}
            className={`px-4 py-2 rounded-xl font-bold transition-all relative flex items-center gap-1.5 ${
              subTab === 'workspace' 
                ? "bg-[#FF8C00] text-zinc-950 shadow-lg" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" /> Google Workspace Connect
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          </button>
        </div>
      </div>

      {subTab === 'logistics' ? (
        /* LOGISTICS INNER ZONE (THE PREVIOUS LOGISTICS CARDS KEEPING EVERYTHING SAFE) */
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-4 flex items-center justify-between text-xs font-mono">
            <span>TRANSACTION : <strong className="text-emerald-505">{tx.id}</strong></span>
            <button
              onClick={onResetCheckout}
              className="px-4 py-1.5 bg-[#FF8C00] text-zinc-950 font-bold rounded-xl hover:bg-amber-500 transition-all font-sans"
            >
              Retour Boutique
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Map visualizer */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[520px]">
              <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Map className="w-4 h-4 text-zinc-500" />
                  <span>LOGISTICS MAP // CONGO ROUTE</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <Navigation className="w-3 h-3 text-[#FF8C00] shrink-0" />
                  <span className="uppercase tracking-wider">Itinéraire Établi ({tx.city})</span>
                </div>
              </div>

              <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-800 flex items-center gap-1.5 font-mono text-[9px]">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                  <span>OUEST-EST</span>
                </div>

                <svg className="w-full h-full min-h-[300px] select-none" viewBox="0 0 600 400">
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

                  <polyline
                    points={selectedCityData.courierPath.slice(0, pathIndex + 1).map(p => p.join(",")).join(" ")}
                    fill="none"
                    stroke="#FF8C00"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="transition-all duration-300"
                  />

                  {selectedCityData.landmarks.map((mark, idx) => (
                    <g key={idx} transform={`translate(${mark.x}, ${mark.y})`}>
                      <circle r="4" fill="#6b7280" />
                      <text 
                        y="15" 
                        textAnchor="middle" 
                        className="font-mono text-[9px] font-bold text-zinc-400 fill-zinc-400"
                      >
                        {mark.name}
                      </text>
                    </g>
                  ))}

                  <motion.g
                    animate={{ x: courierDot[0], y: courierDot[1] }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <circle r="16" fill="#FF8C00" className="animate-ping opacity-15" />
                    <circle r="10" fill="#FF8C00" className="shadow-lg stroke-white stroke-2" />
                    <rect x="-4" y="-4" width="8" height="8" fill="#ffffff" rx="1.5" />
                  </motion.g>
                </svg>

                <div className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-white/5 p-4 rounded-2xl flex justify-between items-center text-xs shadow-xl text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#FF8C00]/10 text-[#FF8C00] rounded-xl">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Heure d'arrivée estimée (ETA)</span>
                      <p className="text-sm font-semibold tracking-tight text-white font-mono mt-0.5">
                        {pathIndex + 1 === selectedCityData.courierPath.length 
                          ? "✓ Livré en main propre" 
                          : `~ ${etaMinutes} minutes restantes - Trafic Modéré`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right border-l border-white/10 pl-4 font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Courier: MBO LUKAS<br />
                    ID: +243 998 726 150
                  </div>
                </div>
              </div>
            </div>

            {/* Micro audits panels simulated */}
            <div className="space-y-6">
              <div className="bg-zinc-905 border border-white/5 text-white p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-green-500 font-semibold text-xs font-mono">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>GOOGLE SHEETS API AUDIT (FALLBACK)</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  La transaction est comptabilisée localement sur la feuille de logs financiers. Connectez votre compte Google Workspace pour un envoi automatique.
                </p>
                <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 font-mono text-[9px] text-zinc-400 space-y-1.5 overflow-x-auto">
                  <div className="grid grid-cols-4 gap-2 font-bold border-b border-white/10 pb-1 mb-1 text-zinc-500">
                    <span>ID</span>
                    <span>ACHETEUR</span>
                    <span>PRIX</span>
                    <span>PAYS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-white font-semibold">{tx.id.substring(0, 7)}</span>
                    <span className="truncate">{tx.buyerName.split(" ")[0]}</span>
                    <span className="text-emerald-400 font-bold">{tx.price}$</span>
                    <span>RDC</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-905 border border-white/5 text-white p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-semibold text-xs font-mono">
                  <Calendar className="w-4 h-4" />
                  <span>CALENDAR logistics (FALLBACK)</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Rendez-vous de livraison prévu par défaut. Synchronisez votre Google Calendar réel pour l'éditer en direct.
                </p>
                <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex gap-3 text-xs">
                  <div className="bg-red-500/10 px-2.5 py-1 rounded text-center text-red-400 font-mono select-none h-fit">
                    <span className="text-[9px] block uppercase text-red-500">CONGO</span>
                    <span className="text-lg font-bold">LIV</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] uppercase font-mono text-zinc-500">Livraison Planifiée</span>
                    <p className="text-xs font-semibold text-zinc-300 truncate">{tx.productTitle}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">Mercredi 15:00 - {tx.city}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-905 border border-white/5 text-white p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs font-mono">
                  <StickyNote className="w-4 h-4" />
                  <span>KEEP INSTRUCTIONS LOG (FALLBACK)</span>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl font-sans text-xs text-amber-300 leading-normal">
                  <span className="font-bold block mb-1">Briefing Coursier #{tx.id}</span>
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    Remettre au client à l'adresse : "{tx.deliveryAddress}". Signature séquestre requise pour débloquer le versement.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* REAL GOOGLE WORKSPACE API HUB VIEW */
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!token ? (
              /* DISCONNECTED SIGN IN REQUIRED STATE */
              <motion.div
                key="google-workspace-disconnected"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-zinc-900 border border-white/10 p-6 md:p-10 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl"
              >
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-full flex items-center justify-center mx-auto text-[#FF8C00]">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black font-sans text-white uppercase tracking-tight">
                    Connexion Google Workspace requise
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Connectez votre compte pour piloter l'administration de KUFULULA.cd en temps réel de façon sécurisée (avec permission de l'utilisateur).
                  </p>
                </div>

                {/* Details list of what each Google API will do */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mr-0.5">
                  <div className="border border-white/5 bg-zinc-950/40 p-4 rounded-2xl flex items-start gap-3">
                    <Mail className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Gmail Connector</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        Consultez votre boîte mail et envoyez des e-mails ou des factures de confirmation d'escroquerie à vos clients avec votre accord explicite.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/5 bg-zinc-950/40 p-4 rounded-2xl flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Calendar Planner</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        Consultez vos prochains rendez-vous et bloquez automatiquement les dates de livraisons sécurisées dans votre agenda.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/5 bg-zinc-950/40 p-4 rounded-2xl flex items-start gap-3">
                    <User className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Contacts Linker</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        Recherchez vos contacts Google pour renseigner l'adresse ou le nom de l'acheteur en un clic.
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/5 bg-zinc-950/40 p-4 rounded-2xl flex items-start gap-3">
                    <Folder className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Drive Secure Vault</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                        Parcourez vos fichiers existants et exportez vos journaux ou reçus d'audit TXT directement dans votre Google Drive.
                      </p>
                    </div>
                  </div>
                </div>

                {apiError && (
                  <div className="text-xs bg-red-950/20 text-red-400 border border-red-500/20 p-3 rounded-xl max-w-sm mx-auto font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Styled Sign In with Google Button aligned with Workspace integrations skill */}
                <div className="pt-2 flex justify-center">
                  <button 
                    disabled={isConnecting}
                    onClick={handleConnectGoogle}
                    className="flex items-center gap-3 bg-white text-zinc-900 font-sans text-sm font-semibold hover:bg-zinc-100 px-6 py-3.5 rounded-xl shadow-lg transition-all border border-zinc-200 active:scale-95 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-[#FF8C00]" />
                    ) : (
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    )}
                    <span>Se connecter avec de vrais services Google Workspace</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* CONNECTED ACTIVE WORKSPACE APPLET ZONE */
              <motion.div
                key="google-workspace-connected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                
                {/* Side Navigation for Workspace Suites */}
                <div className="lg:col-span-1 bg-zinc-900 border border-white/5 p-4 rounded-3xl space-y-4 h-fit">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-450 uppercase font-black">AUTHENTIFICATION ACTIVE</span>
                      <p className="text-xs text-white font-bold leading-normal">Google Workspace Hub</p>
                    </div>

                    <button
                      onClick={handleDisconnectGoogle}
                      className="text-[10px] bg-zinc-950 text-red-400 hover:text-white hover:bg-red-950 px-2.5 py-1.5 rounded-lg font-mono border border-white/5 hover:border-red-500/20 transition-all active:scale-95"
                    >
                      Déconnexion
                    </button>
                  </div>

                  {/* Specific Active Tab Selection Switchers */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'gmail', label: "📬 Boîte & Envois Gmail", color: "hover:bg-red-500/10 text-red-400" },
                      { id: 'calendar', label: "📅 Calendrier & Livraisons", color: "hover:bg-blue-500/10 text-blue-400" },
                      { id: 'contacts', label: "👥 Contacts & Intégrations", color: "hover:bg-green-500/10 text-green-400" },
                      { id: 'drive', label: "📁 Google Drive Stockage", color: "hover:bg-amber-500/10 text-amber-400" }
                    ].map((tabItem) => (
                      <button
                        key={tabItem.id}
                        onClick={() => {
                          setWorkspaceSubTab(tabItem.id as any);
                          setApiError(null);
                        }}
                        className={`w-full py-3 px-4 rounded-xl text-left text-xs font-mono font-bold transition-all border flex items-center justify-between ${
                          workspaceSubTab === tabItem.id 
                            ? "bg-white text-zinc-950 border-white shadow-lg" 
                            : `bg-zinc-950/40 text-zinc-400 border-white/5 ${tabItem.color}`
                        }`}
                      >
                        <span>{tabItem.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>

                  {/* Active Transaction short capsule */}
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-white/5 space-y-2 mt-4">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase font-bold">Transaction liée :</span>
                    <div className="flex justify-between text-xs text-white font-semibold">
                      <span className="text-[#FF8C00]">{tx.id}</span>
                      <span>{tx.price} {tx.currency}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                       {tx.productTitle}
                    </p>
                    <div className="text-[9px] font-mono text-zinc-500 border-t border-white/5 pt-1">
                      Acheteur: {tx.buyerName}
                    </div>
                  </div>
                </div>

                {/* Main Content Workspace viewport */}
                <div className="lg:col-span-3 bg-zinc-900 border border-white/5 p-6 rounded-3xl min-h-[480px] flex flex-col">
                  
                  {apiError && (
                    <div className="mb-4 text-xs bg-red-950/20 text-red-400 border border-red-500/20 p-3 rounded-xl font-mono flex items-center justify-between gap-4">
                      <span className="truncate pr-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Erreur : {apiError}</span>
                      </span>
                      <button 
                        onClick={() => setWorkspaceSubTab(workspaceSubTab)} // reload
                        className="p-1 px-3 bg-zinc-950 rounded text-[9px] hover:bg-zinc-805"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}

                  {/* GMAIL SUB-VIEW MODULE */}
                  {workspaceSubTab === 'gmail' && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="border-b border-white/10 pb-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans uppercase">
                            <Mail className="w-4 h-4 text-red-500" />
                            Client de Messagerie Gmail Intégré
                          </h3>
                          <p className="text-[10px] text-zinc-455">
                            Accédez aux derniers messages de votre compte réel et rédigez des avis de confirmation sécurisés.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        
                        {/* Column Left: Inbox emails list */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">Boîte de Réception Réelle</label>
                          
                          {gmailLoading ? (
                            <div className="py-20 text-center space-y-2">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF8C00]" />
                              <p className="text-[10px] font-mono text-zinc-500">Flux Gmail en cours de rapatriement...</p>
                            </div>
                          ) : emails.length > 0 ? (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                              {emails.map((email) => (
                                <button
                                  key={email.id}
                                  onClick={() => setSelectedEmail(email)}
                                  className={`w-full text-left p-3 rounded-xl border font-sans select-none transition-all ${
                                    selectedEmail?.id === email.id
                                      ? "bg-[#FF8C00]/10 border-[#FF8C00]"
                                      : "bg-zinc-950/40 border-white/5 hover:border-white/15"
                                  }`}
                                >
                                  <div className="flex justify-between items-start text-[9px] font-mono mb-1">
                                    <span className="text-[#FF8C00] font-bold truncate max-w-[150px]">{email.sender}</span>
                                    <span className="text-zinc-500 whitespace-nowrap">{email.date.substring(0, 16)}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white truncate">{email.subject}</h4>
                                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{email.snippet}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="py-20 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl">
                              <Mail className="w-8 h-8 mx-auto stroke-[1.2] opacity-40 mb-2" />
                              <p className="text-[11px] font-mono">Aucun message trouvé ou erreur d'API.</p>
                            </div>
                          )}
                        </div>

                        {/* Column Right: Email Sender Composer OR Email details viewer */}
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex flex-col">
                          
                          {selectedEmail ? (
                            /* Email Reader Pane */
                            <div className="space-y-4 h-full flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <button
                                    onClick={() => setSelectedEmail(null)}
                                    className="text-[10px] text-amber-500 font-mono hover:underline flex items-center gap-1"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                    Retourner à la rédaction de confirmation
                                  </button>
                                  <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-400">LECTEUR GMAIL</span>
                                </div>

                                <div className="border-b border-white/5 pb-2.5 space-y-1">
                                  <div className="text-[10px] font-mono text-zinc-500">
                                    De : <strong className="text-white">{selectedEmail.sender}</strong>
                                  </div>
                                  <h4 className="text-sm font-bold text-white">{selectedEmail.subject}</h4>
                                  <span className="text-[9px] text-zinc-500 block">{selectedEmail.date}</span>
                                </div>

                                <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                                  {selectedEmail.snippet}...
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  // Pre-fill composer reply
                                  setEmailTo(selectedEmail.sender.includes("<") ? selectedEmail.sender.split("<")[1].split(">")[0] : selectedEmail.sender);
                                  setEmailSubject(`RE: ${selectedEmail.subject}`);
                                  setSelectedEmail(null);
                                }}
                                className="w-full py-2 bg-zinc-900 border border-white/10 hover:border-amber-400 text-amber-550 text-xs font-mono font-bold rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
                              >
                                <PenTool className="w-3.5 h-3.5 text-amber-500" /> Rédiger une réponse à cet e-mail
                              </button>
                            </div>
                          ) : (
                            /* Composer Pane */
                            <div className="space-y-3 flex-1 flex flex-col">
                              <label className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">Rédiger un email d'acquittement</label>
                              
                              <div className="space-y-2 flex-1 flex flex-col text-xs font-mono">
                                <div>
                                  <span className="text-[9px] text-zinc-500">Destinataire :</span>
                                  <input
                                    type="email"
                                    value={emailTo}
                                    onChange={(e) => setEmailTo(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white"
                                  />
                                </div>

                                <div>
                                  <span className="text-[9px] text-zinc-500">Sujet de l'acte :</span>
                                  <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white font-semibold"
                                  />
                                </div>

                                <div className="flex-1 flex flex-col min-h-[140px]">
                                  <span className="text-[9px] text-zinc-500">Corps du courriel :</span>
                                  <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full flex-1 p-2 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white text-xs font-sans leading-relaxed resize-none"
                                  />
                                </div>
                              </div>

                              {emailSuccess && (
                                <div className="text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 p-2 rounded-lg font-mono">
                                  ✓ Courriel envoyé avec succès !
                                </div>
                              )}

                              <button
                                disabled={isSendingEmail || !emailTo}
                                onClick={handleSendEmail}
                                className="w-full py-2.5 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 text-xs font-mono font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 self-end mt-2"
                              >
                                {isSendingEmail ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                Envoyer le Courriel Réel
                              </button>
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  )}

                  {/* GOOGLE CALENDAR SUB-VIEW MODULE */}
                  {workspaceSubTab === 'calendar' && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="border-b border-white/10 pb-3">
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans uppercase">
                          <Calendar className="w-4 h-4 text-blue-400 animate-pulse" />
                          Planification Active de Livraisons Google Calendar
                        </h3>
                        <p className="text-[10px] text-zinc-455">
                          Enregistrez des créneaux horaires de distribution et liez-les au calendrier de votre boutique ou de vos livreurs en direct.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        
                        {/* Event List on Left Column */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Événements Réels Inscrits (À venir)</label>
                          
                          {calendarLoading ? (
                            <div className="py-20 text-center space-y-2">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF8C00]" />
                              <p className="text-[10px] font-mono text-zinc-500">Vérification de l'agenda Google...</p>
                            </div>
                          ) : calendarEvents.length > 0 ? (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                              {calendarEvents.map((evt) => {
                                const startDate = evt.start?.dateTime ? new Date(evt.start.dateTime) : (evt.start?.date ? new Date(evt.start.date) : null);
                                return (
                                  <div
                                    key={evt.id}
                                    className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl font-sans"
                                  >
                                    <div className="flex justify-between items-start text-[9px] font-mono mb-1">
                                      <span className="text-blue-400 font-bold max-w-[150px] truncate">{evt.organizer?.email?.split("@")[0].toUpperCase() || "MON AGENDA"}</span>
                                      <span className="text-zinc-500 whitespace-nowrap">
                                        {startDate ? startDate.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Pas de date"}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white line-clamp-1">{evt.summary}</h4>
                                    {evt.description && (
                                      <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-sans italic">{evt.description}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-20 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl">
                              <Calendar className="w-8 h-8 mx-auto stroke-[1.2] opacity-40 mb-2" />
                              <p className="text-[11px] font-mono">Aucun événement à venir trouvé.</p>
                            </div>
                          )}
                        </div>

                        {/* Event Planner Form on Right Column */}
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-3">
                          <label className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Bloquer un horaire de remise</label>
                          
                          <div className="space-y-2 text-xs font-mono">
                            <div>
                              <span className="text-[9px] text-zinc-500">Titre de l'activité (Calendrier) :</span>
                              <input
                                type="text"
                                value={eventSummary}
                                onChange={(e) => setEventSummary(e.target.value)}
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] text-zinc-500">Sélection Date :</span>
                                <input
                                  type="date"
                                  value={eventDate}
                                  onChange={(e) => setEventDate(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] text-zinc-500">Heure Locale :</span>
                                <input
                                  type="time"
                                  value={eventTime}
                                  onChange={(e) => setEventTime(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] text-zinc-500">Durée d'attente estimée :</span>
                              <select
                                value={eventDuration}
                                onChange={(e) => setEventDuration(e.target.value)}
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white"
                              >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes (Recommandé)</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">1 Heure</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[9px] text-zinc-500">Description / Note de brief :</span>
                              <textarea
                                value={eventDescription}
                                onChange={(e) => setEventDescription(e.target.value)}
                                className="w-full p-2 h-[80px] bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-white text-[11px] font-sans resize-none"
                              />
                            </div>
                          </div>

                          {eventSuccess && (
                            <div className="text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 p-2 rounded-lg font-mono">
                              ✓ Événement inscrit dans votre calendrier réel !
                            </div>
                          )}

                          <button
                            disabled={isCreatingEvent || !eventSummary}
                            onClick={handleCreateCalendarEvent}
                            className="w-full py-2.5 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 text-xs font-mono font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-30"
                          >
                            {isCreatingEvent ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            Placer un rendez-vous réel
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* GOOGLE CONTACTS SUB-VIEW MODULE */}
                  {workspaceSubTab === 'contacts' && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="border-b border-white/10 pb-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans uppercase">
                            <User className="w-4 h-4 text-green-400" />
                            Contacts & Collaborateurs Google People Connecté
                          </h3>
                          <p className="text-[10px] text-zinc-455">
                            Recherchez vos contacts Google pour renseigner l'acheteurs du Bon de Séquestre ou envoyer des invitations.
                          </p>
                        </div>

                        {/* Search Contacts in real-time */}
                        <div className="relative w-full max-w-[200px]">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Rechercher contact..."
                            value={contactsQuery}
                            onChange={(e) => setContactsQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/5 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-green-400 text-xs text-white"
                          />
                        </div>
                      </div>

                      {contactsLoading ? (
                        <div className="py-20 text-center space-y-2">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF8C00]" />
                          <p className="text-[10px] font-mono text-zinc-500">Mise en relation avec vos contacts Google...</p>
                        </div>
                      ) : contacts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-1">
                          {contacts
                            .filter(c => c.name.toLowerCase().includes(contactsQuery.toLowerCase()) || c.email.toLowerCase().includes(contactsQuery.toLowerCase()))
                            .map((contact, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3"
                              >
                                <div className="flex items-start gap-3">
                                  <img
                                    src={contact.photo}
                                    alt={contact.name}
                                    className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                                    <p className="text-[10px] text-zinc-400 truncate">{contact.email}</p>
                                    <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                                      <Phone className="w-2.5 h-2.5" />
                                      {contact.phone}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleSelectContactForTransaction(contact)}
                                  className="w-full py-1.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-zinc-950 text-[10px] font-mono font-bold rounded-lg border border-green-500/20 transition-all text-center flex items-center justify-center gap-1"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  Définir comme Acheteur
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div className="py-20 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl">
                          <User className="w-8 h-8 mx-auto stroke-[1.2] opacity-40 mb-2" />
                          <p className="text-[11px] font-mono">Aucun contact trouvé ou liste de contacts vide.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GOOGLE DRIVE SUB-VIEW MODULE */}
                  {workspaceSubTab === 'drive' && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="border-b border-white/10 pb-3">
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans uppercase">
                          <Folder className="w-4 h-4 text-amber-500" />
                          Stockage Sécurisé & Registres Audits Google Drive
                        </h3>
                        <p className="text-[10px] text-zinc-455">
                          Sauvegardez en un clic vos reçus d'audit de transactions en ligne ou explorez vos volumes de données professionnels Google Drive.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        
                        {/* Files display box on left column */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">Fichiers Google Drive réels</label>
                          
                          {driveLoading ? (
                            <div className="py-20 text-center space-y-2">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FF8C00]" />
                              <p className="text-[10px] font-mono text-zinc-500">Exploration de votre stockage en nuage...</p>
                            </div>
                          ) : driveFiles.length > 0 ? (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                              {driveFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-2 rounded-lg ${file.mimeType?.includes("sheet") ? "bg-green-500/10 text-green-400" : (file.mimeType?.includes("document") ? "bg-blue-500/10 text-blue-400" : "bg-zinc-800 text-zinc-400")}`}>
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-white truncate text-[11px]">{file.name}</h4>
                                      <span className="text-[8px] font-mono text-zinc-500 block truncate">{file.mimeType?.replace("application/vnd.google-apps.", "")}</span>
                                    </div>
                                  </div>

                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-zinc-500 hover:text-amber-500 rounded-lg hover:bg-zinc-950 transition-all shrink-0"
                                    title="Visualiser le fichier Google Drive"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-20 text-center text-zinc-550 border border-dashed border-white/5 rounded-2xl">
                              <Folder className="w-8 h-8 mx-auto stroke-[1.2] opacity-40 mb-2" />
                              <p className="text-[11px] font-mono">Aucun fichier trouvé sur votre Drive.</p>
                            </div>
                          )}
                        </div>

                        {/* Audit Log Backup tool on right column */}
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">Sécuriser le Reçu de Transaction</label>
                            <p className="text-[11px] text-zinc-400 leading-normal">
                              Générez un fichier d'audit comptable au format TXT sécurisé et importez-le directement sur votre Google Drive pour vos registres de commerce.
                            </p>

                            <div className="space-y-2 text-xs font-mono">
                              <div>
                                <span className="text-[9px] text-zinc-500">Nom du fichier rapport :</span>
                                <input
                                  type="text"
                                  value={fileName}
                                  onChange={(e) => setFileName(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF8C00] text-amber-400 text-xs font-bold"
                                />
                              </div>

                              <div className="bg-zinc-950 p-3 rounded-lg border border-white/5 text-[9px] text-zinc-500 space-y-1">
                                <strong>Log d'audit rédigé automatiqument :</strong>
                                <p className="leading-tight truncate">TXT RECEIPT LOG: {tx.id}</p>
                                <p className="leading-tight truncate">Buyer: {tx.buyerName} ({tx.buyerEmail})</p>
                                <p className="leading-tight truncate">Escrow: SECURED - Payment: {tx.paymentMethod}</p>
                              </div>
                            </div>
                          </div>

                          {fileSuccess && (
                            <div className="text-[10px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 p-2 rounded-lg font-mono">
                              ✓ Reçu financier sauvegardé dans votre Google Drive !
                            </div>
                          )}

                          <button
                            disabled={isCreatingFile || !fileName}
                            onClick={handleUploadDriveFile}
                            className="w-full py-2.5 bg-[#FF8C00] hover:bg-amber-500 text-zinc-950 text-xs font-mono font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 self-end"
                          >
                            {isCreatingFile ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Exporter d'audit vers Google Drive
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
