import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function BlogPage() {
  const supabase = supabaseAdmin;

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const featured = posts?.[0];
    const latest = posts?.slice(1);
    
    

  return (
    <main className="bg-black text-white">

      {/* HERO */}

      <section className="border-b border-zinc-800">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <span className="rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400">
            Ignitia Insights
          </span>

          <h1 className="mt-8 max-w-4xl text-6xl font-bold leading-tight">
            AI, Automation &
            <br />
            Business Growth.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            Practical guides, AI strategies, marketing insights,
            automation tutorials and growth systems for professionals
            and businesses.
          </p>

        </div>

      </section>

      {/* FEATURED */}

      {featured && (
        <section className="mx-auto max-w-7xl px-6 py-20">

          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 lg:grid-cols-2"
          >

            <div className="relative aspect-video">

              <Image
                src={featured.cover_image}
                alt={featured.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />

            </div>

            <div className="flex flex-col justify-center p-12">

              <span className="text-sm font-medium text-blue-400">
                Featured Article
              </span>

              <h2 className="mt-4 text-4xl font-bold leading-tight">
                {featured.title}
              </h2>

              <p className="mt-6 text-zinc-400">
                {featured.excerpt}
              </p>

              <div className="mt-8 flex gap-6 text-sm text-zinc-500">

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {new Date(
                    featured.published_at
                  ).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  {featured.reading_time} min
                </div>

              </div>

              <div className="mt-10 flex items-center gap-2 font-semibold">

                Read Article

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />

              </div>

            </div>

          </Link>

        </section>
      )}

      {/* ARTICLES */}

      <section className="mx-auto max-w-7xl px-6 pb-32">

        <h2 className="mb-10 text-4xl font-bold">
          Latest Articles
        </h2>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {latest?.map((post) => (

            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:border-zinc-600"
            >

              <div className="relative aspect-[16/10] overflow-hidden">

                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />

              </div>

              <div className="p-6">

                <span className="text-xs uppercase tracking-wider text-blue-400">
                  {post.category}
                </span>

                <h3 className="mt-3 text-2xl font-bold transition group-hover:text-blue-400">
                  {post.title}
                </h3>

                <p className="mt-4 line-clamp-3 text-zinc-400">
                  {post.excerpt}
                </p>

                <div className="mt-6 flex justify-between text-sm text-zinc-500">

                  <span>
                    {new Date(
                      post.published_at
                    ).toLocaleDateString()}
                  </span>

                  <span>
                    {post.reading_time} min
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* NEWSLETTER */}

      <section className="border-t border-zinc-800">

        <div className="mx-auto max-w-4xl px-6 py-24 text-center">

          <h2 className="text-5xl font-bold">
            Stay Ahead of AI.
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Get practical AI strategies, marketing insights,
            and automation tips delivered to your inbox.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl gap-4">

            <input
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none"
              placeholder="Enter your email"
            />

            <button className="rounded-xl bg-white px-8 font-semibold text-black hover:bg-zinc-200">
              Subscribe
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}