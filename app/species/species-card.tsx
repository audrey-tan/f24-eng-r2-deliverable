"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";
import AddCommentCard from "./add-comment-card";
import CommentCard from "./comment-card";
import DeleteSpeciesDialog from "./delete-species-dialog";
import EditSpeciesDialog from "./edit-species-dialog";

interface Profile {
  display_name: string;
}

interface Comment {
  id: number;
  profiles: Profile | null;
  content: string | null;
}

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard({
  species,
  author,
  comments,
  sessionId,
  user_display_name,
}: {
  species: Species;
  author: string;
  comments: Comment[] | null;
  sessionId: string;
  user_display_name: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const isAuthor = sessionId === species.author;

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
          <div className="mt-5">
            {isAuthor ? (
              <div className="space-x-2">
                <EditSpeciesDialog species={species} onEdit={closeDialog} />
                <DeleteSpeciesDialog species={species} />
              </div>
            ) : null}
            {species.image && (
              <div className="relative h-80 w-full">
                <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
              </div>
            )}
            <h3 className="mt-6 text-3xl font-semibold">{species.scientific_name}</h3>
            <h4 className="mt-2 text-xl font-light italic">{species.common_name}</h4>
            <p className="mt-3">
              <b>Kingdom:</b> {species.kingdom}
            </p>
            <p>
              <b>Total population:</b> {species.total_population}
            </p>
            <p>
              <b>Endangered:</b> {species.endangered ? "Yes" : "No"}
            </p>
            <p className="mt-3">{species.description ? species.description : ""}</p>
            <p className="mt-6 font-light italic">
              <b>Written by</b> {author}
            </p>
          </div>
          <div className="mt-3">
            <hr className="mb-6 border-gray-700" />
            <h3 className="mb-4 text-xl font-semibold">Comments</h3>
            <AddCommentCard speciesId={species.id} username={user_display_name} sessionId={sessionId}></AddCommentCard>
            {comments?.map((comment) => (
              <CommentCard
                key={comment.id}
                author={comment.profiles?.display_name ?? "Unknown"}
                content={comment.content ?? "Unknown"}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
