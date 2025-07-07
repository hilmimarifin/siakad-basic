"use server";
import { supabase } from "@/lib/supabase";

export const getUsers = async () => {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, role, full_name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { message: "Failed to fetch users", status: 500 };
  }
  return { users, status: 200 };
};
