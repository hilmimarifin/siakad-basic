import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: classes, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        homeroom_teacher:users(full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch classes" },
        { status: 500 }
      );
    }

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "principal") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, grade_level, homeroom_teacher_id, academic_year } = await request.json();

    const { data: classData, error } = await supabase
      .from("classes")
      .insert([
        {
          name,
          grade_level,
          homeroom_teacher_id: homeroom_teacher_id || null,
          academic_year,
        },
      ])
      .select()
      .single();
    if (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Failed to create class" },
        { status: 500 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
