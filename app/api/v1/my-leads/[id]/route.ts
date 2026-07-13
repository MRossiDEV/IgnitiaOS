import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { notify } from "@/app/admin/toasts-messages";


interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}


export async function PATCH(
  request: NextRequest,
  { params }: RouteProps
) {

  try {

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      priority,
      owner,
      notes,
      follow_up,
      proposal_sent_at,
      won_at,
      lost_at,
      estimated_value,
      probability,
      last_contact_at,
      next_action,
      stage_order,
      tags,
      activity,
    } = body;



    const payload = {
      report_id: id,
      status:
        status ?? "New",
      priority:
        priority ?? "Medium",
      owner:
        owner ?? null,
      notes:
        notes ?? null,

      follow_up:
        follow_up || null,

      proposal_sent_at:
        proposal_sent_at || null,
      won_at:
        won_at || null,
      lost_at:
        lost_at || null,
      estimated_value:
        estimated_value ?? null,
      probability:
        probability ?? 50,
      last_contact_at:
        last_contact_at || null,
      next_action:
        next_action ?? null,
      stage_order:
        stage_order ?? 0,
      tags:
        tags ?? [],
      activity:
        activity ?? [],
    };



    /*
      Check if CRM exists
      */
    
    const { data: existing } = await supabaseAdmin
      .from("lead_crm")
      .select("id")
      .eq(
        "report_id",
        id
      )
      .maybeSingle();
    let result;

    if (existing) {      
      
      
      result =
        await supabaseAdmin
          .from("lead_crm")
          .update(payload)
          .eq(
            "report_id",
            id
          )
          .select()
          .single();
      
      await sendEmail({
        to: "mrossiph@gmail.com",
        subject: "Toma pa Bo",
        html: "<h1>Jelows from IgnitiaAI</h1>",
      });
      
      console.log("Email SENT successfully");
      

      
    } else {
      console.log("Email ABOUT TO SEND successfullyyyyyyyyyy");
      result =
        await supabaseAdmin
          .from("lead_crm")
          .insert(payload)
          .select()
          .single();


    }



    if(result.error){


      console.error(
        result.error
      );


      return NextResponse.json(

        {
          success:false,
          error:result.error.message
        },

        {
          status:500
        }

      );

    }



    return NextResponse.json({

      success:true,

      data:result.data

    });



  } catch(error){


    console.error(error);


    return NextResponse.json(

      {
        success:false,
        error:"Internal server error"
      },

      {
        status:500
      }

    );

  }

}