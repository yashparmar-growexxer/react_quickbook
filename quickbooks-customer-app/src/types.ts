export interface Customer {
  name: string;
  Taxable?: boolean;
  BillAddr?: {
    Id?: string;
    Line1?: string;
    City?: string;
    Country?: string;
    PostalCode?: string;
  };
  Job?: boolean;
  BillWithParent?: boolean;
  Balance?: number;
  BalanceWithJobs?: number;
  CurrencyRef?: {
    value?: string;
    name?: string;
  };
  PreferredDeliveryMethod?: string;
  IsProject?: boolean;
  ClientEntityId?: string;
  domain?: string;
  sparse?: boolean;
  Id: string;
  SyncToken?: string;
  MetaData?: {
    CreateTime?: string;
    LastUpdatedTime?: string;
  };
  FullyQualifiedName?: string;
  DisplayName: string;
  PrintOnCheckName?: string;
  Active?: boolean;
  V4IDPseudonym?: string;
  PrimaryPhone?: {
    FreeFormNumber?: string;
  };
  PrimaryEmailAddr?: {
    Address?: string;
  };
  GivenName?: string;
  FamilyName?: string;
  Notes?: string;
  CompanyName?: string;
}



// types/index.ts
export interface Invoice {
  customer: any;
  CustomerMemo: string;
  lineItems: any;
  id: string;
  docNumber: string;
  customerId: string;
  totalAmount: number;
  balance: number;
  status: 'OPEN' | 'PAID' | 'PARTIALLY_PAID'; // Add other statuses if needed
  dueDate: string;
  date: string;
  customerName?: string;
  SyncToken?: string; // Optional - you might want to add this
}

// export interface Invoice {
//   id: string;
//   docNumber: string;
//   customerId: string;
//   lineItems: InvoiceLineItem[];
//   SyncToken?: string;
//   // ...other properties
// }

export interface InvoiceResponse {
  count: number;
  invoices: Invoice[];
}


export interface Item {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
  FullyQualifiedName?: string;
  Taxable?: boolean;
  UnitPrice: number;
  Type: 'Inventory' | 'Service' | 'NonInventory';
  IncomeAccountRef?: {
    value: string;
    name?: string;
  };
  ExpenseAccountRef?: {
    value: string;
    name?: string;
  };
  AssetAccountRef?: {
    value: string;
    name?: string;
  };
  PurchaseCost?: number;
  TrackQtyOnHand?: boolean;
  QtyOnHand?: number;
  InvStartDate?: string;
  MetaData?: {
    CreateTime?: string;
    LastUpdatedTime?: string;
  };
  domain?: string;
  sparse?: boolean;
  SyncToken?: string;
}


export interface Payment {
  id: string;
  paymentRefNum: string;
  totalAmount: number;
  unappliedAmount: number;
  customer: {
    id: string;
    name: string;
  };
  paymentMethod: {
    id: string;
    name: string;
  };
  depositToAccount?: {
    id: string;
    name: string;
  };
  date: string;
  privateNote?: string;
  appliedInvoices: Array<{
    amount: number;
    invoiceId: string;
    invoiceDocNumber?: string;
  }>;
  syncToken: string;
}