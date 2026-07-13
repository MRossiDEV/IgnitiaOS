import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateFreeReport } from "@/lib/ai/generateFreeReport";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = supabaseAdmin;  

    const { data, error } = await supabase
        .from("free_reports")
        .insert({
            status: "processing",
            full_name: body.fullName,
            email: body.email,
            phone: body.phone,
            metadata: {
            receiveTips: body.receiveTips ?? false,
            },
        })
        .select()
        .single();    

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }


    generateFreeReport(data.id);

    return NextResponse.json({
      success: true,
      reportId: data.id,

    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error",
      },
      {
        status: 500,
      }
    );
  }
}