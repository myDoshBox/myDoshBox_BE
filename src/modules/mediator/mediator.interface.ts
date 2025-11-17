import { IProductDispute } from "../disputes/productsDispute/productDispute.model";
import { IMediator } from "./mediator.model";

// mediator_login
export interface MediatorLoginBody {
  mediator_email: string;
  password: string;
}

export interface MediatorLoginResponse {
  status: string;
  message: string;
  user: Omit<IMediator, "password">;
  accessToken: string;
  refreshToken: string;
}

// get_all_disputes_for_mediator
export interface GetAllDisputeForAMediatorParams {
  mediator_email: string;
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetAllDisputeForAMediatorResponse {
  status: string;
  message: string;
  data: {
    mediator: any; // or use your specific mediator type
    disputes: any[]; // or use your specific dispute type array
  };
  pagination?: PaginationMeta;
}

export interface InvolveAMediatorParams {
  transaction_id: string;
}
export interface InvolveAMediatorResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
    mediator: Omit<IMediator, "password">;
  };
}

export interface ResolveDisputeParams {
  transaction_id: string;
}
export interface ResolveDisputeBody {
  dispute_fault: "buyer" | "seller";
  resolution_description: string;
}
export interface ResolveDisputeResponse {
  status: string;
  message: string;
  data: {
    dispute: IProductDispute;
  };
}
