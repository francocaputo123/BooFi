import * as Linking from "expo-linking";
import {
  CreatePreferenceParams,
  PreferenceApiResponse,
} from "@/types/payment.types";
import { fail } from "assert";

const MP_PREFERENCES_ENDPOINT =
  "https://api.mercadopago.com/checkout/preferences";

export const createMercadoPagoPreference = async (
  params: CreatePreferenceParams,
): Promise<string> => {
  const accessToken = process.env.EXPO_PUBLIC_MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "Falta configurar EXPO_PUBLIC_MP_ACCESS_TOKEN en el archivo .env con tu Access Token de Mercado Pago.",
    );
  }

  const successUrl = Linking.createURL("/books/Details", {
    queryParams: {
      id: params.bookId,
    },
  });

  const faiulreUrl = Linking.createURL("/books/Checkout", {
    queryParams: {
      id: params.bookId,
    },
  });

  const payload = {
    items: [
      {
        id: params.bookId,
        title: params.title,
        quantity: 1,
        unit_price: Number(params.price),
        currency_id: "ARS",
      },
    ],
    back_urls: {
      success: successUrl,
      failure: faiulreUrl,
      // Eze's note: I leave it this way cuz the success and failure already works and idk how u guys want to process the pending buy, so I leave it that way, before this url was the same as 'success' so u can change it to "successUrl" too.
      pending: `BooFi://books/Details?id=${params.bookId}`,
    },
    auto_return: "approved",
  };

  const response = await fetch(MP_PREFERENCES_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.message || `Error de Mercado Pago (${response.status})`;
    throw new Error(message);
  }

  const data = (await response.json()) as PreferenceApiResponse;
  const checkoutUrl = data.init_point || data.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error("No se pudo obtener la URL de pago de Mercado Pago.");
  }

  return checkoutUrl;
};

export const openMercadoPagoCheckout = async (
  params: CreatePreferenceParams,
): Promise<void> => {
  const checkoutUrl = await createMercadoPagoPreference(params);
  await Linking.openURL(checkoutUrl);
};
