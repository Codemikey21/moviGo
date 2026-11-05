"use client";

import { useEffect, useState } from "react";
import { supabaseConfigurado } from "@/compartido/servidor/supabase/config";
import { crearClienteNavegador } from "@/compartido/servidor/supabase/navegador";

/**
 * true si la persona tiene la sesión abierta. Se revisa en el navegador para
 * que la landing siga siendo una página estática (rápida) para todos.
 * Mientras revisa devuelve false.
 */
export function useHaySesion() {
  const [haySesion, setHaySesion] = useState(false);

  useEffect(() => {
    if (!supabaseConfigurado()) return;
    const supabase = crearClienteNavegador();

    supabase.auth.getSession().then(({ data }) => setHaySesion(Boolean(data.session)));

    // Si inicia o cierra sesión en otra pestaña, la barra se actualiza sola
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setHaySesion(Boolean(sesion));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return haySesion;
}
