export function ArtistCard({ name, town }: { name: string; town: string }) {
  return <div className="card"><p className="font-semibold">{name}</p><p className="text-xs text-zinc-400">{town}</p></div>;
}

export function TrackCard({ title, artist }: { title: string; artist: string }) {
  return <div className="card"><p className="font-semibold">{title}</p><p className="text-xs text-zinc-400">{artist}</p></div>;
}

export function PlaylistCard({ title, description }: { title: string; description: string }) {
  return <div className="card"><p className="font-semibold">{title}</p><p className="text-xs text-zinc-400">{description}</p></div>;
}

export function EventCard({ title, venue }: { title: string; venue: string }) {
  return <div className="card"><p className="font-semibold">{title}</p><p className="text-xs text-zinc-400">{venue}</p></div>;
}

export function MerchCard({ title, price }: { title: string; price: string }) {
  return <div className="card"><p className="font-semibold">{title}</p><p className="text-xs text-zinc-400">{price}</p></div>;
}
