interface PricingCardProps {
  title:string;
  subtitle:string;
  price:string;
  monthly?:string;
  features:string[];
  popular?:boolean;
}


export default function PricingCard({
  title,
  subtitle,
  price,
  monthly,
  features,
  popular
}:PricingCardProps){

return (

<div
className={`
relative rounded-3xl border p-8
bg-zinc-950
${popular 
? "border-white scale-105"
: "border-zinc-800"}
`}
>


{
popular && (
<div className="
absolute -top-4 left-1/2 
-translate-x-1/2
rounded-full
bg-white
px-4 py-1
text-xs
font-bold
text-black
">
MOST POPULAR
</div>
)
}


<h3 className="text-2xl font-bold">
{title}
</h3>


<p className="mt-2 text-gray-400">
{subtitle}
</p>


<div className="mt-8">

<span className="text-4xl font-bold">
{price}
</span>


{
monthly && (
<p className="mt-2 text-gray-400">
+ {monthly}/month
</p>
)
}

</div>


<ul className="mt-8 space-y-3">

{
features.map((feature)=>(
<li 
key={feature}
className="flex gap-2 text-sm text-gray-300"
>

<span>
✓
</span>

{feature}

</li>
))
}

</ul>


<button
className="
mt-8 w-full rounded-xl
bg-white py-3
font-semibold
text-black
hover:bg-gray-200
"
>
Get Started
</button>


</div>

)

}