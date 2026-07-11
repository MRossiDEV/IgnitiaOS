import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Eye,
  Search,
  TrendingUp,
  Calendar,
  Globe,
  FileText,
  ExternalLink,
} from "lucide-react";

import { supabaseAdmin } from "@/lib/supabase/server";


interface PageProps {
  params: {
    id: string;
  };
}


export default async function BlogPostPage({
  params,
}: PageProps) {

  const { id } = await params;


  const supabase = supabaseAdmin;


  const {
    data: post,
    error,
  } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      status,
      views,
      created_at,
      updated_at,
      published_at,
      meta_title,
      meta_description,
      focus_keyword,
      featured_image,
      author
    `)
    .eq("id", id)
    .single();



  if (error || !post) {

    return (

      <div className="p-10">

        <h1 className="text-2xl font-bold">
          Artículo no encontrado
        </h1>

        <Link
          href="/admin/blog"
          className="mt-5 inline-block text-blue-400"
        >
          Volver al blog
        </Link>

      </div>

    );

  }



  return (

    <div className="min-h-screen p-6 lg:p-10">


      {/* HEADER */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">


        <div>


          <Link
            href="/admin/blog"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >

            <ArrowLeft size={16}/>

            Volver

          </Link>



          <h1 className="mt-5 text-3xl font-bold">
            {post.title}
          </h1>


          <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">


            <span>
              {post.status}
            </span>


            <span>
              {new Date(
                post.created_at
              ).toLocaleDateString()}
            </span>


            <span>
              {post.views ?? 0} visitas
            </span>


          </div>


        </div>



        <Link
          href={`/admin/blog/${post.id}/edit`}
          className="flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
        >

          <Edit
            size={18}
            className="mr-2"
          />

          Editar artículo

        </Link>


      </div>





      {/* KPI */}

      <div className="mt-10 grid gap-5 md:grid-cols-4">


        <Metric
          icon={<Eye size={20}/>}
          title="Visitas"
          value={post.views ?? 0}
        />


        <Metric
          icon={<Search size={20}/>}
          title="Keyword"
          value={post.focus_keyword || "-"}
        />


        <Metric
          icon={<TrendingUp size={20}/>}
          title="Estado"
          value={post.status}
        />


        <Metric
          icon={<Calendar size={20}/>}
          title="Publicado"
          value={
            post.published_at
            ? new Date(post.published_at)
              .toLocaleDateString()
            : "-"
          }
        />


      </div>





      <div className="mt-10 grid gap-6 lg:grid-cols-3">


        {/* CONTENT */}


        <div className="lg:col-span-2 space-y-6">



          <Section
            title="Resumen"
            icon={<FileText size={20}/>}
          >

            <p className="leading-7 text-zinc-300">
              {post.excerpt || "Sin resumen"}
            </p>


          </Section>





          <Section
            title="Contenido"
            icon={<FileText size={20}/>}
          >

            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: post.content,
              }}
            />


          </Section>



        </div>







        {/* SIDEBAR */}


        <div className="space-y-6">


          <Section
            title="SEO"
            icon={<Search size={20}/>}
          >


            <div className="space-y-4 text-sm">


              <div>

                <p className="text-zinc-500">
                  Meta título
                </p>

                <p>
                  {post.meta_title || "-"}
                </p>

              </div>



              <div>

                <p className="text-zinc-500">
                  Meta descripción
                </p>

                <p>
                  {post.meta_description || "-"}
                </p>

              </div>



            </div>


          </Section>





          <Section
            title="Publicación"
            icon={<Globe size={20}/>}
          >


            <div className="space-y-4">


              <div>

                <p className="text-sm text-zinc-500">
                  URL
                </p>

                <div className="flex items-center gap-2">

                  <span>
                    /blog/{post.slug}
                  </span>

                  <ExternalLink size={15}/>

                </div>


              </div>



              <div>

                <p className="text-sm text-zinc-500">
                  Autor
                </p>

                <p>
                  {post.author || "Admin"}
                </p>

              </div>



            </div>


          </Section>




        </div>



      </div>



    </div>

  );
}






function Metric({
  icon,
  title,
  value,
}:{
  icon:React.ReactNode;
  title:string;
  value:string|number;
}){


  return (

    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">


      <div className="flex items-center gap-3 text-zinc-400">

        {icon}

        <span className="text-sm">
          {title}
        </span>

      </div>


      <div className="mt-4 text-xl font-bold truncate">
        {value}
      </div>


    </div>

  );

}





function Section({
  title,
  icon,
  children,
}:{
  title:string;
  icon:React.ReactNode;
  children:React.ReactNode;
}){


  return (

    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">


      <div className="mb-5 flex items-center gap-3">

        <div className="text-blue-400">
          {icon}
        </div>

        <h2 className="font-semibold">
          {title}
        </h2>

      </div>


      {children}


    </div>

  );

}