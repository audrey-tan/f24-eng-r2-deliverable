import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

interface Profile {
  display_name: string;
}

interface Comment {
  id: number;
  profiles: Profile | null;
  content: string | null;
}

export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  const { data: user } = await supabase.from("profiles").select("display_name").eq("id", sessionId).single();
  const user_display_name: string = user?.display_name ?? "No name";

  const { data: species } = await supabase
    .from("species")
    .select("*, profiles(display_name)")
    .order("id", { ascending: false });

  const comments: Record<number, Comment[] | null> = {};

  if (species !== null) {
    for (const speciesItem of species) {
      const { data: comment } = await supabase
        .from("comment")
        .select("id, profiles(display_name), content")
        .eq("speciesId", speciesItem.id)
        .order("id", { ascending: false });

      comments[speciesItem.id] = comment;
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {species?.map((species) => (
          <SpeciesCard
            key={species.id}
            species={species}
            author={species.profiles?.display_name ?? "Unknown"}
            comments={comments[species.id] ?? []}
            sessionId={sessionId}
            user_display_name={user_display_name}
          />
        ))}
      </div>
    </>
  );
}
