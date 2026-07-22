import { getYouTubeEmbedUrl } from "@/lib/utils";

export function ExerciseVideo({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl bg-muted p-4 text-center text-sm font-medium text-primary"
      >
        Watch demo video ↗
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={embedUrl}
        title="Exercise demonstration"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
