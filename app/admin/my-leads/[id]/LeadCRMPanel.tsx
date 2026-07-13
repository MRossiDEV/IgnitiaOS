"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Save,
  Loader2,
  Flag,
  User,
  DollarSign,
  Calendar,
  Percent,
  ClipboardList,
  Target,
    Clock,
  Paperclip,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { notify } from "../../toasts-messages"



type CRMData = {
  id?: string;

  report_id: string;

  status: string;

  priority: string;

  owner: string | null;

  notes: string | null;

  follow_up: string | null;

  proposal_sent_at: string | null;

  won_at: string | null;

  lost_at: string | null;

  estimated_value: number | null;

  probability: number;

  last_contact_at: string | null;

  next_action: string | null;

  stage_order: number;

  tags: string[];

  activity: any[];
};


interface Props {

  reportId: string;

  crm?: CRMData | null;

}


const statuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiating",
  "Won",
  "Lost",
];


const priorities = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];


export default function LeadCRMPanel({
  reportId,
  crm,
}: Props) {


  const [isPending, startTransition] =
    useTransition();


  const [form, setForm] =
    useState<CRMData>({

      report_id: reportId,
      status: crm?.status ?? "New",
      priority: crm?.priority ?? "Medium",
      owner: crm?.owner ?? "",
      notes: crm?.notes ?? "",
      follow_up: crm?.follow_up ?? "",
      proposal_sent_at: crm?.proposal_sent_at ?? null,
      won_at: crm?.won_at ?? null,
      lost_at: crm?.lost_at ?? null,
      estimated_value: crm?.estimated_value ?? 0,
      probability: crm?.probability ?? 50,
      last_contact_at: crm?.last_contact_at ?? null,
      next_action: crm?.next_action ?? "",
      stage_order: crm?.stage_order ?? 0,
      tags: crm?.tags ?? [],
      activity: crm?.activity ?? [],
    });


  function update(
    field: keyof CRMData,
    value: any
  ) {

    setForm((prev)=>({
      ...prev,
      [field]: value,
    }));
  }



  async function saveCRM(){
    startTransition(async () => {

      const response = await fetch(`/api/v1/my-leads/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if(!response.ok){
        console.error(
          await response.text()
        );
        console.log("Error saving CRM" );

        return;

      }

      notify.success("Lead saved successfully");
      



    });

  }



  return (

    <div className="space-y-6">


      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">


        <h2 className="text-xl font-bold">
          Sales CRM
        </h2>


        <p className="mt-2 text-sm text-zinc-500">
          Manage this lead internally.
        </p>



        {/* STATUS */}

        <div className="mt-8">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <Flag size={16}/>

            Status

          </label>


          <select

            value={form.status}

            onChange={(e)=>
              update(
                "status",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          >

            {
              statuses.map(
                status=>(

                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>

                )
              )
            }

          </select>


        </div>



        {/* PRIORITY */}


        <div className="mt-6">


          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <Target size={16}/>

            Priority

          </label>


          <select

            value={form.priority}

            onChange={(e)=>
              update(
                "priority",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          >

            {
              priorities.map(
                priority=>(

                  <option
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </option>

                )
              )
            }


          </select>


        </div>



        {/* OWNER */}


        <div className="mt-6">


          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <User size={16}/>

            Owner

          </label>


          <input

            value={
              form.owner ?? ""
            }

            onChange={(e)=>
              update(
                "owner",
                e.target.value
              )
            }

            placeholder="Sales person"

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


        </div>



        {/* VALUE */}


        <div className="mt-6">


          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <DollarSign size={16}/>

            Estimated Value

          </label>


          <input

            type="number"

            value={
              form.estimated_value ?? 0
            }

            onChange={(e)=>
              update(
                "estimated_value",
                Number(e.target.value)
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


              </div>
      
              {/* PROBABILITY */}

        <div className="mt-6">

          <label className="mb-2 flex items-center justify-between text-sm text-zinc-400">

            <span className="flex items-center gap-2">
              <Percent size={16}/>
              Probability
            </span>

            <span>
              {form.probability}%
            </span>

          </label>


          <input

            type="range"

            min="0"

            max="100"

            value={form.probability}

            onChange={(e)=>
              update(
                "probability",
                Number(e.target.value)
              )
            }

            className="w-full"

          />


        </div>



        {/* FOLLOW UP */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <Calendar size={16}/>

            Follow Up

          </label>


          <input

            type="date"

            value={
              form.follow_up ?? ""
            }

            onChange={(e)=>
              update(
                "follow_up",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


        </div>




        {/* LAST CONTACT */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <Clock size={16}/>

            Last Contact

          </label>


          <input

            type="datetime-local"

            value={
              form.last_contact_at
                ? form.last_contact_at.slice(0,16)
                : ""
            }

            onChange={(e)=>
              update(
                "last_contact_at",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


              </div>
              
              {/* PROPOSAL SENT */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <Paperclip size={16}/>

            Proposal Sent

          </label>


          <input

            type="date"

            value={
              form.proposal_sent_at ?? ""
            }

            onChange={(e)=>
              update(
                "proposal_sent_at",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


              </div>
              
              {/* WON DATE */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <CheckCircle size={16}/>

            Won Date

          </label>


          <input

            type="date"

            value={
              form.won_at ?? ""
            }

            onChange={(e)=>
              update(
                "won_at",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


              </div>
              
              {/* LOST DATE */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <XCircle size={16}/>

            Lost Date

          </label>


          <input

            type="date"

            value={
              form.lost_at ?? ""
            }

            onChange={(e)=>
              update(
                "lost_at",
                e.target.value
              )
            }

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


        </div>




        {/* NEXT ACTION */}

        <div className="mt-6">

          <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

            <ClipboardList size={16}/>

            Next Action

          </label>


          <input

            value={
              form.next_action ?? ""
            }

            onChange={(e)=>
              update(
                "next_action",
                e.target.value
              )
            }

            placeholder="Call client, send proposal..."

            className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 px-4"

          />


        </div>




        {/* NOTES */}

        <div className="mt-6">


          <label className="mb-2 block text-sm text-zinc-400">

            Notes

          </label>


          <textarea

            rows={6}

            value={
              form.notes ?? ""
            }

            onChange={(e)=>
              update(
                "notes",
                e.target.value
              )
            }

            placeholder="Sales notes..."

            className="w-full rounded-xl border border-white/10 bg-zinc-950 p-4"

          />


        </div>



        {/* TAGS */}

        <div className="mt-6">


          <label className="mb-2 block text-sm text-zinc-400">

            Tags

          </label>


          <div className="flex gap-2">


            <input

              id="tagInput"

              placeholder="Add tag"

              className="h-12 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4"

            />


            <button

              type="button"

              onClick={()=>{

                const input =
                  document.getElementById(
                    "tagInput"
                  ) as HTMLInputElement;


                if(!input.value)
                  return;


                update(
                  "tags",
                  [
                    ...form.tags,
                    input.value
                  ]
                );


                input.value="";

              }}

              className="rounded-xl bg-blue-600 px-5"

            >

              Add

            </button>


          </div>



          <div className="mt-4 flex flex-wrap gap-2">


            {
              form.tags.map(
                (tag,index)=>(

                  <button

                    key={index}

                    type="button"

                    onClick={()=>{

                      update(
                        "tags",
                        form.tags.filter(
                          (_,i)=>
                            i!==index
                        )
                      );

                    }}

                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"

                  >

                    {tag}
                    ×

                  </button>

                )
              )
            }


          </div>


              </div>
      
              {/* ACTIVITY TIMELINE */}

        <div className="mt-8">

          <label className="mb-3 block text-sm text-zinc-400">

            Activity Timeline

          </label>


          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">


            {
              form.activity.length === 0 ? (

                <p className="text-sm text-zinc-500">
                  No activity recorded yet.
                </p>

              ) : (

                <div className="space-y-4">


                  {
                    form.activity.map(
                      (item,index)=>(

                        <div
                          key={index}
                          className="border-b border-white/10 pb-3 last:border-0"
                        >

                          <div className="flex justify-between">

                            <span className="font-medium">
                              {item.type}
                            </span>

                            <span className="text-xs text-zinc-500">
                              {item.date}
                            </span>

                          </div>


                          <p className="mt-1 text-sm text-zinc-400">
                            {item.message}
                          </p>


                        </div>

                      )
                    )
                  }


                </div>

              )
            }


          </div>


        </div>




        {/* ADD ACTIVITY */}

        <button

          type="button"

          onClick={()=>{

            const activity = {

              type:
                "Manual Note",

              message:
                "Activity added by administrator",

              date:
                new Date().toISOString(),

            };


            update(
              "activity",
              [
                ...form.activity,
                activity
              ]
            );


          }}

          className="mt-4 w-full rounded-xl border border-white/10 py-3 text-sm transition hover:border-blue-500"

        >

          + Add Activity

        </button>




        {/* SAVE */}

        <button

          type="button"

          onClick={saveCRM}

          disabled={isPending}

          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-50"

        >

          {
            isPending ? (

              <Loader2
                size={18}
                className="animate-spin"
              />

            ) : (

              <Save
                size={18}
              />

            )
          }


          {
            isPending
              ? "Saving..."
              : "Save CRM"
          }


        </button>



      </div>


    </div>

  );

}