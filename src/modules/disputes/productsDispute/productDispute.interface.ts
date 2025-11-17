// import { IProductDispute } from "./productDispute.model";

// export interface BuyerResolveDisputeParams {
//   transaction_id: string;
// }

// export interface BuyerResolveDisputeBody {
//   vendor_name: string;
//   vendor_phone_number: string;
//   vendor_email: string;
//   transaction_type: string;
//   product_name: string;
//   product_quantity: number;
//   product_price: number;
//   transaction_total: number;
//   product_image: string;
//   product_description: string;
//   signed_escrow_doc?: string;
//   delivery_address: string;
// }

// export interface BuyerResolveDisputeResponse {
//   status: string;
//   message: string;
//   data: {
//     // transaction: any; // Replace with IProductTransaction if schema is defined
//     dispute: IProductDispute;
//   };
// }

// export interface SellerResolveDisputeParams {
//   transaction_id: string;
// }

// export interface SellerResolveDisputeBody {
//   resolution_description: string;
// }

// export interface SellerResolveDisputeResponse {
//   status: string;
//   message: string;
//   data: {
//     // transaction: any; // Replace with IProductTransaction if schema is defined
//     dispute: IProductDispute;
//   };
// }
// export interface GetAllDisputeForAMediatorParams {
//   mediator_email: string;
// }

// export interface PaginationMeta {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

// productDispute.interface.ts

import { Document, Types } from "mongoose";

export interface IProductItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  description?: string;
}

export interface IResolutionProposal {
  proposed_by: "buyer" | "seller";
  proposed_by_email: string;
  proposal_date: Date;
  proposal_type: "description_only";
  resolution_description?: string;
  proposal_description?: string;

  proposed_changes?: {
    vendor_name?: string;
    vendor_phone_number?: string;
    vendor_email?: string;
    transaction_type?: string;
    updated_products?: IProductItem[];
    transaction_total?: number;
    signed_escrow_doc?: string;
    delivery_address?: string;
  };

  status: "pending" | "accepted" | "rejected";
  responded_by?: string;
  response_date?: Date;
  rejection_reason?: string;
}

export interface IProductDispute extends Document {
  user: Types.ObjectId;
  transaction: Types.ObjectId;
  mediator?: Types.ObjectId;
  transaction_id: string;

  resolution_description?: string; // Description of how the dispute was resolved
  dispute_fault?: "buyer" | "seller";

  // Parties involved
  buyer_email: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone_number: string;

  // Disputed products
  product_name: string;
  product_image: string;
  products: IProductItem[];

  // Initial dispute details
  reason_for_dispute: string;
  dispute_description: string;
  dispute_raised_by: "buyer" | "seller";
  dispute_raised_by_email: string;

  // Resolution tracking - NEW FIELDS
  resolution_proposals: IResolutionProposal[];
  rejection_count: number;
  max_rejections: number;

  // Status
  dispute_status:
    | "processing"
    | "resolving"
    | "resolved"
    | "cancelled"
    | "escalated_to_mediator";
  dispute_resolution_method: "unresolved" | "dispute_parties" | "mediator";

  // Mediator request
  mediator_requested_by?: "buyer" | "seller";
  mediator_requested_at?: Date;
  mediator_assigned_at?: Date;

  // Final resolution - NEW FIELDS
  resolved_at?: Date;
  resolution_summary?: string;

  // Legacy fields (for backward compatibility - can be removed after migration)
  proposed_by?: "buyer" | "seller";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface RaiseDisputeParams {
  transaction_id: string;
}

export interface RaiseDisputeBody {
  user_email: string;
  buyer_email: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone_number: string;
  product_name?: string;
  product_image?: string;
  disputed_products?: Array<{ name: string; image: string }>;
  reason_for_dispute: string;
  dispute_description: string;
}

export interface RaiseDisputeResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    disputed_products_count: number;
    next_steps?: {
      buyer_can: string[];
      seller_can: string[];
    };
  };
}

export interface ProposeResolutionParams {
  transaction_id: string;
}

export interface ProposeResolutionBody {
  resolution_description?: string;
  newProposal?: string;
  vendor_name?: string;
  vendor_phone_number?: string;
  vendor_email?: string;
  transaction_type?: string;
  updated_products?: Array<{
    name: string;
    image: string;
    quantity?: number;
    price?: number;
    description?: string;
  }>;
  transaction_total?: number;
  signed_escrow_doc?: string;
  delivery_address?: string;
}

export interface ProposeResolutionResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    proposal_number: number;
    rejections_remaining: number;
  };
}

export interface RespondToResolutionParams {
  transaction_id: string;
}

export interface RespondToResolutionBody {
  action: "accept" | "reject";
  rejection_reason?: string;
}

export interface RespondToResolutionResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    auto_escalated?: boolean;
    rejection_count?: number;
    rejections_remaining?: number;
    can_propose_again?: boolean;
  };
}

export interface RequestMediatorParams {
  transaction_id: string;
}

export interface RequestMediatorResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    requested_by: "buyer" | "seller";
  };
}

export interface CancelDisputeParams {
  transaction_id: string;
}

export interface CancelDisputeResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
  };
}

export interface GetDisputeDetailsParams {
  transaction_id: string;
}

export interface GetDisputeDetailsResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    resolution_history: IResolutionProposal[];
    can_propose: boolean;
    can_respond: boolean;
    can_request_mediator: boolean;
  };
}

export interface GetAllDisputesByUserParams {
  user_email: string;
}

export interface GetAllDisputesByUserQuery {
  page?: number;
  limit?: number;
}

export interface GetAllDisputesByUserResponse {
  status: string;
  message: string;
  data: {
    disputes: IProductDispute[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Legacy interfaces (for backward compatibility - DEPRECATED)
export interface BuyerResolveDisputeParams {
  transaction_id: string;
}

export interface BuyerResolveDisputeBody {
  vendor_name?: string;
  vendor_phone_number?: string;
  vendor_email?: string;
  transaction_type?: string;
  product_name?: string;
  product_quantity?: number;
  product_price?: number;
  product_image?: string;
  product_description?: string;
  updated_products?: Array<{
    name: string;
    image: string;
    quantity?: number;
    price?: number;
    description?: string;
  }>;
  transaction_total?: number;
  signed_escrow_doc?: string;
  delivery_address?: string;
}

export interface BuyerResolveDisputeResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    updated_products_count?: number;
  };
}

export interface SellerResolveDisputeParams {
  transaction_id: string;
}

export interface SellerResolveDisputeBody {
  resolution_description: string;
  updated_products?: Array<{
    name: string;
    image: string;
    quantity?: number;
    price?: number;
    description?: string;
  }>;
  transaction_total?: number;
}

export interface SellerResolveDisputeResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    updated_products_count?: number;
  };
}

export interface AcceptResolutionParams {
  transaction_id: string;
}

export interface AcceptResolutionResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
  };
}

export interface RejectResolutionParams {
  transaction_id: string;
}

export interface RejectResolutionResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
  };
}
