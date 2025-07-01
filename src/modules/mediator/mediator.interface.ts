import { IProductDispute } from "../disputes/productsDispute/productDispute.model";
import { IMediator } from "./mediator.model";

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

export interface GetAllDisputeForAMediatorParams {
  mediator_email: string;
}

export interface GetAllDisputeForAMediatorResponse {
  status: string;
  message: string;
  data: {
    mediator: Omit<IMediator, "password">;
    disputes: IProductDispute[];
  };
}
