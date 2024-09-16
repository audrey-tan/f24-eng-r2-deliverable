"use client";

export default function AddCommentCard({ author, content }: { author: string; content: string }) {
  return (
    <div className="mt-8 w-full min-w-72 flex-none">
      <h3 className="mb-2 text-base font-semibold">{author}</h3>
      <p className="font-light">{content}</p>
      <hr className="border-gray-1000 mx-6 mb-6 mt-6" />
    </div>
  );
}
