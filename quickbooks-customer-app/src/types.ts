export interface Customer {
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