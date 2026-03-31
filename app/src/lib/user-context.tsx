"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  wa_phone: string;
  display_name: string;
  city: string;
  province: string;
  payment_methods: PaymentMethod[];
  savings_total: number;
  preferred_categories: string[];
  onboarding_completed: boolean;
  plan_tier: string;
}

interface PaymentMethod {
  method_type: string;
  bank_slug: string | null;
  card_network: string | null;
  wallet_slug: string | null;
  is_active: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  phone: string | null;
  setPhone: (phone: string) => void;
  reloadProfile: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  phone: null,
  setPhone: () => {},
  reloadProfile: () => {},
  logout: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhoneState] = useState<string | null>(null);

  function setPhone(p: string) {
    // Normalizar: sacar +, espacios, guiones
    const cleaned = p.replace(/[\s\-\+\(\)]/g, "");
    // Si empieza con 54 pero no con 549, agregar 9
    const normalized = cleaned.startsWith("549") ? cleaned
      : cleaned.startsWith("54") ? "549" + cleaned.slice(2)
      : cleaned.startsWith("9") ? "54" + cleaned
      : cleaned.startsWith("0") ? "549" + cleaned.slice(1)
      : "549" + cleaned;

    localStorage.setItem("esplus_phone", normalized);
    setPhoneState(normalized);
  }

  function logout() {
    localStorage.removeItem("esplus_phone");
    setPhoneState(null);
    setUser(null);
  }

  // Al montar: leer phone de URL param o localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get("phone");
    const storedPhone = localStorage.getItem("esplus_phone");

    if (urlPhone) {
      setPhone(urlPhone);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (storedPhone) {
      setPhoneState(storedPhone);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando hay phone, cargar perfil de Supabase
  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      setLoading(true);

      // Buscar usuario por teléfono
      const { data: users } = await supabase
        .from("users")
        .select("id, wa_phone, display_name, onboarding_completed, plan_tier")
        .eq("wa_phone", phone)
        .limit(1);

      if (!users || users.length === 0) {
        // Usuario no existe — mostrar pantalla de entrada
        setUser(null);
        setLoading(false);
        return;
      }

      const u = users[0];

      // Cargar ubicación
      const { data: locations } = await supabase
        .from("user_locations")
        .select("city, province")
        .eq("user_id", u.id)
        .eq("is_primary", true)
        .limit(1);

      const loc = locations?.[0] || { city: "", province: "" };

      // Cargar medios de pago
      const { data: pms } = await supabase
        .from("user_payment_methods")
        .select("method_type, bank_slug, card_network, wallet_slug, is_active")
        .eq("user_id", u.id)
        .eq("is_active", true);

      // Cargar memoria de Yapa (ahorro total)
      const { data: memory } = await supabase
        .from("yapa_memory")
        .select("total_savings, preferred_categories")
        .eq("user_id", u.id)
        .limit(1);

      const mem = memory?.[0] || { total_savings: 0, preferred_categories: [] };

      setUser({
        id: u.id,
        wa_phone: u.wa_phone,
        display_name: u.display_name || "Amiga",
        city: loc.city,
        province: loc.province,
        payment_methods: pms || [],
        savings_total: mem.total_savings || 0,
        preferred_categories: mem.preferred_categories || [],
        onboarding_completed: u.onboarding_completed || false,
        plan_tier: u.plan_tier || "free",
      });

      setLoading(false);
    }

    loadProfile();
  }, [phone]);

  return (
    <UserContext.Provider value={{ user, loading, phone, setPhone, reloadProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
}
