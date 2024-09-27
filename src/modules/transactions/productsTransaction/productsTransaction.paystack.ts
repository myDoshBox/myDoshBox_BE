import axios from "axios";

interface IPayment {
  reference: string;
  amount: number;
  email: string;
  currency?: string;
  channels?: string[];
  callback_url?: string;
}

export const paymentForEscrowProductTransaction = async (data: IPayment) => {
  const API_URL = process.env.PAYSTACK_BASE_URL;
  const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;

  const response = await axios.post(
    `${API_URL}/transaction/initialize`,
    {
      reference: data.reference,
      amount: data.amount * 100,
      email: data.email,
      currency: "NGN",
      // channels: ["bank_transfer", "ussd", "card"],
      channels: ["card"],
      callback_url: `https://mydoshbox.vercel.app/userdashboardagreement?reference=${data.reference}`,
      // callback_url: `http://localhost:3000/userdashboard/agreement?reference=${data.reference}`,
      // callback_url: `http://localhost:3000?reference=${data.reference}`,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
    }
  );

  return response.data;
};

export const verifyPaymentForEscrowProductTransaction = async (
  reference: string
) => {
  const API_URL = process.env.PAYSTACK_BASE_URL;
  const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;

  const response = await axios.get(
    `${API_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
    }
  );

  return response.data;
};
