import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClassInfo {
  id: string;
  name: string;
  token: string;
  deadline: string;
  is_active: boolean;
}

const STORAGE_KEY = "vyc_class_id";

export const useClassAccess = () => {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(async () => {
    const id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      setClassInfo(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) setClassInfo(data as ClassInfo);
    else sessionStorage.removeItem(STORAGE_KEY);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFromStorage();

    const channel = supabase
      .channel("class_access_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classes" },
        () => loadFromStorage()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFromStorage]);

  const verifyToken = useCallback(async (token: string) => {
    const normalized = token.trim().toUpperCase();
    if (!normalized) return { error: "Please enter a class token" };
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("token", normalized)
      .maybeSingle();
    if (error) return { error: "Failed to verify token" };
    if (!data) return { error: "Invalid class token" };
    sessionStorage.setItem(STORAGE_KEY, data.id);
    setClassInfo(data as ClassInfo);
    return { error: null };
  }, []);

  const clearClass = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setClassInfo(null);
  }, []);

  const deadlineDate = classInfo ? new Date(classInfo.deadline) : null;
  const isVotingOpen =
    !!classInfo && classInfo.is_active && !!deadlineDate && deadlineDate > new Date();

  return {
    classInfo,
    deadline: deadlineDate,
    isVotingOpen,
    loading,
    verifyToken,
    clearClass,
    refresh: loadFromStorage,
  };
};