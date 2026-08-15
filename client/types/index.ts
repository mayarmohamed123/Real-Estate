export interface Property {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: string[];
  highlights: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: string;
  postedDate: string;
  averageRating?: number;
  numberOfReviews?: number;
  locationId: number;
  managerCognitoId: string;
  location?: Location;
}

export interface Manager {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Tenant {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  favorites?: Property[];
}

export interface Location {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?:
    | { latitude: number; longitude: number }
    | { type: string; coordinates: [number, number] };
}

export interface Application {
  id: number;
  applicationDate: string;
  status: "Pending" | "Denied" | "Approved";
  propertyId: number;
  tenantCognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
  leaseId?: number;
  property?: Property;
  tenant?: Tenant;
  lease?: Lease;
  nextPaymentDate?: string | null;
}

export interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  propertyId: number;
  tenantCognitoId: string;
  property?: Property;
  tenant?: Tenant;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate: string;
  paymentStatus: "Pending" | "Paid" | "PartiallyPaid" | "Overdue";
  leaseId: number;
}

export interface User {
  cognitoInfo: {
    userId: string;
    username: string;
  };
  userInfo: Tenant | Manager;
  userRole: string | null;
}

