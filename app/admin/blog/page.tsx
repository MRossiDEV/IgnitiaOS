import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  TrendingUp,
  Search,
  Clock,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import { supabaseAdmin } from "@/lib/supabase/server";


export default async function BlogDashboardPage() {

  const supabase = supabaseAdmin;


  /*
    POSTS
    Adjust column names according to your blog_posts table
  */

  const {
    data: posts,
    error: postsError,
  } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      status,
      views,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

    
    

  /*
    EVENTS / TASKS
  */

  const {
    data: events,
  } = await supabase
    .from("blog_events")
    .select(`
      id,
      title,
      event_date
    `)
    .order("event_date", {
      ascending: true,
    })
    .limit(5);



  /*
    KPI DATA
  */

  const {
    count: totalPosts,
  } = await supabase
    .from("blog_posts")
    .select("*", {
      count: "exact",
      head: true,
    });



  const {
    data: analytics,
  } = await supabase
    .from("blog_analytics")
    .select(`
      total_views,
      google_clicks,
      ctr
    `)
    .single();



  const stats = [
    {
      title: "Publicaciones",
      value: totalPosts ?? 0,
      icon: FileText,
    },
    {
      title: "Visitas totales",
      value: analytics?.total_views ?? 0,
      icon: Eye,
    },
    {
      title: "Clicks Google",
      value: analytics?.google_clicks ?? 0,
      icon: Search,
    },
    {
      title: "CTR promedio",
      value: analytics?.ctr
        ? `${analytics.ctr}%`
        : "0%",
      icon: TrendingUp,
    },
  ];



  return (

    <div className="min-h-screen p-6 lg:p-10">


      {/* HEADER */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Blog
          </h1>

          <p className="mt-2 text-zinc-400">
            Gestiona contenido optimizado para tráfico orgánico y generación de clientes.
          </p>

        </div>


        <Link
          href="/admin/blog/new"
          className="flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
        >

          <Plus
            size={18}
            className="mr-2"
          />

          Nuevo artículo

        </Link>


      </div>



      {/* KPI */}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">


        {stats.map((item)=>{

          const Icon = item.icon;


          return (

            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >

              <div className="flex justify-between">

                <span className="text-sm text-zinc-400">
                  {item.title}
                </span>


                <Icon
                  size={22}
                  className="text-blue-400"
                />

              </div>


              <div className="mt-5 text-3xl font-bold">
                {item.value}
              </div>


            </div>

          );

        })}


      </div>




      <div className="mt-10 grid gap-6 xl:grid-cols-3">



        {/* POSTS */}

        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03]">


          <div className="border-b border-white/10 p-6 flex justify-between">

            <h2 className="text-xl font-semibold">
              Últimos artículos
            </h2>


            <Link
              href="/admin/blog/posts"
              className="text-blue-400 text-sm"
            >
              Ver todos
            </Link>

          </div>



          <div className="divide-y divide-white/10">


            {posts?.map((post)=>(
              
              <Link
                href={`/admin/blog/${post.id}`}
                key={post.id}
                className="block p-6 hover:bg-white/5"
              >


                <div className="flex justify-between gap-4">


                  <div>

                    <h3 className="font-medium">
                      {post.title}
                    </h3>


                    <div className="mt-2 text-sm text-zinc-500">

                      {new Date(
                        post.created_at
                      ).toLocaleDateString()}

                      {" • "}

                      {post.views ?? 0} visitas

                    </div>


                  </div>



                  <span
                    className={
                      post.status === "published"
                      ? "text-green-400"
                      : "text-yellow-400"
                    }
                  >
                    {post.status}
                  </span>


                </div>


              </Link>

            ))}


          </div>


        </div>






        {/* EVENTS */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">


          <div className="flex items-center gap-3">

            <CalendarDays
              size={22}
              className="text-blue-400"
            />

            <h2 className="font-semibold">
              Próximas tareas
            </h2>

          </div>



          <div className="mt-5 space-y-4">


            {events?.map((event)=>(

              <div
                key={event.id}
                className="rounded-xl bg-white/[0.03] p-4"
              >

                <div className="font-medium">
                  {event.title}
                </div>


                <div className="mt-2 flex gap-2 text-sm text-zinc-500">

                  <Clock size={14}/>

                  {new Date(
                    event.event_date
                  ).toLocaleDateString()}

                </div>


              </div>

            ))}


          </div>


        </div>



      </div>


    </div>

  );
}