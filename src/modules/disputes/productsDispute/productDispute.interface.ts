import { IProductDispute } from "./productDispute.model";

export interface BuyerResolveDisputeParams {
  transaction_id: string;
}

export interface BuyerResolveDisputeBody {
  vendor_name: string;
  vendor_phone_number: string;
  vendor_email: string;
  transaction_type: string;
  product_name: string;
  product_quantity: number;
  product_price: number;
  transaction_total: number;
  product_image: string;
  product_description: string;
  signed_escrow_doc?: string;
  delivery_address: string;
}

export interface BuyerResolveDisputeResponse {
  status: string;
  message: string;
  data: {
    // transaction: any; // Replace with IProductTransaction if schema is defined
    dispute: IProductDispute;
  };
}

export interface SellerResolveDisputeParams {
  transaction_id: string;
}

export interface SellerResolveDisputeBody {
  resolution_description: string;
}

export interface SellerResolveDisputeResponse {
  status: string;
  message: string;
  data: {
    // transaction: any; // Replace with IProductTransaction if schema is defined
    dispute: IProductDispute;
  };
}
