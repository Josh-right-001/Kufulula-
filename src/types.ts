/**
 * KUFULULA Core Types Definition
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'USD' | 'CDF';
  image: string;
  category: string;
  stock: number;
  vendor: string;
  tags: string[];
  isDraft: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  comments?: { id: string; user: string; text: string; date: string }[];
  colors?: { name: string; value: string }[];
  imagesDetail?: string[];
  specifications?: { label: string; value: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'customer' | 'admin' | 'merchant';

export interface UserAuth {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  isVerified: boolean;
}

export interface KYCData {
  status: 'idle' | 'document_capture' | 'liveness' | 'verifying' | 'success' | 'failed';
  documentType?: 'PASSEPORT' | 'CARTE_ELECTEUR' | 'PERMIS_CONDUIRE' | 'CARTE_SERVICE';
  docImage?: string;
  livenessFaceImage?: string;
  ocrName?: string;
  ocrIdNumber?: string;
  confidenceScore?: number;
  livenessPassed?: boolean;
}

export type PaymentMethod = 'M-PESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'AFRIMONEY' | 'VISA_DIASPORA';

export interface DirectTransaction {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  currency: 'USD' | 'CDF';
  buyerName: string;
  buyerEmail: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  escrowStatus: 'SECURED' | 'RELEASED' | 'REFUNDED';
  kycRequiredScore: number;
  kycPassed: boolean;
  deliveryAddress: string;
  city: 'Kinshasa' | 'Goma' | 'Bukavu' | 'Lubumbashi';
  sheetLogged: boolean;
  calendarBooked: boolean;
  keepNoteCreated: boolean;
  timestamp: string;
}

export interface DeliveryState {
  transactionId: string;
  courierName: string;
  courierPhone: string;
  currentLat: number;
  currentLng: number;
  routeCoordinates: [number, number][];
  currentIndex: number;
  status: 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';
}
